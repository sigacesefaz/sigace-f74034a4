
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationFormProps {
  processNumber: string;
  onVerificationComplete: (email: string) => void;
  onCancel: () => void;
}

export function EmailVerificationForm({ 
  processNumber, 
  onVerificationComplete,
  onCancel
}: EmailVerificationFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [token, setToken] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: "Atenção",
        description: "Por favor, informe um email válido.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch("/functions/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email,
          processNumber
        }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setToken(result.token);
      setIsCodeSent(true);
      toast({
        title: "Código Enviado",
        description: `Um código de verificação foi enviado para ${email}`
      });
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({
        title: "Erro",
        description: `Erro ao enviar código: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast({
        title: "Atenção",
        description: "Por favor, informe o código de verificação.",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch("/functions/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, code }),
      });

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Verificação Concluída",
        description: "Código verificado com sucesso!"
      });
      
      onVerificationComplete(email);
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({
        title: "Erro",
        description: `Erro na verificação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Verificação de Email</h3>
          <p className="text-sm text-gray-500 mt-1">
            {!isCodeSent 
              ? "Para acessar os detalhes do processo, informe seu email para receber um código de verificação."
              : `Um código de verificação foi enviado para ${email}. Verifique sua caixa de entrada.`}
          </p>
        </div>

        {!isCodeSent ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={isSending}
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={onCancel} disabled={isSending}>
                Voltar
              </Button>
              <Button onClick={handleSendCode} disabled={isSending}>
                {isSending ? (
                  <>
                    <Spinner size="sm" className="mr-2" /> Enviando...
                  </>
                ) : (
                  "Enviar Código"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Verificação</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código recebido"
                disabled={isVerifying}
              />
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setIsCodeSent(false)} disabled={isVerifying}>
                Voltar
              </Button>
              <Button onClick={handleVerifyCode} disabled={isVerifying}>
                {isVerifying ? (
                  <>
                    <Spinner size="sm" className="mr-2" /> Verificando...
                  </>
                ) : (
                  "Verificar Código"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
