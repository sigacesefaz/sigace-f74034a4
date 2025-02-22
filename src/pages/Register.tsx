
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            document_number: documentNumber,
          },
        },
      });

      if (error) throw error;

      toast.success("Cadastro realizado com sucesso! Por favor, verifique seu email.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sage-50 to-white">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Cadastro - SEFAZ TO</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Nome Completo
            </label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700">
              CPF/CNPJ
            </label>
            <Input
              id="document"
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
          <p className="text-center text-sm text-gray-600">
            Já possui uma conta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
