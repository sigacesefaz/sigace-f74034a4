
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { Process, Movement } from "@/types/process";
import { Pagination } from "@/components/ui/pagination";
import { getProcess, getProcesses } from "@/lib/supabase";
import { useSearchParams } from "react-router-dom";

export default function ProcessList() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchTerm = searchParams.get("search") || "";
  const courtFilter = searchParams.get("court") || "";
  const statusFilter = searchParams.get("status") || "";

  useEffect(() => {
    fetchProcesses();
  }, [searchTerm, courtFilter, statusFilter, currentPage]);

  const fetchProcesses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await getProcesses();
      
      if (error) throw error;

      if (!data) {
        setProcesses([]);
        setTotalPages(1);
        setIsLoading(false);
        return;
      }

      // Process the data to create parent-child relationships
      const processesWithMovements = await Promise.all(
        data.map(async (process) => {
          // Fetch process movements from the database
          const { data: movements } = await supabase
            .from('process_movements')
            .select('*')
            .eq('process_id', process.id)
            .order('data_hora', { ascending: false });
          
          console.log(`Process ${process.id} movements:`, movements);
          
          return {
            ...process,
            movimentacoes: movements || []
          };
        })
      );

      // Apply filters
      let filteredProcesses = processesWithMovements;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filteredProcesses = filteredProcesses.filter(p => 
          p.number?.toLowerCase().includes(search) || 
          p.title?.toLowerCase().includes(search) || 
          p.description?.toLowerCase().includes(search) ||
          p.plaintiff?.toLowerCase().includes(search)
        );
      }
      
      if (courtFilter) {
        filteredProcesses = filteredProcesses.filter(p => 
          p.court?.toLowerCase().includes(courtFilter.toLowerCase())
        );
      }
      
      if (statusFilter) {
        filteredProcesses = filteredProcesses.filter(p => 
          p.status?.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // Group processes by parent-child
      const groupedProcesses = groupProcessesByParent(filteredProcesses);
      
      // Calculate pagination
      const total = Object.keys(groupedProcesses).length;
      setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      
      // Get paginated data
      const paginatedGroups = getPaginatedGroups(groupedProcesses, currentPage, pageSize);
      
      console.log("Grouped processes:", groupedProcesses);
      console.log("Paginated groups:", paginatedGroups);
      
      setProcesses(filteredProcesses);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching processes:", err);
      setError("Erro ao carregar processos. Por favor, tente novamente.");
      setIsLoading(false);
    }
  };

  // Function to group processes by parent-child relationship
  const groupProcessesByParent = (processes: Process[]) => {
    const groups: Record<string, {parent: Process, children: Process[]}> = {};
    
    // First, identify all parent processes
    processes.forEach(process => {
      if (process.is_parent) {
        groups[process.id] = {
          parent: process,
          children: []
        };
      }
    });
    
    // Then, assign children to their parents
    processes.forEach(process => {
      if (!process.is_parent && process.parent_id) {
        // If the parent exists in our groups
        if (groups[process.parent_id]) {
          groups[process.parent_id].children.push(process);
        }
      }
    });
    
    return groups;
  };
  
  // Function to paginate the grouped processes
  const getPaginatedGroups = (groups: Record<string, {parent: Process, children: Process[]}>, page: number, pageSize: number) => {
    const entries = Object.entries(groups);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return entries.slice(start, end);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async (processId: string) => {
    try {
      // Delete related data first
      await supabase.from('process_movements').delete().eq('process_id', processId);
      await supabase.from('process_subjects').delete().eq('process_id', processId);
      await supabase.from('process_details').delete().eq('process_id', processId);
      await supabase.from('process_parties').delete().eq('process_id', processId);
      
      // Then delete the process itself
      const { error } = await supabase.from('processes').delete().eq('id', processId);
      
      if (error) throw error;
      
      toast.success("Processo excluído com sucesso");
      setConfirmDelete(null);
      fetchProcesses();
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Erro ao excluir processo");
      setConfirmDelete(null);
    }
  };

  const viewProcessDetails = async (processId: string) => {
    try {
      const { data: process, error } = await getProcess(processId);
      
      if (error) throw error;
      
      setSelectedProcess(process);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching process details:", error);
      toast.error("Erro ao carregar detalhes do processo");
    }
  };

  const groupedProcesses = groupProcessesByParent(processes);
  const paginatedGroups = getPaginatedGroups(groupedProcesses, currentPage, pageSize);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2e3092]">Processos</h1>
          <p className="text-gray-600">Visualize e gerencie seus processos</p>
        </div>
        <Link to="/processes/new">
          <Button className="bg-[#2e3092]">
            Novo Processo
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2e3092]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4 border border-red-200 rounded-lg">
          {error}
          <Button variant="outline" className="mt-4" onClick={fetchProcesses}>
            Tentar Novamente
          </Button>
        </div>
      ) : processes.length === 0 ? (
        <div className="text-center p-8 border border-gray-200 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">Nenhum processo encontrado</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || courtFilter || statusFilter
              ? "Tente remover os filtros aplicados."
              : "Clique em 'Novo Processo' para adicionar um processo."}
          </p>
          {(searchTerm || courtFilter || statusFilter) && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchParams({});
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedGroups.map(([parentId, group]) => {
            const parentProcess = group.parent;
            if (!parentProcess) return null;
            
            // Add console logging to debug the movements data
            console.log("Process ID:", parentProcess.id);
            console.log("Movements:", parentProcess.movimentacoes);
            
            return (
              <div key={parentId} className="space-y-1">
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="bg-[#2e3092] text-white">
                            {parentProcess.court || "Tribunal"}
                          </Badge>
                          <Badge className={`${
                            parentProcess.status?.toLowerCase() === "active" || parentProcess.status?.toLowerCase() === "em andamento"
                              ? "bg-green-500"
                              : parentProcess.status?.toLowerCase() === "pending" || parentProcess.status?.toLowerCase() === "pendente"
                              ? "bg-yellow-500"
                              : "bg-gray-500"
                          } text-white`}>
                            {parentProcess.status || "Status não definido"}
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-1">{parentProcess.title}</h3>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-2 items-center">
                          <span>Número: {parentProcess.number}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(parentProcess.created_at), "dd/MM/yyyy")}
                          </span>
                        </div>
                        
                        {parentProcess.description && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {parentProcess.description}
                          </p>
                        )}
                        
                        {parentProcess.plaintiff && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Autor:</span> {parentProcess.plaintiff}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewProcessDetails(parentProcess.id)}
                        >
                          Detalhes
                        </Button>
                        <Link to={`/processes/${parentProcess.id}`}>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-[#2e3092]"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <Tabs defaultValue="ultimo" className="mt-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ultimo">Último Movimento</TabsTrigger>
                        <TabsTrigger value="anteriores">Anteriores</TabsTrigger>
                      </TabsList>

                      <TabsContent value="ultimo" className="space-y-2">
                        {parentProcess.movimentacoes && parentProcess.movimentacoes.length > 0 ? (
                          <div className="bg-white rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-medium">
                                  {parentProcess.movimentacoes[0].descricao || parentProcess.movimentacoes[0].nome || "Movimento sem título"}
                                </h4>
                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {parentProcess.movimentacoes[0].data_hora ? (
                                    format(new Date(parentProcess.movimentacoes[0].data_hora), "dd/MM/yyyy HH:mm")
                                  ) : parentProcess.movimentacoes[0].data ? (
                                    format(new Date(parentProcess.movimentacoes[0].data), "dd/MM/yyyy HH:mm")
                                  ) : (
                                    "Data não disponível"
                                  )}
                                </div>
                                {parentProcess.movimentacoes[0].codigo && (
                                  <div className="text-xs bg-gray-100 rounded px-2 py-1 inline-block mt-2">
                                    Código: {parentProcess.movimentacoes[0].codigo}
                                  </div>
                                )}
                              </div>
                            </div>
                            {parentProcess.movimentacoes[0].complemento && (
                              <div className="text-sm text-gray-600 mt-2">
                                {parentProcess.movimentacoes[0].complemento}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-4 text-gray-500">
                            Nenhum movimento registrado
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="anteriores" className="space-y-2">
                        {parentProcess.movimentacoes && parentProcess.movimentacoes.length > 1 ? (
                          parentProcess.movimentacoes.slice(1).map((movimento, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="font-medium">
                                    {movimento.descricao || movimento.nome || "Movimento sem título"}
                                  </h4>
                                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />
                                    {movimento.data_hora ? (
                                      format(new Date(movimento.data_hora), "dd/MM/yyyy HH:mm")
                                    ) : movimento.data ? (
                                      format(new Date(movimento.data), "dd/MM/yyyy HH:mm")
                                    ) : (
                                      "Data não disponível"
                                    )}
                                  </div>
                                  {movimento.codigo && (
                                    <div className="text-xs bg-gray-100 rounded px-2 py-1 inline-block mt-2">
                                      Código: {movimento.codigo}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {movimento.complemento && (
                                <div className="text-sm text-gray-600 mt-2">
                                  {movimento.complemento}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center p-4 text-gray-500">
                            Não há movimentos anteriores
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {group.children.length > 0 && (
                  <div className="ml-6 pl-6 border-l border-gray-200 space-y-4 mt-2">
                    {group.children.map(childProcess => (
                      <Card key={childProcess.id} className="glass-card">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="bg-gray-100">
                                  {childProcess.court || "Tribunal"}
                                </Badge>
                              </div>
                              <h4 className="font-medium">{childProcess.title}</h4>
                              <p className="text-sm text-gray-500">{childProcess.number}</p>
                            </div>
                            <Link to={`/processes/${childProcess.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Processo</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre o processo
            </DialogDescription>
          </DialogHeader>
          
          {selectedProcess && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Número do Processo</h3>
                <p>{selectedProcess.number}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Título</h3>
                <p>{selectedProcess.title}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Tribunal</h3>
                <p>{selectedProcess.court || "Não informado"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Status</h3>
                <p>{selectedProcess.status || "Não informado"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Autor</h3>
                <p>{selectedProcess.plaintiff || "Não informado"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Descrição</h3>
                <p className="text-sm">{selectedProcess.description || "Sem descrição"}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-gray-500">Data de Criação</h3>
                <p>{format(new Date(selectedProcess.created_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDelete(selectedProcess?.id || null)}
              className="text-red-500 hover:text-red-700"
            >
              Excluir
            </Button>
            <Link to={`/processes/${selectedProcess?.id}`}>
              <Button className="bg-[#2e3092]">
                Ver Completo
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá excluir permanentemente o processo e todos os dados relacionados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
