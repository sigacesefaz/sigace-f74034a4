import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Trash, Printer, Share2, RefreshCw, Check, ChevronDown, ChevronUp, ChevronRight, ChevronLeft } from "lucide-react";
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { Pagination } from "@/components/ui/pagination";
import { ProcessReportDialog } from "@/components/process/ProcessReportDialog";
import { formatProcessNumber } from "@/lib/utils";

interface ProcessListProps {
  processes: Process[];
  isLoading: boolean;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: (id: string) => Promise<void>;
}

export function ProcessList({ processes, isLoading, onDelete, onRefresh }: ProcessListProps) {
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [bulkAlertOpen, setBulkAlertOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProcessId, setLoadingProcessId] = useState<string | null>(null);
  const [showMovementsId, setShowMovementsId] = useState<string | null>(null);
  const [showOverviewId, setShowOverviewId] = useState<string | null>(null);
  const [showTabsId, setShowTabsId] = useState<string | null>(null);
  const [processTabStates, setProcessTabStates] = useState<Record<string, string>>({});
  const [currentMovementIndex, setCurrentMovementIndex] = useState<Record<string, number>>({});
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const itemsPerPage = 5;

  const groupedProcesses = processes.reduce((acc, process) => {
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
  }, {} as Record<string, { parent: Process | null; children: Process[] }>);

  const paginatedGroups = Object.entries(groupedProcesses)
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          text: shareText,
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
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const toggleProcessSelection = (id: string) => {
    setSelectedProcesses(prev => 
      prev.includes(id) ? prev.filter(processId => processId !== id) : [...prev, id]
    );
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
    setProcessTabStates(prev => ({ ...prev, [processId]: value }));
  };

  const handlePreviousMovement = (processId: string) => {
    setCurrentMovementIndex((prev) => {
      const currentIndex = prev[processId] || 0;
      const process = processes.find(p => p.id === processId);
      const maxIndex = (process?.movimentacoes?.length || 1) - 1;
      return {
        ...prev,
        [processId]: currentIndex > 0 ? currentIndex - 1 : maxIndex
      };
    });
    setShowTabsId(processId);
    setProcessTabStates(prev => ({ ...prev, [processId]: "eventos" }));
  };

  const handleNextMovement = (processId: string) => {
    setCurrentMovementIndex((prev) => {
      const currentIndex = prev[processId] || 0;
      const process = processes.find(p => p.id === processId);
      const maxIndex = (process?.movimentacoes?.length || 1) - 1;
      return {
        ...prev,
        [processId]: currentIndex < maxIndex ? currentIndex + 1 : 0
      };
    });
    setShowTabsId(processId);
    setProcessTabStates(prev => ({ ...prev, [processId]: "eventos" }));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="bg-gray-100 h-20"></CardHeader>
            <CardContent className="py-2">
              <div className="h-32 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <Card className="text-center py-6">
        <CardContent>
          <p className="text-gray-500">Nenhum processo encontrado</p>
          <Link to="/processes/new">
            <Button className="mt-2">Cadastrar Novo Processo</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {processes.length > 0 && (
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1">
            <Checkbox 
              id="selectAll" 
              checked={selectedProcesses.length === Object.keys(groupedProcesses).length && Object.keys(groupedProcesses).length > 0}
              onCheckedChange={toggleAllProcesses}
            />
            <label htmlFor="selectAll" className="text-sm font-medium">
              Selecionar todos
            </label>
          </div>
          
          {selectedProcesses.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setBulkAlertOpen(true)}
              className="flex items-center gap-1"
            >
              <Trash className="h-4 w-4" />
              Excluir {selectedProcesses.length} selecionado(s)
            </Button>
          )}
        </div>
      )}

      {paginatedGroups.map(([parentId, group]) => {
        const parentProcess = group.parent;
        if (!parentProcess) return null;
        
        return (
          <div key={parentId} className="space-y-1">
            <Card className="overflow-hidden border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 p-2">
                <div className="flex flex-wrap items-start gap-1 justify-between">
                  <div className="flex items-start gap-1">
                    <Checkbox 
                      checked={selectedProcesses.includes(parentProcess.id)} 
                      onCheckedChange={() => toggleProcessSelection(parentProcess.id)}
                      className="mt-1"
                    />
                    <div>
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {parentProcess.title || `Processo ${formatProcessNumber(parentProcess.number)}`}
                      </CardTitle>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-baseline gap-1">
                          <Badge variant={parentProcess.status === "Em andamento" ? "secondary" : "outline"}>
                            {parentProcess.status || "Não informado"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatProcessNumber(parentProcess.number)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <Badge 
                            variant="default" 
                            className="bg-indigo-500 hover:bg-indigo-600 font-medium whitespace-normal text-xs text-white"
                            title={parentProcess.metadata?.assuntos?.[0]?.nome 
                              ? `${parentProcess.metadata.assuntos[0].nome}${
                                  parentProcess.metadata.assuntos[0].codigo 
                                    ? ` (${parentProcess.metadata.assuntos[0].codigo})`
                                    : ''
                                }`
                              : "Assunto não informado"
                            }
                          >
                            {parentProcess.metadata?.assuntos?.[0]?.nome 
                              ? (
                                <>
                                  {parentProcess.metadata.assuntos[0].nome}
                                  {parentProcess.metadata.assuntos[0].codigo && (
                                    <span className="ml-1 opacity-90">
                                      ({parentProcess.metadata.assuntos[0].codigo})
                                    </span>
                                  )}
                                </>
                              )
                              : "Assunto não informado"
                            }
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
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
                          <div className="flex items-center gap-4">
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
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRefresh?.(parentProcess.id)}
                      disabled={loadingProcessId === parentProcess.id || !onRefresh}
                      className="h-7 px-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePrint(parentProcess)}
                      className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      title="Imprimir processo"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(parentProcess)}
                      className="h-7 px-2 text-green-500 hover:text-green-700 hover:bg-green-50"
                      title="Visualizar processo"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleShare(parentProcess)}
                      className="h-7 px-2 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setProcessToDelete(parentProcess.id);
                        setAlertOpen(true);
                      }}
                      disabled={loadingProcessId === parentProcess.id || !onDelete}
                      className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <div className="h-4 w-px bg-gray-200 mx-1" />
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handlePreviousMovement(parentProcess.id)}
                      disabled={!parentProcess.movimentacoes?.length}
                      className="h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                      title="Movimentação anterior"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleNextMovement(parentProcess.id)}
                      disabled={!parentProcess.movimentacoes?.length}
                      className="h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700 text-white"
                      title="Próxima movimentação"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="py-1 px-2 bg-gray-50 border-t border-b divide-y divide-gray-100">
                <div className="text-sm text-gray-700 pb-1">
                  <button 
                    onClick={() => setShowOverviewId(showOverviewId === parentProcess.id ? null : parentProcess.id)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform ${
                        showOverviewId === parentProcess.id ? "rotate-90" : ""
                      }`}
                    />
                    Dados do Processo
                  </button>
                  <div 
                    id={`overview-${parentProcess.id}`}
                    className={`transition-all duration-200 bg-gray-50 rounded-lg p-2 ${
                      showOverviewId === parentProcess.id
                        ? "opacity-100 max-h-[800px] mt-1"
                        : "opacity-0 max-h-0 overflow-hidden"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="bg-white rounded-lg p-2 space-y-1">
                        <h4 className="font-medium text-sm text-gray-900">Informações Básicas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
                          <p><span className="font-medium text-gray-500">Número do Processo:</span> {parentProcess.number || "Não informado"}</p>
                          <p><span className="font-medium text-gray-500">Classe:</span> {parentProcess.metadata?.classe?.nome || "Não informado"} {parentProcess.metadata?.classe?.codigo ? `(Código: ${parentProcess.metadata.classe.codigo})` : ""}</p>
                          <p><span className="font-medium text-gray-500">Data de Ajuizamento:</span> {formatDate(parentProcess.metadata?.dataAjuizamento)}</p>
                          <p><span className="font-medium text-gray-500">Grau:</span> {parentProcess.metadata?.grau || "G1"}</p>
                          <p><span className="font-medium text-gray-500">Tribunal:</span> {parentProcess.court || "Não informado"}</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-2 space-y-1">
                        <h4 className="font-medium text-sm text-gray-900">Assuntos</h4>
                        <div className="text-sm">
                          {parentProcess.metadata?.assuntos?.map((assunto, index) => (
                            <p key={index} className="text-gray-700">
                              {assunto.nome} <span className="text-gray-500">(Código: {assunto.codigo})</span>
                            </p>
                          )) || <p className="text-gray-500">Não informado</p>}
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-2 space-y-1">
                        <h4 className="font-medium text-sm text-gray-900">Órgão Julgador</h4>
                        <div className="text-sm">
                          <p><span className="font-medium text-gray-500">Nome:</span> {parentProcess.metadata?.orgaoJulgador?.nome || "Não informado"} (Código: {parentProcess.metadata?.orgaoJulgador?.codigo || "Não informado"})</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-2 space-y-1">
                        <h4 className="font-medium text-sm text-gray-900">Sistema</h4>
                        <div className="text-sm">
                          <p><span className="font-medium text-gray-500">Nome:</span> {parentProcess.metadata?.sistema?.nome || "Não informado"}</p>
                          <p><span className="font-medium text-gray-500">Formato:</span> {parentProcess.metadata?.formato || "Eletrônico"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 pt-1">
                  <button 
                    onClick={() => setShowTabsId(showTabsId === parentProcess.id ? null : parentProcess.id)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform ${
                        showTabsId === parentProcess.id ? "rotate-90" : ""
                      }`}
                    />
                    Detalhes do Processo
                  </button>
                  <div 
                    id={`tabs-${parentProcess.id}`}
                    className={`transition-all duration-200 bg-gray-50 rounded-lg p-2 ${
                      showTabsId === parentProcess.id
                        ? "opacity-100 max-h-[2000px] mt-1"
                        : "opacity-0 max-h-0 overflow-hidden"
                    }`}
                  >
                    <Tabs 
                      defaultValue="eventos" 
                      value={processTabStates[parentProcess.id] || "eventos"} 
                      onValueChange={(value) => handleTabChange(parentProcess.id, value)} 
                      className="space-y-1"
                    >
                      <TabsList className="bg-white h-8">
                        <TabsTrigger value="eventos">Eventos</TabsTrigger>
                        <TabsTrigger value="intimacao">Intimação</TabsTrigger>
                        <TabsTrigger value="documentos">Documentos</TabsTrigger>
                        <TabsTrigger value="decisao">Decisão</TabsTrigger>
                        <TabsTrigger value="partes">Partes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="eventos" className="space-y-1">
                        <ProcessMovements 
                          movimentos={parentProcess.movimentacoes || []} 
                          currentIndex={currentMovementIndex[parentProcess.id] || 0}
                        />
                      </TabsContent>

                      <TabsContent value="intimacao">
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-sm text-gray-600">
                            <p>Conteúdo de intimações</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="documentos">
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-sm text-gray-600">
                            <p>Documentos do processo</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="decisao">
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-sm text-gray-600">
                            <p>Decisões do processo</p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="partes">
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-sm text-gray-600">
                            <p>Partes envolvidas no processo</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          className="mt-2"
        />
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
            <AlertDialogAction 
              onClick={() => processToDelete && handleDelete(processToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkAlertOpen} onOpenChange={setBulkAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Processos em Massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedProcesses.length} processo(s)? Esta ação não pode ser desfeita
              e todos os dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBulkAlertOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir {selectedProcesses.length} processo(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo do Relatório */}
      {selectedProcess && (
        <ProcessReportDialog
          process={selectedProcess}
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
        />
      )}
    </div>
  );
}
