
import React, { useState } from "react";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { ProcessHeader } from "./ProcessHeader";
import { ProcessNavigation } from "./ProcessNavigation";
import { ProcessInformation } from "./ProcessInformation";
import { ProcessEvents } from "./ProcessEvents";
import { ProcessPartiesList } from "./ProcessPartiesList";
import { Button } from "@/components/ui/button";
import { AlertCircle, Save } from "lucide-react";

interface ProcessDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  mainProcess: DatajudProcess;
  onSave: () => Promise<boolean>;
  onCancel: () => void;
  isImport?: boolean;
  importProgress?: number;
  isPublicView?: boolean;
  isLoading?: boolean;
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
  isLoading = false,
  handleProcessSelect
}: ProcessDetailsProps) {
  const [currentMovimentoIndex, setCurrentMovimentoIndex] = useState(0);
  
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
    return await onSave();
  };

  return (
    <div>
      <ProcessHeader 
        currentProcess={currentProcess} 
        importProgress={importProgress}
        isImporting={isLoading}
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
      
      <div className="mt-6 flex justify-between">
        <Button 
          onClick={onCancel}
          variant="outline"
          disabled={isLoading}
        >
          Voltar
        </Button>
        
        {isImport && !isPublicView && (
          <Button 
            onClick={handleImportProcess}
            disabled={isLoading}
            className="bg-primary text-white"
          >
            {isLoading ? (
              <>Importando...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> 
                Importar Processo
              </>
            )}
          </Button>
        )}
      </div>
      
      {mainProcess.assuntos && mainProcess.assuntos.length === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start">
          <AlertCircle className="text-yellow-500 w-5 h-5 mr-2 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700">
              Este processo não possui assuntos cadastrados no DataJud. 
              Você poderá adicionar assuntos manualmente após a importação.
            </p>
          </div>
        </div>
      )}
      
      {isPublicView && (
        <p className="mt-4 text-xs text-gray-500 text-center">
          Esta consulta pública é fornecida apenas para fins informativos.
          Os dados são provenientes da API DataJud e podem estar incompletos ou desatualizados.
        </p>
      )}
    </div>
  );
}
