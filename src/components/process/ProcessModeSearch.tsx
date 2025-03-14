
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcessSearch } from "@/components/process/ProcessSearch";

interface ProcessModeSearchProps {
  showManualEntry: boolean;
  isLoading: boolean;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  handleManualEntry: () => void;
}

export function ProcessModeSearch({
  showManualEntry,
  isLoading,
  handleProcessSelect,
  handleManualEntry
}: ProcessModeSearchProps) {
  return (
    <Card className="p-6">
      <ProcessSearch 
        onProcessSelect={handleProcessSelect} 
        onManual={handleManualEntry} 
      />
      {showManualEntry && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">Processo não encontrado</h3>
            <p className="text-sm text-gray-500 mb-4">
              Não foi possível encontrar o processo na base de dados do tribunal.
              Você pode cadastrar manualmente os dados do processo.
            </p>
            <Button 
              onClick={handleManualEntry}
              className="bg-primary text-white"
            >
              Cadastrar Processo Manualmente
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
