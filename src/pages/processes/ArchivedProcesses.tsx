import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { ProcessList } from "@/pages/processes/ProcessList";
import { Process } from "@/types/process";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupabaseProcess {
  id: string;
  number: string;
  title: string;
  status: string;
  court: string;
  instance: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  parent_id: string | null;
  user_id: string;
}

export default function ArchivedProcesses() {
  const navigate = useNavigate();
  const supabase = getSupabaseClient();
  const [showArchiveReasonDialog, setShowArchiveReasonDialog] = useState(false);
  const [archiveInfo, setArchiveInfo] = useState<{ reason: string; date: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);

  const {
    data: processesData,
    isLoading: processesLoading,
    refetch
  } = useQuery({
    queryKey: ['archived-processes'],
    queryFn: async () => {
      try {
        // Fetch processes
        const { data: processesData, error: processesError } = await supabase
          .from('processes')
          .select('*, archived_at')
          .eq('is_archived', true)
          .order('created_at', { ascending: false });

        if (processesError) {
          console.error("Error fetching processes:", processesError);
          throw processesError;
        }

        // Add metadata for each process to maintain compatibility
        const rawProcesses = processesData as unknown as (SupabaseProcess & { archived_at: string })[];
        const processesWithMetadata = await Promise.all(rawProcesses.map(async process => {
          try {
            // Fetch process details - direct attempt using simpler SQL
            const { data: details, error: detailsError } = await supabase
              .from('process_details')
              .select('*')
              .eq('process_id', process.id)
              .order('updated_at', { ascending: false })
              .limit(1);

            if (detailsError) {
              console.warn(`Error fetching details for process ${process.id}:`, detailsError);
            }

            // Fetch process movements
            const { data: movements, error: movementsError } = await supabase
              .from('process_movements')
              .select('*')
              .eq('process_id', process.id)
              .order('data_hora', { ascending: false });

            if (movementsError) {
              console.warn(`Error fetching movements for process ${process.id}:`, movementsError);
            }

            // Fetch process hits
            const { data: hits, error: hitsError } = await supabase
              .from('process_hits')
              .select('*')
              .eq('process_id', process.id)
              .order('data_hora_ultima_atualizacao', { ascending: false });

            if (hitsError) {
              console.warn(`Error fetching hits for process ${process.id}:`, hitsError);
            }

            // Fetch process subjects
            const { data: subjects, error: subjectsError } = await supabase
              .from('process_subjects')
              .select('*')
              .eq('process_id', process.id);

            if (subjectsError) {
              console.warn(`Error fetching subjects for process ${process.id}:`, subjectsError);
            }

            // Create full metadata for display
            const processDetails = Array.isArray(details) && details.length > 0 ? details[0] : null;

            const processWithMetadata: Process = {
              id: process.id,
              number: process.number,
              title: process.title,
              status: process.status,
              court: process.court,
              instance: process.instance,
              created_at: process.created_at,
              updated_at: process.updated_at,
              is_archived: process.is_archived,
              archived_at: process.archived_at,
              parent_id: process.parent_id,
              user_id: process.user_id,
              is_parent: !process.parent_id,
              metadata: {
                numeroProcesso: process.number,
                classe: {
                  nome: process.title || "Not specified"
                },
                dataAjuizamento: processDetails?.data_ajuizamento || process.created_at,
                orgaoJulgador: {
                  nome: process.court || "Not specified"
                },
                grau: process.instance === "2" ? "G2" : "G1",
                nivelSigilo: 0,
                assuntos: subjects?.map(subject => ({
                  nome: subject.name || subject.nome || "Não especificado",
                  codigo: subject.code || subject.codigo || "",
                  principal: Boolean(subject.is_main || subject.principal)
                })) || []
              },
              hits: hits || [],
              movimentacoes: movements || []
            };

            return processWithMetadata;
          } catch (error) {
            console.error(`Error loading complete data for process ${process.id}:`, error);
            // Return the process with minimal metadata on error
            const fallbackProcess: Process = {
              id: process.id,
              number: process.number,
              title: process.title,
              status: process.status,
              court: process.court,
              instance: process.instance,
              created_at: process.created_at,
              updated_at: process.updated_at,
              is_archived: process.is_archived,
              archived_at: process.archived_at,
              parent_id: process.parent_id,
              user_id: process.user_id,
              is_parent: !process.parent_id,
              metadata: {
                numeroProcesso: process.number,
                classe: {
                  nome: process.title || "Not specified"
                },
                dataAjuizamento: process.created_at,
                orgaoJulgador: {
                  nome: process.court || "Not specified"
                },
                grau: process.instance === "2" ? "G2" : "G1",
                nivelSigilo: 0,
                assuntos: []
              },
              hits: [],
              movimentacoes: []
            };
            return fallbackProcess;
          }
        }));

        return processesWithMetadata;
      } catch (error) {
        console.error("Error in Supabase query:", error);
        throw error;
      }
    }
  });

  useEffect(() => {
    if (processesData) {
      setFilteredProcesses(processesData);
    }
  }, [processesData]);

  const searchProcesses = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProcesses(processesData || []);
      return;
    }

    const searchLower = searchTerm.toLowerCase().trim();

    const filtered = processesData?.filter(process => {
      // Função auxiliar para verificar se um texto contém o termo de busca
      const containsSearch = (text: string | null | undefined) => {
        return text?.toLowerCase().includes(searchLower) || false;
      };

      // Verifica campos básicos
      if (containsSearch(process.number)) return true;
      if (containsSearch(process.title)) return true;
      if (containsSearch(process.status)) return true;
      if (containsSearch(process.court)) return true;
      if (containsSearch(process.instance)) return true;

      // Verifica campos do metadata
      if (containsSearch(process.metadata?.classe?.nome)) return true;
      if (containsSearch(process.metadata?.orgaoJulgador?.nome)) return true;
      if (containsSearch(process.metadata?.sistema?.nome)) return true;
      if (containsSearch(process.metadata?.dataAjuizamento)) return true;
      if (containsSearch(process.metadata?.grau)) return true;

      // Verifica assuntos
      const hasMatchingSubject = process.metadata?.assuntos?.some((assunto: { nome?: string; name?: string } | string) => {
        if (typeof assunto === 'string') return containsSearch(assunto);
        return containsSearch(assunto.nome) || containsSearch(assunto.name);
      });
      if (hasMatchingSubject) return true;

      // Verifica movimentações
      const hasMatchingMovement = process.movimentacoes?.some((mov: { nome?: string; descricao?: string }) => 
        containsSearch(mov.nome) || containsSearch(mov.descricao)
      );
      if (hasMatchingMovement) return true;

      // Verifica hits
      const hasMatchingHit = process.hits?.some((hit: { data_hora_ultima_atualizacao?: string }) => 
        containsSearch(hit.data_hora_ultima_atualizacao)
      );
      if (hasMatchingHit) return true;

      return false;
    }) || [];

    setFilteredProcesses(filtered);
  };

  useEffect(() => {
    searchProcesses(searchTerm);
  }, [searchTerm, processesData]);

  const handleDeleteProcess = async (id: string) => {
    try {
      // First delete related data
      await supabase.from('process_movements').delete().eq('process_id', id);
      await supabase.from('process_subjects').delete().eq('process_id', id);
      await supabase.from('process_details').delete().eq('process_id', id);
      
      // Then delete the process itself
      const { error } = await supabase.from('processes').delete().eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success("Processo excluído com sucesso!");
      refetch();
    } catch (error) {
      console.error("Erro ao excluir processo:", error);
      toast.error("Erro ao excluir o processo");
    }
  };

  const handleRefreshProcess = async (id: string) => {
    try {
      // Implemente a lógica de atualização do processo aqui
      toast.success("Processo atualizado com sucesso!");
      refetch();
    } catch (error) {
      console.error("Erro ao atualizar processo:", error);
      toast.error("Erro ao atualizar o processo");
    }
  };

  const handleUnarchiveProcess = async (id: string) => {
    try {
      // Registrar o histórico de desarquivamento
      const { error: archiveHistoryError } = await supabase
        .from('process_archive_info')
        .insert({
          process_id: id,
          action: 'unarchive',
          date: new Date().toISOString()
        });

      if (archiveHistoryError) throw archiveHistoryError;

      // Atualizar o status do processo
      const { error: updateError } = await supabase
        .from('processes')
        .update({
          is_archived: false,
          archive_reason: null,
          archived_at: null
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success("Processo desarquivado com sucesso!");
      refetch();
    } catch (error) {
      console.error("Erro ao desarquivar processo:", error);
      toast.error("Erro ao desarquivar o processo");
    }
  };

  const handleShowArchiveReason = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('archive_reason, archived_at')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const archivedAt = typeof data.archived_at === 'string' ? new Date(data.archived_at) : new Date();
        const formattedArchiveDate = format(archivedAt, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
        setArchiveInfo({
          reason: data.archive_reason?.toString() || 'Não especificado',
          date: formattedArchiveDate
        });
        setShowArchiveReasonDialog(true);
      }
    } catch (error) {
      console.error("Erro ao buscar motivo do arquivamento:", error);
      toast.error("Erro ao buscar motivo do arquivamento");
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterOpen(false);
    setStatusFilter('all');
    setDateFilter('all');
    if (processesData) {
      setFilteredProcesses(processesData);
    }
  };

  // Aplicar filtros de data e status após a busca
  const applyFilters = () => {
    let processesToFilter = [...filteredProcesses];

    // Filtro de status
    if (statusFilter !== 'all') {
      processesToFilter = processesToFilter.filter(process => process.status === statusFilter);
    }

    // Filtro de data
    if (dateFilter !== 'all') {
      processesToFilter = processesToFilter.filter(process => {
        if (!process.archived_at) return false;
        const archiveDate = new Date(process.archived_at);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            return archiveDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return archiveDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return archiveDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredProcesses(processesToFilter);
  };

  useEffect(() => {
    applyFilters();
  }, [statusFilter, dateFilter]);

  const isLoading = processesLoading;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Processos Arquivados</h1>
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
                    <Label htmlFor="date-filter">Data de arquivamento</Label>
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

                  <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <ProcessList 
        processes={filteredProcesses}
        isLoading={isLoading}
        showArchiveInfo={true}
        onUnarchive={handleUnarchiveProcess}
        onShowArchiveReason={handleShowArchiveReason}
        hideNewProcessButton={true}
      />

      <Dialog open={showArchiveReasonDialog} onOpenChange={setShowArchiveReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informações do Arquivamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Motivo do Arquivamento</h4>
              <p className="text-sm">{archiveInfo?.reason}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-500">Data do Arquivamento</h4>
              <p className="text-sm">{archiveInfo?.date}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
