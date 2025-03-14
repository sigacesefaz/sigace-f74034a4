
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface PublicConsultationTermsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublicConsultationTerms({ open, onOpenChange }: PublicConsultationTermsProps) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [activeStep, setActiveStep] = useState<string>("terms");
  const [processNumber, setProcessNumber] = useState<string>("");
  const [courtEndpoint, setCourtEndpoint] = useState<string>("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const handleStepClick = (step: string) => {
    if (step === "terms" || 
        (step === "search" && accepted) || 
        (step === "verify" && processNumber) ||
        (step === "result" && verificationCode)) {
      setActiveStep(step);
    }
  };

  const handleAcceptTerms = () => {
    if (accepted) {
      setActiveStep("search");
    }
  };

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setProcessNumber(processNumber);
    setCourtEndpoint(courtEndpoint);
    setActiveStep("verify");
    return true;
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
      sessionStorage.setItem('verificationToken', result.token);
      
      // In development mode, we directly get the code for testing
      if (result.devCode) {
        setDevCode(result.devCode);
      }
      
      toast({
        title: "Código enviado",
        description: "Verifique seu email e informe o código recebido",
      });
      
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
      const token = sessionStorage.getItem('verificationToken');
      
      if (!token) {
        throw new Error("Token de verificação não encontrado. Solicite um novo código.");
      }
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ 
          email,
          code: verificationCode,
          token
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Error response from verification server:", result);
        throw new Error(result.error || "Código inválido ou expirado");
      }
      
      // Verification successful, move to the result step
      setActiveStep("result");
      
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNavigateToPublicSearch = () => {
    try {
      // Primeiro, feche o diálogo
      onOpenChange(false);
      
      // Notifique o usuário
      toast({
        title: "Processo selecionado",
        description: "Redirecionando para visualização do processo...",
      });
      
      // Armazene as informações do processo selecionado
      sessionStorage.setItem('publicProcessNumber', processNumber);
      sessionStorage.setItem('publicCourtEndpoint', courtEndpoint);
      sessionStorage.setItem('publicVerifiedEmail', email);
      
      // Use um timeout para garantir que o diálogo feche completamente antes da navegação
      setTimeout(() => {
        // Navegue para a página de visualização do processo
        navigate("/public/process-view");
      }, 300);
    } catch (error) {
      console.error("Erro ao navegar:", error);
      toast({
        title: "Erro de navegação",
        description: "Não foi possível acessar a página de consulta pública.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto" 
      >
        <DialogHeader>
          <DialogTitle>Consulta Pública de Processos</DialogTitle>
          <DialogDescription>
            Acompanhe o andamento de processos judiciais
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Indicador de progresso do wizard */}
          <div className="mb-6">
            <Tabs 
              value={activeStep} 
              onValueChange={handleStepClick}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger 
                  value="terms" 
                  className="flex items-center gap-2"
                  data-state={activeStep === "terms" ? "active" : accepted ? "completed" : ""}
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Termos</span>
                  {accepted && activeStep !== "terms" && (
                    <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="search" 
                  disabled={!accepted}
                  className="flex items-center gap-2"
                  data-state={activeStep === "search" ? "active" : processNumber ? "completed" : ""}
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Pesquisa</span>
                  {processNumber && activeStep !== "search" && (
                    <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="verify" 
                  disabled={!processNumber}
                  className="flex items-center gap-2"
                  data-state={activeStep === "verify" ? "active" : verificationCode.length === 6 ? "completed" : ""}
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Verificação</span>
                  {verificationCode.length === 6 && activeStep !== "verify" && (
                    <CheckCircle2 className="h-4 w-4 ml-1 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="result" 
                  disabled={verificationCode.length !== 6}
                  className="flex items-center gap-2"
                >
                  <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <span>Resultado</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="terms" className="mt-4">
                <div className="space-y-4">
                  <div className="border p-4 rounded-md bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">
                      Esta pesquisa é realizada utilizando a API Pública do DATAJUD. Os dados retornados são 
                      informações públicas de processos judiciais, e podem ou não estar disponíveis dependendo 
                      do tribunal e das configurações de privacidade do processo.
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      A consulta tem finalidade meramente informativa e não substitui a consulta oficial 
                      aos sites dos tribunais. Os dados são fornecidos sem garantia de completude, precisão 
                      ou atualização.
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="terms" 
                      checked={accepted} 
                      onCheckedChange={(checked) => setAccepted(checked as boolean)} 
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Concordo com os termos de uso da consulta pública
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleAcceptTerms}
                    disabled={!accepted}
                    className="bg-primary text-white"
                  >
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="search" className="mt-4">
                <ProcessSearch 
                  onProcessSelect={handleProcessSelect} 
                  isPublic={true}
                />
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep("terms")}
                  >
                    Voltar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="verify" className="mt-4">
                <div className="space-y-4">
                  <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-semibold mb-2">Verificação</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Para acessar os dados do processo, precisamos verificar sua identidade.
                    </p>
                    
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
                          Insira o código de 6 dígitos enviado para {email || "seu email"}
                        </p>
                      </div>

                      <Button 
                        onClick={handleVerifyCode} 
                        disabled={isLoading || verificationCode.length !== 6}
                        className="w-full bg-primary text-white"
                      >
                        {isLoading ? "Verificando..." : "Verificar código"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep("search")}
                  >
                    Voltar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="result" className="mt-4">
                <div className="border p-4 rounded-md">
                  <h3 className="text-lg font-semibold mb-3">Processo Encontrado</h3>
                  
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Número do Processo:</span>
                      <span className="font-medium">{processNumber}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Tribunal:</span>
                      <span className="font-medium">
                        {courtEndpoint.includes("tjto") ? "Tribunal de Justiça do Tocantins" : 
                         courtEndpoint.includes("tjsp") ? "Tribunal de Justiça de São Paulo" : 
                         courtEndpoint}
                      </span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Email para Acesso:</span>
                      <span className="font-medium">{email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep("verify")}
                  >
                    Voltar
                  </Button>
                  
                  <Button
                    onClick={handleNavigateToPublicSearch}
                    className="bg-primary text-white"
                  >
                    Visualizar Processo
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
