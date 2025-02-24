
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail } from "@/lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      navigate("/processes"); // Alterado para redirecionar para a lista de processos
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <img 
            src="/lovable-uploads/41d8761a-90fe-4080-9302-a5040d446fb1.png" 
            alt="SEFAZ Tecnologia" 
            className="h-12"
          />
        </div>
        <h1 className="text-2xl font-bold text-center text-primary mb-2">SIGACE</h1>
        <p className="text-center text-gray-600 mb-6">Sistema de Gestão de Ações Contra o Estado - Tocantins</p>
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
            <Input
              type="password"
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-primary/20 focus-visible:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary-dark">
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
}
