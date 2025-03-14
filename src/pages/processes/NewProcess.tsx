
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ProcessForm } from "@/components/process/ProcessForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useProcessImport } from "@/hooks/useProcessImport";
import { createManualProcess } from "@/services/processService";

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
    setImportProgress,
    setShowManualEntry,
    setProcessMovimentos,
    handleProcessSelect,
    importProcess
  } = useProcessImport();
  
  // Função para preencher o formulário manual com dados do processo pesquisado
  const handleManualEntry = () => {
    // Se tivermos pesquisado um número de processo, usamos ele como default
    if (currentMode === "search") {
      setCurrentMode("manual");
    }
  };

  const handleSaveProcess = async () => {
    const success = await importProcess();
    if (success) {
      navigate("/processes");
    }
  };

  const handleCreateManualProcess = async (processData: any) => {
    setImportProgress(5);
    
    try {
      const success = await createManualProcess(processData);
      if (success) {
        setImportProgress(100);
        navigate("/processes");
      } else {
        setImportProgress(0);
      }
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      setImportProgress(0);
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setProcessMovimentos(null);
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
              onProcessSelect={async (processNumber, courtEndpoint) => {
                const success = await handleProcessSelect(processNumber, courtEndpoint);
                if (success) {
                  setCurrentMode("details");
                }
                return success;
              }} 
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

        {currentMode === "details" && processMovimentos && (
          <ProcessDetails
            processMovimentos={processMovimentos}
            mainProcess={processMovimentos[0].process}
            isImport={true}
            importProgress={importProgress}
            onSave={handleSaveProcess}
            onCancel={() => setCurrentMode("search")}
            handleProcessSelect={handleProcessSelect}
            importProcess={importProcess}
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
          </>
        )}
      </div>
    </div>
  );
}
