
import React, { useState, useEffect } from "react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { Skeleton } from "@/components/ui/skeleton";
import { getProcessById } from "@/services/datajud";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { 
  CheckCircle2Icon, 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  XCircleIcon, 
  InfoIcon, 
  Printer
} from "lucide-react";
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
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [isLoadingProcess, setIsLoadingProcess] = useState(false);

  const totalSteps = 4;

  const resetWizard = () => {
    setStep(1);
    setTermsAccepted(false);
    setProcessNumber("");
    setCourtEndpoint("");
    setEmail("");
    setVerificationCode("");
    setVerificationToken("");
    setDevCode(null);
    setCodeSent(false);
    setProcessMovimentos(null);
  };

  const handleClose = () => {
    resetWizard();
    onOpenChange(false);
  };

  const handleContinue = () => {
    if (step < totalSteps) {
      // Special handling for step 3 (verification)
      if (step === 3) {
        handleVerifyCode();
      } else {
        setStep(step + 1);
      }
    } else {
      handleClose();
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDevCode(null);
    
    try {
      console.log("Sending verification code to:", email);
      console.log("Process Number:", processNumber);
      
      // Call the edge function to send verification email
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          email,
          processNumber 
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Error response from server:", result);
        throw new Error(result.error || result.details || "Erro ao enviar código de verificação");
      }
      
      // Store the session token for verification
      setVerificationToken(result.token);
      
      // In development mode, we directly get the code for testing
      if (result.devCode) {
        setDevCode(result.devCode);
      }
      
      toast({
        title: "Código enviado",
        description: "Verifique seu email e informe o código recebido",
      });
      
      setCodeSent(true);
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Erro ao enviar código",
        description: error.message || "Não foi possível enviar o código de verificação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Código incompleto",
        description: "O código de verificação deve conter 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify the OTP code
      if (!verificationToken) {
        throw new Error("Token de verificação não encontrado. Solicite um novo código.");
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          token: verificationToken,
          code: verificationCode
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Error response from verification server:", result);
        throw new Error(result.error || "Código inválido ou expirado");
      }
      
      toast({
        title: "Verificação concluída",
        description: "Código verificado com sucesso",
      });
      
      // Now that verification is complete, load the process data
      setIsLoadingProcess(true);
      try {
        const data = await getProcessById(courtEndpoint, processNumber);
        
        if (!data || data.length === 0) {
          toast({
            title: "Processo não encontrado",
            description: "Não foi possível carregar os dados do processo.",
            variant: "destructive",
          });
          return;
        }
        
        setProcessMovimentos(data);
        setStep(4); // Move to process view step
      } catch (processError) {
        console.error("Error fetching process data:", processError);
        toast({
          title: "Erro ao carregar processo",
          description: "Não foi possível carregar os dados do processo.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingProcess(false);
      }
      
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        title: "Erro na verificação",
        description: error.message || "Código inválido ou expirado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Convert functions to return a Promise to match the expected type
  const handleSave = async (): Promise<void> => {
    // This is a no-op function since we don't save in public view
    return Promise.resolve();
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
          
          {!codeSent ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Seu Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Enviaremos um código de verificação para este email.
                </p>
              </div>

              <Button 
                onClick={handleSendCode} 
                disabled={isLoading || !email}
                className="w-full bg-primary text-white"
              >
                {isLoading ? "Enviando..." : "Enviar código de verificação"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {devCode && (
                <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                  <InfoIcon className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Modo de desenvolvimento</AlertTitle>
                  <AlertDescription className="text-yellow-800">
                    Código de verificação: <strong>{devCode}</strong>
                    <p className="text-xs mt-1">
                      Este código é exibido apenas em ambiente de desenvolvimento para fins de teste.
                    </p>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de Verificação</Label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Insira o código de 6 dígitos enviado para {email}
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleVerifyCode} 
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-primary text-white"
                >
                  {isLoading ? "Verificando..." : "Verificar código"}
                </Button>
                
                <Button 
                  variant="link" 
                  onClick={() => {
                    setCodeSent(false);
                    setVerificationCode("");
                    setDevCode(null);
                  }}
                  className="w-full"
                  disabled={isLoading}
                >
                  Usar outro email
                </Button>
              </div>
            </div>
          )}
          
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

      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
              <CheckCircle2Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Dados do Processo</h3>
          </div>
          
          {isLoadingProcess ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : processMovimentos && processMovimentos.length > 0 ? (
            <div className="max-h-[60vh] overflow-y-auto">
              <ProcessDetails
                processMovimentos={processMovimentos}
                mainProcess={processMovimentos[0].process}
                onSave={handleSave}
                onCancel={() => {}}
                isPublicView={true}
              />
            </div>
          ) : (
            <div className="p-4 border rounded-md bg-red-50 text-red-800">
              <p>Não foi possível carregar os dados do processo.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isLoading || isLoadingProcess}
            className="flex items-center"
          >
            <ChevronLeftIcon className="mr-1 h-4 w-4" />
            Voltar
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isLoadingProcess}
            className="flex items-center"
          >
            <XCircleIcon className="mr-1 h-4 w-4" />
            Cancelar
          </Button>
        )}
        
        {step < 4 ? (
          <Button
            onClick={handleContinue}
            disabled={
              (step === 1 && !termsAccepted) ||
              (step === 2 && !processNumber) ||
              (step === 3 && (!codeSent || verificationCode.length !== 6)) ||
              isLoading ||
              isLoadingProcess
            }
            className="bg-primary text-white flex items-center"
          >
            {step === 3 ? (
              isLoading ? "Verificando..." : "Verificar"
            ) : (
              <>
                Continuar
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleClose}
            className="bg-primary text-white"
          >
            Finalizar
          </Button>
        )}
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
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Consulta Pública</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
