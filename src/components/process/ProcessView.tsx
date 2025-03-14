import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { getProcessById } from "@/services/datajud";
import { formatProcessNumber } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface ProcessViewProps {
  processNumber: string;
  courtEndpoint: string;
  email: string;
  onBack: () => void;
}

export function ProcessView({ 
  processNumber, 
  courtEndpoint, 
  email, 
  onBack 
}: ProcessViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [process, setProcess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProcessData = async () => {
      setIsLoading(true);
      try {
        const processData = await getProcessById(courtEndpoint, processNumber);
        if (processData && processData.length > 0) {
          setProcess(processData[0]);
        } else {
          setError("Processo não encontrado");
        }
      } catch (err) {
        console.error("Error fetching process:", err);
        setError("Erro ao carregar os dados do processo");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcessData();
  }, [processNumber, courtEndpoint]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium text-red-600 mb-2">{error || "Erro ao carregar processo"}</h3>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  const { process: processData, movements } = process;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} size="sm" className="hover:bg-transparent p-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="text-xs text-gray-500">
          Consultado por: {email}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold">{processData.classe?.nome || "Sem classe informada"}</h3>
              <p className="text-sm font-mono mt-1">{formatProcessNumber(processData.numeroProcesso)}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Tribunal</h4>
                <p className="text-sm">{processData.tribunal || "Não informado"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="text-sm">{processData.status || "Não informado"}</p>
              </div>
            </div>
            
            {processData.assuntos && processData.assuntos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Assuntos</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {processData.assuntos.map((assunto: any, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {assunto.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Movimentações Processuais</h3>
        <div className="space-y-4">
          {movements && movements.length > 0 ? (
            movements.map((movement: any, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{movement.movimento?.nome || "Movimento não informado"}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.dataHora).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {movement.movimento?.codigo || ""}
                    </span>
                  </div>
                  {movement.complemento && (
                    <p className="text-sm mt-2 text-gray-600">{movement.complemento}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center py-4 text-gray-500">Nenhuma movimentação encontrada</p>
          )}
        </div>
      </div>
    </div>
  );
}
