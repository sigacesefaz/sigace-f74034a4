
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IntimationSearch } from "@/components/intimation/IntimationSearch";
import { IntimationForm } from "@/components/intimation/IntimationForm";
import { ArrowLeft } from "lucide-react";

export default function NewIntimationFinal() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<"search" | "form">("search");
  const [processNumber, setProcessNumber] = useState("");
  const [courtEndpoint, setCourtEndpoint] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    try {
      setIsLoading(true);
      setProcessNumber(processNumber);
      setCourtEndpoint(courtEndpoint);
      setCurrentStep("form");
      return true;
    } catch (error) {
      console.error("Error selecting process:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    setCurrentStep("form");
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      setIsLoading(true);
      console.log("Form data:", formData);
      // Aqui seria implementada a lógica para salvar a intimação
      navigate("/intimations");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => currentStep === "search" ? navigate('/intimations') : setCurrentStep("search")} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {currentStep === "search" ? "Nova Intimação" : "Detalhes da Intimação"}
          </h1>
        </div>

        {currentStep === "search" && (
          <Card className="p-6">
            <IntimationSearch 
              onSelect={handleProcessSelect}
              onManual={handleManualEntry}
              isLoading={isLoading}
            />
          </Card>
        )}

        {currentStep === "form" && (
          <Card className="p-6">
            <IntimationForm 
              onSubmit={handleFormSubmit}
              onBack={() => setCurrentStep("search")}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
