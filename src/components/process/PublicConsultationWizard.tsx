
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2Icon, ChevronRightIcon, ChevronLeftIcon, XCircleIcon, InfoIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface PublicConsultationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicConsultationWizard({ open, onOpenChange }: PublicConsultationWizardProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processNumber, setProcessNumber] = useState("");
  const [email, setEmail] = useState("");
  const [courtEndpoint, setCourtEndpoint] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  const resetWizard = () => {
    setStep(1);
    setTermsAccepted(false);
    setProcessNumber("");
    setCourtEndpoint("");
    setEmail("");
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleContinue = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeConsultation();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleProcessSelect = async (selectedProcess: string, selectedCourt: string) => {
    setProcessNumber(selectedProcess);
    setCourtEndpoint(selectedCourt);
    return true;
  };

  const completeConsultation = () => {
    setIsLoading(true);
    try {
      // Store the selected process info in sessionStorage for the verification step
      sessionStorage.setItem('publicProcessNumber', processNumber);
      sessionStorage.setItem('publicCourtEndpoint', courtEndpoint);
      sessionStorage.setItem('publicEmail', email);
      
      // Close dialog
      onOpenChange(false);
      
      // Notify user
      toast({
        title: "Consulta iniciada",
        description: "Redirecionando para a visualização do processo...",
      });
      
      // Navigate to process view
      setTimeout(() => {
        navigate("/public/verify");
        resetWizard();
      }, 300);
    } catch (error) {
      console.error("Error initiating consultation:", error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a consulta pública.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center">
            {step}
          </div>
          <span className="text-sm font-medium">
            Passo {step} de {totalSteps}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div 
              key={index} 
              className={`h-1.5 rounded-full ${
                index + 1 === step 
                  ? "w-8 bg-primary" 
                  : index + 1 < step 
                    ? "w-8 bg-primary/60" 
                    : "w-8 bg-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <InfoIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Termos de Uso da Consulta Pública</h3>
          </div>
          
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto border rounded-md p-4 bg-gray-50">
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
            
            <p className="text-sm text-gray-600">
              Ao utilizar esta ferramenta, você concorda com os termos de uso e privacidade estabelecidos 
              pela Secretaria da Fazenda do Tocantins e pelo Conselho Nacional de Justiça.
            </p>
          </div>
          
          <div className="flex items-center space-x-2 pt-4">
            <Checkbox 
              id="terms" 
              checked={termsAccepted} 
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} 
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Concordo com os termos de uso da consulta pública
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <CheckCircle2Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Pesquisar Processo</h3>
          </div>
          
          <div className="py-2">
            <ProcessSearch 
              onProcessSelect={handleProcessSelect} 
              isPublic={true}
              showCourtSelector={true}
            />
          </div>
          
          {processNumber && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle2Icon className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">Processo selecionado: {processNumber}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <CheckCircle2Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Verificação por Email</h3>
          </div>
          
          <div className="py-2">
            <p className="text-sm text-gray-600 mb-4">
              Informe seu email para receber um código de verificação. Este passo é necessário 
              para garantir a segurança da consulta pública.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu.email@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          {processNumber && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="text-sm space-y-1">
                <p><strong>Processo:</strong> {processNumber}</p>
                <p><strong>Email para verificação:</strong> {email || "Não informado"}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isLoading}
            className="flex items-center"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex items-center"
          >
            <XCircleIcon className="mr-1 h-4 w-4" />
            Cancelar
          </Button>
        )}
        
        <Button
          onClick={handleContinue}
          disabled={
            (step === 1 && !termsAccepted) ||
            (step === 2 && !processNumber) ||
            (step === 3 && !email) ||
            isLoading
          }
          className="bg-primary text-white flex items-center"
        >
          {step === totalSteps ? "Finalizar" : "Continuar"}
          {step !== totalSteps && <ChevronRightIcon className="ml-1 h-4 w-4" />}
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="border-b pb-2">
            <DrawerTitle>Consulta Pública</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 py-4">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Consulta Pública</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
