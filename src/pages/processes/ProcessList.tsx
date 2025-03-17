import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Trash, Printer, Share2, RefreshCw, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Filter, X } from "lucide-react";
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
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>(processes);
  const [processStatuses, setProcessStatuses] = useState<Record<string, string>>({});
  const itemsPerPage = 5;

  const groupedProcesses = filteredProcesses.reduce<Record<string, {
    parent: Process | null;
    children: Process[];
  }>>((acc, process) => {
    if (process.is_parent || !process.parent_id) {
      if (!acc[process.id]) {
        acc[process.id] = {
          parent: process,
          children: []
        };
      } else {
        acc[process.id].parent = process;
      }
    } else if (process.parent_id) {
      if (!acc[process.parent_id]) {
        acc[process.parent_id] = {
          parent: null,
          children: [process]
        };
      } else {
        acc[process.parent_id].children.push(process);
      }
    }
    return acc;
  }, {});

  const paginatedGroups = Object.entries(groupedProcesses).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(Object.keys(groupedProcesses).length / itemsPerPage);

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

  // Verificar senha do usuário
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

  // Função para confirmar exclusão em massa com senha
  const confirmBulkDeleteWithPassword = async () => {
    const isPasswordValid = await verifyPassword(password);
    
    if (isPasswordValid) {
      await handleBulkDelete();
      setPassword("");
      setPasswordError("");
      setPasswordConfirmOpen(false);
    }
  };

  // Função para aplicar filtros
  const applyFilters = () => {
    let filtered = [...processes];
    
    // Filtrar por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(process => process.status === statusFilter);
    }
    
    // Filtrar por tribunal
    if (courtFilter !== "all") {
      filtered = filtered.filter(process => process.court === courtFilter);
    }
    
    // Filtrar por data
    if (dateFilter !== "all") {
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      const oneMonth = 30 * oneDay;
      
      filtered = filtered.filter(process => {
        const createdAt = new Date(process.created_at);
        const diff = now.getTime() - createdAt.getTime();
        
        switch (dateFilter) {
          case "today":
            return diff < oneDay;
          case "week":
            return diff < oneWeek;
          case "month":
            return diff < oneMonth;
          default:
            return true;
        }
      });
    }
    
    setFilteredProcesses(filtered);
  };

  // Aplicar filtros quando os valores mudarem
  useEffect(() => {
    applyFilters();
  }, [statusFilter, courtFilter, dateFilter, processes]);

  // Obter lista única de tribunais para o filtro
  const availableCourts = useMemo(() => {
    const courts = processes
      .map(process => process.court)
      .filter((court): court is string => !!court);
    return Array.from(new Set(courts));
  }, [processes]);

  // Obter lista única de status para o filtro
  const availableStatuses = useMemo(() => {
    const statuses = processes
      .map(process => process.status)
      .filter((status): status is string => !!status);
    return Array.from(new Set(statuses));
  }, [processes]);

  // Resetar filtros
  const resetFilters = () => {
    setStatusFilter("all");
    setCourtFilter("all");
    setDateFilter("all");
    setFilteredProcesses(processes);
  };

  const getProcessStatus = (process: Process): string => {
    // Verifica se o processo tem hits
    if (!process.hits || process.hits.length === 0) {
      return "Em andamento";
    }

    // Pega o hit mais recente (último do array)
    const latestHit = process.hits[process.hits.length - 1];
    
    // Verifica se o hit tem movimentos
    if (!latestHit.movimentos || !Array.isArray(latestHit.movimentos)) {
      return "Em andamento";
    }

    // Verifica se existe algum movimento com código 22 ou 848
    const hasBaixaMovement = latestHit.movimentos.some(
      movimento => movimento.codigo === 22 || movimento.codigo === 848
    );

    return hasBaixaMovement ? "Baixado" : "Em andamento";
  };

  // Função para carregar o status dos processos
  const loadProcessStatuses = async (processes: Process[]) => {
    try {
      // Filtra apenas processos com IDs válidos (não nulos e não vazios)
      const validProcesses = processes.filter(process => 
        process?.id && typeof process.id === 'string' && process.id.trim() !== ''
      );

      const statusPromises = validProcesses.map(async (process) => {
        const status = await checkProcessStatus(process.id);
        return [process.id, status] as [string, string];
      });

      const statuses = await Promise.all(statusPromises);
      setProcessStatuses(Object.fromEntries(statuses));
    } catch (error) {
      console.error('Erro ao carregar status dos processos:', error);
    }
  };

  // Carregar status quando os processos mudarem
  useEffect(() => {
    if (processes.length > 0) {
      loadProcessStatuses(processes);
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
                          <CardTitle className="text-lg font-medium text-gray-900">
                            {parentProcess.title || `Processo ${formatProcessNumber(parentProcess.number)}`}
                          </CardTitle>
                          <div className="flex flex-col space-y-1">
                            <div className="flex flex-wrap items-baseline gap-1">
                              <Badge variant={processStatuses[parentProcess.id] === "Baixado" ? "destructive" : "secondary"}>
                                {processStatuses[parentProcess.id] || "Em andamento"}
                              </Badge>
                              <span className="text-sm text-gray-500 break-all">
                                {formatProcessNumber(parentProcess.number)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-baseline gap-1">
                              {parentProcess.metadata?.assuntos && Array.isArray(parentProcess.metadata.assuntos) && parentProcess.metadata.assuntos.length > 0 ? (
                                <>
                                  <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                                    {parentProcess.metadata.assuntos.length} {parentProcess.metadata.assuntos.length === 1 ? 'assunto' : 'assuntos'}
                                  </Badge>
                                  {parentProcess.metadata.assuntos.map((assunto, index) => {
                                    const isPrincipal = assunto.principal;
                                    return (
                                      <Badge 
                                        key={index}
                                        variant="default" 
                                        className={cn(
                                          "whitespace-normal text-xs",
                                          isPrincipal 
                                            ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
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
                                <Badge variant="default" className="bg-indigo-500 hover:bg-indigo-600 font-medium whitespace-normal text-xs text-white">
                                  Assunto não informado
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                              <div className="flex flex-wrap items-center gap-1">
                                <Badge variant="outline">
                                  Data Ajuizamento: {formatDate(parentProcess.metadata?.dataAjuizamento)}
                                </Badge>
                                <Badge variant="outline">
                                  Tribunal: {parentProcess.court || "Não informado"}
                                </Badge>
                                <Badge variant="outline">
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
                                  <span className="font-medium text-gray-700">{formatDate(parentProcess.updated_at)}</span>
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

      {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-2" />}

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
