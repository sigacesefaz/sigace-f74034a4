
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, Trash, Printer, Share2, RefreshCw, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
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
import { SimpleProcess } from "@/types/datajud";
import { supabase } from "@/lib/supabase";
import { Pagination } from "@/components/ui/pagination";

interface ProcessListProps {
  processes: SimpleProcess[];
  isLoading: boolean;
  onDelete?: (id: string) => Promise<void>;
  onRefresh?: (id: string) => Promise<void>;
}

export function ProcessList({ processes, isLoading, onDelete, onRefresh }: ProcessListProps) {
  const [expandedProcessId, setExpandedProcessId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState("movimentacao");
  const [alertOpen, setAlertOpen] = useState(false);
  const [bulkAlertOpen, setBulkAlertOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProcessId, setLoadingProcessId] = useState<string | null>(null);
  const itemsPerPage = 5;

  // Group processes by parent/child relationship
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
  }, {} as Record<string, { parent: SimpleProcess | null; children: SimpleProcess[] }>);

  // Get paginated groups
  const paginatedGroups = Object.entries(groupedProcesses)
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(Object.keys(groupedProcesses).length / itemsPerPage);

  const handleDelete = async (id: string) => {
    if (onDelete) {
      setLoadingProcessId(id);
      try {
        await onDelete(id);
        // Remove the deleted process from the selected processes list
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
        // Create a copy of the selected processes array to avoid modification during iteration
        const processesToDelete = [...selectedProcesses];
        
        for (const id of processesToDelete) {
          await onDelete(id);
        }
        
        toast.success(`${processesToDelete.length} processos excluídos com sucesso!`);
        setSelectedProcesses([]); // Clear selection after successful deletion
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

  const handlePrint = (process: SimpleProcess) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Seu navegador bloqueou a janela de impressão");
      return;
    }

    // Format process data for printing
    const formatProcessNumber = (number: string) => {
      if (!number) return "";
      const numericOnly = number.replace(/\D/g, '');
      if (numericOnly.length !== 20) return number;
      return `${numericOnly.slice(0, 7)}-${numericOnly.slice(7, 9)}.${numericOnly.slice(9, 13)}.${numericOnly.slice(13, 14)}.${numericOnly.slice(14, 16)}.${numericOnly.slice(16)}`;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Processo ${process.number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { font-size: 18px; }
          h2 { font-size: 16px; }
          .section { margin-bottom: 20px; }
          .data { margin-bottom: 10px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Detalhes do Processo</h1>
        <div class="section">
          <div class="data"><span class="label">Número:</span> ${formatProcessNumber(process.number)}</div>
          <div class="data"><span class="label">Título:</span> ${process.title || "Não informado"}</div>
          <div class="data"><span class="label">Tribunal:</span> ${process.court || "Não informado"}</div>
          <div class="data"><span class="label">Status:</span> ${process.status || "Não informado"}</div>
          <div class="data"><span class="label">Data de criação:</span> ${
            process.created_at ? format(new Date(process.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : "Não informado"
          }</div>
        </div>
        <h2>Descrição</h2>
        <div class="section">
          ${process.description || "Sem descrição disponível"}
        </div>
        <div class="footer" style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          Impresso em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Give time for resources to load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleShare = async (process: SimpleProcess) => {
    const formatProcessNumber = (number: string) => {
      if (!number) return "";
      const numericOnly = number.replace(/\D/g, '');
      if (numericOnly.length !== 20) return number;
      return `${numericOnly.slice(0, 7)}-${numericOnly.slice(7, 9)}.${numericOnly.slice(9, 13)}.${numericOnly.slice(13, 14)}.${numericOnly.slice(14, 16)}.${numericOnly.slice(16)}`;
    };

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
    if (!dateString) return "Não informado";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatProcessNumber = (number: string) => {
    if (!number) return "";
    const numericOnly = number.replace(/\D/g, '');
    if (numericOnly.length !== 20) return number;
    return `${numericOnly.slice(0, 7)}-${numericOnly.slice(7, 9)}.${numericOnly.slice(9, 13)}.${numericOnly.slice(13, 14)}.${numericOnly.slice(14, 16)}.${numericOnly.slice(16)}`;
  };

  const toggleProcessSelection = (id: string) => {
    setSelectedProcesses(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleAllProcesses = () => {
    // If all are selected, deselect all. Otherwise, select all parents
    const allParentIds = Object.keys(groupedProcesses);
    
    if (selectedProcesses.length === allParentIds.length && allParentIds.length > 0) {
      setSelectedProcesses([]);
    } else {
      setSelectedProcesses(allParentIds);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="bg-gray-100 h-20"></CardHeader>
            <CardContent className="py-4">
              <div className="h-32 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <Card className="text-center py-10">
        <CardContent>
          <p className="text-gray-500">Nenhum processo encontrado</p>
          <Link to="/processes/new">
            <Button className="mt-4">Cadastrar Novo Processo</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {processes.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
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
        
        const isExpanded = expandedProcessId === parentProcess.id;
        
        return (
          <div key={parentId} className="space-y-2">
            <Card className="overflow-hidden border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 p-4 pb-0">
                <div className="flex flex-wrap items-start gap-2 justify-between">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={selectedProcesses.includes(parentProcess.id)} 
                      onCheckedChange={() => toggleProcessSelection(parentProcess.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold">
                        <Link to={`/processes/${parentProcess.id}`} className="hover:underline">
                          {parentProcess.title || `Processo ${formatProcessNumber(parentProcess.number)}`}
                        </Link>
                      </CardTitle>
                      <div className="text-sm text-gray-500 font-mono">
                        {formatProcessNumber(parentProcess.number)}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
                        <Badge variant="outline">{parentProcess.court || "Tribunal não informado"}</Badge>
                        <Badge variant={parentProcess.status === "Em andamento" ? "secondary" : "outline"}>
                          {parentProcess.status || "Status não informado"}
                        </Badge>
                        <span>Criado em: {formatDate(parentProcess.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRefresh?.(parentProcess.id)}
                      disabled={loadingProcessId === parentProcess.id || !onRefresh}
                      className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span className="sr-only">Atualizar</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handlePrint(parentProcess)}
                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    >
                      <Printer className="h-4 w-4" />
                      <span className="sr-only">Imprimir</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                      className="h-8 w-8 text-green-500 hover:text-green-700 hover:bg-green-50"
                    >
                      <Link to={`/processes/${parentProcess.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Visualizar</span>
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleShare(parentProcess)}
                      className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Compartilhar</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setProcessToDelete(parentProcess.id);
                        setAlertOpen(true);
                      }}
                      disabled={loadingProcessId === parentProcess.id || !onDelete}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Excluir</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="movimentacao" value={currentTab} onValueChange={setCurrentTab} className="w-full">
                  <TabsList className="w-full rounded-none justify-start border-b bg-transparent h-10 px-4">
                    <TabsTrigger value="movimentacao" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Movimentação
                    </TabsTrigger>
                    <TabsTrigger value="intimacao" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Intimação
                    </TabsTrigger>
                    <TabsTrigger value="documentos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Documentos
                    </TabsTrigger>
                    <TabsTrigger value="decisao" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Decisão
                    </TabsTrigger>
                    <TabsTrigger value="partes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                      Partes
                    </TabsTrigger>
                  </TabsList>
                  <div className="p-4">
                    <TabsContent value="movimentacao">
                      <div className="text-sm text-gray-600">
                        <div className="space-y-2">
                          {group.children.length > 0 && (
                            <div className="mb-4">
                              <h3 className="text-sm font-medium mb-2">Hits Relacionados:</h3>
                              <div className="space-y-2">
                                {group.children
                                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                  .map((childProcess) => (
                                  <div key={childProcess.id} className="p-2 border rounded-md flex justify-between items-center">
                                    <div>
                                      <div className="font-medium text-sm">{childProcess.title || `Subprocesso ${formatProcessNumber(childProcess.number)}`}</div>
                                      <div className="text-xs text-gray-500">{formatDate(childProcess.created_at)}</div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      asChild
                                      className="h-7 text-xs text-green-500 hover:text-green-700 hover:bg-green-50"
                                    >
                                      <Link to={`/processes/${childProcess.id}`}>
                                        <Eye className="h-3 w-3 mr-1" />
                                        Visualizar
                                      </Link>
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <p>{parentProcess.description || "Sem descrição disponível."}</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="intimacao">
                      <p className="text-sm text-gray-500">Nenhuma intimação registrada para este processo.</p>
                    </TabsContent>
                    <TabsContent value="documentos">
                      <p className="text-sm text-gray-500">Nenhum documento disponível para este processo.</p>
                    </TabsContent>
                    <TabsContent value="decisao">
                      <p className="text-sm text-gray-500">Nenhuma decisão registrada para este processo.</p>
                    </TabsContent>
                    <TabsContent value="partes">
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium">Autor/Requerente:</div>
                          <span className="text-sm">{parentProcess.plaintiff || "Não informado"}</span>
                          {parentProcess.plaintiff_document && (
                            <span className="text-xs text-gray-500">{parentProcess.plaintiff_document}</span>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
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
          className="mt-4"
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
    </div>
  );
}
