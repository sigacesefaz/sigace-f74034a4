
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getEmailStats } from "@/services/emailService";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Check the Resend test mode settings from the system
    const checkTestMode = async () => {
      try {
        const stats = await getEmailStats();
        setIsTestMode(stats.testMode);
        console.log("Email settings loaded:", { 
          testMode: stats.testMode, 
          verifiedEmail: stats.verifiedEmail 
        });
      } catch (error) {
        console.error("Error checking email settings:", error);
        // Default to false if there's an error
        setIsTestMode(false);
      }
    };
    
    checkTestMode();
  }, []);

  // Check if we have process data in session storage
  const processNumber = sessionStorage.getItem('publicProcessNumber');
  const courtEndpoint = sessionStorage.getItem('publicCourtEndpoint');
  
  if (!processNumber || !courtEndpoint) {
    // Redirect back to search if no process selected
    navigate('/public/search');
  }

  const handleSendCode = async () => {
    if (!validateEmail(email)) {
      toast.error("Email inválido. Por favor, informe um email válido");
      return;
    }

    setIsLoading(true);
    setDevCode(null);
    
    try {
      console.log("Sending verification code to:", email);
      console.log("Process Number:", processNumber);
      console.log("Test Mode enabled:", isTestMode);
      
      // Call the edge function to send verification email with the test mode flag
      const { data, error } = await supabase.functions.invoke("send-verification-code", {
        body: {
          email,
          processNumber,
          testMode: isTestMode
        }
      });
      
      if (error) {
        console.error("Error from Supabase function:", error);
        throw new Error(error.message || "Erro ao enviar código de verificação");
      }
      
      if (!data.success) {
        console.error("Error response from server:", data);
        throw new Error(data.error || data.details?.message || data.details || "Erro ao enviar código de verificação");
      }
      
      // Store the session token in sessionStorage for verification
      sessionStorage.setItem('verificationToken', data.token);
      
      // Check for verification code in test mode
      if (data.devCode) {
        console.log("Verification code received:", data.devCode);
        setDevCode(data.devCode);
      } else {
        console.log("No verification code received in response");
      }
      
      toast.success("Código enviado. Verifique seu email e informe o código recebido");
      setShowOTP(true);
    } catch (error) {
      console.error("Error sending verification code:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível enviar o código de verificação. Tente novamente.";
      toast.error(`Erro ao enviar código: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error("O código de verificação deve conter 6 dígitos");
      return;
    }

    setIsLoading(true);
    
    try {
      // Verify the OTP code
      const token = sessionStorage.getItem('verificationToken');
      
      if (!token) {
        throw new Error("Token de verificação não encontrado. Solicite um novo código.");
      }
      
      const { data, error } = await supabase.functions.invoke("verify-code", {
        body: {
          email,
          code: verificationCode,
          token
        }
      });
      
      if (error) {
        console.error("Error from Supabase function:", error);
        throw new Error(error.message || "Código inválido ou expirado");
      }
      
      if (!data.success) {
        console.error("Error response from verification server:", data);
        throw new Error(data.error || "Código inválido ou expirado");
      }
      
      // Navigate to process view with email in query param for additional verification
      sessionStorage.setItem('publicVerifiedEmail', email);
      navigate(`/public/process-view?email=${encodeURIComponent(email)}`);
      
    } catch (error) {
      console.error("Error verifying code:", error);
      const errorMessage = error instanceof Error ? error.message : "Código inválido ou expirado. Tente novamente.";
      toast.error(`Erro na verificação: ${errorMessage}`);
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
              {isTestMode && (
                <Alert variant="info" className="mt-3 bg-blue-50 border-blue-200">
                  <InfoIcon className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Modo de teste ativado</AlertTitle>
                  <AlertDescription className="text-blue-800">
                    O sistema está configurado em modo de teste.
                  </AlertDescription>
                </Alert>
              )}
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
                {/* Show verification code in test mode */}
                {devCode && isTestMode && (
                  <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                    <InfoIcon className="h-4 w-4 text-yellow-600" />
                    <AlertTitle className="text-yellow-800">Modo de teste</AlertTitle>
                    <AlertDescription className="text-yellow-800">
                      Código de verificação: <strong>{devCode}</strong>
                      <p className="text-xs mt-1">
                        Este código é exibido apenas em modo de teste para fins de verificação.
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
