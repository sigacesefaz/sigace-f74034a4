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
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DatajudMovimentoProcessual } from "@/types/datajud";
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
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [existingProcess, setExistingProcess] = useState(false);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    setShowManualEntry(false);
    try {
      const movimentos = await getProcessById(courtEndpoint, processNumber);
      if (movimentos && movimentos.length > 0) {
        setProcessMovimentos(movimentos);
        setSelectedCourt(courtEndpoint);
        setCurrentMode("details");
        return true;
      } else {
        setShowManualEntry(true);
        return false;
      }
    } catch (error) {
      console.error("Erro ao buscar processo:", error);
      if (error instanceof Error) {
        toast.error(`Erro ao buscar processo: ${error.message}`);
      } else {
        toast.error("Erro ao buscar processo");
      }
      setShowManualEntry(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    setCurrentMode("manual");
    setShowManualEntry(false);
  };

  const handleCreateManualProcess = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase
        .from("processes")
        .insert({
          ...data,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success("Processo cadastrado com sucesso!");
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      if (error instanceof Error) {
        toast.error(`Erro ao cadastrar processo: ${error.message}`);
      } else {
        toast.error("Erro ao cadastrar processo");
      }
    }
  };

  const handleSaveProcess = async () => {
    if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
      toast.error("Dados do processo incompletos.");
      return;
    }
    
    setIsLoading(true);
    setImportProgress(0);
    
    try {
      setImportProgress(10);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        setImportProgress(0);
        return;
      }

      const mainProcess = processMovimentos[0].process;

      setImportProgress(20);
      // Verificar se o processo já existe
      const { data: existingProcessData } = await supabase
        .from("processes")
        .select("id")
        .eq("number", mainProcess.numeroProcesso)
        .maybeSingle();

      if (existingProcessData) {
        setIsLoading(false);
        setImportProgress(0);
        setExistingProcess(true);
        setShowSuccessDialog(true);
        return;
      }

      setImportProgress(30);
      // Inserir o processo na tabela processes
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
          plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || ""
        })
        .select('id')
        .single();

      if (insertError) {
        console.error("Erro ao inserir processo:", insertError);
        toast.error(`Erro ao importar processo: ${insertError.message}`);
        setIsLoading(false);
        setImportProgress(0);
        return;
      }

      if (!newProcess?.id) {
        toast.error("Erro ao obter ID do processo criado");
        setIsLoading(false);
        setImportProgress(0);
        return;
      }

      setImportProgress(50);
      // Armazenar todos os detalhes do processo em process_details
      try {
        const { error: detailsError } = await supabase
          .from("process_details")
          .insert({
            process_id: newProcess.id,
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
          console.error("Erro ao inserir detalhes do processo:", detailsError);
        }
      } catch (error) {
        console.error("Erro ao inserir detalhes do processo:", error);
      }

      setImportProgress(70);
      // Inserir os movimentos do processo
      if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
        try {
          for (const movement of mainProcess.movimentos) {
            const { error: movementError } = await supabase
              .from("process_movements")
              .insert({
                process_id: newProcess.id,
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
          }
        } catch (error) {
          console.error("Erro ao inserir movimentos do processo:", error);
        }
      }

      setImportProgress(90);
      // Inserir assuntos do processo
      if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
        try {
          for (let i = 0; i < mainProcess.assuntos.length; i++) {
            const subject = mainProcess.assuntos[i];
            const { error: subjectError } = await supabase
              .from("process_subjects")
              .insert({
                process_id: newProcess.id,
                codigo: subject.codigo,
                nome: subject.nome || "",
                principal: i === 0
              });

            if (subjectError) {
              console.error(`Erro ao inserir assunto ${subject.nome}:`, subjectError);
            }
          }
        } catch (error) {
          console.error("Erro ao inserir assuntos do processo:", error);
        }
      }

      setImportProgress(100);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      
      if (error instanceof Error) {
        toast.error(`Erro ao importar processo: ${error.message}`);
      } else {
        toast.error("Erro ao importar processo");
      }
      setImportProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setShowManualEntry(false);
    setProcessMovimentos(null);
    setExistingProcess(false);
  };

  const handleImportAnother = () => {
    setShowSuccessDialog(false);
    setImportProgress(0);
    setProcessMovimentos(null);
    setExistingProcess(false);
    setCurrentMode("search");
  };

  const handleGoToList = () => {
    setShowSuccessDialog(false);
    setExistingProcess(false);
    navigate("/processes");
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

        {importProgress > 0 && importProgress < 100 && (
          <div className="mb-6">
            <Progress value={importProgress} className="w-full" />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Importando processo... {importProgress}%
            </p>
          </div>
        )}

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
          <Card className="p-6">
            <ProcessDetails 
              processMovimentos={processMovimentos}
              mainProcess={processMovimentos[0].process}
              isImport={true}
              onSave={handleSaveProcess}
              onCancel={handleCancel}
              handleProcessSelect={handleProcessSelect}
            />
          </Card>
        )}

        {currentMode === "manual" && (
          <Card className="p-6">
            <ProcessForm onSubmit={handleCreateManualProcess} onCancel={handleCancel} />
          </Card>
        )}

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {existingProcess ? 
                  "Processo Já Cadastrado" : 
                  "Processo Importado com Sucesso!"
                }
              </DialogTitle>
              <DialogDescription>
                {existingProcess ? 
                  "Este processo já está cadastrado no sistema. O que você deseja fazer?" :
                  "O processo foi importado com sucesso. O que você deseja fazer agora?"
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-between">
              <Button onClick={handleGoToList} variant="outline">
                Ver Lista de Processos
              </Button>
              <Button onClick={handleImportAnother} className="bg-primary">
                {existingProcess ? 
                  "Importar Outro Processo" : 
                  "Importar Novo Processo"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
