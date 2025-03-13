
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { getProcessById } from "@/services/datajud";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProcessView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verifiedEmail = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(true);
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  
  // Get process data from sessionStorage
  const processNumber = sessionStorage.getItem('publicProcessNumber');
  const courtEndpoint = sessionStorage.getItem('publicCourtEndpoint');

  useEffect(() => {
    // Verify that we have all required data
    if (!processNumber || !courtEndpoint || !verifiedEmail) {
      toast({
        title: "Acesso não autorizado",
        description: "Informações de verificação ausentes ou inválidas.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    // Fetch process data
    const fetchProcessData = async () => {
      try {
        const data = await getProcessById(courtEndpoint, processNumber);
        
        if (!data || data.length === 0) {
          toast({
            title: "Processo não encontrado",
            description: "Não foi possível carregar os dados do processo.",
            variant: "destructive",
          });
          navigate('/public/search');
          return;
        }
        
        setProcessMovimentos(data);
      } catch (error) {
        console.error("Error fetching process data:", error);
        toast({
          title: "Erro ao carregar processo",
          description: "Não foi possível carregar os dados do processo.",
          variant: "destructive",
        });
        navigate('/public/search');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcessData();
  }, [processNumber, courtEndpoint, verifiedEmail, navigate]);

  const handleReturn = () => {
    navigate('/');
  };
  
  // Convert the handleReturn function to return a Promise to match the expected type
  const handleSave = async (): Promise<void> => {
    // This is a no-op function since we don't save in public view
    return Promise.resolve();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Consulta Pública de Processos</h2>
          <p className="text-gray-600 mb-4">
            Visualização dos dados do processo consultado.
          </p>
        </div>
        
        {processMovimentos && processMovimentos.length > 0 && (
          <ProcessDetails
            processMovimentos={processMovimentos}
            mainProcess={processMovimentos[0].process}
            onSave={handleSave}
            onCancel={handleReturn}
            isPublicView={true}
          />
        )}
      </div>
    </div>
  );
}
