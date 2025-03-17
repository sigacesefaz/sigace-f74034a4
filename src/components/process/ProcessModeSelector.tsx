
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
  handleSaveProcess: () => Promise<boolean>;
  handleCreateManualProcess: (processData: any) => Promise<void>;
  handleCancel: () => void;
  handleImportAnother?: () => void;
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
  handleImportAnother,
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
          importComplete={importComplete}
          onSave={handleSaveProcess}
          onCancel={() => setCurrentMode("search")}
          handleProcessSelect={handleProcessSelect}
          onImportAnother={handleImportAnother}
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
