
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail } from "@/lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }
    const {
      data,
      error
    } = await signInWithEmail(email, password);
    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado com sucesso!"
      });
      navigate("/dashboard"); // Redireciona para o dashboard após login
    }
  };

  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white">
      <Card className="w-full max-w-md p-8 bg-slate-50">
        <div className="flex justify-center mb-6">
          <img src="/lovable-uploads/41d8761a-90fe-4080-9302-a5040d446fb1.png" alt="SEFAZ Tecnologia" className="h-12" />
        </div>
        
        <p className="text-center mb-6 text-slate-900 font-bold text-sm">Sigace - Sistema de Gestão da Ações Contra o Estado</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="seuemail@email.com" value={email} onChange={e => setEmail(e.target.value)} className="border-primary/20 focus-visible:ring-primary" />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} id="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} className="w-full pr-10 border-primary/20 focus-visible:ring-primary" />
              <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-slate-50">
            Entrar
          </Button>
        </form>
      </Card>
    </div>;
}
