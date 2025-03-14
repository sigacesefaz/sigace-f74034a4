
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
  importComplete?: boolean;
  isLoading: boolean;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  handleManualEntry: () => void;
  handleSaveProcess: () => Promise<void>;
  handleCreateManualProcess: (processData: any) => Promise<void>;
  handleCancel: () => void;
  onImportAnother?: () => void;
}

export function ProcessModeSelector({
  currentMode,
  setCurrentMode,
  processMovimentos,
  showManualEntry,
  importProgress,
  importComplete = false,
  isLoading,
  handleProcessSelect,
  handleManualEntry,
  handleSaveProcess,
  handleCreateManualProcess,
  handleCancel,
  onImportAnother
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
          onImportAnother={onImportAnother || (() => setCurrentMode("search"))}
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
