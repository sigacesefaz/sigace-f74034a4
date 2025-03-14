
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ProcessDetails } from "@/components/process/ProcessDetails";
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { getProcessById } from "@/services/datajud";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { ProcessPrintView } from "@/components/process/ProcessPrintView";

export default function ProcessView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verifiedEmail = searchParams.get('email');
  
  const [isLoading, setIsLoading] = useState(true);
  const [processMovimentos, setProcessMovimentos] = useState<DatajudMovimentoProcessual[] | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
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
      navigate('/public/search');
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

  const handlePrint = () => {
    const printContent = document.getElementById('printable-process');
    
    if (printContent) {
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Impressão do Processo ${processNumber}</title>
              <link rel="stylesheet" href="/src/index.css" />
              <style>
                @media print {
                  body { font-family: Arial, sans-serif; }
                  .page-break { page-break-after: always; }
                }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  }, 300);
                };
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
      } else {
        // Fallback if popup is blocked
        alert("Por favor, permita a abertura de popups para imprimir o processo.");
      }
    } else {
      console.error("Elemento de impressão não encontrado");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Carregando Processo</h2>
          <p className="text-sm text-gray-600">
            Aguarde enquanto buscamos as informações do processo...
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Ensure we have valid process data before rendering
  const hasValidProcessData = processMovimentos && 
                             processMovimentos.length > 0 && 
                             processMovimentos[0].process;

  // Prepare process data for print view
  const processData = hasValidProcessData ? processMovimentos[0].process : null;

  return (
    <div className="space-y-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Dados do Processo</h2>
          <p className="text-sm text-gray-600">
            Informações públicas do processo consultado
          </p>
        </div>
        {hasValidProcessData && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrint}
            title="Imprimir processo"
            className="flex items-center"
          >
            <Printer className="h-4 w-4 mr-1" />
            Imprimir
          </Button>
        )}
      </div>
      
      {hasValidProcessData ? (
        <>
          <ProcessDetails
            processMovimentos={processMovimentos}
            mainProcess={processMovimentos[0].process}
            onSave={handleSave}
            onCancel={handleReturn}
            isPublicView={true}
          />
          
          {/* Hidden div for printing - Make sure this is properly populated with all required data */}
          <div id="printable-process" className="hidden">
            {processData && <ProcessPrintView process={processData} />}
          </div>
        </>
      ) : (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">Processo não encontrado ou sem dados disponíveis</p>
          <p className="text-sm text-yellow-700 mt-2">
            Não foi possível encontrar os dados do processo solicitado. Verifique o número e tente novamente.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/public/search')}
            className="mt-4"
          >
            Voltar para a busca
          </Button>
        </div>
      )}
    </div>
  );
}
