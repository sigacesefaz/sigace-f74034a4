
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ProcessForm } from "@/components/process/ProcessForm";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { ArrowLeft } from "lucide-react";

type FormMode = "search" | "details" | "manual";

export default function NewProcess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<FormMode>("search");
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      const movimentos = await getProcessById(courtEndpoint, processNumber);
      
      if (!movimentos || movimentos.length === 0) {
        toast.error("Processo não encontrado");
        setShowManualEntry(true);
        setCurrentMode("search"); // Manter no modo de busca para exibir o botão de cadastro manual
        setIsLoading(false);
        return false;
      }
      
      console.log(`Processo encontrado com ${movimentos.length} movimento(s):`, movimentos);
      
      // Filtramos para exibir apenas o primeiro movimento (principal) e seus relacionados
      // Lógica: todos os movimentos com o mesmo número de processo são considerados do mesmo processo
      const firstProcess = movimentos[0].process.numeroProcesso;
      const filteredMovimentos = movimentos.filter(m => m.process.numeroProcesso === firstProcess);
      
      console.log(`Filtrado para ${filteredMovimentos.length} movimento(s) do mesmo processo`);
      
      setProcessMovimentos(filteredMovimentos);
      setSelectedCourt(courtEndpoint);
      setCurrentMode("details");
      setShowManualEntry(false);
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast.error("Erro ao importar processo");
      setShowManualEntry(true); // Mostrar opção de cadastro manual também em caso de erro
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para preencher o formulário manual com dados do processo pesquisado
  const handleManualEntry = () => {
    // Se tivermos pesquisado um número de processo, usamos ele como default
    if (currentMode === "search") {
      setCurrentMode("manual");
    }
  };

  const handleSaveProcess = async () => {
    if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
      toast.error("Dados do processo incompletos.");
      return;
    }
    
    setIsLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Obter o processo principal (primeiro movimento processual)
      const mainMovimento = processMovimentos[0];
      const mainProcess = mainMovimento.process;

      // Verificar se o processo já existe
      const { data: existingProcess } = await supabase
        .from("processes")
        .select("id")
        .eq("number", mainProcess.numeroProcesso)
        .maybeSingle();

      if (existingProcess) {
        toast.error("Este processo já foi cadastrado anteriormente.");
        setIsLoading(false);
        return;
      }

      // Inserir o processo principal na tabela processes
      const { data: newProcess, error: insertError } = await supabase
        .from("processes")
        .insert({
          number: mainProcess.numeroProcesso,
          title: `${mainProcess.classe?.nome || 'Processo'} - ${mainProcess.numeroProcesso}`,
          description: mainProcess.assuntos?.map(a => a.nome).join(", ") || "",
          status: mainProcess.situacao?.nome || "Em andamento",
          court: mainProcess.tribunal,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          plaintiff: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.nome || "",
          plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || "",
          is_parent: true,
          parent_id: null
        })
        .select('id')
        .single();

      if (insertError) {
        console.error("Erro ao inserir processo principal:", insertError);
        toast.error(`Erro ao importar processo: ${insertError.message}`);
        setIsLoading(false);
        return;
      }

      if (!newProcess?.id) {
        toast.error("Erro ao obter ID do processo principal criado");
        setIsLoading(false);
        return;
      }

      const mainProcessId = newProcess.id;

      // Armazenar os detalhes do processo principal
      try {
        const { error: detailsError } = await supabase
          .from("process_details")
          .insert({
            process_id: mainProcessId,
            tribunal: mainProcess.tribunal,
            data_ajuizamento: mainProcess.dataAjuizamento,
            grau: mainProcess.grau,
            nivele_sigilo: mainProcess.nivelSigilo,
            formato: mainProcess.formato,
            sistema: mainProcess.sistema,
            classe: mainProcess.classe,
            assuntos: mainProcess.assuntos,
            orgao_julgador: mainProcess.orgaoJulgador,
            movimentos: mainProcess.movimentos,
            partes: mainProcess.partes,
            data_hora_ultima_atualizacao: mainProcess.dataHoraUltimaAtualizacao,
            json_completo: mainProcess // Armazenar o JSON completo
          });

        if (detailsError) {
          console.error("Erro ao inserir detalhes do processo principal:", detailsError);
        }
      } catch (error) {
        console.error("Erro ao inserir detalhes do processo principal:", error);
      }

      // Processar os movimentos do processo principal
      if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
        await saveProcessMovements(mainProcessId, mainProcess.movimentos);
      }
      
      // Processar os assuntos do processo principal
      if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
        await saveProcessSubjects(mainProcessId, mainProcess.assuntos);
      }

      // Processar os movimentos processuais adicionais (mesma numeração processual, mas diferentes movimentos)
      if (processMovimentos.length > 1) {
        // Aqui vamos anexar todos os movimentos adicionais ao processo principal
        // em vez de criar processos separados
        for (let i = 1; i < processMovimentos.length; i++) {
          const additionalMovimento = processMovimentos[i];
          const additionalProcess = additionalMovimento.process;
          
          // Verificamos se tem movimentos adicionais e adicionamos ao processo principal
          if (additionalProcess.movimentos && additionalProcess.movimentos.length > 0) {
            await saveProcessMovements(mainProcessId, additionalProcess.movimentos);
          }
        }
      }

      toast.success("Processo importado com sucesso!");
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      
      // Exibir mensagem de erro mais detalhada
      if (error instanceof Error) {
        toast.error(`Erro ao importar processo: ${error.message}`);
      } else {
        toast.error("Erro ao importar processo");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar os movimentos de um processo
  const saveProcessMovements = async (processId: string | number, movements: DatajudProcess["movimentos"]) => {
    try {
      // Inserir cada movimento individualmente para evitar problemas de tamanho
      for (const movement of movements) {
        const { error: movementError } = await supabase
          .from("process_movements")
          .insert({
            process_id: processId,
            codigo: movement.codigo, 
            nome: movement.nome || "",
            data_hora: movement.dataHora,
            tipo: movement.tipo || "",
            complemento: Array.isArray(movement.complemento) ? movement.complemento.join(", ") : (movement.complemento || ""),
            complementos_tabelados: movement.complementosTabelados || [],
            orgao_julgador: movement.orgaoJulgador || {},
            movimento_principal_id: null,
            json_completo: movement
          });

        if (movementError) {
          console.error(`Erro ao inserir movimento ${movement.codigo}:`, movementError);
        }
        
        // Se o movimento tem complementos tabelados, inseri-los também
        if (movement.complementosTabelados && Array.isArray(movement.complementosTabelados) && movement.complementosTabelados.length > 0) {
          // Obter o ID do movimento principal que acabamos de inserir
          const { data: insertedMovement } = await supabase
            .from("process_movements")
            .select("id")
            .eq("process_id", processId)
            .eq("codigo", movement.codigo)
            .eq("data_hora", movement.dataHora)
            .order("id", { ascending: false })
            .limit(1)
            .single();
            
          if (insertedMovement) {
            for (const complemento of movement.complementosTabelados) {
              const { error: complementoError } = await supabase
                .from("process_movements")
                .insert({
                  process_id: processId,
                  codigo: complemento.codigo || movement.codigo,
                  nome: complemento.nome || complemento.descricao || "Complemento",
                  data_hora: movement.dataHora,
                  tipo: "COMPLEMENTO_TABELADO",
                  complemento: complemento.descricao || "",
                  complementos_tabelados: [],
                  orgao_julgador: movement.orgaoJulgador || {},
                  movimento_principal_id: insertedMovement.id,
                  json_completo: complemento
                });
                
              if (complementoError) {
                console.error(`Erro ao inserir complemento tabelado:`, complementoError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Erro ao inserir movimentos do processo:", error);
    }
  };

  // Função para salvar os assuntos de um processo
  const saveProcessSubjects = async (processId: string | number, subjects: DatajudProcess["assuntos"]) => {
    try {
      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        const { error: subjectError } = await supabase
          .from("process_subjects")
          .insert({
            process_id: processId,
            codigo: subject.codigo,
            nome: subject.nome || "",
            principal: i === 0 // Considerar o primeiro como principal
          });

        if (subjectError) {
          console.error(`Erro ao inserir assunto ${subject.nome}:`, subjectError);
        }
      }
    } catch (error) {
      console.error("Erro ao inserir assuntos do processo:", error);
    }
  };

  const handleCreateManualProcess = async (processData: any) => {
    setIsLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Verificar se o processo já existe
      const { data: existingProcess } = await supabase
        .from("processes")
        .select("id")
        .eq("number", processData.number)
        .maybeSingle();

      if (existingProcess) {
        toast.error("Este processo já foi cadastrado anteriormente.");
        setIsLoading(false);
        return;
      }

      const {
        error
      } = await supabase.from("processes").insert({
        ...processData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
        is_parent: true,
        parent_id: null
      });
      if (error) throw error;
      toast.success("Processo cadastrado com sucesso!");
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      toast.error("Erro ao cadastrar processo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setProcessMovimentos(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/processes')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {currentMode === "search" ? "Novo Processo" : currentMode === "details" ? "Detalhes do Processo" : "Cadastro Manual de Processo"}
          </h1>
        </div>

        {currentMode === "search" && (
          <Card className="p-6">
            <ProcessSearch 
              onProcessSelect={handleProcessSelect} 
              onManual={handleManualEntry} 
            />
            {showManualEntry && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Processo não encontrado</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Não foi possível encontrar o processo na base de dados do tribunal.
                    Você pode cadastrar manualmente os dados do processo.
                  </p>
                  <Button 
                    onClick={handleManualEntry}
                    className="bg-primary text-white"
                  >
                    Cadastrar Processo Manualmente
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {currentMode === "details" && processMovimentos && processMovimentos.length > 0 && (
          <ProcessDetails 
            processMovimentos={processMovimentos} 
            mainProcess={processMovimentos[0].process} 
            onSave={handleSaveProcess} 
            onCancel={handleCancel} 
          />
        )}

        {currentMode === "manual" && (
          <>
            <Button variant="ghost" className="mb-4" onClick={() => setCurrentMode("search")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Busca
            </Button>
            <Card className="p-6">
              <ProcessForm onSubmit={handleCreateManualProcess} onCancel={handleCancel} />
            </Card>
          </>
        )}

        <div className="mt-4 flex justify-end">
          
        </div>
      </div>
    </div>
  );
}
