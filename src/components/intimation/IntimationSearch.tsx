
import { useState } from "react";
import { ProcessSearchPanel } from "@/components/shared/ProcessSearchPanel";
import { Court, DatajudProcess } from "@/types/datajud";

export interface IntimationSearchProps {
  onSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  onManual: () => void;
  isLoading: boolean;
}

export function IntimationSearch({ onSelect, onManual, isLoading }: IntimationSearchProps) {
  const handleProcessSelect = (process: DatajudProcess, courtEndpoint: string) => {
    return onSelect(process.numeroProcesso, courtEndpoint);
  };

  return (
    <ProcessSearchPanel
      onProcessSelect={handleProcessSelect}
      onManualEntry={onManual} // Now this prop name matches the one in ProcessSearchPanel
      buttonLabel="Buscar Intimação"
    />
  );
}
