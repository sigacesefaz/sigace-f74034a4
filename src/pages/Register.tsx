
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Erro ao registrar",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Erro ao registrar",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        toast({
          title: "Erro ao registrar",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso!",
          description: "Verifique seu email para confirmar o registro.",
        });
        navigate("/login");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao registrar",
        description: error.message || "Ocorreu um erro durante o registro",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsRegistering(true);
    
    try {
      // Get the current URL's origin for proper redirecting
      const origin = window.location.origin;
      const redirectTo = `${origin}/dashboard`;
      
      console.log('Redirecting to:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      
      if (error) {
        toast({
          title: "Erro ao registrar com Google",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao registrar com Google",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white">
      <Card className="w-full max-w-md p-8 bg-slate-50">
        <div className="flex justify-center mb-6">
          <img src="/images/sefaz_t1i.png" alt="SEFAZ Tecnologia" className="h-12" />
        </div>
        
        <p className="text-center mb-6 text-slate-900 font-bold text-sm">Sigace - Sistema de Gestão da Ações Contra o Estado</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input 
              id="fullName" 
              type="text" 
              placeholder="Seu nome completo" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              className="border-primary/20 focus-visible:ring-primary"
              disabled={isRegistering}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="seuemail@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="border-primary/20 focus-visible:ring-primary"
              disabled={isRegistering}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="********" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full pr-10 border-primary/20 focus-visible:ring-primary"
                disabled={isRegistering}
                required
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isRegistering}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                placeholder="********" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full pr-10 border-primary/20 focus-visible:ring-primary"
                disabled={isRegistering}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-dark text-slate-50"
            disabled={isRegistering}
          >
            {isRegistering ? "Registrando..." : "Registrar"}
          </Button>
        </form>
        
        <div className="relative my-6">
          <Separator className="my-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-slate-50 px-2 text-sm text-slate-500">ou continue com</span>
          </div>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 border-slate-300"
          onClick={handleGoogleSignUp}
          disabled={isRegistering}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
          Registrar com Google
        </Button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
