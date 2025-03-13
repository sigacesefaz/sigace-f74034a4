
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import { DatajudProcess } from "@/types/datajud";
import { formatProcessNumber } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface ProcessHeaderProps {
  currentProcess: DatajudProcess;
  importProgress: number;
  isImporting: boolean;
  handleImportProcess: () => Promise<void>;
}

export function ProcessHeader({
  currentProcess,
  importProgress,
  isImporting,
  handleImportProcess
}: ProcessHeaderProps) {
  return (
    <>
      {/* Cabeçalho do processo */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{currentProcess.classe?.nome || "Processo"}</h2>
          <p className="text-lg">{formatProcessNumber(currentProcess.numeroProcesso)}</p>
          <div className="text-sm text-gray-600 mt-2">
            <div>Tribunal: {currentProcess.tribunal}</div>
            <div>Órgão Julgador: {currentProcess.orgaoJulgador?.nome}</div>
            <div>Data de Ajuizamento: {formatDate(currentProcess.dataAjuizamento)}</div>
          </div>
        </div>
        
        {/* Botão de importar processo */}
        <Button 
          variant="outline"
          size="sm"
          onClick={handleImportProcess}
          className="flex items-center gap-2"
          disabled={(importProgress > 0 && importProgress < 100) || isImporting}
        >
          <Download className="h-4 w-4" />
          {isImporting ? "Importando..." : "Importar Processo"}
        </Button>
      </div>

      {/* Progress indicator for imports */}
      {importProgress > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Importando processo...</span>
            <span>{Math.round(importProgress)}%</span>
          </div>
          <Progress value={importProgress} className="h-2" />
        </div>
      )}
    </>
  );
}
