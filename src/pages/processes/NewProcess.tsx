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
        toast({
          title: "Processo não encontrado",
          variant: "destructive"
        });
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
      toast({
        title: "Erro ao importar processo",
        variant: "destructive"
      });
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
      toast({
        title: "Dados do processo incompletos",
        variant: "destructive"
      });
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
        toast({
          title: "Usuário não autenticado",
          variant: "destructive"
        });
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
        toast({
          title: "Este processo já foi cadastrado anteriormente",
          variant: "destructive"
        });
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
        toast({
          title: "Erro ao importar processo",
          description: insertError.message,
          variant: "destructive"
        });
        setImportProgress(0);
        setIsLoading(false);
        return;
      }

      if (!newProcess?.id) {
        toast({
          title: "Erro ao obter ID do processo principal criado",
          variant: "destructive"
        });
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
            json_completo: mainProcess
          });

        if (detailsError) {
          throw detailsError;
        }
      } catch (error) {
        console.error("Erro ao inserir detalhes do processo:", error);
        toast({
          title: "Erro ao salvar detalhes do processo",
          variant: "destructive"
        });
        return;
      }
      
      setImportProgress(70);

      // Inserir movimentos do processo
      try {
        if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
          const { error: movementsError } = await supabase
            .from("process_movements")
            .insert(
              mainProcess.movimentos.map(movement => ({
                process_id: mainProcessId,
                codigo: movement.codigo,
                nome: movement.nome || "",
                data_hora: movement.dataHora,
                tipo: movement.tipo || "",
                complemento: Array.isArray(movement.complemento) ? movement.complemento.join(", ") : (movement.complemento || ""),
                complementos_tabelados: movement.complementosTabelados || [],
                orgao_julgador: movement.orgaoJulgador || {},
                json_completo: movement
              }))
            );

          if (movementsError) {
            throw movementsError;
          }
        }
      } catch (error) {
        console.error("Erro ao inserir movimentos do processo:", error);
        toast({
          title: "Erro ao salvar movimentos do processo",
          variant: "destructive"
        });
        return;
      }
      
      setImportProgress(90);

      // Inserir assuntos do processo
      try {
        if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
          const { error: subjectsError } = await supabase
            .from("process_subjects")
            .insert(
              mainProcess.assuntos.map((subject, index) => ({
                process_id: mainProcessId,
                codigo: subject.codigo,
                nome: subject.nome || "",
                principal: index === 0
              }))
            );

          if (subjectsError) {
            throw subjectsError;
          }
        }
      } catch (error) {
        console.error("Erro ao inserir assuntos do processo:", error);
        toast({
          title: "Erro ao salvar assuntos do processo",
          variant: "destructive"
        });
        return;
      }

      setImportProgress(100);
      toast({
        title: "Processo importado com sucesso!",
        variant: "success"
      });
      navigate(`/processes/${mainProcessId}`);
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast({
        title: "Erro ao importar processo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setImportProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Novo Processo</h1>
      </div>

      <Card className="p-6">
        {currentMode === "search" && (
          <ProcessSearch
            onProcessSelect={handleProcessSelect}
            onManual={handleManualEntry}
            isLoading={isLoading}
          />
        )}

        {currentMode === "details" && processMovimentos && (
          <ProcessDetails
            processMovimentos={processMovimentos}
            onSave={handleSaveProcess}
            onCancel={() => {
              setCurrentMode("search");
              setProcessMovimentos(null);
            }}
            isNewProcess
          />
        )}

        {currentMode === "manual" && (
          <ProcessForm
            onSubmit={async (data) => {
              // TODO: Implementar o cadastro manual
              console.log("Dados do formulário:", data);
            }}
            onCancel={() => setCurrentMode("search")}
          />
        )}

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
    </div>
  );
}
