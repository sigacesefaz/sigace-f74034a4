import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatajudProcess } from "@/types/datajud";
import { formatProcessNumber } from "@/utils/format";
import { Badge } from "@/components/ui/badge";

interface ProcessHeaderProps {
  currentProcess: DatajudProcess;
  importProgress?: number;
  isImporting?: boolean;
  handleImportProcess?: () => Promise<void>;
  isPublicView?: boolean;
  currentMovementIndex?: number;
}

export function ProcessHeader({ 
  currentProcess, 
  importProgress = 0,
  isImporting = false,
  handleImportProcess,
  isPublicView = false,
  currentMovementIndex = 0
}: ProcessHeaderProps) {
  // Função para obter classes únicas das movimentações
  const getUniqueClasses = (movements: any[] = []) => {
    return [...new Set(movements.map(m => m.nome))];
  };

  const currentMovement = currentProcess.movimentos?.[currentMovementIndex];
  const uniqueClasses = getUniqueClasses(currentProcess.movimentos || []);

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-gray-700 font-bold">{currentProcess.classe?.nome || "Processo"}</h1>
          </div>
          <div className="font-mono text-gray-700 mt-1">{formatProcessNumber(currentProcess.numeroProcesso)}</div>
          <div className="mt-2 w-full">
            {!isPublicView && handleImportProcess && (
              <div className="mb-4 flex justify-end">
                <Button 
                  onClick={handleImportProcess}
                  disabled={isImporting}
                  className="bg-primary text-white"
                >
                  {isImporting ? "Importando..." : (
                    <>
                      <span className="hidden md:inline">Importar Processo</span>
                      <span className="md:hidden">Importar</span>
                    </>
                  )}
                </Button>
              </div>
            )}
            <Badge variant="secondary" className="text-sm block">
              {currentProcess.movimentos && currentProcess.movimentos.length > 0 
                ? `${currentProcess.movimentos.length} eventos`
                : "Sem eventos"}
            </Badge>
          </div>
        </div>
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
