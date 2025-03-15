import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProcessList } from "@/pages/processes/ProcessList";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase, customSupabaseQuery } from "@/lib/supabase";

interface Process {
  id: string;
  number: string;
  title: string;
  description?: string;
  status: "active" | "pending" | "closed";
  court?: string;
  created_at: string;
}

// Utilidade para conversão segura de valores para string
export const safeStringValue = (value: any, defaultValue: string = ""): string => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.nome) {
      return typeof value.nome === 'string' ? value.nome : String(value.nome);
    }
    if (value.name) {
      return typeof value.name === 'string' ? value.name : String(value.name);
    }
    // Para evitar [object Object] em loops JSON.stringify
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return String(value);
};

export default function ProcessListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const {
    data: processesData,
    isLoading: processesLoading,
    refetch
  } = useQuery({
    queryKey: ['processes'],
    queryFn: async () => {
      try {
        // Buscar processos
        const {
          data: processesData,
          error: processesError
        } = await supabase.from('processes').select('*').order('created_at', {
          ascending: false
        });
        if (processesError) {
          console.error("Erro ao buscar processos:", processesError);
          throw processesError;
        }
        console.log("Processos carregados:", processesData);

        // Adicionar metadata para cada processo para manter a compatibilidade
        const processesWithMetadata = await Promise.all(processesData.map(async process => {
          try {
            // Buscar detalhes do processo - tentativa direta usando SQL mais simples
            const {
              data: details,
              error: detailsError
            } = await supabase.from('process_details').select('*').eq('process_id', process.id).order('updated_at', {
              ascending: false
            }).limit(1);
            if (detailsError) {
              console.warn(`Erro ao buscar detalhes para processo ${process.id}:`, detailsError);
            }

            // Buscar movimentos do processo
            const {
              data: movements,
              error: movementsError
            } = await supabase.from('process_movements').select('*').eq('process_id', process.id).order('data_hora', {
              ascending: false
            });
            if (movementsError) {
              console.warn(`Erro ao buscar movimentos para processo ${process.id}:`, movementsError);
            }

            // Buscar assuntos do processo
            const {
              data: subjects,
              error: subjectsError
            } = await supabase.from('process_subjects').select('*').eq('process_id', process.id);
            if (subjectsError) {
              console.warn(`Erro ao buscar assuntos para processo ${process.id}:`, subjectsError);
            }

            // Criar metadata completo para exibição
            const processDetails = Array.isArray(details) && details.length > 0 ? details[0] : null;
            const metadata = {
              numeroProcesso: process.number,
              classe: {
                nome: processDetails?.classe?.nome || process.title || "Não especificado",
                codigo: processDetails?.classe?.codigo || "0000"
              },
              dataAjuizamento: processDetails?.data_ajuizamento || process.created_at,
              sistema: {
                nome: processDetails?.sistema?.nome || "PJe",
                codigo: processDetails?.sistema?.codigo || "1"
              },
              orgaoJulgador: {
                nome: processDetails?.orgao_julgador?.nome || process.court || "Não especificado",
                codigo: processDetails?.orgao_julgador?.codigo || "0000"
              },
              grau: processDetails?.grau || process.instance || "Primeira",
              nivelSigilo: processDetails?.nivel_sigilo || 0,
              movimentos: movements || [],
              assuntos: subjects || []
            };
            console.log(`Processo ${process.id} carregado com metadata:`, metadata);
            return {
              ...process,
              metadata
            };
          } catch (error) {
            console.error(`Erro ao carregar dados completos para processo ${process.id}:`, error);
            // Retornar o processo com metadata mínimo em caso de erro
            return {
              ...process,
              metadata: {
                numeroProcesso: process.number,
                classe: {
                  nome: process.title || "Não especificado"
                },
                dataAjuizamento: process.created_at,
                orgaoJulgador: {
                  nome: process.court || "Não especificado"
                },
                grau: process.instance || "Primeira",
                nivelSigilo: 0
              }
            };
          }
        }));
        return processesWithMetadata;
      } catch (error) {
        console.error("Erro na consulta do Supabase:", error);
        throw error;
      }
    }
  });

  const handleNewProcess = () => {
    navigate('/processes/new');
  };

  // Function to delete a process
  const handleDeleteProcess = async (processId: string): Promise<void> => {
    try {
      console.log(`Deleting process with ID: ${processId}`);
      
      // First delete related data
      await supabase.from('process_movements').delete().eq('process_id', processId);
      await supabase.from('process_subjects').delete().eq('process_id', processId);
      await supabase.from('process_details').delete().eq('process_id', processId);
      
      // Then delete the process itself
      const { error } = await supabase.from('processes').delete().eq('id', processId);
      
      if (error) {
        throw error;
      }
      
      // Refetch the data to update the UI
      refetch();
      
      toast.success("Processo excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Erro ao excluir o processo");
    }
  };

  // Function to refresh a process
  const handleRefreshProcess = async (processId: string): Promise<void> => {
    try {
      console.log(`Refreshing process with ID: ${processId}`);
      // Here you would implement the logic to refresh process data
      // For now, just show success
      toast.success("Processo atualizado com sucesso!");
    } catch (error) {
      console.error("Error refreshing process:", error);
      toast.error("Erro ao atualizar o processo");
    }
  };

  // Filtrar processos baseado no termo de pesquisa
  const filteredProcesses = processesData ? processesData.filter(process => {
    const searchLower = searchTerm.toLowerCase();
    const number = process.number ? process.number.toLowerCase() : '';

    // Extrair o nome da classe com segurança
    let classeNome = '';
    if (process.metadata?.classe) {
      if (typeof process.metadata.classe === 'object' && process.metadata.classe !== null) {
        classeNome = process.metadata.classe.nome || '';
      } else if (typeof process.metadata.classe === 'string') {
        classeNome = process.metadata.classe;
      }
    }
    return number.includes(searchLower) || classeNome.toLowerCase().includes(searchLower);
  }) : [];

  if (processesLoading) {
    return <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      </div>;
  }

  if (processesData === undefined) {
    return <div className="container mx-auto py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            {/* <AlertCircle className="h-10 w-10 text-red-600" /> */}
          </div>
          <h2 className="text-xl font-semibold">Erro ao carregar processos</h2>
          <p className="text-gray-600">Erro ao carregar processos</p>
        </div>
      </div>;
  }

  // Ensure we always pass an array to ProcessList, even if the data is undefined
  const safeProcesses = Array.isArray(filteredProcesses) ? filteredProcesses : [];

  return <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6 my-0 py-0 px-0 mx-[33px]">
        <h1 className="text-2xl font-bold">Processos</h1>
        <div className="flex items-center gap-4">
          <Input 
            placeholder="Pesquisar processos" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-64" 
          />
          <Button onClick={handleNewProcess}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Processo
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <ProcessList 
          processes={safeProcesses} 
          isLoading={processesLoading}
          onDelete={handleDeleteProcess}
          onRefresh={handleRefreshProcess} 
        />
      </div>
    </div>;
}
