import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Trash, Printer, Share2, RefreshCw, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Filter, X, Clock, Archive, ArchiveX, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProcessMovements } from "@/components/process/ProcessMovements";
import { Process } from "@/types/process";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getSupabaseClient, checkProcessStatus } from "@/lib/supabase";
import { Pagination } from "@/components/ui/pagination";
import { ProcessReportDialog } from "@/components/process/ProcessReportDialog";
import { formatProcessNumber } from "@/utils/format";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ProcessDecisions } from "@/components/process/ProcessDecisions";
import { ProcessParties } from "@/components/process/ProcessParties";
import { ProcessDocuments } from "@/components/process/ProcessDocuments";
import { ProcessHitsNavigation } from "@/components/process/ProcessHitsNavigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProcessSubjects } from "@/components/process/ProcessSubjects";
import { cn } from "@/lib/utils";
import { ProcessScheduleConfig } from '@/components/ProcessScheduleConfig';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FilingDateFilter } from "@/components/process/FilingDateFilter";
import { ArchiveDialog } from "@/components/process/ArchiveDialog";
import { UnarchiveDialog } from "@/components/process/UnarchiveDialog";

interface ProcessListProps {
  processes: Process[];
  isLoading: boolean;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: (id: string) => Promise<void>;
}

export function ProcessList({
  processes,
  isLoading,
  onDelete,
  onRefresh
}: ProcessListProps) {
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [bulkAlertOpen, setBulkAlertOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProcessId, setLoadingProcessId] = useState<string | null>(null);
  const [showOverviewId, setShowOverviewId] = useState<string | null>(null);
  const [processTabStates, setProcessTabStates] = useState<Record<string, string>>({});
  const [currentMovementIndex, setCurrentMovementIndex] = useState<Record<string, number>>({});
  const [selectedHitIndex, setSelectedHitIndex] = useState<Record<string, number>>({});
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [showTabsId, setShowTabsId] = useState<string | null>(null);
  const [eventStartDate, setEventStartDate] = useState<Date | undefined>(undefined);
  const [eventEndDate, setEventEndDate] = useState<Date | undefined>(undefined);
  const [eventCode, setEventCode] = useState<string>("");
  const [eventText, setEventText] = useState<string>("");
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courtFilter, setCourtFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [processStatuses, setProcessStatuses] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [scheduleConfigOpen, setScheduleConfigOpen] = useState(false);
  const [processDetails, setProcessDetails] = useState<Record<string, {
    data_ajuizamento?: string;
  }>>({});
  const [processHits, setProcessHits] = useState<Record<string, {
    data_hora_ultima_atualizacao?: string;
  }>>({});
  const itemsPerPage = 5;
  const [filingDateFilter, setFilingDateFilter] = useState<Date | undefined>(undefined);
  const [sortByFilingDate, setSortByFilingDate] = useState<"none" | "oldest" | "recent">("none");
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);

  // Função de ordenação centralizada
  const sortProcessesByDate = (processes: Process[], order: "recent" | "oldest" = "recent") => {
    return [...processes].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      // Garante que datas mais recentes vêm primeiro
      return order === "recent" ? dateB - dateA : dateA - dateB;
    });
  };

  // Inicialização - sempre começa com os mais recentes
  useEffect(() => {
    if (processes.length > 0) {
      const sortedProcesses = sortProcessesByDate(processes, "recent");
      setFilteredProcesses(sortedProcesses);
      loadProcessStatuses(processes);
    }
  }, [processes]);
  const handleSortOrderChange = () => {
    const newSortOrder = sortOrder === "recent" ? "oldest" : "recent";
    setSortOrder(newSortOrder);
    setFilteredProcesses(prev => sortProcessesByDate(prev, newSortOrder));
  };

  // Agrupa os processos mantendo a ordem de criação
  const groupedProcesses = useMemo(() => {
    // Primeiro, vamos criar um array de processos pai ordenados por data
    const parentProcesses = filteredProcesses.filter(p => p.is_parent || !p.parent_id);
    const sortedParents = parentProcesses.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    // Criar um array ordenado de grupos para preservar a ordem
    const orderedGroups: [string, {
      parent: Process | null;
      children: Process[];
    }][] = [];

    // Agora vamos criar os grupos mantendo a ordem dos pais
    sortedParents.forEach(process => {
      const children = filteredProcesses.filter(p => p.parent_id === process.id);
      orderedGroups.push([process.id, {
        parent: process,
        children: children
      }]);
    });
    return orderedGroups;
  }, [filteredProcesses, sortOrder]);
  const applyFilters = useCallback(() => {
    let processesToFilter = [...processes];

    // Aplicar o filtro de status
    if (statusFilter !== "all") {
      processesToFilter = processesToFilter.filter(process => {
        const status = process.status || "Em andamento";
        if (statusFilter === "active") return status === "Em andamento";
        if (statusFilter === "archived") return status === "Arquivado";
        if (statusFilter === "closed") return status === "Baixado";
        return true;
      });
    }
    
    // Aplicar o filtro de data de ajuizamento
    if (filingDateFilter) {
      const filingDateStart = new Date(filingDateFilter);
      filingDateStart.setHours(0, 0, 0, 0);
      
      const filingDateEnd = new Date(filingDateFilter);
      filingDateEnd.setHours(23, 59, 59, 999);
      
      processesToFilter = processesToFilter.filter(process => {
        // Verificar no metadata.dataAjuizamento
        if (process.metadata?.dataAjuizamento) {
          const dataAjuizamento = new Date(process.metadata.dataAjuizamento);
          return dataAjuizamento >= filingDateStart && dataAjuizamento <= filingDateEnd;
        }
        
        // Verificar também em processDetails se necessário
        if (processDetails[process.id]?.data_ajuizamento) {
          const dataAjuizamento = new Date(processDetails[process.id].data_ajuizamento);
          return dataAjuizamento >= filingDateStart && dataAjuizamento <= filingDateEnd;
        }
        
        return false;
      });
    }
    
    // Aplicar a ordenação (criado ou data de ajuizamento)
    if (sortByFilingDate !== "none") {
      processesToFilter.sort((a, b) => {
        let dateA: number, dateB: number;
        
        // Obter data de ajuizamento de A
        if (a.metadata?.dataAjuizamento) {
          dateA = new Date(a.metadata.dataAjuizamento).getTime();
        } else if (processDetails[a.id]?.data_ajuizamento) {
          dateA = new Date(processDetails[a.id].data_ajuizamento).getTime();
        } else {
          dateA = new Date(a.created_at).getTime(); // Fallback para created_at
        }
        
        // Obter data de ajuizamento de B
        if (b.metadata?.dataAjuizamento) {
          dateB = new Date(b.metadata.dataAjuizamento).getTime();
        } else if (processDetails[b.id]?.data_ajuizamento) {
          dateB = new Date(processDetails[b.id].data_ajuizamento).getTime();
        } else {
          dateB = new Date(b.created_at).getTime(); // Fallback para created_at
        }
        
        return sortByFilingDate === "recent" ? dateB - dateA : dateA - dateB;
      });
    } else {
      // Ordenação padrão por data de criação
      processesToFilter.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
      });
    }
    
    setFilteredProcesses(processesToFilter);
  }, [processes, sortOrder, statusFilter, filingDateFilter, sortByFilingDate, processDetails]);

  // Effect para reaplicar filtros quando as dependências mudarem
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Ajustar a paginação para trabalhar com o array ordenado
  const paginatedGroups = groupedProcesses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(groupedProcesses.length / itemsPerPage);
  
  // Define the getStatusBadgeVariant function only once
  const getStatusBadgeVariant = (status?: string): "destructive" | "secondary" | "default" | "outline" => {
    if (status === "Baixado") {
      return "destructive";
    }
    if (status === "Arquivado") {
      return "outline";
    }
    return "secondary";
  };

  const handleDelete = async (id: string) => {
    if (onDelete) {
      setLoadingProcessId(id);
      try {
        await onDelete(id);
        setSelectedProcesses(prev => prev.filter(processId => processId !== id));
        toast.success("Processo excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir processo:", error);
        toast.error("Erro ao excluir o processo");
      } finally {
        setLoadingProcessId(null);
        setProcessToDelete(null);
        setAlertOpen(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (onDelete && selectedProcesses.length > 0) {
      try {
        const processesToDelete = [...selectedProcesses];
        for (const id of processesToDelete) {
          await onDelete(id);
        }
        toast.success(`${processesToDelete.length} processos excluídos com sucesso!`);
        setSelectedProcesses([]);
        setBulkAlertOpen(false);
      } catch (error) {
        console.error("Erro ao excluir processos em massa:", error);
        toast.error("Erro ao excluir processos");
        setBulkAlertOpen(false);
      }
    } else {
      toast.error("Nenhum processo selecionado para exclusão");
      setBulkAlertOpen(false);
    }
  };

  const handleRefresh = async (id: string) => {
    if (onRefresh) {
      setLoadingProcessId(id);
      try {
        await onRefresh(id);
        toast.success("Processo atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao atualizar processo:", error);
        toast.error("Erro ao atualizar o processo");
      } finally {
        setLoadingProcessId(null);
      }
    }
  };

  const handlePrint = (process: Process) => {
    setSelectedProcess(process);
    setReportDialogOpen(true);
  };
  
  const handleView = (process: Process) => {
    setSelectedProcess(process);
    setReportDialogOpen(true);
  };
  
  const handleShare = async (process: Process) => {
    const shareText = `Processo ${formatProcessNumber(process.number)} - ${process.title || ""}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Compartilhar Processo',
          text: shareText
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success("Informações do processo copiadas para a área de transferência");
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      toast.error("Não foi possível compartilhar o processo");
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não informada";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return format(date, 'dd/MM/yyyy HH:mm:ss', {
        locale: ptBR
      });
    } catch {
      return "Data inválida";
    }
  };
  
  const toggleProcessSelection = (id: string) => {
    setSelectedProcesses(prev => prev.includes(id) ? prev.filter(processId => processId !== id) : [...prev, id]);
  };
  
  const toggleAllProcesses = () => {
    const allParentIds = Object.keys(groupedProcesses);
    if (selectedProcesses.length === allParentIds.length && allParentIds.length > 0) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(allParentIds);
    }
  };

  const handleTabChange = (processId: string, value: string) => {
    setProcessTabStates(prev => ({
      ...prev,
      [processId]: value
    }));
  };
  
  const handlePreviousMovement = (processId: string) => {
    setCurrentMovementIndex(prev => {
      const currentIndex = prev[processId] || 0;
      const process = processes.find(p => p.id === processId);
      const maxIndex = (process?.movimentacoes?.length || 1) - 1;
      return {
        ...prev,
        [processId]: currentIndex > 0 ? currentIndex - 1 : maxIndex
      };
    });
    setShowTabsId(processId);
    setProcessTabStates(prev => ({
      ...prev,
      [processId]: "eventos"
    }));
  };
  
  const handleNextMovement = (processId: string) => {
    setCurrentMovementIndex(prev => {
      const currentIndex = prev[processId] || 0;
      const process = processes.find(p => p.id === processId);
      const maxIndex = (process?.movimentacoes?.length || 1) - 1;
      return {
        ...prev,
        [processId]: currentIndex < maxIndex ? currentIndex + 1 : 0
      };
    });
    setShowTabsId(processId);
    setProcessTabStates(prev => ({
      ...prev,
      [processId]: "eventos"
    }));
  };
  
  const handleHitSelect = (processId: string, hitIndex: number) => {
    setSelectedHitIndex(prev => ({
      ...prev,
      [processId]: hitIndex
    }));
  };
  
  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const supabase = getSupabaseClient();
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }
      if (!password.trim()) {
        setPasswordError("A senha não pode estar vazia");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Erro ao verificar senha:", error);
      setPasswordError("Erro ao verificar senha");
      return false;
    }
  };
  
  const confirmBulkDeleteWithPassword = async () => {
    const isPasswordValid = await verifyPassword(password);
    if (isPasswordValid) {
      await handleBulkDelete();
      setPassword("");
      setPasswordError("");
      setPasswordConfirmOpen(false);
    }
  };

  const loadProcessStatuses = async (processes: Process[]) => {
    try {
      const supabase = getSupabaseClient();

      // Filtra processos válidos
      const validProcesses = processes.filter(process => process?.id && typeof process.id === 'string' && process.id.trim() !== '');
      interface ProcessStatusData {
        id: string;
        status: string;
      }

      // Busca o status diretamente da tabela processes
      const {
        data: processesData,
        error: processesError
      } = await supabase.from('processes').select('id, status').in('id', validProcesses.map(p => p.id));
      if (processesError) {
        console.error('Erro ao buscar status dos processos:', processesError);
        return;
      }

      // Cria um mapa de status
      const statusMap: Record<string, string> = {};
      if (processesData) {
        (processesData as ProcessStatusData[]).forEach(process => {
          statusMap[process.id] = process.status;
        });
      }
      setProcessStatuses(statusMap);
    } catch (error) {
      console.error('Erro ao carregar status dos processos:', error);
    }
  };
  
  const availableCourts = useMemo(() => {
    const courts = processes.map(process => process.court).filter((court): court is string => !!court);
    return Array.from(new Set(courts));
  }, [processes]);
  
  const availableStatuses = useMemo(() => {
    const statuses = processes.map(process => process.status).filter((status): status is string => !!status);
    return Array.from(new Set(statuses));
  }, [processes]);
  
  const resetFilters = () => {
    setStatusFilter("all");
    setCourtFilter("all");
    setDateFilter("all");
    setFilteredProcesses(processes);
  };
  
  const getProcessStatus = (process: Process): string => {
    if (!process.hits || process.hits.length === 0) {
      return "Em andamento";
    }
    const latestHit = process.hits[process.hits.length - 1];
    if (!latestHit.movimentos || !Array.isArray(latestHit.movimentos)) {
      return "Em andamento";
    }
    const hasBaixaMovement = latestHit.movimentos?.some((movimento: {
      codigo: number;
    }) => movimento.codigo === 22 || movimento.codigo === 848) || false;
    return hasBaixaMovement ? "Baixado" : "Em andamento";
  };

  const handleScheduleUpdate = (updatedProcess: Process) => {
    // Atualiza o processo na lista
    setFilteredProcesses((prevProcesses: Process[]) => prevProcesses.map((p: Process) => p.id === updatedProcess.id ? updatedProcess : p));
  };

  // Função para buscar detalhes dos processos
  const fetchProcessDetails = async (processIds: string[]) => {
    try {
      const supabase = getSupabaseClient();
      const {
        data,
        error
      } = await supabase.from('process_details').select('process_id, data_ajuizamento').in('process_id', processIds);
      if (error) {
        console.error('Erro ao buscar detalhes dos processos:', error);
        return;
      }
      const detailsMap = (data || []).reduce((acc, detail) => ({
        ...acc,
        [detail.process_id]: detail
      }), {});
      setProcessDetails(detailsMap);
    } catch (error) {
      console.error('Erro ao buscar detalhes dos processos:', error);
    }
  };

  // Função para buscar detalhes dos hits dos processos
  const fetchProcessHits = async (processIds: string[]) => {
    try {
      const supabase = getSupabaseClient();
      const {
        data,
        error
      } = await supabase.from('process_hits').select('process_id, data_hora_ultima_atualizacao').in('process_id', processIds).order('data_hora_ultima_atualizacao', {
        ascending: false
      });
      if (error) {
        console.error('Erro ao buscar hits dos processos:', error);
        return;
      }
      interface ProcessHit {
        process_id: string;
        data_hora_ultima_atualizacao?: string;
      }

      // Agrupa por process_id pegando apenas o hit mais recente
      const hitsMap = (data || []).reduce((acc: Record<string, ProcessHit>, hit: ProcessHit) => {
        if (!hit.process_id) return acc;
        const hitDate = hit.data_hora_ultima_atualizacao ? new Date(hit.data_hora_ultima_atualizacao) : null;
        const accDate = acc[hit.process_id]?.data_hora_ultima_atualizacao ? new Date(acc[hit.process_id].data_hora_ultima_atualizacao || '') : null;
        if (!acc[hit.process_id] || hitDate && accDate && hitDate > accDate) {
          acc[hit.process_id] = {
            process_id: hit.process_id,
            data_hora_ultima_atualizacao: hit.data_hora_ultima_atualizacao
          };
        }
        return acc;
      }, {} as Record<string, ProcessHit>);
      setProcessHits(hitsMap);
    } catch (error) {
      console.error('Erro ao buscar hits dos processos:', error);
    }
  };

  // Buscar detalhes quando os processos mudarem
  useEffect(() => {
    if (processes.length > 0) {
      const processIds = processes.map(p => p.id);
      fetchProcessDetails(processIds);
      fetchProcessHits(processIds);
    }
  }, [processes]);

  const renderFilterPopover = () => (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
          <ChevronDown className={`h-4 w-4 transition-transform ${statusFilter !== "all" ? "rotate-180" : ""}`} />
          Status: {
            statusFilter === "all" ? "Todos" : 
            statusFilter === "active" ? "Em andamento" : 
            statusFilter === "archived" ? "Arquivados" :
            "Baixados"
          }
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => setStatusFilter("all")} 
            className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${statusFilter === "all" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setStatusFilter("active")} 
            className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${statusFilter === "active" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Em andamento
          </button>
          <button 
            onClick={() => setStatusFilter("archived")} 
            className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${statusFilter === "archived" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Arquivados
          </button>
          <button 
            onClick={() => setStatusFilter("closed")} 
            className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${statusFilter === "closed" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Baixados
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
  
  // Botão de arquivamento/desarquivamento em massa
  const renderArchiveButton = () => {
    if (selectedProcesses.length === 0) return null;
    
    // Verifica se todos os processos selecionados têm o mesmo status
    const allSelected = selectedProcesses.map(id => 
      processes.find(p => p.id === id)
    ).filter(Boolean);
    
    // Se todos estiverem arquivados, mostra botão de desarquivar
    const allArchived = allSelected.every(p => p?.status === "Arquivado");
    
    if (allArchived) {
      return (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => setUnarchiveDialogOpen(true)} 
          className="ml-0 sm:ml-4"
        >
          <ArchiveX className="h-4 w-4 mr-2" />
          Desarquivar {selectedProcesses.length} {selectedProcesses.length === 1 ? 'processo' : 'processos'}
        </Button>
      );
    }
    
    // Caso contrário, mostra botão de arquivar
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => setArchiveDialogOpen(true)} 
        className="ml-0 sm:ml-4"
      >
        <Archive className="h-4 w-4 mr-2" />
        Arquivar {selectedProcesses.length} {selectedProcesses.length === 1 ? 'processo' : 'processos'}
      </Button>
    );
  };
  
  // Modificar os botões de ação de cada processo para incluir arquivar/desarquivar
  const renderProcessActionButtons = (process: Process) => {
    const isArchived = process.status === "Arquivado";
    
    return (
      <div className="flex flex-wrap items-center gap-1 mt-2 sm:mt-0 self-end sm:self-auto w-full sm:w-auto justify-end">
        <Button size="sm" variant="ghost" onClick={() => handleRefresh?.(process.id)} disabled={loadingProcessId === process.id || !onRefresh} className="h-7 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handlePrint(process)} className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50" title="Imprimir processo">
          <Printer className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handleView(process)} className="h-7 px-2 text-green-500 hover:text-green-700 hover:bg-green-50" title="Visualizar processo">
          <Eye className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handleShare(process)} className="h-7 px-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50">
          <Share2 className="h-4 w-4" />
        </Button>
        
        {/* Botão arquivar/desarquivar */}
        {isArchived ? (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setSelectedProcesses([process.id]);
              setUnarchiveDialogOpen(true);
            }} 
            className="h-7 px-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
            title="Desarquivar processo"
          >
            <ArchiveX className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              setSelectedProcesses([process.id]);
              setArchiveDialogOpen(true);
            }} 
            className="h-7 px-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
            title="Arquivar processo"
          >
            <Archive className="h-4 w-4" />
          </Button>
        )}
        
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => {
            setProcessToDelete(process.id);
            setAlertOpen(true);
          }} 
          disabled={loadingProcessId === process.id || !onDelete} 
          className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
      </div>
    );
  };
  
  // Adicionar o botão de filtro de data de ajuizamento na barra de ferramentas
  const renderFilingDateSortButton = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          <Calendar className="h-4 w-4 mr-2" />
          {sortByFilingDate === "none" 
            ? "Ordernar por ajuizamento" 
            : sortByFilingDate === "recent" 
              ? "Mais recente primeiro" 
              : "Mais antigo primeiro"
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => setSortByFilingDate("none")} 
            className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${sortByFilingDate === "none" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Ordenação padrão
          </button>
          <button 
            onClick={() => setSortByFilingDate("recent")} 
            className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${sortByFilingDate === "recent" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
          >
            Ajuizamento - Mais recente primeiro
          </button>
          <button 
            onClick={() => setSortByFilingDate("oldest")} 
            className={`flex items-center px-
