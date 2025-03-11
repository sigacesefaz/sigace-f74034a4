import React from "react";
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
import { Eye, EyeOff } from "lucide-react";

export function LoginDropdown() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
  };

  return (
    <DropdownMenu>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="seuemail@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    className="border-primary/20 focus-visible:ring-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
              >
                Entrar
              </Button>
            </form>
          </div>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
