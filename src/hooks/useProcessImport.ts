
import { useState } from "react";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { saveProcess } from "@/services/processService";

export function useProcessImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      const movimentos = await getProcessById(courtEndpoint, processNumber);
      
      if (!movimentos || movimentos.length === 0) {
        toast("Processo não encontrado", "", { variant: "destructive" });
        setShowManualEntry(true);
        setIsLoading(false);
        return false;
      }
      
      console.log(`Processo encontrado com ${movimentos.length} movimento(s):`, movimentos);
      
      // Agrupamos os movimentos pelo mesmo número de processo
      const numeroProcessoPrincipal = movimentos[0].process.numeroProcesso;
      const movimentosDoProcesso = movimentos.filter(m => 
        m.process.numeroProcesso === numeroProcessoPrincipal
      );
      
      console.log(`Filtrado para ${movimentosDoProcesso.length} movimento(s) do mesmo processo`);
      
      setProcessMovimentos(movimentosDoProcesso);
      setSelectedCourt(courtEndpoint);
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast("Erro ao importar processo", "", { variant: "destructive" });
      setShowManualEntry(true); // Mostrar opção de cadastro manual também em caso de erro
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const importProcess = async () => {
    if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
      toast("Dados do processo incompletos", "", { variant: "destructive" });
      return false;
    }
    
    setIsLoading(true);
    setImportProgress(5); // Iniciar a barra de progresso
    
    try {
      const success = await saveProcess(processMovimentos, selectedCourt, setImportProgress);
      if (success) {
        toast("Processo importado com sucesso", "", { variant: "success" });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      
      // Exibir mensagem de erro mais detalhada
      if (error instanceof Error) {
        toast("Erro ao importar processo", error.message, { variant: "destructive" });
      } else {
        toast("Erro ao importar processo", "", { variant: "destructive" });
      }
      
      setImportProgress(0);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processMovimentos,
    selectedCourt,
    showManualEntry,
    importProgress,
    setImportProgress,
    setShowManualEntry,
    setProcessMovimentos,
    handleProcessSelect,
    importProcess
  };
}
