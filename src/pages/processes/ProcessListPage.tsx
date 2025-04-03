import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProcessList } from "@/pages/processes/ProcessList";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { updateProcess } from "@/services/processUpdateService";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Pagination } from "@/components/shared/Pagination";

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const {
    data: processesData,
    isLoading: processesLoading,
    refetch
  } = useQuery({
    queryKey: ['processes'],
    queryFn: async () => {
      try {
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

        const processesWithMetadata = await Promise.all(processesData.map(async process => {
          try {
            const { data: details, error: detailsError } = await supabase
              .from('process_details')
              .select('*')
              .eq('process_id', process.id)
              .order('updated_at', { ascending: false })
              .limit(1);

            if (detailsError) {
              console.warn(`Error fetching details for process ${process.id}:`, detailsError);
            }

            const { data: movements, error: movementsError } = await supabase
              .from('process_movements')
              .select('*')
              .eq('process_id', process.id)
              .order('data_hora', { ascending: false });

            if (movementsError) {
              console.warn(`Error fetching movements for process ${process.id}:`, movementsError);
            }

            const { data: hits, error: hitsError } = await supabase
              .from('process_hits')
              .select('*')
              .eq('process_id', process.id)
              .order('data_hora_ultima_atualizacao', { ascending: false });

            if (hitsError) {
              console.warn(`Error fetching hits for process ${process.id}:`, hitsError);
            }

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
              assuntos: processDetails?.assuntos || []
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
                nivelSigilo: 0,
                assuntos: []
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

  const handleDeleteProcess = async (processId: string): Promise<void> => {
    try {
      console.log(`Deleting process with ID: ${processId}`);
      
      await supabase.from('process_movements').delete().eq('process_id', processId);
      await supabase.from('process_subjects').delete().eq('process_id', processId);
      await supabase.from('process_details').delete().eq('process_id', processId);
      
      const { error } = await supabase.from('processes').delete().eq('id', processId);
      
      if (error) {
        throw error;
      }
      
      refetch();
      
      toast.success("Process deleted successfully!");
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Error deleting the process");
    }
  };

  const handleRefreshProcess = async (processId: string): Promise<void> => {
    try {
      console.log(`Refreshing process with ID: ${processId}`);
      
      const success = await updateProcess(processId);
      
      if (success) {
        refetch();
      }
    } catch (error) {
      console.error("Error refreshing process:", error);
      toast.error("Error updating the process");
    }
  };

  const filteredProcesses = processesData ? processesData.filter(process => {
    const searchLower = searchTerm.toLowerCase();
    const number = process.number ? process.number.toLowerCase() : '';

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

  const totalPages = Math.ceil(filteredProcesses.length / itemsPerPage);
  const paginatedProcesses = filteredProcesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
  };

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

  const safeProcesses = Array.isArray(paginatedProcesses) ? paginatedProcesses : [];

  return <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Processos</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              placeholder="Pesquisar processos..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 w-full" 
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtrar processos</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Data de cadastro</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger id="date-filter">
                        <SelectValue placeholder="Qualquer data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Qualquer data</SelectItem>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                    <Button size="sm" onClick={() => setFilterOpen(false)}>
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button onClick={handleNewProcess} variant="default" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novo Processo
            </Button>
          </div>
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

      <div className="flex justify-end mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>;
}
