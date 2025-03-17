import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessForm } from "@/components/process/ProcessForm";
import { ProcessModeDetails } from "@/components/process/ProcessModeDetails";
import { useProcessImport } from "@/hooks/useProcessImport";
import { createManualProcess } from "@/services/processService";
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Definindo os tipos para as etapas do wizard
type WizardStep = "search" | "details" | "manual" | "confirmation";

export default function NewProcess() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<WizardStep>("search");
  const [savedProcess, setSavedProcess] = useState<any>(null);
  const [showProcessExistsDialog, setShowProcessExistsDialog] = useState(false);
  
  const { 
    isLoading,
    processMovimentos,
    selectedCourt,
    showManualEntry,
    importProgress,
    importComplete,
    setShowManualEntry,
    handleProcessSelect,
    handleSaveProcess,
    resetImportState
  } = useProcessImport();

  const handleManualEntry = () => {
    setCurrentStep("manual");
    setShowManualEntry(false);
  };

  const handleCreateManualProcess = async (data: any) => {
    try {
      const success = await createManualProcess(data);
      
      if (success) {
        setSavedProcess({
          ...data,
          created_at: new Date().toISOString()
        });
        setCurrentStep("confirmation");
        toast.success("Processo cadastrado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      if (error instanceof Error) {
        toast.error(`Erro ao cadastrar processo: ${error.message}`);
      } else {
        toast.error("Erro ao cadastrar processo");
      }
    }
  };

  const handleCancel = () => {
    setCurrentStep("search");
    resetImportState();
  };

  const handleCreateAnother = () => {
    resetImportState();
    setSavedProcess(null);
    setCurrentStep("search");
  };

  const handleSaveProcessWithConfirmation = async () => {
    try {
      const result = await handleSaveProcess();
      
      if (result === 'PROCESS_EXISTS') {
        // Mostrar diálogo de confirmação para processo já existente
        setShowProcessExistsDialog(true);
        return false;
      } else if (result) {
        // Armazenar os dados do processo salvo
        const mainProcess = processMovimentos && processMovimentos.length > 0 
          ? processMovimentos[0].process 
          : null;
          
        setSavedProcess({
          number: mainProcess?.numeroProcesso,
          court: selectedCourt,
          title: mainProcess?.classe?.nome || "Processo",
          created_at: new Date().toISOString()
        });
        
        // Avançar para a tela de confirmação
        setCurrentStep("confirmation");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
      toast.error("Erro ao salvar processo");
      return false;
    }
  };

  const processSelectHandler = async (processNumber: string, courtEndpoint: string) => {
    const success = await handleProcessSelect(processNumber, courtEndpoint);
    if (success) {
      setCurrentStep("details");
    }
    return success;
  };

  // Calcular o progresso do wizard
  const getProgressPercentage = () => {
    switch (currentStep) {
      case "search": return 25;
      case "details": 
      case "manual": return 50;
      case "confirmation": return 100;
      default: return 0;
    }
  };

  // Obter o título da etapa atual
  const getStepTitle = () => {
    switch (currentStep) {
      case "search": return "Novo Processo - Buscar Processo";
      case "details": return "Novo Processo - Detalhes";
      case "manual": return "Novo Processo - Cadastro Manual";
      case "confirmation": return "Processo Cadastrado com Sucesso";
      default: return "Novo Processo";
    }
  };

  // Formatar data
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => navigate('/processes')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
        </div>

        {/* Barra de progresso do wizard */}
        <div className="mb-6">
          <Progress value={getProgressPercentage()} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className={currentStep === "search" ? "font-bold text-primary" : ""}>Buscar Processo</span>
            <span className={currentStep === "details" || currentStep === "manual" ? "font-bold text-primary" : ""}>Detalhes</span>
            <span className={currentStep === "confirmation" ? "font-bold text-primary" : ""}>Confirmação</span>
          </div>
        </div>

        {currentStep === "search" && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Busque o processo para cadastro</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ProcessSearch 
                onProcessSelect={processSelectHandler} 
                onManual={handleManualEntry}
                isLoading={isLoading}
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
            </CardContent>
          </Card>
        )}

        {currentStep === "details" && processMovimentos && processMovimentos.length > 0 && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Detalhes do Processo</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ProcessModeDetails
                processMovimentos={processMovimentos}
                importProgress={importProgress}
                importComplete={importComplete}
                onSave={handleSaveProcessWithConfirmation}
                onCancel={handleCancel}
                onImportAnother={handleCreateAnother}
                handleProcessSelect={processSelectHandler}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === "manual" && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Cadastro Manual de Processo</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ProcessForm onSubmit={handleCreateManualProcess} onCancel={handleCancel} />
            </CardContent>
          </Card>
        )}

        {currentStep === "confirmation" && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-xl">Processo Cadastrado com Sucesso!</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Detalhes do Processo:</h3>
                <p><strong>Número:</strong> {savedProcess?.number || "N/A"}</p>
                <p><strong>Tribunal:</strong> {savedProcess?.court || "N/A"}</p>
                <p><strong>Título:</strong> {savedProcess?.title || "N/A"}</p>
                <p><strong>Data de Cadastro:</strong> {formatDate(savedProcess?.created_at)}</p>
              </div>
              <p className="text-center mb-4">Deseja cadastrar outro processo?</p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 px-0">
              <Button 
                variant="outline" 
                onClick={() => navigate('/processes')}
                className="min-w-[120px]"
              >
                <X className="mr-2 h-4 w-4" />
                Não
              </Button>
              <Button 
                onClick={handleCreateAnother}
                className="min-w-[120px] bg-primary"
              >
                <Check className="mr-2 h-4 w-4" />
                Sim
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Diálogo de confirmação para processo já existente */}
        <AlertDialog open={showProcessExistsDialog} onOpenChange={setShowProcessExistsDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Processo já cadastrado
              </AlertDialogTitle>
              <AlertDialogDescription>
                Este processo já foi cadastrado anteriormente no sistema. Deseja cadastrar outro processo?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => navigate('/processes')}>
                Não, ir para lista
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateAnother}>
                Sim, cadastrar outro
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
