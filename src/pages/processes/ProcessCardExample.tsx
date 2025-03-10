import { useState } from "react";
import { ProcessCard } from "@/components/dashboard/ProcessCard";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Dados de exemplo
const exampleProcesses = [
  {
    id: "1",
    number: "0037536-57.2015.8.27.2729",
    title: "Mandado de Segurança Cível",
    created_at: "2023-05-09T16:24:00",
    updated_at: "2025-02-26T15:54:00",
    metadata: {
      numeroProcesso: "0037536-57.2015.8.27.2729",
      classe: {
        codigo: "120",
        nome: "Mandado de Segurança Cível"
      },
      dataAjuizamento: "2015-12-08T12:50:00",
      sistema: {
        nome: "Inválido"
      },
      orgaoJulgador: {
        nome: "Juízo da Vara de Execuções Fiscais e Saúde de Palmas"
      },
      grau: "G1",
      nivelSigilo: "Público",
      assuntos: [
        {
          codigo: "10536",
          nome: "ICMS / Incidência Sobre o Ativo Fixo"
        }
      ],
      movimentos: [
        {
          codigo: "11383",
          nome: "Ato ordinatório",
          dataHora: "2023-05-09T16:24:00"
        },
        {
          codigo: "123",
          nome: "Remessa",
          dataHora: "2023-05-05T16:14:00"
        },
        {
          codigo: "11010",
          nome: "Mero expediente",
          dataHora: "2023-05-05T14:43:00"
        },
        {
          codigo: "118",
          nome: "Protocolo de Petição",
          dataHora: "2022-06-07T13:08:00"
        },
        {
          codigo: "12266",
          nome: "Confirmada",
          dataHora: "2022-05-16T23:59:00"
        }
      ]
    }
  },
  {
    id: "2",
    number: "1234567-89.2022.8.27.2700",
    title: "Ação Civil Pública",
    created_at: "2022-01-10T09:30:00",
    updated_at: "2025-02-25T14:22:00",
    metadata: {
      numeroProcesso: "1234567-89.2022.8.27.2700",
      classe: {
        codigo: "65",
        nome: "Ação Civil Pública"
      },
      dataAjuizamento: "2022-01-10T09:30:00",
      sistema: {
        nome: "PJe"
      },
      orgaoJulgador: {
        nome: "2ª Vara Cível de Palmas"
      },
      grau: "G1",
      nivelSigilo: "Público",
      assuntos: [
        {
          codigo: "9985",
          nome: "Direito do Consumidor"
        }
      ],
      movimentos: [
        {
          codigo: "11022",
          nome: "Decisão",
          dataHora: "2023-01-15T11:20:00"
        },
        {
          codigo: "51",
          nome: "Certidão Emitida",
          dataHora: "2022-11-23T14:30:00"
        }
      ]
    }
  }
];

export default function ProcessCardExample() {
  const [processes, setProcesses] = useState(exampleProcesses);
  
  const handleDelete = (id: string) => {
    setProcesses(processes.filter(p => p.id !== id));
    toast({
      title: "Processo excluído",
      description: `O processo foi excluído com sucesso.`,
      variant: "default",
    });
  };
  
  const handleView = (id: string) => {
    toast({
      title: "Visualizar processo",
      description: `Visualizando processo ID: ${id}`,
      variant: "default",
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exemplo de Cards de Processos</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Processo
        </Button>
      </div>
      
      <div className="space-y-4">
        {processes.map(process => (
          <ProcessCard 
            key={process.id}
            process={process}
            onDelete={handleDelete}
            onView={handleView}
          />
        ))}
        
        {processes.length === 0 && (
          <div className="text-center py-12 border rounded-md">
            <p className="text-gray-500">Nenhum processo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
