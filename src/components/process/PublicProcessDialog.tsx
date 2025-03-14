
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { EmailVerificationForm } from "@/components/process/EmailVerificationForm";
import { ProcessView } from "@/components/process/ProcessView";

type ProcessDialogStep = "search" | "verify" | "view";

interface PublicProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicProcessDialog({ open, onOpenChange }: PublicProcessDialogProps) {
  const [step, setStep] = useState<ProcessDialogStep>("search");
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

  const handleReset = () => {
    setStep("search");
    setProcessNumber("");
    setCourtEndpoint("");
    setVerifiedEmail("");
  };

  let title = "Consulta Pública de Processos";
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
