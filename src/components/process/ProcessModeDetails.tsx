
import React, { useState, useEffect } from 'react';
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ImportConfirmationDialog } from "@/components/process/ImportConfirmationDialog";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { useNavigate } from "react-router-dom";

interface ProcessModeDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  importProgress: number;
  onSave: () => Promise<boolean | void>; // Update to accept either boolean or void return type
  onCancel: () => void;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  importProcess?: () => Promise<boolean>;
}

export function ProcessModeDetails({
  processMovimentos,
  importProgress,
  onSave,
  onCancel,
  handleProcessSelect,
  importProcess
}: ProcessModeDetailsProps) {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Show confirmation dialog when import is complete
  useEffect(() => {
    if (importProgress === 100) {
      setShowConfirmation(true);
    } else {
      setShowConfirmation(false);
    }
  }, [importProgress]);
  
  const handleImportAnother = () => {
    onCancel(); // Go back to search screen
  };
  
  const handleGoToList = () => {
    navigate('/processes'); // Go to process list
  };

  return (
    <>
      <ProcessDetails
        processMovimentos={processMovimentos}
        mainProcess={processMovimentos[0].process}
        onSave={onSave}
        onCancel={onCancel}
        isImport={true}
        importProgress={importProgress}
      />
      
      {showConfirmation && (
        <ImportConfirmationDialog 
          onImportAnother={handleImportAnother}
          onGoToList={handleGoToList}
        />
      )}
    </>
  );
}
