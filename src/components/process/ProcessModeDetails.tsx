
import React, { useState, useEffect } from 'react';
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ImportConfirmationDialog } from "@/components/process/ImportConfirmationDialog";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { useNavigate } from "react-router-dom";

interface ProcessModeDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  importProgress: number;
  onSave: () => Promise<void>;
  onCancel: () => void;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
}

export function ProcessModeDetails({
  processMovimentos,
  importProgress,
  onSave,
  onCancel,
  handleProcessSelect
}: ProcessModeDetailsProps) {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  
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

  const handlePrevMovimento = () => {
    if (currentMovimentoIndex > 0) {
      setCurrentMovimentoIndex(currentMovimentoIndex - 1);
    }
  };

  const handleNextMovimento = () => {
    if (currentMovimentoIndex < processMovimentos.length - 1) {
      setCurrentMovimentoIndex(currentMovimentoIndex + 1);
    }
  };

  return (
    <>
      <ProcessDetails
        processMovimentos={processMovimentos}
        mainProcess={processMovimentos[currentMovimentoIndex].process}
        isImport={true}
        importProgress={importProgress}
        onSave={onSave}
        onCancel={onCancel}
        handleProcessSelect={handleProcessSelect}
        currentMovimentoIndex={currentMovimentoIndex}
        handlePrevMovimento={handlePrevMovimento}
        handleNextMovimento={handleNextMovimento}
        totalMovimentos={processMovimentos.length}
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
