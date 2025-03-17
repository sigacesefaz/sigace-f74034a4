import { useState } from "react";
import { getProcessById } from "@/services/datajud";
import { saveProcess } from "@/services/processService";
import { toast } from "sonner";
import { DatajudMovimentoProcessual } from "@/types/datajud";

export function useProcessImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string): Promise<boolean> => {
    setIsLoading(true);
    setImportComplete(false);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      const movimentos = await getProcessById(courtEndpoint, processNumber);
      
      if (!movimentos || movimentos.length === 0) {
        toast.error("Processo não encontrado");
        setShowManualEntry(true);
        setIsLoading(false);
        return false;
      }
      
      console.log(`Processo encontrado com ${movimentos.length} movimento(s):`, movimentos);
      
      // Armazenamos todos os movimentos - não filtramos mais por número de processo
      // Isso é importante para capturar todos os hits relacionados
      setProcessMovimentos(movimentos);
      setSelectedCourt(courtEndpoint);
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast.error("Erro ao importar processo");
      setShowManualEntry(true); // Mostrar opção de cadastro manual também em caso de erro
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProcess = async (): Promise<boolean | 'PROCESS_EXISTS'> => {
    if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
      toast.error("Dados do processo incompletos");
      return false;
    }
    
    setIsLoading(true);
    try {
      const result = await saveProcess(processMovimentos, selectedCourt, setImportProgress);
      
      if (result === true) {
        setImportComplete(true);
      }
      
      return result;
    } catch (error) {
      console.error("Erro ao salvar processo:", error);
      toast.error("Erro ao salvar processo");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetImportState = () => {
    setImportProgress(0);
    setImportComplete(false);
    setProcessMovimentos(null);
    setSelectedCourt(undefined);
    setShowManualEntry(false);
  };

  return {
    isLoading,
    processMovimentos,
    selectedCourt,
    showManualEntry,
    importProgress,
    importComplete,
    setImportProgress,
    setImportComplete,
    setShowManualEntry,
    setProcessMovimentos,
    handleProcessSelect,
    handleSaveProcess,
    resetImportState
  };
}
