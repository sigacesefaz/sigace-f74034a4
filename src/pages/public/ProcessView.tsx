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
  const storedEmail = sessionStorage.getItem('publicVerifiedEmail');

  useEffect(() => {
    // Verify that we have all required data and email matches
    if (!processNumber || !courtEndpoint) {
      toast({
        title: "Acesso não autorizado",
        description: "Informações de processo ausentes ou inválidas.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    // Ensure we have an email verification
    if (!storedEmail && !verifiedEmail) {
      toast({
        title: "Acesso não autorizado",
        description: "Verificação de email necessária.",
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
  }, [processNumber, courtEndpoint, verifiedEmail, storedEmail, navigate]);

  const handleReturn = () => {
    navigate('/');
  };
  
  // Convert the handleReturn function to return a Promise to match the expected type
  const handleSave = async (): Promise<boolean> => {
    // This is a no-op function since we don't save in public view
    return Promise.resolve(true);
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

  // Ensure we have valid process data before rendering
  const hasValidProcessData = processMovimentos && 
                             processMovimentos.length > 0 && 
                             processMovimentos[0].process;

  // Prepare process data for print view
  const processData = hasValidProcessData ? processMovimentos[0].process : null;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold mb-2">Consulta Pública de Processos</h2>
          {hasValidProcessData && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handlePrint}
              title="Imprimir processo"
              className="ml-2"
            >
              <Printer className="h-5 w-5" />
            </Button>
          )}
        </div>
        <p className="text-gray-600 mb-4">
          Visualização dos dados do processo consultado.
        </p>
        
        {hasValidProcessData && (
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
        )}
      </div>
    </div>
  );
}
