
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function EmailVerification() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);

  // Check if we have process data in session storage
  const processNumber = sessionStorage.getItem('publicProcessNumber');
  const courtEndpoint = sessionStorage.getItem('publicCourtEndpoint');
  
  if (!processNumber || !courtEndpoint) {
    // Redirect back to search if no process selected
    navigate('/public/search');
  }

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
      
      // Store the session token in sessionStorage for verification
      sessionStorage.setItem('verificationToken', result.token);
      
      // In development mode, we directly get the code for testing
      if (result.devCode) {
        setDevCode(result.devCode);
      }
      
      toast({
        title: "Código enviado",
        description: "Verifique seu email e informe o código recebido",
      });
      
      setShowOTP(true);
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
      
      // Navigate to process view with email in query param for additional verification
      navigate(`/public/process-view?email=${encodeURIComponent(email)}`);
      
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Verificação</h2>
              <p className="text-gray-600 text-sm">
                Para acessar os dados do processo, precisamos verificar sua identidade.
              </p>
            </div>

            {!showOTP ? (
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
                    onClick={() => setShowOTP(false)}
                    className="w-full"
                    disabled={isLoading}
                  >
                    Usar outro email
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
