
import { useState } from "react";
import { ProcessCard } from "@/components/dashboard/ProcessCard";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Process, ProcessHit } from "@/types/process";

// Dados de exemplo
const exampleProcesses = [
  {
    id: "1",
    number: "0037536-57.2015.8.27.2729",
    title: "Mandado de Segurança Cível",
    court: "TJTO", 
    created_at: "2023-05-09T16:24:00",
    updated_at: "2025-02-26T15:54:00",
    metadata: {
      numeroProcesso: "0037536-57.2015.8.27.2729",
      classe: {
        codigo: 120,
        nome: "Mandado de Segurança Cível"
      },
      dataAjuizamento: "2015-12-08T12:50:00",
      sistema: {
        nome: "Inválido",
        codigo: 0
      },
      orgaoJulgador: {
        nome: "Juízo da Vara de Execuções Fiscais e Saúde de Palmas",
        codigo: 2729
      },
      grau: "G1",
      nivelSigilo: 0,
      assuntos: [
        {
          codigo: 10536,
          nome: "ICMS / Incidência Sobre o Ativo Fixo"
        }
      ],
      movimentos: [
        {
          id: "1",
          data: "2023-05-09T16:24:00",
          descricao: "Ato ordinatório praticado"
        },
        {
          id: "2",
          data: "2023-05-05T16:14:00",
          descricao: "Remessa dos autos"
        },
        {
          id: "3",
          data: "2023-05-05T14:43:00",
          descricao: "Mero expediente processual"
        }
      ],
      intimacoes: [
        {
          id: "1",
          data: "2023-05-09T16:24:00",
          descricao: "Intimação para manifestação"
        },
        {
          id: "2",
          data: "2023-05-05T16:14:00",
          descricao: "Intimação para pagamento de custas"
        }
      ],
      documentos: [
        {
          id: "1",
          data: "2023-05-09T16:24:00",
          descricao: "Petição inicial",
          tipo: "Petição"
        },
        {
          id: "2",
          data: "2023-05-05T16:14:00",
          descricao: "Procuração",
          tipo: "Documento"
        }
      ],
      decisoes: [
        {
          id: "1",
          data: "2023-05-09T16:24:00",
          descricao: "Decisão de deferimento da liminar"
        }
      ],
      partes: [
        {
          papel: "Autor",
          nome: "João da Silva",
          tipoPessoa: "Física",
          documento: "123.456.789-00",
          advogados: [
            {
              nome: "Dr. Carlos Advogado",
              inscricao: "OAB/TO 1234"
            }
          ]
        },
        {
          papel: "Réu",
          nome: "Estado do Tocantins",
          tipoPessoa: "Jurídica",
          documento: "12.345.678/0001-00",
          advogados: [
            {
              nome: "Dra. Maria Procuradora",
              inscricao: "OAB/TO 5678"
            }
          ]
        }
      ]
    },
    hits: [
      {
        id: "h1",
        hit_index: "1",
        hit_id: "hit_123",
        tribunal: "TJTO",
        numero_processo: "0037536-57.2015.8.27.2729",
        data_ajuizamento: "2015-12-08T12:50:00",
        classe: {
          nome: "Mandado de Segurança Cível",
          codigo: "120" // Converted to string
        },
        orgao_julgador: {
          nome: "Juízo da Vara de Execuções Fiscais e Saúde de Palmas",
          codigo: "2729" // Converted to string
        },
        data_hora_ultima_atualizacao: "2023-05-09T16:24:00"
      },
      {
        id: "h2",
        hit_index: "2",
        hit_id: "hit_456",
        tribunal: "TJTO",
        numero_processo: "0037536-57.2015.8.27.2729",
        data_ajuizamento: "2015-12-08T12:50:00",
        classe: {
          nome: "Mandado de Segurança Cível",
          codigo: "120" // Converted to string
        },
        orgao_julgador: {
          nome: "Juízo da Vara de Execuções Fiscais e Saúde de Palmas",
          codigo: "2729" // Converted to string
        },
        data_hora_ultima_atualizacao: "2022-10-15T08:30:00"
      }
    ]
  },
  {
    id: "2",
    number: "1234567-89.2022.8.27.2700",
    title: "Ação Civil Pública",
    court: "TJTO", 
    created_at: "2022-01-10T09:30:00",
    updated_at: "2025-02-25T14:22:00",
    metadata: {
      numeroProcesso: "1234567-89.2022.8.27.2700",
      classe: {
        codigo: 65,
        nome: "Ação Civil Pública"
      },
      dataAjuizamento: "2022-01-10T09:30:00",
      sistema: {
        nome: "PJe",
        codigo: 1
      },
      orgaoJulgador: {
        nome: "2ª Vara Cível de Palmas",
        codigo: 2700
      },
      grau: "G1",
      nivelSigilo: 0,
      assuntos: [
        {
          codigo: 9985,
          nome: "Direito do Consumidor"
        }
      ],
      movimentos: [
        {
          id: "1",
          data: "2023-01-15T11:20:00",
          descricao: "Decisão proferida"
        },
        {
          id: "2",
          data: "2022-11-23T14:30:00",
          descricao: "Certidão emitida"
        }
      ],
      intimacoes: [
        {
          id: "1",
          data: "2023-01-15T11:20:00",
          descricao: "Intimação da decisão"
        }
      ],
      documentos: [
        {
          id: "1",
          data: "2022-01-10T09:30:00",
          descricao: "Petição inicial",
          tipo: "Petição"
        }
      ],
      decisoes: [
        {
          id: "1",
          data: "2023-01-15T11:20:00",
          descricao: "Decisão de mérito"
        }
      ],
      partes: [
        {
          papel: "Autor",
          nome: "Ministério Público",
          tipoPessoa: "Jurídica",
          documento: "00.000.000/0001-00",
          advogados: []
        },
        {
          papel: "Réu",
          nome: "Empresa XYZ Ltda",
          tipoPessoa: "Jurídica",
          documento: "98.765.432/0001-00",
          advogados: [
            {
              nome: "Dr. Pedro Advogado",
              inscricao: "OAB/TO 9876"
            }
          ]
        }
      ]
    },
    hits: [
      {
        id: "h3",
        hit_index: "1",
        hit_id: "hit_789",
        tribunal: "TJTO",
        numero_processo: "1234567-89.2022.8.27.2700",
        data_ajuizamento: "2022-01-10T09:30:00",
        classe: {
          nome: "Ação Civil Pública",
          codigo: "65" // Converted to string
        },
        orgao_julgador: {
          nome: "2ª Vara Cível de Palmas", 
          codigo: "2700" // Converted to string
        },
        data_hora_ultima_atualizacao: "2023-01-15T11:20:00"
      }
    ]
  }
] as unknown as Process[];

export default function ProcessCardExample() {
  const [processes, setProcesses] = useState<Process[]>(exampleProcesses);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  
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
  
  const handlePrint = (process: any) => {
    toast({
      title: "Imprimir processo",
      description: `Imprimindo processo: ${process.number}`,
      variant: "default",
    });
  };
  
  const handleShare = (process: any) => {
    toast({
      title: "Compartilhar processo",
      description: `Compartilhando processo: ${process.number}`,
      variant: "default",
    });
  };
  
  const handleRefresh = (id: string) => {
    toast({
      title: "Atualizar processo",
      description: `Atualizando processo ID: ${id}`,
      variant: "default",
    });
  };
  
  const handleToggleSelect = (id: string) => {
    setSelectedProcesses(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
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
            onPrint={handlePrint}
            onShare={handleShare}
            onRefresh={handleRefresh}
            isSelected={selectedProcesses.includes(process.id)}
            onToggleSelect={handleToggleSelect}
            relatedHits={process.id === "1" ? [processes[1]] : []}
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
