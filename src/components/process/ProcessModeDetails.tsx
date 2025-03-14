
import React from 'react';
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { DatajudMovimentoProcessual } from "@/types/datajud";

interface ProcessModeDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  importProgress: number;
  onSave: () => Promise<void>;
  onCancel: () => void;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  onImportAnother?: () => void;
}

export function ProcessModeDetails({
  processMovimentos,
  importProgress,
  onSave,
  onCancel,
  handleProcessSelect,
  onImportAnother
}: ProcessModeDetailsProps) {
  return (
    <ProcessDetails
      processMovimentos={processMovimentos}
      mainProcess={processMovimentos[0].process}
      isImport={true}
      importProgress={importProgress}
      onSave={onSave}
      onCancel={onCancel}
      handleProcessSelect={handleProcessSelect}
      onImportAnother={onImportAnother}
    />
  );
}
