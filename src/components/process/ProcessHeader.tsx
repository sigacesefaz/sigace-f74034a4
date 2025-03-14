
import React from "react";
import { DatajudProcess } from "@/types/datajud";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ProcessHeaderProps {
  currentProcess: DatajudProcess;
  importProgress?: number;
  isImporting?: boolean;
  handleImportProcess?: () => Promise<void>;
  isPublicView?: boolean;
}

export function ProcessHeader({
  currentProcess,
  importProgress = 0,
  isImporting = false,
  handleImportProcess,
  isPublicView = false
}: ProcessHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold">
            {currentProcess.classe?.nome || "Processo"} - {currentProcess.numeroProcesso}
          </h2>
          <p className="text-sm text-gray-500">
            {currentProcess.tribunal} - Grau: {currentProcess.grau}
          </p>
        </div>
        
        {!isPublicView && handleImportProcess && importProgress === 0 && (
          <Button 
            onClick={handleImportProcess}
            disabled={isImporting}
            className="bg-primary text-white mt-2 sm:mt-0"
          >
            {isImporting ? "Importando..." : "Importar Processo"}
          </Button>
        )}
      </div>
      
      {importProgress > 0 && (
        <div className="mt-2 mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Importando processo...</span>
            <span>{Math.round(importProgress)}%</span>
          </div>
          <Progress value={importProgress} className="h-2" />
          
          {importProgress === 100 && (
            <div className="flex items-center text-green-600 font-medium mt-2">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <span>Processo importado com sucesso!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
