
import React from 'react';
import { useNavigate } from "react-router-dom";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { ProcessModeHeader } from "@/components/process/ProcessModeHeader";
import { ProcessModeSearch } from "@/components/process/ProcessModeSearch";
import { ProcessModeDetails } from "@/components/process/ProcessModeDetails";
import { ProcessModeManual } from "@/components/process/ProcessModeManual";

type FormMode = "search" | "details" | "manual";

interface ProcessModeSelectorProps {
  currentMode: FormMode;
  setCurrentMode: (mode: FormMode) => void;
  processMovimentos: DatajudMovimentoProcessual[] | null;
  showManualEntry: boolean;
  importProgress: number;
  isLoading: boolean;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  handleManualEntry: () => void;
  handleSaveProcess: () => Promise<void>;
  handleCreateManualProcess: (processData: any) => Promise<void>;
  handleCancel: () => void;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
  onImportAnother?: () => void;
  importComplete?: boolean;
}

export function ProcessModeSelector({
  currentMode,
  setCurrentMode,
  processMovimentos,
  showManualEntry,
  importProgress,
  isLoading,
  handleProcessSelect,
  handleManualEntry,
  handleSaveProcess,
  handleCreateManualProcess,
  handleCancel,
  onSave,
  onCancel,
  onImportAnother,
  importComplete = false
}: ProcessModeSelectorProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (currentMode === "search") {
      navigate('/processes');
    } else {
      setCurrentMode("search");
    }
  };

  // Use the passed onSave or fall back to handleSaveProcess
  const handleSave = onSave || handleSaveProcess;
  
  // Use the passed onCancel or fall back to the handleCancel function
  const handleCancelAction = onCancel || (() => setCurrentMode("search"));

  return (
    <>
      <ProcessModeHeader 
        currentMode={currentMode} 
        onBack={handleBack} 
      />

      {currentMode === "search" && (
        <ProcessModeSearch 
          showManualEntry={showManualEntry}
          isLoading={isLoading}
          handleProcessSelect={handleProcessSelect}
          handleManualEntry={handleManualEntry}
        />
      )}

      {currentMode === "details" && processMovimentos && (
        <ProcessModeDetails
          processMovimentos={processMovimentos}
          importProgress={importProgress}
          onSave={handleSave}
          onCancel={handleCancelAction}
          handleProcessSelect={handleProcessSelect}
          onImportAnother={onImportAnother}
        />
      )}

      {currentMode === "manual" && (
        <ProcessModeManual
          importProgress={importProgress}
          onSubmit={handleCreateManualProcess}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}
