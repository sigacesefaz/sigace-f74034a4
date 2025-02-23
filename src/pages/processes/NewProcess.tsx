
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProcessSearch } from "@/components/process/ProcessSearch";
import { getProcessById } from "@/services/datajud";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewProcess() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessSelect = async (processNumber: string, courtEndpoint: string) => {
    setIsLoading(true);
    try {
      const processData = await getProcessById(courtEndpoint, processNumber);
      
      if (!processData) {
        toast.error("Processo não encontrado");
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Novo Processo</h1>
        <Card className="p-6">
          <ProcessSearch onProcessSelect={handleProcessSelect} />
          
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={() => navigate("/processes")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
