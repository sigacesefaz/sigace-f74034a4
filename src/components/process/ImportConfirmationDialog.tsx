
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ImportConfirmationDialogProps {
  onImportAnother: () => void;
  onGoToList: () => void;
}

export function ImportConfirmationDialog({ onImportAnother, onGoToList }: ImportConfirmationDialogProps) {
  return (
    <Card className="p-6 mt-4 bg-gray-50 border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-3">Processo importado com sucesso!</h3>
        <p className="text-gray-600 mb-4">Deseja importar outro processo?</p>
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={onGoToList}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Não, ir para a lista
          </Button>
          <Button
            onClick={onImportAnother}
            className="bg-primary text-white flex items-center"
          >
            Sim, importar outro
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
