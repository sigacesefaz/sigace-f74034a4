
import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessForm } from "@/components/process/ProcessForm";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { Progress } from "@/components/ui/progress";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { useNavigate } from "react-router-dom";

type FormMode = "search" | "details" | "manual";

interface ProcessModeSelectorProps {
  currentMode: FormMode;
  setCurrentMode: (mode: FormMode) => void;
  processMovimentos: DatajudMovimentoProcessual[] | null;
  showManualEntry: boolean;
  importProgress: number;
  isLoading: boolean;
  handleProcessSelect: (processNumber: string, courtEndpoint: string) => Promise<boolean>;
  handleManualEntry: () => void;
  handleSaveProcess: () => Promise<void>;
  handleCreateManualProcess: (processData: any) => Promise<void>;
  handleCancel: () => void;
}

export function ProcessModeSelector({
  currentMode,
  setCurrentMode,
  processMovimentos,
  showManualEntry,
  importProgress,
  isLoading,
  handleProcessSelect,
  handleManualEntry,
  handleSaveProcess,
  handleCreateManualProcess,
  handleCancel
}: ProcessModeSelectorProps) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => currentMode === "search" ? navigate('/processes') : setCurrentMode("search")} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {currentMode === "search" ? "Novo Processo" : currentMode === "details" ? "Detalhes do Processo" : "Cadastro Manual de Processo"}
        </h1>
      </div>

      {currentMode === "search" && (
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
      )}

      {currentMode === "details" && processMovimentos && (
        <ProcessDetails
          processMovimentos={processMovimentos}
          mainProcess={processMovimentos[0].process}
          isImport={true}
          importProgress={importProgress}
          onSave={handleSaveProcess}
          onCancel={() => setCurrentMode("search")}
          handleProcessSelect={handleProcessSelect}
        />
      )}

      {currentMode === "manual" && (
        <>
          <Button variant="ghost" className="mb-4" onClick={() => setCurrentMode("search")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Busca
          </Button>
          <Card className="p-6">
            <ProcessForm onSubmit={handleCreateManualProcess} onCancel={handleCancel} />
            
            {importProgress > 0 && (
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Importando processo...</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}
