import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { ProcessReport } from "@/components/process/ProcessReport";
import { Process } from "@/types/process";

export function ProcessReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [process, setProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        // Aqui você deve implementar a chamada à sua API para buscar os dados do processo
        // Por enquanto, vamos usar dados do localStorage como exemplo
        const storedProcesses = localStorage.getItem("processes");
        if (storedProcesses) {
          const processes = JSON.parse(storedProcesses);
          const foundProcess = processes.find((p: Process) => p.id === id);
          if (foundProcess) {
            setProcess(foundProcess);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar processo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcess();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Processo não encontrado</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Barra de ações - escondida na impressão */}
      <div className="bg-white border-b print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Conteúdo do relatório */}
      <ProcessReport process={process} />
    </div>
  );
}
