import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatajudProcess } from "@/types/datajud";
import { formatProcessNumber } from "@/utils/format";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{currentProcess.classe?.nome || "Processo"}</h1>
          <div className="font-mono text-gray-700 mt-1">{formatProcessNumber(currentProcess.numeroProcesso)}</div>
        </div>
        
        {!isPublicView && handleImportProcess && (
          <div className="flex-shrink-0">
            <Button 
              onClick={handleImportProcess}
              disabled={isImporting}
              className="bg-primary text-white"
            >
              {isImporting ? "Importando..." : "Importar Processo"}
            </Button>
          </div>
        )}
      </div>
      
      {importProgress > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Importando processo</span>
            <span>{importProgress}%</span>
          </div>
          <Progress value={importProgress} />
        </div>
      )}
      
      {isPublicView && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-700 text-sm mb-4">
          <p className="font-semibold">Visualização pública</p>
          <p>Você está consultando dados públicos do processo.</p>
        </div>
      )}
    </div>
  );
}
