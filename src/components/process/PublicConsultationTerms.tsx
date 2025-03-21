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
import { ArrowRight, CheckCircle2, Printer, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/services/emailService";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ProcessPrintView } from "@/components/process/ProcessPrintView";
import { getProcessById } from "@/services/datajud";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const [isLoadingProcess, setIsLoadingProcess] = useState(false);

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
      console.log("Sending verification code to:", email);
      console.log("Process Number:", processNumber);
      
      // Gerar um código de verificação de 6 dígitos
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Armazenar o código e timestamp no sessionStorage
      const verificationData = {
        code: verificationCode,
        email,
        timestamp: Date.now(),
        processNumber
      };
      const token = btoa(JSON.stringify(verificationData));
      sessionStorage.setItem('verificationToken', token);
      
      // Em desenvolvimento, mostrar o código
      if (process.env.NODE_ENV === 'development') {
        setDevCode(verificationCode);
      }

      // Enviar o email usando o emailService
      const success = await sendEmail({
        to: email,
        subject: 'Código de verificação para o usuário',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">SIGACE - Sistema de Gestão de Ações Contra o Estado</h1>
            
            <p style="margin-bottom: 15px;">Código de verificação para o usuário: ${email}</p>
            
            <p style="margin-bottom: 15px;">Processo: ${processNumber}</p>
            
            <p style="margin-bottom: 15px;">Para prosseguir com o acesso, utilize o código de verificação abaixo:</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              ${verificationCode}
            </div>
            
            <p style="margin-bottom: 15px;">Este código é válido por 15 minutos.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 20px; font-style: italic;">
              Esta é uma mensagem automática. Por favor, não responda a este email.
            </p>
            
            <p style="color: #666; font-size: 12px; margin-top: 10px; font-style: italic;">
              OBSERVAÇÃO PARA DESENVOLVIMENTO: Este email foi enviado para ${email} ao invés do destinatário real (${email}) porque estamos em modo de teste do Resend. Em produção, os emails serão enviados diretamente para os usuários.
            </p>
          </div>
        `
      });

      if (!success) {
        throw new Error('Não foi possível enviar o código de verificação');
      }

      toast({
        title: "Código enviado",
        description: "Verifique seu email e informe o código recebido",
      });
      
    } catch (error) {
      console.error("Error sending verification code:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível enviar o código de verificação. Tente novamente.";
      toast({
        title: "Erro ao enviar código",
        description: errorMessage,
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
      
      // Decodificar o token
      const verificationData = JSON.parse(atob(token));
      
      // Verificar se o código expirou (15 minutos)
      const now = Date.now();
      const tokenAge = now - verificationData.timestamp;
      const tokenMaxAge = 15 * 60 * 1000; // 15 minutos em milissegundos

      if (tokenAge > tokenMaxAge) {
        throw new Error("Código expirado. Solicite um novo código.");
      }
      
      // Verificar se o código e email correspondem
      if (verificationData.code !== verificationCode || verificationData.email !== email) {
        throw new Error("Código inválido.");
      }
      
      // Verification successful, fetch process data and move to the result step
      await fetchProcessData();
      setActiveStep("result");
      
    } catch (error) {
      console.error("Error verifying code:", error);
      const errorMessage = error instanceof Error ? error.message : "Código inválido ou expirado. Tente novamente.";
      toast({
        title: "Erro na verificação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProcessData = async () => {
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
    } catch (error) {
      console.error("Error fetching process data:", error);
      toast({
        title: "Erro ao carregar processo",
        description: "Não foi possível carregar os dados do processo.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById('printable-process');
    
    if (printContent) {
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Impressão do Processo ${processNumber}</title>
              <link rel="stylesheet" href="/src/index.css" />
              <style>
                @media print {
                  body { 
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  img {
                    display: block !important;
                    print-color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                  }
                  .page-break { 
                    page-break-after: always; 
                  }
                  @page {
                    size: A4;
                    margin: 20mm;
                  }
                  .print-content {
                    width: 100%;
                    max-width: 210mm;
                    margin: 0 auto;
                  }
                  .text-\[\#1e3a8a\] {
                    color: #1e3a8a !important;
                    print-color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
      } else {
        // Fallback if popup is blocked
        alert("Por favor, permita a abertura de popups para imprimir o processo.");
      }
    } else {
      console.error("Elemento de impressão não encontrado");
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
        className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto" 
      >
        <DialogHeader>
          <DialogTitle>Consulta Pública de Processos</DialogTitle>
          <DialogDescription>
            Acompanhe o andamento de processos judiciais
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
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
                {isLoadingProcess ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : processMovimentos && processMovimentos.length > 0 ? (
                  <>
                    <div className="mb-6 flex justify-between items-center">
                      <h2 className="text-2xl font-bold mb-2">Dados do Processo</h2>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handlePrint}
                        title="Imprimir processo"
                        className="ml-2"
                      >
                        <Printer className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <ProcessDetails
                      processMovimentos={processMovimentos}
                      mainProcess={processMovimentos[0].process}
                      onSave={async () => true}
                      onCancel={() => {}}
                      isPublicView={true}
                    />
                    
                    {/* Hidden div for printing */}
                    <div id="printable-process" className="hidden">
                      {processMovimentos && processMovimentos.length > 0 && processMovimentos[0].process && (
                        <ProcessPrintView 
                          process={processMovimentos[0].process}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum dado encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Não foi possível carregar os dados do processo.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
