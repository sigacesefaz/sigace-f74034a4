
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { ProcessForm } from "@/components/process/ProcessForm";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatajudProcess } from "@/types/datajud";
import { ArrowLeft } from "lucide-react";

type FormMode = "search" | "details" | "manual";

export default function NewProcess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<FormMode>("search");
  const [processData, setProcessData] = useState<DatajudProcess | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<string | undefined>(undefined);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    try {
      const processData = await getProcessById(courtEndpoint, processNumber);
      
      if (!processData) {
        toast.error("Processo não encontrado");
        setIsLoading(false);
        return false;
      }

      setProcessData(processData);
      setSelectedCourt(courtEndpoint);
      setCurrentMode("details");
      return true;
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast.error("Erro ao importar processo");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProcess = async () => {
    if (!processData || !selectedCourt) {
      toast.error("Dados do processo incompletos.");
      return;
    }

    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase
        .from("processes")
        .insert({
          number: processData.numeroProcesso,
          title: `${processData.classe.nome} - ${processData.numeroProcesso}`,
          status: "active",
          type: "liminar",
          instance: "primeira",
          court: processData.tribunal,
          description: processData.assuntos.map(a => a.nome).join(", "),
          created_at: processData.dataAjuizamento,
          updated_at: new Date().toISOString(),
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Processo importado com sucesso!");
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao importar processo:", error);
      toast.error("Erro ao importar processo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualEntry = () => {
    setCurrentMode("manual");
  };

  const handleCreateManualProcess = async (processData: any) => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase
        .from("processes")
        .insert({
          ...processData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Processo cadastrado com sucesso!");
      navigate("/processes");
    } catch (error) {
      console.error("Erro ao cadastrar processo:", error);
      toast.error("Erro ao cadastrar processo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentMode("search");
    setProcessData(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {currentMode === "search" ? "Novo Processo" :
           currentMode === "details" ? "Detalhes do Processo" : "Cadastro Manual de Processo"}
        </h1>

        {currentMode === "search" && (
          <Card className="p-6">
            <ProcessSearch onProcessSelect={handleProcessSelect} onManualEntry={handleManualEntry} />
          </Card>
        )}

        {currentMode === "details" && processData && (
          <>
            <Button variant="ghost" className="mb-4" onClick={() => setCurrentMode("search")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Busca
            </Button>
            <ProcessDetails
              process={processData}
              onSave={handleSaveProcess}
              onCancel={handleCancel}
            />
          </>
        )}

        {currentMode === "manual" && (
          <>
            <Button variant="ghost" className="mb-4" onClick={() => setCurrentMode("search")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a Busca
            </Button>
            <Card className="p-6">
              <ProcessForm onSubmit={handleCreateManualProcess} onCancel={handleCancel} />
            </Card>
          </>
        )}

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/processes")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
