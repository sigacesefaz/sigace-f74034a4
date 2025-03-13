import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ProcessForm } from "@/components/process/ProcessForm";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  const [importProgress, setImportProgress] = useState(0);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      const movimentos = await getProcessById(courtEndpoint, processNumber);
      
      if (!movimentos || movimentos.length === 0) {
        toast("Processo não encontrado", "", { variant: "destructive" });
        setShowManualEntry(true);
        setCurrentMode("search"); // Manter no modo de busca para exibir o botão de cadastro manual
        setIsLoading(false);
        return false;
      }
      
      console.log(`Processo encontrado com ${movimentos.length} movimento(s):`, movimentos);
      
      // Agrupamos os movimentos pelo mesmo número de processo
      const numeroProcessoPrincipal = movimentos[0].process.numeroProcesso;
      const movimentosDoProcesso = movimentos.filter(m => 
        m.process.numeroProcesso === numeroProcessoPrincipal
      );
      
      console.log(`Filtrado para ${movimentosDoProcesso.length} movimento(s) do mesmo processo`);
      
      setProcessMovimentos(movimentosDoProcesso);
      setSelectedCourt(courtEndpoint);
      setCurrentMode("details");
      setShowManualEntry(false);
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast("Erro ao importar processo", "", { variant: "destructive" });
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
      toast("Dados do processo incompletos", "", { variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    setImportProgress(5); // Iniciar a barra de progresso
    
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      
      if (!user) {
        toast("Usuário não autenticado", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }

      // Obter o processo principal (primeiro movimento processual)
      const mainMovimento = processMovimentos[0];
      const mainProcess = mainMovimento.process;
      
      setImportProgress(10);

      // Verificar se o processo já existe
      const { data: existingProcess } = await supabase
        .from("processes")
        .select("id")
        .eq("number", mainProcess.numeroProcesso)
        .maybeSingle();

      if (existingProcess) {
        toast("Este processo já foi cadastrado anteriormente", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }
      
      setImportProgress(20);

      console.log("Dados do processo a ser inserido:", {
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
        parent_id: null,
        metadata: JSON.stringify(mainProcess) // Convertendo o objeto para string
      });

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
          parent_id: null,
          metadata: JSON.stringify(mainProcess) // Convertendo o objeto para string
        })
        .select('id')
        .single();
        
      setImportProgress(40);

      if (insertError) {
        console.error("Erro ao inserir processo principal:", insertError);
        console.error("Detalhes do erro:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        toast("Erro ao importar processo", { 
          description: insertError.message,
          variant: "destructive" 
        });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }

      if (!newProcess?.id) {
        toast("Erro ao obter ID do processo principal criado", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }

      const mainProcessId = newProcess.id;
      
      setImportProgress(50);

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
          
        setImportProgress(60);

        if (detailsError) {
          console.error("Erro ao inserir detalhes do processo principal:", detailsError);
        }
      } catch (error) {
        console.error("Erro ao inserir detalhes do processo principal:", error);
      }

      // Processar os movimentos e assuntos em paralelo para otimizar
      setImportProgress(65);
      
      const savePromises = [];
      
      // Processar os movimentos do processo principal
      if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
        savePromises.push(saveProcessMovements(mainProcessId, mainProcess.movimentos));
      }
      
      // Processar os assuntos do processo principal
      if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
        savePromises.push(saveProcessSubjects(mainProcessId, mainProcess.assuntos));
      }
      
      // Processar as partes do processo principal
      if (mainProcess.partes && mainProcess.partes.length > 0) {
        savePromises.push(saveProcessParties(mainProcessId, mainProcess.partes));
      }
      
      // Esperar todas as operações paralelas terminarem
      await Promise.all(savePromises);
      setImportProgress(90);
      
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
      
      setImportProgress(100);

      toast("Processo importado com sucesso", "", { variant: "success" });
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      
      // Exibir mensagem de erro mais detalhada
      if (error instanceof Error) {
        toast("Erro ao importar processo", error.message, { variant: "destructive" });
      } else {
        toast("Erro ao importar processo", "", { variant: "destructive" });
      }
      
      setImportProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar os movimentos de um processo
  const saveProcessMovements = async (processId: string | number, movements: DatajudProcess["movimentos"]) => {
    if (!movements || movements.length === 0) return;
    
    try {
      // Preparar todos os movimentos para inserção em batch (lotes)
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < movements.length; i += batchSize) {
        const batch = movements.slice(i, i + batchSize).map(movement => ({
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
        }));
        
        batches.push(batch);
      }
      
      // Inserir os lotes em paralelo
      await Promise.all(batches.map(async batch => {
        const { error } = await supabase
          .from("process_movements")
          .insert(batch);
          
        if (error) {
          console.error("Erro ao inserir lote de movimentos:", error);
        }
      }));
      
      // Processar os complementos tabelados em uma segunda passagem
      // Este é um exemplo simplificado, você precisaria rastrear IDs
      for (const movement of movements) {
        if (movement.complementosTabelados && Array.isArray(movement.complementosTabelados) && movement.complementosTabelados.length > 0) {
          // Obter o ID do movimento principal
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
            const complementoBatches = [];
            
            for (let i = 0; i < movement.complementosTabelados.length; i += batchSize) {
              const complementoBatch = movement.complementosTabelados.slice(i, i + batchSize).map(complemento => ({
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
              }));
              
              complementoBatches.push(complementoBatch);
            }
            
            // Inserir os lotes de complementos em paralelo
            await Promise.all(complementoBatches.map(async batch => {
              const { error } = await supabase
                .from("process_movements")
                .insert(batch);
                
              if (error) {
                console.error("Erro ao inserir lote de complementos:", error);
              }
            }));
          }
        }
      }
    } catch (error) {
      console.error("Erro ao inserir movimentos do processo:", error);
    }
  };

  // Função para salvar os assuntos de um processo
  const saveProcessSubjects = async (processId: string | number, subjects: DatajudProcess["assuntos"]) => {
    if (!subjects || subjects.length === 0) return;
    
    try {
      const subjectsData = subjects.map((subject, index) => ({
        process_id: processId,
        codigo: subject.codigo,
        nome: subject.nome || "",
        principal: index === 0 // Considerar o primeiro como principal
      }));
      
      const { error } = await supabase
        .from("process_subjects")
        .insert(subjectsData);
        
      if (error) {
        console.error("Erro ao inserir assuntos:", error);
      }
    } catch (error) {
      console.error("Erro ao inserir assuntos do processo:", error);
    }
  };
  
  // Função para salvar as partes do processo
  const saveProcessParties = async (processId: string | number, parties: any[]) => {
    if (!parties || parties.length === 0) return;
    
    try {
      const partiesData = parties.map(party => ({
        process_id: processId,
        nome: party.nome || "",
        papel: party.papel || "",
        tipo_pessoa: party.tipoPessoa || "",
        documento: party.documento || "",
        advogados: party.advogados || [],
        json_completo: party
      }));
      
      const { error } = await supabase
        .from("process_parties")
        .insert(partiesData);
        
      if (error) {
        console.error("Erro ao inserir partes:", error);
      }
    } catch (error) {
      console.error("Erro ao inserir partes do processo:", error);
    }
  };

  const handleCreateManualProcess = async (processData: any) => {
    setIsLoading(true);
    setImportProgress(5);
    
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast("Usuário não autenticado", "", { variant: "destructive" });
        return;
      }
      
      setImportProgress(30);

      // Verificar se o processo já existe
      const { data: existingProcess } = await supabase
        .from("processes")
        .select("id")
        .eq("number", processData.number)
        .maybeSingle();

      if (existingProcess) {
        toast("Este processo já foi cadastrado anteriormente", "", { variant: "destructive" });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }
      
      setImportProgress(60);
      
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
      
      setImportProgress(90);
      
      if (error) throw error;
      
      setImportProgress(100);
      
      toast("Processo cadastrado com sucesso", "", { variant: "success" });
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      toast("Erro ao cadastrar processo", "", { variant: "destructive" });
      setImportProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setProcessMovimentos(null);
    setSelectedCourt(undefined);
    setShowManualEntry(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => currentMode === "search" ? navigate('/processes') : setCurrentMode("search")} 
            className="mr-2"
          >
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
            onSave={handleSaveProcess} 
            onCancel={handleCancel}
            isNewProcess={true}
          />
        )}

        {currentMode === "manual" && (
          <Card className="p-6">
            <ProcessForm onSubmit={handleCreateManualProcess} onCancel={() => setCurrentMode("search")} />
            
            {importProgress > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Importando processo...</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
