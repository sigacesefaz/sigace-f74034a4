
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { IntimationDetails } from "@/components/intimation/IntimationDetails";
import { IntimationForm } from "@/components/intimation/IntimationForm";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatajudProcess, DatajudMovimentoProcessual } from "@/types/datajud";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

type FormMode = "search" | "details" | "manual";

export default function NewIntimation() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<FormMode>("search");
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

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
      
      console.log("Processo encontrado:", movimentos);
      setProcessMovimentos(movimentos);
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
  
  const handleManualEntry = () => {
    setCurrentMode("manual");
  };

  const handleSaveIntimation = async (formData: any) => {
    try {
      if (!processMovimentos || processMovimentos.length === 0) {
        toast("Dados do processo incompletos", "", { variant: "destructive" });
        return;
      }
      
      // Get the main process from the first movimento
      const mainProcess = processMovimentos[0].process;
      
      // Create base intimation data
      const intimationData = {
        ...formData,
        process_number: mainProcess.numeroProcesso || formData.process_number,
        court: selectedCourt || formData.court,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      
      // Handle receipt file upload if present
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `intimation-receipts/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, receiptFile);
          
        if (uploadError) {
          console.error("Erro ao fazer upload do arquivo:", uploadError);
          toast("Erro ao fazer upload do comprovante", "", { variant: "destructive" });
        } else {
          intimationData.receipt_file = filePath;
        }
      }

      const { error } = await supabase.from("intimations").insert([intimationData]);

      if (error) throw error;

      toast("Intimação salva com sucesso", "", { variant: "success" });
      navigate("/intimations");
    } catch (error) {
      console.error("Erro ao salvar intimação:", error);
      toast("Erro ao salvar intimação", "", { variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setProcessMovimentos(null);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/intimations')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-[#2e3092]">
            {currentMode === "search" ? "Nova Intimação" : 
             currentMode === "details" ? "Detalhes da Intimação" : 
             "Cadastro Manual de Intimação"}
          </h1>
        </div>

        {currentMode === "search" && (
          <Card className="p-6">
            <ProcessSearch 
              onProcessSelect={handleProcessSelect} 
              onManual={handleManualEntry} 
              isLoading={isLoading}
            />
            {showManualEntry && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Processo não encontrado</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Não foi possível encontrar o processo na base de dados do tribunal.
                    Você pode cadastrar manualmente os dados da intimação.
                  </p>
                  <Button 
                    onClick={handleManualEntry}
                    className="bg-primary text-white"
                  >
                    Cadastrar Intimação Manualmente
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {currentMode === "details" && processMovimentos && processMovimentos.length > 0 && (
          <Card className="p-6">
            <IntimationDetails 
              process={processMovimentos[0].process} 
              onConfirm={handleSaveIntimation} 
              onBack={handleCancel} 
            />
          </Card>
        )}

        {currentMode === "manual" && (
          <Card className="p-6">
            <IntimationForm
              onSubmit={handleSaveIntimation}
              onBack={() => setCurrentMode("search")}
            />
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
