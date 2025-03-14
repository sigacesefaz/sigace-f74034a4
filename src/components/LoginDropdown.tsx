
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
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function LoginDropdown() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
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
        setIsOpen(false);
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
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          placeholder="seuemail@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoggingIn}
          className="border-primary/20 focus-visible:ring-primary"
        />
      </div>
      
      <div>
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoggingIn}
            className="border-primary/20 focus-visible:ring-primary pr-10"
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
        className="w-full bg-primary hover:bg-primary-dark text-slate-50"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? "Entrando..." : "Entrar"}
      </Button>
      
      <div className="text-center text-sm">
        Ainda não tem uma conta?{" "}
        <Link 
          to="/register" 
          className="text-primary hover:underline"
          onClick={() => setIsOpen(false)}
        >
          Registre-se
        </Link>
      </div>
    </form>
  );

  // Versão mobile usando Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold">
            Entrar
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full p-6">
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#ffd700] hover:bg-[#ffd700]/90 text-black font-bold">
          Entrar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[32rem] p-0 border-0 shadow-md mt-[13px]" 
        align="end" 
        alignOffset={0}
        sideOffset={0}
      >
        <Card className="border rounded shadow-none">
          <div className="p-8 space-y-6">
            <LoginForm />
          </div>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
