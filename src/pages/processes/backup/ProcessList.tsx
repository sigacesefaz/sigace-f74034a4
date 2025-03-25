import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Trash, Printer, Share2, RefreshCw, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Filter, X, Clock } from "lucide-react";
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
  const [processDetails, setProcessDetails] = useState<Record<string, { data_ajuizamento?: string }>>({});
  const [processHits, setProcessHits] = useState<Record<string, { data_hora_ultima_atualizacao?: string }>>({});
  const itemsPerPage = 5;

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
    const orderedGroups: [string, { parent: Process | null; children: Process[] }][] = [];
    
    // Agora vamos criar os grupos mantendo a ordem dos pais
    sortedParents.forEach(process => {
      const children = filteredProcesses.filter(p => p.parent_id === process.id);
      orderedGroups.push([
        process.id,
        {
          parent: process,
          children: children
        }
      ]);
    });
    
    return orderedGroups;
  }, [filteredProcesses, sortOrder]);

  const applyFilters = useCallback(() => {
    let processesToFilter = [...processes];
    
    // Primeiro aplicar o filtro de status
    if (statusFilter !== "all") {
      processesToFilter = processesToFilter.filter(process => {
        const status = process.status || "Em andamento";
        if (statusFilter === "active") return status === "Em andamento";
        if (statusFilter === "archived") return status === "Baixado";
        return true;
      });
    }

    // Depois aplicar a ordenação
    processesToFilter.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "recent" ? dateB - dateA : dateA - dateB;
    });

    setFilteredProcesses(processesToFilter);
  }, [processes, sortOrder, statusFilter]);

  // Effect para reaplicar filtros quando as dependências mudarem
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Ajustar a paginação para trabalhar com o array ordenado
  const paginatedGroups = groupedProcesses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(groupedProcesses.length / itemsPerPage);

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
      const { data: { user } } = await supabase.auth.getUser();
      
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
      const validProcesses = processes.filter(process => 
        process?.id && typeof process.id === 'string' && process.id.trim() !== ''
      );

      interface ProcessStatusData {
        id: string;
        status: string;
      }

      // Busca o status diretamente da tabela processes
      const { data: processesData, error: processesError } = await supabase
        .from('processes')
        .select('id, status')
        .in('id', validProcesses.map(p => p.id));

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
    const courts = processes
      .map(process => process.court)
      .filter((court): court is string => !!court);
    return Array.from(new Set(courts));
  }, [processes]);

  const availableStatuses = useMemo(() => {
    const statuses = processes
      .map(process => process.status)
      .filter((status): status is string => !!status);
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

    const hasBaixaMovement = latestHit.movimentos.some(
      movimento => movimento.codigo === 22 || movimento.codigo === 848
    );

    return hasBaixaMovement ? "Baixado" : "Em andamento";
  };

  const getStatusBadgeVariant = (status?: string): "destructive" | "secondary" | "default" | "outline" => {
    if (status === "Baixado") {
      return "destructive";
    } 
    return "secondary";
  };

  const handleScheduleUpdate = (updatedProcess: Process) => {
    // Atualiza o processo na lista
    setProcesses((prevProcesses) =>
      prevProcesses.map((p) =>
        p.id === updatedProcess.id ? updatedProcess : p
      )
    );
  };

  // Função para buscar detalhes dos processos
  const fetchProcessDetails = async (processIds: string[]) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('process_details')
        .select('process_id, data_ajuizamento')
        .in('process_id', processIds);

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
      const { data, error } = await supabase
        .from('process_hits')
        .select('process_id, data_hora_ultima_atualizacao')
        .in('process_id', processIds)
        .order('data_hora_ultima_atualizacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar hits dos processos:', error);
        return;
      }

      // Agrupa por process_id pegando apenas o hit mais recente
      const hitsMap = (data || []).reduce((acc, hit) => {
        if (!acc[hit.process_id] || new Date(hit.data_hora_ultima_atualizacao) > new Date(acc[hit.process_id].data_hora_ultima_atualizacao)) {
          acc[hit.process_id] = hit;
        }
        return acc;
      }, {} as Record<string, any>);

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

  if (isLoading) {
    return <div className="space-y-2">
        {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
            <CardHeader className="bg-gray-100 h-20"></CardHeader>
            <CardContent className="py-2">
              <div className="h-32 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>)}
      </div>;
  }

  if (processes.length === 0) {
    return <Card className="text-center py-6">
        <CardContent>
          <p className="text-gray-500">Nenhum processo encontrado</p>
          <Link to="/processes/new">
            <Button className="mt-2">Cadastrar Novo Processo</Button>
          </Link>
        </CardContent>
      </Card>;
  }

  return <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all" 
              checked={selectedProcesses.length > 0 && selectedProcesses.length === Object.keys(groupedProcesses).length}
              onCheckedChange={toggleAllProcesses}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Selecionar todos
            </label>
          </div>
          
          <Badge variant="outline" className="px-2 py-1">
            Total: {Object.keys(groupedProcesses).length} processos
          </Badge>

          <button 
            onClick={handleSortOrderChange}
            className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
          >
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${sortOrder === "recent" ? "" : "rotate-180"}`}
            />
            {sortOrder === "recent" ? "Recentes Primeiro" : "Antigos Primeiro"}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${statusFilter !== "all" ? "rotate-180" : ""}`}
                />
                Status: {statusFilter === "all" ? "Todos" : statusFilter === "active" ? "Em andamento" : "Baixados"}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1">
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${
                    statusFilter === "all"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${
                    statusFilter === "active"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Em andamento
                </button>
                <button
                  onClick={() => setStatusFilter("archived")}
                  className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${
                    statusFilter === "archived"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Baixados
                </button>
              </div>
            </PopoverContent>
          </Popover>
          
          {selectedProcesses.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setBulkAlertOpen(true)}
              className="ml-0 sm:ml-4"
            >
              <Trash className="h-4 w-4 mr-2" />
              Excluir {selectedProcesses.length} {selectedProcesses.length === 1 ? 'processo' : 'processos'}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
      </div>

      {paginatedGroups.length === 0 ? (
        <Card className="p-6">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhum processo encontrado com os filtros selecionados.</p>
          </CardContent>
        </Card>
      ) : (
        paginatedGroups.map(([groupId, group]) => {
          const parentProcess = group.parent;
          if (!parentProcess) return null;
          return <div key={groupId} className="space-y-1">
                <Card className="overflow-hidden border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 p-2">
                    <div className="flex flex-wrap items-start gap-1 justify-between">
                      <div className="flex items-start gap-1">
                        <Checkbox checked={selectedProcesses.includes(parentProcess.id)} onCheckedChange={() => toggleProcessSelection(parentProcess.id)} className="mt-1" />
                        <div>
                          <CardTitle className="text-lg font-medium text-gray-900 flex items-baseline gap-2">
                            {parentProcess.title || "Processo"}
                            <span className="font-mono text-base text-gray-600">
                              {formatProcessNumber(parentProcess.number).replace(/^0+/, '')}
                            </span>
                            <Badge 
                              variant={getStatusBadgeVariant(parentProcess.status)}
                              className={cn(
                                "h-6 px-2",
                                parentProcess.status === "Baixado" 
                                  ? "bg-red-600 text-white hover:bg-red-700" 
                                  : "bg-[#fec30b] text-black hover:bg-[#fec30b]/90"
                              )}
                            >
                              {parentProcess.status || "Em andamento"}
                            </Badge>
                          </CardTitle>
                          <div className="flex flex-col space-y-1">
                            <div className="flex flex-wrap items-center gap-1">
                              {/* Badge de eventos */}
                              {parentProcess.movimentacoes && parentProcess.movimentacoes.length > 0 && (
                                <Badge variant="secondary" className="h-6 px-2 bg-[#fec30b] text-black hover:bg-[#fec30b]/90">
                                  {parentProcess.movimentacoes.length} {parentProcess.movimentacoes.length === 1 ? 'evento' : 'eventos'}
                                </Badge>
                              )}
                              {/* Badge de movimentações processuais */}
                              {parentProcess.hits && parentProcess.hits.length > 0 && (
                                <Badge variant="secondary" className="h-6 px-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
                                  {parentProcess.hits.length} {parentProcess.hits.length === 1 ? 'movimentação processual' : 'movimentações processuais'}
                                </Badge>
                              )}
                              {/* Badges das classes de movimentação */}
                              {parentProcess.hits && parentProcess.hits.length > 0 && parentProcess.hits.map((hit, index) => {
                                const isCurrentHit = index === 0;
                                return (
                                  <Badge 
                                    key={index}
                                    variant={isCurrentHit ? "default" : "outline"}
                                    className={cn(
                                      "h-6 px-2",
                                      isCurrentHit 
                                        ? "bg-green-600 text-white hover:bg-green-700" 
                                        : "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300"
                                    )}
                                  >
                                    {hit.classe?.nome || "Classe não informada"}
                                  </Badge>
                                );
                              })}
                            </div>
                            <div className="flex flex-wrap items-baseline gap-1">
                              {/* Badge de assuntos */}
                              {parentProcess.metadata?.assuntos && Array.isArray(parentProcess.metadata.assuntos) && parentProcess.metadata.assuntos.length > 0 ? (
                                <>
                                  <Badge variant="outline" className="h-6 px-2 bg-[#2e3092] text-white hover:bg-[#2e3092]/90">
                                    {parentProcess.metadata.assuntos.length} {parentProcess.metadata.assuntos.length === 1 ? 'assunto' : 'assuntos'}
                                  </Badge>
                                  {parentProcess.metadata.assuntos.map((assunto, index) => {
                                    const isPrincipal = assunto.principal;
                                    return (
                                      <Badge 
                                        key={index}
                                        variant="default" 
                                        className={cn(
                                          "h-6 px-2 whitespace-normal text-xs",
                                          "bg-[#2e3092] text-white hover:bg-[#2e3092]/90"
                                        )}
                                        title={assunto.nome ? `${assunto.nome}${assunto.codigo ? ` (${assunto.codigo})` : ''}${isPrincipal ? ' - Principal' : ''}` : "Assunto não informado"}
                                      >
                                        {isPrincipal && <Check className="h-3 w-3 mr-1 inline-block" />}
                                        {assunto.nome}
                                        {assunto.codigo && <span className="ml-1 opacity-90">({assunto.codigo})</span>}
                                      </Badge>
                                    );
                                  })}
                                </>
                              ) : (
                                <Badge variant="default" className="h-6 px-2 bg-[#2e3092] text-white hover:bg-[#2e3092]/90 whitespace-normal text-xs">
                                  Assunto não informado
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                              <div className="flex flex-wrap items-center gap-1">
                                <Badge variant="outline" className="h-6 px-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
                                  Data Ajuizamento: {formatDate(processDetails[parentProcess.id]?.data_ajuizamento)}
                                </Badge>
                                <Badge variant="outline" className="h-6 px-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
                                  Tribunal: {parentProcess.court || "Não informado"}
                                </Badge>
                                <Badge variant="outline" className="h-6 px-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
                                  Grau: {parentProcess.metadata?.grau || "G1"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 mt-1 sm:mt-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Criado em:</span>
                                  <span className="font-medium text-gray-700">{formatDate(parentProcess.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-500">Última Atualização:</span>
                                  <span className="font-medium text-gray-700">
                                    {formatDate(processHits[parentProcess.id]?.data_hora_ultima_atualizacao || parentProcess.updated_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1 mt-2 sm:mt-0">
                        <Button size="sm" variant="ghost" onClick={() => handleRefresh?.(parentProcess.id)} disabled={loadingProcessId === parentProcess.id || !onRefresh} className="h-7 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handlePrint(parentProcess)} className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50" title="Imprimir processo">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleView(parentProcess)} className="h-7 px-2 text-green-500 hover:text-green-700 hover:bg-green-50" title="Visualizar processo">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleShare(parentProcess)} className="h-7 px-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setProcessToDelete(parentProcess.id);
                          setAlertOpen(true);
                        }} disabled={loadingProcessId === parentProcess.id || !onDelete} className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash className="h-4 w-4" />
                        </Button>
                        <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="py-1 px-2 bg-gray-50 border-t border-b divide-y divide-gray-100">
                    <div className="text-sm text-gray-700 pt-1">
                      <button onClick={() => setShowOverviewId(showOverviewId === parentProcess.id ? null : parentProcess.id)} className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                        <ChevronRight className={`h-4 w-4 transition-transform ${showOverviewId === parentProcess.id ? "rotate-90" : ""}`} />
                        Detalhes do Processo
                      </button>
                      <div id={`overview-${parentProcess.id}`} className={`transition-all duration-200 bg-gray-50 rounded-lg p-2 ${showOverviewId === parentProcess.id ? "opacity-100 max-h-[800px] mt-1" : "opacity-0 max-h-0 overflow-hidden"}`}>
                        <div className="space-y-2">
                          <div className="bg-white rounded-lg p-3 space-y-2">
                            <h4 className="font-medium text-sm text-gray-900">Movimentações Processuais</h4>
                            <ProcessHitsNavigation 
                              processId={parentProcess.id} 
                              hits={parentProcess.hits || []} 
                              currentHitIndex={selectedHitIndex[parentProcess.id] || 0}
                              onHitSelect={(index) => handleHitSelect(parentProcess.id, index)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>;
        })
      )}

      

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Processo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este processo? Esta ação não pode ser desfeita
              e todos os dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProcessToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => processToDelete && handleDelete(processToDelete)} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkAlertOpen} onOpenChange={setBulkAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedProcesses.length} {selectedProcesses.length === 1 ? 'processo' : 'processos'}. 
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => setPasswordConfirmOpen(true)}>
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={passwordConfirmOpen} onOpenChange={setPasswordConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirme sua senha</DialogTitle>
            <DialogDescription>
              Por motivos de segurança, digite sua senha para confirmar a exclusão em massa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setPasswordConfirmOpen(false);
              setPassword("");
              setPasswordError("");
            }}>
              Cancelar
            </Button>
            <Button onClick={confirmBulkDeleteWithPassword}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedProcess && <ProcessReportDialog process={selectedProcess} open={reportDialogOpen} onOpenChange={setReportDialogOpen} />}
    </div>;
}
