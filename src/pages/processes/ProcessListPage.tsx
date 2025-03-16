
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProcessList } from "@/pages/processes/ProcessList";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { updateProcess } from "@/services/processUpdateService";

// Utility for safe string conversion
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
    // To avoid [object Object] in JSON.stringify loops
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
        // Fetch processes
        const {
          data: processesData,
          error: processesError
        } = await supabase.from('processes').select('*').order('created_at', {
          ascending: false
        });
        if (processesError) {
          console.error("Error fetching processes:", processesError);
          throw processesError;
        }
        console.log("Processes loaded:", processesData);

        // Add metadata for each process to maintain compatibility
        const processesWithMetadata = await Promise.all(processesData.map(async process => {
          try {
            // Fetch process details - direct attempt using simpler SQL
            const {
              data: details,
              error: detailsError
            } = await supabase.from('process_details').select('*').eq('process_id', process.id).order('updated_at', {
              ascending: false
            }).limit(1);
            if (detailsError) {
              console.warn(`Error fetching details for process ${process.id}:`, detailsError);
            }

            // Fetch process movements
            const {
              data: movements,
              error: movementsError
            } = await supabase.from('process_movements').select('*').eq('process_id', process.id).order('data_hora', {
              ascending: false
            });
            if (movementsError) {
              console.warn(`Error fetching movements for process ${process.id}:`, movementsError);
            }

            // Fetch process subjects
            const {
              data: subjects,
              error: subjectsError
            } = await supabase.from('process_subjects').select('*').eq('process_id', process.id);
            if (subjectsError) {
              console.warn(`Error fetching subjects for process ${process.id}:`, subjectsError);
            }

            // Fetch process hits
            const {
              data: hits,
              error: hitsError
            } = await supabase.from('process_hits').select('*').eq('process_id', process.id).order('data_hora_ultima_atualizacao', {
              ascending: false
            });
            if (hitsError) {
              console.warn(`Error fetching hits for process ${process.id}:`, hitsError);
            }

            // Create full metadata for display
            const processDetails = Array.isArray(details) && details.length > 0 ? details[0] : null;
            const metadata = {
              numeroProcesso: process.number,
              classe: {
                nome: processDetails?.classe?.nome || process.title || "Not specified",
                codigo: processDetails?.classe?.codigo || "0000"
              },
              dataAjuizamento: processDetails?.data_ajuizamento || process.created_at,
              sistema: {
                nome: processDetails?.sistema?.nome || "PJe",
                codigo: processDetails?.sistema?.codigo || "1"
              },
              orgaoJulgador: {
                nome: processDetails?.orgao_julgador?.nome || process.court || "Not specified",
                codigo: processDetails?.orgao_julgador?.codigo || "0000"
              },
              grau: processDetails?.grau || process.instance || "First",
              nivelSigilo: processDetails?.nivel_sigilo || 0,
              movimentos: movements || [],
              assuntos: subjects || []
            };
            console.log(`Process ${process.id} loaded with metadata:`, metadata);
            return {
              ...process,
              metadata,
              hits: hits || [],
              movimentacoes: movements || [],
              is_parent: !process.parent_id,
              parent_id: process.parent_id || null
            };
          } catch (error) {
            console.error(`Error loading complete data for process ${process.id}:`, error);
            // Return the process with minimal metadata on error
            return {
              ...process,
              metadata: {
                numeroProcesso: process.number,
                classe: {
                  nome: process.title || "Not specified"
                },
                dataAjuizamento: process.created_at,
                orgaoJulgador: {
                  nome: process.court || "Not specified"
                },
                grau: process.instance || "First",
                nivelSigilo: 0
              },
              hits: [],
              movimentacoes: [],
              is_parent: !process.parent_id,
              parent_id: process.parent_id || null
            };
          }
        }));
        return processesWithMetadata;
      } catch (error) {
        console.error("Error in Supabase query:", error);
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
      
      toast.success("Process deleted successfully!");
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Error deleting the process");
    }
  };

  // Function to refresh a process
  const handleRefreshProcess = async (processId: string): Promise<void> => {
    try {
      console.log(`Refreshing process with ID: ${processId}`);
      
      const success = await updateProcess(processId);
      
      if (success) {
        // Refetch the data to update the UI
        refetch();
      }
    } catch (error) {
      console.error("Error refreshing process:", error);
      toast.error("Error updating the process");
    }
  };

  // Filter processes based on the search term
  const filteredProcesses = processesData ? processesData.filter(process => {
    const searchLower = searchTerm.toLowerCase();
    const number = process.number ? process.number.toLowerCase() : '';

    // Safely extract the class name
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
          <h2 className="text-xl font-semibold">Error loading processes</h2>
          <p className="text-gray-600">Error loading processes</p>
        </div>
      </div>;
  }

  // Ensure we always pass an array to ProcessList, even if the data is undefined
  const safeProcesses = Array.isArray(filteredProcesses) ? filteredProcesses : [];

  return <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6 my-0 py-0 px-0 mx-[33px]">
        <h1 className="text-2xl font-bold">Processes</h1>
        <div className="flex items-center gap-4">
          <Input 
            placeholder="Search processes" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
            className="w-64" 
          />
          <Button onClick={handleNewProcess}>
            <Plus className="h-4 w-4 mr-2" />
            New Process
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
