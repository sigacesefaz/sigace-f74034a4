
import { ProcessSearchPanel } from "@/components/shared/ProcessSearchPanel";
import { DatajudMovimentoProcessual } from "@/types/datajud";

export interface IntimationSearchProps {
  onSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  onManual: () => void;
  isLoading: boolean;
}

export function IntimationSearch({ onSelect, onManual, isLoading }: IntimationSearchProps) {
  const handleProcessSelect = (movimentos: DatajudMovimentoProcessual[], courtEndpoint: string) => {
    // Take the first process from the array since we only need one
    if (movimentos && movimentos.length > 0) {
      return onSelect(movimentos[0].process.numeroProcesso, courtEndpoint);
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
