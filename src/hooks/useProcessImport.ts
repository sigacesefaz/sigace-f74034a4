import { useState } from "react";
import { getProcessById } from "@/services/datajud";
import { saveProcess } from "@/services/processService";
import { toast } from "sonner";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { supabase } from '@/lib/supabase';

export function useProcessImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string): Promise<DatajudMovimentoProcessual[] | false> => {
    setIsLoading(true);
    setImportComplete(false);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      // Normalize the process number by removing non-numeric characters
      const normalizedNumber = processNumber.replace(/\D/g, '');
      console.log(`Normalized process number: ${normalizedNumber}`);
      
      const movimentos = await getProcessById(courtEndpoint, normalizedNumber);
      
      if (!movimentos || movimentos.length === 0) {
        toast.error("Processo não encontrado");
        setShowManualEntry(true);
        setIsLoading(false);
        return false;
      }
      
      console.log(`Processo encontrado com ${movimentos.length} movimento(s):`, movimentos);
      
      // Armazenamos os movimentos no estado (para manter compatibilidade)
      setProcessMovimentos(movimentos);
      setSelectedCourt(courtEndpoint);
      
      return movimentos;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast.error("Erro ao importar processo");
      setShowManualEntry(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para verificar se o processo possui os códigos 22 ou 848 nos movimentos
  const checkProcessStatus = (movimentos: DatajudMovimentoProcessual[]): string => {
    // Se não temos movimentos, consideramos o processo em andamento
    if (!movimentos || movimentos.length === 0) {
      return "Em andamento";
    }
    
    // Verificar todos os hits por movimentos com código 22 ou 848
    for (const hit of movimentos) {
      // Verificar se o hit tem movimentos e se é um array
      if (!hit.process?.movimentos || !Array.isArray(hit.process.movimentos)) {
        continue;
      }
      
      // Verificar se existe algum movimento com código 22 ou 848
      const hasBaixaMovement = hit.process.movimentos.some(
        movimento => movimento.codigo === 22 || movimento.codigo === 848
      );
      
      // Se encontrou algum movimento de baixa, retorna "Baixado"
      if (hasBaixaMovement) {
        return "Baixado";
      }
    }
    
    // Se não encontrou movimento de baixa em nenhum hit, retorna "Em andamento"
    return "Em andamento";
  };

  const handleSaveProcess = async (movimentos?: DatajudMovimentoProcessual[], court?: string) => {
    console.log("=== INICIANDO handleSaveProcess ===");
    try {
      // Use os movimentos passados como parâmetro ou os do estado
      const processMovimentosToUse = movimentos || processMovimentos;
      const courtToUse = court || selectedCourt;

      if (!processMovimentosToUse || processMovimentosToUse.length === 0) {
        console.error("Nenhum processo para importar", { processMovimentos: processMovimentosToUse });
        toast.error('Nenhum processo selecionado para importação');
        return false;
      }

      if (!courtToUse) {
        console.error("Tribunal não especificado");
        toast.error('Tribunal não especificado');
        return false;
      }

      console.log("Dados do processo para importar:", {
        movimentos: processMovimentosToUse.length,
        tribunal: courtToUse,
        primeiroMovimento: {
          id: processMovimentosToUse[0].id,
          processo: processMovimentosToUse[0].process.numeroProcesso
        }
      });

      const mainProcess = processMovimentosToUse[0].process;
      
      // Verificar se o processo já existe usando apenas o número do processo limpo
      const numeroProcessoLimpo = mainProcess.numeroProcesso.replace(/\D/g, '');
      console.log("Verificando processo existente:", numeroProcessoLimpo);

      const { data: existingProcess, error: checkError } = await supabase
        .from('processes')
        .select('id')
        .eq('number', numeroProcessoLimpo)
        .maybeSingle();

      if (checkError) {
        console.error("Erro ao verificar processo existente:", checkError);
        toast.error(`Erro ao verificar processo: ${checkError.message}`);
        return false;
      }

      if (existingProcess) {
        console.log("Processo já existe:", existingProcess);
        return 'PROCESS_EXISTS';
      }

      // Determinar o status do processo com base nos movimentos
      const processStatus = checkProcessStatus(processMovimentosToUse);
      console.log("Status determinado:", processStatus);
      
      console.log("Chamando saveProcess com:", {
        movimentos: processMovimentosToUse.length,
        tribunal: courtToUse,
        status: processStatus
      });

      // Use the saveProcess function from processService, passing the determined status
      const result = await saveProcess(processMovimentosToUse, courtToUse, processStatus, setImportProgress);
      
      console.log("Resultado do saveProcess:", result);

      if (result === true) {
        setImportComplete(true);
        toast.success('Processo importado com sucesso!');
      } else if (result === 'PROCESS_EXISTS') {
        console.log("Processo já existe (retorno do saveProcess)");
        toast.error("Este processo já foi cadastrado anteriormente");
      } else {
        console.error("Falha ao salvar processo");
        toast.error("Erro ao salvar processo");
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      toast.error('Erro ao salvar processo');
      return false;
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
    resetImportState,
    checkProcessStatus
  };
}
