
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
import { ProcessModeSelector } from "@/components/process/ProcessModeSelector";

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
        <ProcessModeSelector
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          processMovimentos={processMovimentos}
          showManualEntry={showManualEntry}
          importProgress={importProgress}
          isLoading={isLoading}
          handleProcessSelect={handleProcessSelect}
          handleManualEntry={handleManualEntry}
          handleSaveProcess={handleSaveProcess}
          handleCreateManualProcess={handleCreateManualProcess}
          handleCancel={handleCancel}
          importProcess={importProcess} // Pass the importProcess function here
        />
      </div>
    </div>
  );
}
