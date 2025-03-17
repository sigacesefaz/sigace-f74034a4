import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

interface ProcessModeDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  importProgress: number;
  importComplete?: boolean;
  onSave: () => Promise<boolean | 'PROCESS_EXISTS'>;
  onCancel: () => void;
  onImportAnother?: () => void;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  isLoading?: boolean;
}

export function ProcessModeDetails({
  processMovimentos,
  importProgress,
  importComplete = false,
  onSave,
  onCancel,
  onImportAnother,
  handleProcessSelect,
  isLoading = false
}: ProcessModeDetailsProps) {
  const navigate = useNavigate();
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  
  useEffect(() => {
    // When import is complete (progress at 100%), show the completion dialog
    if (importProgress === 100 && importComplete) {
      setShowCompletionDialog(true);
    }
  }, [importProgress, importComplete]);

  const handleImportAnother = () => {
    setShowCompletionDialog(false);
    if (onImportAnother) {
      onImportAnother();
    } else {
      // Fallback if onImportAnother is not provided
      onCancel();
    }
  };

  const handleGoToProcessList = () => {
    setShowCompletionDialog(false);
    navigate('/processes');
  };

  const handleSaveClick = async () => {
    const result = await onSave();
    if (result === true) {
      setShowCompletionDialog(true);
    }
    return result === true;
  };

  return (
    <>
      {importProgress > 0 && importProgress < 100 && (
        <div className="mb-4">
          <Progress value={importProgress} className="w-full" />
          <p className="text-sm text-gray-500 mt-1 text-center">
            Importando processo... {importProgress}%
          </p>
        </div>
      )}
      
      <ProcessDetails
        processMovimentos={processMovimentos}
        mainProcess={processMovimentos[0].process}
        isImport={true}
        onSave={handleSaveClick}
        onCancel={onCancel}
        handleProcessSelect={handleProcessSelect}
        isLoading={isLoading}
      />

      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processo importado com sucesso</AlertDialogTitle>
            <AlertDialogDescription>
              O processo foi importado com êxito para o sistema. O que deseja fazer agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleGoToProcessList}>Ver Lista de Processos</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportAnother}>Importar Outro Processo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
