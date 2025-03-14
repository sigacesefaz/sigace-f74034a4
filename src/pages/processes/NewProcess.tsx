
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessModeDetails } from "@/components/process/ProcessModeDetails";
import { ProcessForm } from "@/components/process/ProcessForm";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DatajudMovimentoProcessual, DatajudProcess } from "@/types/datajud";
import { ArrowLeft } from "lucide-react";
import { ProcessModeHeader } from "@/components/process/ProcessModeHeader";
import { saveProcess } from "@/services/processService";
import { createManualProcess } from "@/services/processService";

type FormMode = "search" | "details" | "manual";

export default function NewProcess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<FormMode>("search");
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      const movimentos = await getProcessById(courtEndpoint, processNumber);
      
      if (!movimentos || movimentos.length === 0) {
        toast("Processo não encontrado", "", { variant: "destructive" });
        setShowManualEntry(true);
        setCurrentMode("search"); // Manter no modo de busca para exibir o botão de cadastro manual
        setIsLoading(false);
        return false;
      }
      
      console.log(`Processo encontrado com ${movimentos.length} movimento(s):`, movimentos);
      
      // Agrupamos os movimentos pelo mesmo número de processo
      const numeroProcessoPrincipal = movimentos[0].process.numeroProcesso;
      const movimentosDoProcesso = movimentos.filter(m => 
        m.process.numeroProcesso === numeroProcessoPrincipal
      );
      
      console.log(`Filtrado para ${movimentosDoProcesso.length} movimento(s) do mesmo processo`);
      
      setProcessMovimentos(movimentosDoProcesso);
      setSelectedCourt(courtEndpoint);
      setCurrentMode("details");
      setShowManualEntry(false);
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast("Erro ao importar processo", "", { variant: "destructive" });
      setShowManualEntry(true); // Mostrar opção de cadastro manual também em caso de erro
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para preencher o formulário manual com dados do processo pesquisado
  const handleManualEntry = () => {
    // Se tivermos pesquisado um número de processo, usamos ele como default
    if (currentMode === "search") {
      setCurrentMode("manual");
    }
  };

  const handleSaveProcess = async () => {
    if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
      toast("Dados do processo incompletos", "", { variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    setImportProgress(5); // Iniciar a barra de progresso
    
    try {
      const success = await saveProcess(processMovimentos, selectedCourt, setImportProgress);
      if (success) {
        // Don't navigate automatically - show confirmation dialog instead
        setIsLoading(false);
      } else {
        setImportProgress(0);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      setImportProgress(0);
      setIsLoading(false);
    }
  };

  const handleCreateManualProcess = async (processData: any) => {
    setIsLoading(true);
    setImportProgress(5);
    
    try {
      const success = await createManualProcess(processData);
      if (success) {
        setImportProgress(100);
        navigate("/processes");
      } else {
        setImportProgress(0);
      }
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      toast("Erro ao cadastrar processo", "", { variant: "destructive" });
      setImportProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setProcessMovimentos(null);
    setSelectedCourt(undefined);
    setShowManualEntry(false);
    setImportProgress(0);
  };

  const handleBack = () => {
    if (currentMode === "search") {
      navigate('/processes');
    } else {
      setCurrentMode("search");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <ProcessModeHeader 
          currentMode={currentMode} 
          onBack={handleBack} 
        />

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
          <ProcessModeDetails
            processMovimentos={processMovimentos}
            importProgress={importProgress}
            onSave={handleSaveProcess}
            onCancel={handleCancel}
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
      </div>
    </div>
  );
}
