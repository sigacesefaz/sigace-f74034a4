
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
  importComplete?: boolean; // Added importComplete as an optional property
  isLoading: boolean;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  handleManualEntry: () => void;
  handleSaveProcess: () => Promise<void>;
  handleCreateManualProcess: (processData: any) => Promise<void>;
  handleCancel: () => void;
  onImportAnother?: () => void; // Added onImportAnother as an optional property
  onSave?: () => Promise<void>; // Added onSave as an optional property
}

export function ProcessModeSelector({
  currentMode,
  setCurrentMode,
  processMovimentos,
  showManualEntry,
  importProgress,
  importComplete = false, // Set a default value of false
  isLoading,
  handleProcessSelect,
  handleManualEntry,
  handleSaveProcess,
  handleCreateManualProcess,
  handleCancel,
  onImportAnother, // Include the new prop
  onSave  // Include the new prop
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
          importComplete={importComplete} // Pass the importComplete prop
          onSave={onSave || handleSaveProcess} // Use onSave if provided, otherwise use handleSaveProcess
          onCancel={() => setCurrentMode("search")}
          handleProcessSelect={handleProcessSelect}
          onImportAnother={onImportAnother || (() => setCurrentMode("search"))} // Use onImportAnother if provided, otherwise default behavior
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
