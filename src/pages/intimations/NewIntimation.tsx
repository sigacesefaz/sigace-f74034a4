
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { IntimationDetails } from "@/components/intimation/IntimationDetails";
import { IntimationForm } from "@/components/intimation/IntimationForm";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatajudProcess, DatajudHit } from "@/types/datajud";
import { ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

type FormMode = "search" | "details" | "manual";

export default function NewIntimation() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<FormMode>("search");
  const [processData, setProcessData] = useState<DatajudHit[] | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    try {
      console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
      
      const processData = await getProcessById(courtEndpoint, processNumber);
      
      if (!processData || processData.length === 0) {
        toast.error("Processo não encontrado");
        setShowManualEntry(true);
        setCurrentMode("search"); // Manter no modo de busca para exibir o botão de cadastro manual
        setIsLoading(false);
        return false;
      }
      
      console.log("Processo encontrado:", processData);
      setProcessData(processData);
      setSelectedCourt(courtEndpoint);
      setCurrentMode("details");
      setShowManualEntry(false);
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast.error("Erro ao importar processo");
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
      if (!processData || processData.length === 0) {
        toast.error("Dados do processo incompletos");
        return;
      }
      
      // Get the main process from the first hit
      const mainProcess = processData[0].process;
      
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
          toast.error("Erro ao fazer upload do comprovante");
        } else {
          intimationData.receipt_file = filePath;
        }
      }

      const { error } = await supabase.from("intimations").insert([intimationData]);

      if (error) throw error;

      toast.success("Intimação salva com sucesso!");
      navigate("/intimations");
    } catch (error) {
      console.error("Erro ao salvar intimação:", error);
      toast.error("Erro ao salvar intimação");
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setProcessData(null);
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

        {currentMode === "details" && processData && processData.length > 0 && (
          <Card className="p-6">
            <IntimationDetails 
              process={processData[0].process} 
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
