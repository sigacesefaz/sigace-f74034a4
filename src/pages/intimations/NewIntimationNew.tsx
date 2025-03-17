import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { DatajudIntimation } from "@/types/datajud";

interface IntimationForm {
  title: string;
  description: string;
  type: string;
  deadline: string;
}

export default function NewIntimationNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<IntimationForm>({
    title: "",
    description: "",
    type: "",
    deadline: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase.from("intimations").insert({
        ...formData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Erro ao criar intimação:", error);
        toast.error("Erro ao criar intimação");
        return;
      }

      toast.success("Intimação criada com sucesso!");
      navigate("/intimations");
    } catch (error) {
      console.error("Erro ao criar intimação:", error);
      toast.error("Erro ao criar intimação");
    } finally {
      setIsLoading(false);
    }
  };

  const loadIntimationData = async (intimation: DatajudIntimation) => {
    // Convert the DatajudIntimation type to match the expected form data structure
    const formattedIntimation = {
      title: intimation.titulo || "",
      description: intimation.descricao || "",
      type: intimation.tipo || "",
      deadline: intimation.prazo ? new Date(intimation.prazo).toISOString() : "",
      // Add any other necessary fields here
    };
    
    setFormData(formattedIntimation);
    
    // setIsLoading(true);
    // try {
    //   // Assuming 'intimation' is of type DatajudIntimation
    //   setFormData({
    //     title: intimation.titulo || "",
    //     description: intimation.descricao || "",
    //     type: intimation.tipo || "",
    //     deadline: intimation.prazo ? new Date(intimation.prazo).toISOString() : "",
    //   });
    // } catch (error) {
    //   console.error("Erro ao carregar dados da intimação:", error);
    //   toast.error("Erro ao carregar dados da intimação");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate("/intimations")} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Nova Intimação</h1>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium">Detalhes da Intimação</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Título da intimação"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descrição da intimação"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Input
                  type="text"
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Tipo de intimação"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Prazo</Label>
                <Input
                  type="datetime-local"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Intimação"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
