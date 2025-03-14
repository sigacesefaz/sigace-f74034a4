
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, CircleCheck } from "lucide-react";

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: "search",
    title: "Busca",
    description: "Buscar processo por número",
  },
  {
    id: "verify",
    title: "Verificação",
    description: "Verificar identidade",
  },
  {
    id: "view",
    title: "Visualização",
    description: "Consultar dados do processo",
  },
];

interface PublicConsultationWizardProps {
  children: React.ReactNode;
}

export function PublicConsultationWizard({ children }: PublicConsultationWizardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Determine current step based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/public/search")) {
      setCurrentStepIndex(0);
    } else if (path.includes("/public/verify")) {
      setCurrentStepIndex(1);
    } else if (path.includes("/public/process-view")) {
      setCurrentStepIndex(2);
    }
  }, [location.pathname]);

  const handleBack = () => {
    if (currentStepIndex === 0) {
      // If we're on the first step, go back to the landing page
      navigate("/");
    } else if (currentStepIndex === 1) {
      // From verification to search
      navigate("/public/search");
    } else if (currentStepIndex === 2) {
      // From process view to verification
      navigate("/public/verify");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header with logo */}
      <header className="bg-white border-b shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center space-x-2">
          <img 
            src="/images/logo_sefaz_estado.png" 
            alt="Governo do Tocantins" 
            className="h-10 object-contain" 
          />
          <div className="flex flex-col">
            <span className="font-bold text-[#2e3092] text-sm md:text-base">
              SIGACE - Sistema de Gestão de Ações Contra o Estado
            </span>
            <span className="text-xs text-gray-500">
              Consulta Pública de Processos
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#2e3092]">Consulta Pública</h1>
            <p className="text-sm text-gray-600">
              Consulte informações públicas de processos judiciais
            </p>
          </div>

          {/* Progress steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {WIZARD_STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        index < currentStepIndex
                          ? "bg-green-500 border-green-500 text-white"
                          : index === currentStepIndex
                          ? "border-[#2e3092] text-[#2e3092]"
                          : "border-gray-300 text-gray-300"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p
                        className={`text-xs font-medium ${
                          index <= currentStepIndex ? "text-[#2e3092]" : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 hidden md:block">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector line (except after last step) */}
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        index < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <Card className="p-6 shadow-md">
            {/* Back button */}
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
            </div>

            {/* Step content */}
            <div className="py-2">{children}</div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Secretaria da Fazenda do Tocantins</p>
            <p className="text-xs mt-1">
              Os dados apresentados são fornecidos pelo DataJud e têm caráter meramente informativo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
