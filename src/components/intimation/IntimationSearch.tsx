
import { ProcessSearchPanel } from "@/components/shared/ProcessSearchPanel";
import { DatajudProcess } from "@/types/datajud";

export interface IntimationSearchProps {
  onSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  onManual: () => void;
  isLoading: boolean;
}

export function IntimationSearch({ onSelect, onManual, isLoading }: IntimationSearchProps) {
  const handleProcessSelect = (processes: DatajudProcess[], courtEndpoint: string) => {
    // Take the first process from the array since we only need one
    if (processes && processes.length > 0) {
      return onSelect(processes[0].numeroProcesso, courtEndpoint);
    }
    return Promise.resolve(false);
  };

  return (
    <ProcessSearchPanel
      onProcessSelect={handleProcessSelect}
      onManualEntry={onManual}
      buttonLabel="Buscar Intimação"
      isLoading={isLoading}
    />
  );
}
