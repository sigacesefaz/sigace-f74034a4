import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { ProcessList } from "./ProcessList";
import type { Process } from "@/types/process";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ArchiveRestore } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Eye, Trash, Printer, Share2, RefreshCw, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react";
import { Tabs as ShadcnTabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs as MuiTabs, Tab as MuiTab } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';
import ArticleIcon from '@mui/icons-material/Article';
import TimelineIcon from '@mui/icons-material/Timeline';
import { ProcessMovements } from "@/components/process/ProcessMovements";
import { ProcessDecisions } from "@/components/process/ProcessDecisions";
import { ProcessParties } from "@/components/process/ProcessParties";
import { ProcessDocuments } from "@/components/process/ProcessDocuments";
import { ProcessHitsNavigation } from "@/components/process/ProcessHitsNavigation";
import { ProcessSubjects } from "@/components/process/ProcessSubjects";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { Checkbox } from "@/components/ui/checkbox";
import { formatProcessNumber } from "@/utils/format";

interface Assunto {
  nome: string;
  codigo?: string;
  principal?: boolean;
}

interface ProcessDetails {
  classe?: {
    nome: string;
    codigo: string;
  };
  data_ajuizamento?: string;
  sistema?: {
    nome?: string;
    codigo?: string;
  };
  orgao_julgador?: {
    nome?: string;
    codigo?: string;
  };
  grau?: string;
  nivel_sigilo?: number;
  assuntos?: any[];
}

interface ProcessMovement {
  id: string;
  process_id: string;
  nome: string;
  data_hora: string;
  codigo?: string;
  complemento?: string;
}

interface ProcessHit {
  id: string;
  process_id: string;
  data_hora_ultima_atualizacao: string;
}

interface ProcessWithRelations extends Process {
  process_details: ProcessDetails[];
  process_movements: ProcessMovement[];
  process_hits: ProcessHit[];
  archive_reason?: string;
  archived_at?: string;
}

interface DatabaseProcess {
  id: string;
  number: string;
  title: string;
  court: string;
  instance: string;
  status: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  is_archived: boolean;
}

interface SelectedHitIndex {
  [processId: string]: number;
}

export default function ArchivedProcesses() {
  const [isLoading, setIsLoading] = useState(true);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showArchiveReasonDialog, setShowArchiveReasonDialog] = useState(false);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [archiveReason, setArchiveReason] = useState<string>("");
  const ITEMS_PER_PAGE = 10;
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null);
  const [processTabStates, setProcessTabStates] = useState<Record<string, string>>({});
  const [selectedHitIndex, setSelectedHitIndex] = useState<SelectedHitIndex>({});
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [showOverviewId, setShowOverviewId] = useState<string | null>(null);

  const fetchProcesses = async (pageNumber = page) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const start = (pageNumber - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      const { data: processesData, error: processesError, count } = await supabase
        .from('processes')
        .select('*, process_details(*), process_movements(*), process_hits(*)', { count: 'exact' })
        .eq('is_archived', true)
        .order('updated_at', { ascending: false })
        .range(start, end);

      if (processesError) throw processesError;

      if (processesData) {
        const formattedProcesses = (processesData as unknown as ProcessWithRelations[]).map(process => ({
          id: process.id,
          number: process.number,
          title: process.title,
          description: process.description,
          status: process.status,
          last_movement: process.process_movements?.[0]?.data_hora,
          movements: process.process_movements?.map(m => ({
            data: m.data_hora,
            descricao: m.nome
          })),
          created_at: process.created_at,
          updated_at: process.updated_at,
          user_id: process.user_id,
          metadata: {
            sistema: {
              codigo: Number(process.process_details?.[0]?.sistema?.codigo) || 1,
              nome: process.process_details?.[0]?.sistema?.nome || "PJe"
            },
            classe: {
              codigo: Number(process.process_details?.[0]?.classe?.codigo) || 0,
              nome: process.process_details?.[0]?.classe?.nome || process.title || "Not specified"
            },
            orgaoJulgador: {
              codigo: Number(process.process_details?.[0]?.orgao_julgador?.codigo) || 0,
              nome: process.process_details?.[0]?.orgao_julgador?.nome || "Not specified"
            },
            dataAjuizamento: process.process_details?.[0]?.data_ajuizamento || process.created_at,
            grau: process.process_details?.[0]?.grau || "First",
            nivelSigilo: process.process_details?.[0]?.nivel_sigilo || 0,
            assuntos: process.process_details?.[0]?.assuntos || [],
            arquivamento: {
              motivo: process.archive_reason || "Não especificado",
              data: process.archived_at || process.updated_at
            }
          }
        })) as Process[];

        setProcesses(prev => pageNumber === 1 ? formattedProcesses : [...prev, ...formattedProcesses]);
        setHasMore(count ? start + ITEMS_PER_PAGE < count : false);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error('Error fetching archived processes:', error);
      toast.error('Erro ao carregar processos arquivados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('processes')
        .update({ 
          is_archived: false,
          status: 'Em andamento',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setProcesses(prev => prev.filter(p => p.id !== id));
      toast.success("Processo desarquivado com sucesso");
    } catch (error) {
      console.error("Error unarchiving process:", error);
      toast.error("Erro ao desarquivar processo");
    }
  };

  const showArchiveReason = (id: string) => {
    const process = processes.find(p => p.id === id);
    if (process) {
      setSelectedProcessId(id);
      setArchiveReason(process.metadata?.arquivamento?.motivo || "Não especificado");
      setShowArchiveReasonDialog(true);
    }
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
  };

  const toggleProcessSelection = (id: string) => {
    if (selectedProcesses.includes(id)) {
      setSelectedProcesses(prev => prev.filter(i => i !== id));
    } else {
      setSelectedProcesses(prev => [...prev, id]);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  // Filter processes based on search term and filters
  const filteredProcesses = processes.filter(process => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = process.number.toLowerCase().includes(searchLower) ||
                         process.metadata?.classe?.nome?.toLowerCase().includes(searchLower);

    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className="px-2 py-1">
            Total: {filteredProcesses.length} processos arquivados
          </Badge>

          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filtrar por</h4>
                  <p className="text-sm text-muted-foreground">
                    Selecione os critérios de filtro
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label htmlFor="date">Data</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger id="date">
                        <SelectValue placeholder="Selecione um período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar filtros
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar processo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredProcesses.map((process) => (
          <div key={process.id} className="space-y-1">
            <Card className="overflow-hidden border-gray-200 shadow-sm h-auto">
              <CardHeader className="bg-gray-50 p-2 h-auto">
                <div className="flex flex-col sm:flex-row flex-wrap items-start gap-3 justify-between w-full">
                  <div className="flex flex-col sm:flex-row items-start gap-3 w-full sm:w-auto flex-grow">
                    <Checkbox 
                      checked={selectedProcesses.includes(process.id)} 
                      onCheckedChange={() => toggleProcessSelection(process.id)} 
                      className="mt-1" 
                    />
                    <div>
                      <CardTitle className="text-lg font-medium text-gray-900 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-base text-gray-600">
                            {formatProcessNumber(process.number)}
                          </span>
                        </div>
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-1 mb-1">
                        {process.movimentacoes && process.movimentacoes.length > 0 && (
                          <Badge variant="secondary" className="h-6 px-2 bg-[#fec30b] text-black hover:bg-[#fec30b]/90">
                            {process.movimentacoes.length} {process.movimentacoes.length === 1 ? 'evento' : 'eventos'}
                          </Badge>
                        )}
                        {process.hits && process.hits.length > 0 && (
                          <Badge variant="secondary" className="h-6 px-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
                            {process.hits.length} {process.hits.length === 1 ? 'movimentação processual' : 'movimentações processuais'}
                          </Badge>
                        )}
                        {process.hits && process.hits.length > 0 && process.hits.map((hit: {classe?: {nome: string}}, index: number) => {
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
                      <div className="flex flex-wrap items-baseline gap-1 mb-1">
                        {process.metadata?.assuntos && Array.isArray(process.metadata.assuntos) && process.metadata.assuntos.length > 0 ? (
                          <>
                            <Badge variant="outline" className="h-6 px-2 bg-[#2e3092] text-white hover:bg-[#2e3092]/90">
                              {process.metadata.assuntos.length} {process.metadata.assuntos.length === 1 ? 'assunto' : 'assuntos'}
                            </Badge>
                            {process.metadata.assuntos.map((assunto: Assunto, index: number) => {
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
                                  {assunto.codigo && <span className="ml-1 opacity90">({assunto.codigo})</span>}
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
                            Data Ajuizamento: {format(new Date(process.metadata?.dataAjuizamento || process.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </Badge>
                          <Badge variant="outline" className="h-6 px-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
                            Tribunal: {process.court || "Não informado"}
                          </Badge>
                          <Badge variant="outline" className="h-6 px-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300">
                            Grau: {process.metadata?.grau || "G1"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 mt-1 sm:mt-0">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Criado em:</span>
                            <span className="font-medium text-gray-700">{format(new Date(process.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Última Atualização:</span>
                            <span className="font-medium text-gray-700">
                              {format(new Date(process.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-2 sm:mt-0 self-end sm:self-auto w-full sm:w-auto justify-end">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleUnarchive(process.id)}
                      className="h-7 px-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                      title="Desarquivar processo"
                    >
                      <ArchiveRestore className="h-4 w-4 mr-1" />
                      Desarquivar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50" title="Imprimir processo">
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-green-500 hover:text-green-700 hover:bg-green-50" title="Visualizar processo">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50" title="Compartilhar processo">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="py-1 px-2 bg-gray-50 border-t border-b divide-y divide-gray-100 overflow-visible h-auto min-h-0">
                <div className="text-sm text-gray-700 pt-1 overflow-visible">
                  <button onClick={() => {
                    setShowOverviewId(showOverviewId === process.id ? null : process.id);
                    setProcessTabStates(prev => ({
                      ...prev,
                      [process.id]: "movimentacoes"
                    }));
                  }} className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                    <ChevronRight className={`h-4 w-4 transition-transform ${showOverviewId === process.id ? "rotate-90" : ""}`} />
                    Detalhes do Processo
                  </button>
                  <div id={`overview-${process.id}`} className={`transition-all duration-200 bg-gray-50 rounded-lg p-2 ${showOverviewId === process.id ? "opacity-100 h-auto mt-1" : "opacity-0 h-0 overflow-hidden"}`}>
                    <div className="space-y-2 overflow-visible">
                      <div className="bg-white rounded-lg p-3 space-y-2 overflow-visible">
                        <div className="md:hidden space-y-2 mb-4">
                          {[
                            { 
                              value: "movimentacoes", 
                              icon: <ListAltIcon className="h-4 w-4" />, 
                              label: "Movimentações", 
                              bgColor: "bg-[rgb(254,195,11)]",
                              textColor: "text-black"
                            },
                            { 
                              value: "partes", 
                              icon: <PeopleIcon className="h-4 w-4" />, 
                              label: "Partes",
                              bgColor: "bg-purple-100",
                              textColor: "text-purple-800"
                            },
                            { 
                              value: "documentos", 
                              icon: <ArticleIcon className="h-4 w-4" />, 
                              label: "Documentos",
                              bgColor: "bg-green-100",
                              textColor: "text-green-800"
                            },
                            { 
                              value: "timeline", 
                              icon: <TimelineIcon className="h-4 w-4" />, 
                              label: "Timeline",
                              bgColor: "bg-blue-100",
                              textColor: "text-blue-800"
                            }
                          ].map((tab) => (
                            <button
                              key={tab.value}
                              onClick={() => setProcessTabStates(prev => ({ ...prev, [process.id]: tab.value }))}
                              className={cn(
                                "flex items-center gap-2 w-full p-2 rounded-lg transition-colors",
                                processTabStates[process.id] === tab.value ? `${tab.bgColor} ${tab.textColor}` : "hover:bg-gray-100"
                              )}
                            >
                              {tab.icon}
                              {tab.label}
                            </button>
                          ))}
                        </div>
                        <div className="hidden md:block">
                          <ShadcnTabs
                            defaultValue="eventos"
                            value={processTabStates[process.id] || "eventos"}
                            onValueChange={(value) => setProcessTabStates(prev => ({ ...prev, [process.id]: value }))}
                          >
                            <TabsList className="w-full">
                              <TabsTrigger value="eventos" className="flex items-center gap-2">
                                <ListAltIcon className="h-4 w-4" />
                                Eventos
                              </TabsTrigger>
                              <TabsTrigger value="partes" className="flex items-center gap-2">
                                <PeopleIcon className="h-4 w-4" />
                                Partes
                              </TabsTrigger>
                              <TabsTrigger value="documentos" className="flex items-center gap-2">
                                <ArticleIcon className="h-4 w-4" />
                                Documentos
                              </TabsTrigger>
                              <TabsTrigger value="timeline" className="flex items-center gap-2">
                                <TimelineIcon className="h-4 w-4" />
                                Timeline
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="eventos" className="mt-4">
                              {processTabStates[process.id] === "eventos" && (
                                <>
                                  <ProcessHitsNavigation 
                                    processId={process.id}
                                    hits={process.hits || []}
                                    currentHitIndex={selectedHitIndex[process.id] ?? 0}
                                    onHitSelect={(index) => setSelectedHitIndex(prev => ({ ...prev, [process.id]: index }))}
                                  />
                                  <ProcessMovements
                                    processId={process.id}
                                    hitId={process.hits?.[selectedHitIndex[process.id] ?? 0]?.id}
                                    filter={{ ascending: false }}
                                  />
                                </>
                              )}
                            </TabsContent>

                            <TabsContent value="partes" className="mt-4">
                              {processTabStates[process.id] === "partes" && (
                                <ProcessParties processId={process.id} />
                              )}
                            </TabsContent>

                            <TabsContent value="documentos" className="mt-4">
                              {processTabStates[process.id] === "documentos" && (
                                <ProcessDocuments processId={process.id} />
                              )}
                            </TabsContent>

                            <TabsContent value="timeline" className="mt-4">
                              {processTabStates[process.id] === "timeline" && (
                                <ProcessTimeline 
                                  processId={process.id}
                                  hits={process.hits || []}
                                />
                              )}
                            </TabsContent>
                          </ShadcnTabs>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Dialog open={showArchiveReasonDialog} onOpenChange={setShowArchiveReasonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Motivo do Arquivamento</DialogTitle>
            <DialogDescription>
              {archiveReason}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowArchiveReasonDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
