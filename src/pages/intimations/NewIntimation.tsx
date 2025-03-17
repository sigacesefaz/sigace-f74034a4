import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { IntimationDetails } from "@/components/intimation/IntimationDetails";
import { IntimationForm } from "@/components/intimation/IntimationForm";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, X } from "lucide-react";
import { useProcessImport } from "@/hooks/useProcessImport";
import { Progress } from "@/components/ui/progress";

// Definindo os tipos para as etapas do wizard
type WizardStep = "search" | "details" | "manual" | "confirmation";

export default function NewIntimation() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>("search");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [savedIntimation, setSavedIntimation] = useState<any>(null);

  const {
    processMovimentos,
    selectedCourt,
    showManualEntry,
    handleProcessSelect,
    resetImportState
  } = useProcessImport();
  
  const handleManualEntry = () => {
    setCurrentStep("manual");
  };

  const handleSaveIntimation = async (formData: any) => {
    try {
      setIsLoading(true);
      
      if (!processMovimentos || processMovimentos.length === 0 && currentStep === "details") {
        toast("Dados do processo incompletos", "", { variant: "destructive" });
        return;
      }
      
      // Get the main process from the first movimento if available
      const mainProcess = processMovimentos && processMovimentos.length > 0 
        ? processMovimentos[0].process 
        : null;
      
      // Create base intimation data
      const intimationData = {
        ...formData,
        process_number: mainProcess?.numeroProcesso || formData.process_number,
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

      const { data, error } = await supabase
        .from("intimations")
        .insert([intimationData])
        .select();

      if (error) throw error;

      // Armazenar os dados da intimação salva
      setSavedIntimation(data?.[0] || intimationData);
      
      // Avançar para a tela de confirmação
      setCurrentStep("confirmation");
      toast("Intimação salva com sucesso", "", { variant: "success" });
    } catch (error) {
      console.error("Erro ao salvar intimação:", error);
      toast("Erro ao salvar intimação", "", { variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentStep("search");
    resetImportState();
  };

  const handleCreateAnother = () => {
    setCurrentStep("search");
    resetImportState();
    setSavedIntimation(null);
  };

  const processSelectHandler = async (processNumber: string, courtEndpoint: string) => {
    const success = await handleProcessSelect(processNumber, courtEndpoint);
    if (success) {
      setCurrentStep("details");
    }
    return success;
  };

  // Calcular o progresso do wizard
  const getProgressPercentage = () => {
    switch (currentStep) {
      case "search": return 25;
      case "details": 
      case "manual": return 50;
      case "confirmation": return 100;
      default: return 0;
    }
  };

  // Obter o título da etapa atual
  const getStepTitle = () => {
    switch (currentStep) {
      case "search": return "Nova Intimação - Buscar Processo";
      case "details": return "Nova Intimação - Detalhes";
      case "manual": return "Nova Intimação - Cadastro Manual";
      case "confirmation": return "Intimação Cadastrada com Sucesso";
      default: return "Nova Intimação";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={() => navigate('/intimations')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
        </div>

        {/* Barra de progresso do wizard */}
        <div className="mb-6">
          <Progress value={getProgressPercentage()} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className={currentStep === "search" ? "font-bold text-primary" : ""}>Buscar Processo</span>
            <span className={currentStep === "details" || currentStep === "manual" ? "font-bold text-primary" : ""}>Detalhes</span>
            <span className={currentStep === "confirmation" ? "font-bold text-primary" : ""}>Confirmação</span>
          </div>
        </div>

        {currentStep === "search" && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Busque o processo para a intimação</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ProcessSearch 
                onProcessSelect={processSelectHandler} 
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
            </CardContent>
          </Card>
        )}

        {currentStep === "details" && processMovimentos && processMovimentos.length > 0 && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Detalhes da Intimação</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <IntimationDetails 
                process={processMovimentos[0].process} 
                onConfirm={handleSaveIntimation} 
                onBack={handleCancel} 
              />
            </CardContent>
          </Card>
        )}

        {currentStep === "manual" && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg">Cadastro Manual de Intimação</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <IntimationForm
                onSubmit={handleSaveIntimation}
                onBack={() => setCurrentStep("search")}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === "confirmation" && (
          <Card className="p-6">
            <CardHeader className="px-0 pt-0 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-xl">Intimação Cadastrada com Sucesso!</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-2">Detalhes da Intimação:</h3>
                <p><strong>Processo:</strong> {savedIntimation?.process_number}</p>
                <p><strong>Tribunal:</strong> {savedIntimation?.court}</p>
                <p><strong>Data de Criação:</strong> {new Date(savedIntimation?.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
              <p className="text-center mb-4">Deseja cadastrar outra intimação?</p>
            </CardContent>
            <CardFooter className="flex justify-center gap-4 px-0">
              <Button 
                variant="outline" 
                onClick={() => navigate('/intimations')}
                className="min-w-[120px]"
              >
                <X className="mr-2 h-4 w-4" />
                Não
              </Button>
              <Button 
                onClick={handleCreateAnother}
                className="min-w-[120px] bg-primary"
              >
                <Check className="mr-2 h-4 w-4" />
                Sim
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
