import React, { useState, useMemo } from "react";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { ProcessHeader } from "./ProcessHeader";
import { ProcessNavigation } from "./ProcessNavigation";
import { ProcessInformation } from "./ProcessInformation";
import { ProcessEvents } from "./ProcessEvents";
import { ProcessPartiesList } from "./ProcessPartiesList";
import { Button } from "@/components/ui/button";

interface ProcessDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  mainProcess: DatajudProcess;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isImport?: boolean;
  importProgress?: number;
  isPublicView?: boolean;
  handleProcessSelect?: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
}

export function ProcessDetails({
  processMovimentos,
  mainProcess,
  isImport = false,
  onSave,
  onCancel,
  importProgress = 0,
  isPublicView = false,
  handleProcessSelect
}: ProcessDetailsProps) {
  const navigate = useNavigate();
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  
  // Se não existirem movimentos processuais múltiplos, utilizar o principal
  const currentMovimento = processMovimentos[currentMovimentoIndex] || processMovimentos[0];
  const currentProcess = currentMovimento.process;
  
  const totalMovimentos = processMovimentos.length;
  
  const handleNextMovimento = () => {
    if (currentMovimentoIndex < totalMovimentos - 1) {
      setCurrentMovimentoIndex(currentMovimentoIndex + 1);
    }
  };
  
  const handlePrevMovimento = () => {
    if (currentMovimentoIndex > 0) {
      setCurrentMovimentoIndex(currentMovimentoIndex - 1);
    }
  };

  const handleImportProcess = async () => {
    if (!handleProcessSelect) {
      console.error("handleProcessSelect function is not provided");
      toast("Erro ao importar processo", "Função de importação não disponível", { variant: "destructive" });
      return;
    }
    
    setIsImporting(true);
    try {
      const success = await handleProcessSelect(currentProcess.numeroProcesso, currentProcess.tribunal);
      if (!success) {
        toast("Erro ao importar processo", "Não foi possível importar o processo", { variant: "destructive" });
      } else {
        toast("Processo importado com sucesso", "", { variant: "default" });
        onSave();
      }
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast("Erro ao importar processo", "", { variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div>
      <ProcessHeader 
        currentProcess={currentProcess} 
        importProgress={importProgress}
        isImporting={isImporting}
        handleImportProcess={handleImportProcess}
        isPublicView={isPublicView}
      />
      
      <ProcessNavigation
        currentMovimentoIndex={currentMovimentoIndex}
        totalMovimentos={totalMovimentos}
        handlePrevMovimento={handlePrevMovimento}
        handleNextMovimento={handleNextMovimento}
      />

      <ProcessInformation currentProcess={currentProcess} />
      
      <ProcessEvents currentProcess={currentProcess} />
      
      {!isPublicView && (
        <ProcessPartiesList parties={currentProcess.partes} />
      )}
      
      {isPublicView && (
        <div className="mt-6 text-center">
          <Button 
            onClick={onCancel}
            className="bg-gray-500 text-white hover:bg-gray-600"
          >
            Voltar
          </Button>
          <p className="mt-4 text-xs text-gray-500">
            Esta consulta pública é fornecida apenas para fins informativos.
            Os dados são provenientes da API DataJud e podem estar incompletos ou desatualizados.
          </p>
        </div>
      )}
    </div>
  );
}
