
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProcessImport } from "@/hooks/useProcessImport";
import { saveProcess, createManualProcess } from "@/services/processService";
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
    handleProcessSelect
  } = useProcessImport();
  
  // Função para preencher o formulário manual com dados do processo pesquisado
  const handleManualEntry = () => {
    // Se tivermos pesquisado um número de processo, usamos ele como default
    if (currentMode === "search") {
      setCurrentMode("manual");
    }
  };

  const handleSaveProcess = async () => {
    if (!processMovimentos || !selectedCourt) return;
    
    const success = await saveProcess(processMovimentos, selectedCourt, setImportProgress);
    if (success) {
      navigate("/processes");
    }
  };

  const handleCreateManualProcess = async (processData: any) => {
    setImportProgress(5);
    const success = await createManualProcess(processData);
    
    if (success) {
      navigate("/processes");
    }
    
    setImportProgress(0);
  };

  const handleCancel = () => {
    setCurrentMode("search");
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
        />
      </div>
    </div>
  );
}
