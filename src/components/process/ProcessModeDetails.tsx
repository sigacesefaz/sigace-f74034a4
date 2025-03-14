
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

interface ProcessModeDetailsProps {
  processMovimentos: DatajudMovimentoProcessual[];
  importProgress: number;
  importComplete?: boolean;
  onSave: () => Promise<void>;
  onCancel: () => void;
  onImportAnother: () => void;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
}

export function ProcessModeDetails({
  processMovimentos,
  importProgress,
  importComplete = false,
  onSave,
  onCancel,
  onImportAnother,
  handleProcessSelect
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
    onImportAnother();
  };

  const handleGoToProcessList = () => {
    setShowCompletionDialog(false);
    navigate('/processes');
  };

  return (
    <>
      <ProcessDetails
        processMovimentos={processMovimentos}
        mainProcess={processMovimentos[0].process}
        isImport={true}
        importProgress={importProgress}
        onSave={onSave}
        onCancel={onCancel}
        handleProcessSelect={handleProcessSelect}
      />

      <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Processo importado com sucesso</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja importar um novo processo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleGoToProcessList}>Não</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportAnother}>Sim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
