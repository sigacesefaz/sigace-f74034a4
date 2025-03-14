
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function LoginDropdown() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
        });
        navigate("/dashboard"); // Redireciona para o dashboard após login
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro ao processar sua solicitação",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const LoginForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
        <Input
          type="email"
          id="email"
          placeholder="seuemail@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 bg-gray-50"
          disabled={isLoggingIn}
        />
      </div>
      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor="password" className="text-sm font-semibold">Senha</Label>
          <a href="#" className="text-xs text-primary hover:underline">
            Esqueceu a senha?
          </a>
        </div>
        <div className="relative mt-1">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10 bg-gray-50"
            disabled={isLoggingIn}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-slate-50 flex items-center justify-center gap-2"
        disabled={isLoggingIn}
      >
        <LogIn className="h-4 w-4" />
        {isLoggingIn ? "Entrando..." : "Entrar"}
      </Button>
      
      <div className="text-center mt-4 text-sm text-gray-500">
        <p>Não tem uma conta? <a href="#" className="text-primary hover:underline">Cadastre-se</a></p>
      </div>
    </form>
  );

  // Versão mobile usando Sheet
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Entrar
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full p-6" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">Login</h2>
            <div className="p-0">
              <LoginForm />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Versão desktop mantendo o dropdown original
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Entrar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[320px] p-0 border-0 shadow-lg rounded-lg mt-[13px]" 
        align="end" 
        alignOffset={0}
        sideOffset={0}
      >
        <Card className="border-0 rounded-lg shadow-none overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 border-b">
            <h3 className="font-semibold text-lg text-center">Acesso ao Sistema</h3>
          </div>
          <div className="p-6 space-y-6">
            <LoginForm />
          </div>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
