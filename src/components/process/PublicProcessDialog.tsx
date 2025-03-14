
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { EmailVerificationForm } from "@/components/process/EmailVerificationForm";
import { ProcessView } from "@/components/process/ProcessView";
import { PublicConsultationTerms } from "@/components/process/PublicConsultationTerms";

type ProcessDialogStep = "terms" | "search" | "verify" | "view";

interface PublicProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicProcessDialog({ open, onOpenChange }: PublicProcessDialogProps) {
  const [step, setStep] = useState<ProcessDialogStep>("terms");
  const [processNumber, setProcessNumber] = useState<string>("");
  const [courtEndpoint, setCourtEndpoint] = useState<string>("");
  const [verifiedEmail, setVerifiedEmail] = useState<string>("");

  const handleProcessSelect = async (processNum: string, court: string) => {
    setProcessNumber(processNum);
    setCourtEndpoint(court);
    setStep("verify");
    return true;
  };

  const handleVerificationComplete = (email: string) => {
    setVerifiedEmail(email);
    setStep("view");
  };

  const handleTermsAccepted = () => {
    setStep("search");
  };

  const handleReset = () => {
    setStep("terms");
    setProcessNumber("");
    setCourtEndpoint("");
    setVerifiedEmail("");
  };

  let title = "Consulta Pública de Processos";
  if (step === "terms") title = "Termos de Consulta";
  if (step === "verify") title = "Verificação de Email";
  if (step === "view") title = "Detalhes do Processo";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {step === "terms" && (
          <div className="py-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Esta pesquisa é realizada utilizando a API Pública do DATAJUD. Os dados retornados são 
                informações públicas de processos judiciais, e podem ou não estar disponíveis dependendo 
                do tribunal e das configurações de privacidade do processo.
              </p>
              
              <p className="text-sm text-gray-600">
                A consulta tem finalidade meramente informativa e não substitui a consulta oficial 
                aos sites dos tribunais. Os dados são fornecidos sem garantia de completude, precisão 
                ou atualização.
              </p>
              
              <div className="flex justify-end mt-6">
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-primary text-white hover:bg-primary/90 h-10 px-4 py-2"
                  onClick={handleTermsAccepted}
                >
                  Concordar e Continuar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {step === "search" && (
          <div className="py-4">
            <ProcessSearch 
              onProcessSelect={handleProcessSelect} 
              isPublic={true}
            />
          </div>
        )}
        
        {step === "verify" && processNumber && (
          <EmailVerificationForm 
            processNumber={processNumber}
            onVerificationComplete={handleVerificationComplete}
            onCancel={() => setStep("search")}
          />
        )}
        
        {step === "view" && processNumber && verifiedEmail && (
          <ProcessView 
            processNumber={processNumber}
            courtEndpoint={courtEndpoint}
            email={verifiedEmail}
            onBack={() => setStep("search")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
