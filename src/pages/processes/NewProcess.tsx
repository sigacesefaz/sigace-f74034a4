
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessForm } from "@/components/process/ProcessForm";
import { ProcessModeDetails } from "@/components/process/ProcessModeDetails";
import { useProcessImport } from "@/hooks/useProcessImport";
import { createManualProcess } from "@/services/processService";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type FormMode = "search" | "details" | "manual";

export default function NewProcess() {
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState<FormMode>("search");
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
    setCurrentMode("manual");
    setShowManualEntry(false);
  };

  const handleCreateManualProcess = async (data: any) => {
    try {
      const success = await createManualProcess(data);
      
      if (success) {
        toast.success("Processo cadastrado com sucesso!");
        navigate("/processes");
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
    setCurrentMode("search");
    resetImportState();
  };

  const handleImportAnother = () => {
    resetImportState();
    setCurrentMode("search");
  };

  const processSelectHandler = async (processNumber: string, courtEndpoint: string) => {
    const success = await handleProcessSelect(processNumber, courtEndpoint);
    if (success) {
      setCurrentMode("details");
    }
    return success;
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
          </Card>
        )}

        {currentMode === "details" && processMovimentos && processMovimentos.length > 0 && (
          <Card className="p-6">
            <ProcessModeDetails
              processMovimentos={processMovimentos}
              importProgress={importProgress}
              importComplete={importComplete}
              onSave={handleSaveProcess}
              onCancel={handleCancel}
              onImportAnother={handleImportAnother}
              handleProcessSelect={processSelectHandler}
              isLoading={isLoading}
            />
          </Card>
        )}

        {currentMode === "manual" && (
          <Card className="p-6">
            <ProcessForm onSubmit={handleCreateManualProcess} onCancel={handleCancel} />
          </Card>
        )}
      </div>
    </div>
  );
}
