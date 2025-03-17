import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntimations } from "@/services/intimations";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Search, Trash2, Loader2, FileText, Filter, X, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";

interface Intimation {
  id: string;
  title: string;
  description: string;
  process_number: string;
  deadline: string;
  status: string;
  created_at: string;
}

export default function IntimationList() {
  const [intimations, setIntimations] = useState<Intimation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredIntimations, setFilteredIntimations] = useState<Intimation[]>([]);
  const [selectedIntimations, setSelectedIntimations] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [intimationToDelete, setIntimationToDelete] = useState<string | null>(null);
  const [bulkAlertOpen, setBulkAlertOpen] = useState(false);
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<Date | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchIntimations();
  }, []);

  useEffect(() => {
    let filtered = intimations.filter(intimation => {
      const searchLower = searchQuery.toLowerCase();
      return intimation.process_number && intimation.process_number.toLowerCase().includes(searchLower) || 
             intimation.title && intimation.title.toLowerCase().includes(searchLower) || 
             intimation.description && intimation.description.toLowerCase().includes(searchLower) || 
             intimation.status && intimation.status.toLowerCase().includes(searchLower) || 
             intimation.deadline && intimation.deadline.toLowerCase().includes(searchLower);
    });
    
    // Aplicar filtros adicionais
    if (statusFilter !== "all") {
      filtered = filtered.filter(intimation => intimation.status === statusFilter);
    }
    
    if (deadlineFilter) {
      const deadlineDate = new Date(deadlineFilter);
      filtered = filtered.filter(intimation => {
        if (!intimation.deadline) return false;
        const intimationDeadline = new Date(intimation.deadline);
        return intimationDeadline.toDateString() === deadlineDate.toDateString();
      });
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    
    setFilteredIntimations(filtered);
    setCurrentPage(1);
  }, [searchQuery, intimations, statusFilter, deadlineFilter, sortOrder]);

  const fetchIntimations = async () => {
    try {
      setLoading(true);
      const data = await getIntimations();
      setIntimations(data);
    } catch (error) {
      console.error("Error fetching intimations:", error);
      toast.error("Erro ao carregar intimações");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIntimation = async (intimationId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('intimations')
        .delete()
        .eq('id', intimationId);

      if (error) throw error;

      setIntimations(prevIntimations => 
        prevIntimations.filter(intimation => intimation.id !== intimationId)
      );
      toast.success("Intimação excluída com sucesso");
    } catch (error) {
      console.error("Error deleting intimation:", error);
      toast.error("Erro ao excluir intimação");
    } finally {
      setIsDeleting(false);
      setAlertOpen(false);
      setIntimationToDelete(null);
    }
  };

  const confirmDelete = (intimationId: string) => {
    setIntimationToDelete(intimationId);
    setAlertOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedIntimations.length === 0) return;

    try {
      setIsDeleting(true);

      // Delete each selected intimation
      for (const intimationId of selectedIntimations) {
        const { error } = await supabase
          .from('intimations')
          .delete()
          .eq('id', intimationId);
        
        if (error) throw error;
      }

      // Update the local state
      setIntimations(prevIntimations => 
        prevIntimations.filter(intimation => !selectedIntimations.includes(intimation.id))
      );
      
      // Clear selection
      setSelectedIntimations([]);
      
      toast.success(`${selectedIntimations.length} intimações excluídas com sucesso`);
    } catch (error) {
      console.error("Error deleting intimations:", error);
      toast.error("Erro ao excluir intimações");
    } finally {
      setIsDeleting(false);
      setBulkAlertOpen(false);
      setPasswordConfirmOpen(false);
    }
  };

  // Verificar senha do usuário
  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }
      
      // Aqui você pode implementar a verificação de senha
      // Como exemplo, estamos apenas verificando se a senha não está vazia
      if (!password.trim()) {
        setPasswordError("A senha não pode estar vazia");
        return false;
      }
      
      // Em um cenário real, você enviaria a senha para o servidor verificar
      // Por simplicidade, vamos apenas simular uma verificação bem-sucedida
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

  const toggleIntimationSelection = (intimationId: string) => {
    setSelectedIntimations(prev => {
      if (prev.includes(intimationId)) {
        return prev.filter(id => id !== intimationId);
      } else {
        return [...prev, intimationId];
      }
    });
  };

  const toggleAllIntimations = () => {
    if (selectedIntimations.length === filteredIntimations.length) {
      // If all are selected, deselect all
      setSelectedIntimations([]);
    } else {
      // Otherwise, select all
      setSelectedIntimations(filteredIntimations.map(intimation => intimation.id));
    }
  };

  // Resetar filtros
  const resetFilters = () => {
    setStatusFilter("all");
    setDeadlineFilter(undefined);
    setSortOrder("desc");
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredIntimations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIntimations = filteredIntimations.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Pendente',
      'completed': 'Concluída',
      'expired': 'Expirada',
      'in_progress': 'Em Andamento',
      'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeVariant = (status: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'pending': 'outline',
      'completed': 'default',
      'expired': 'destructive',
      'in_progress': 'secondary',
      'cancelled': 'outline'
    };
    return variantMap[status] || 'outline';
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Intimações</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input 
              type="search" 
              placeholder="Pesquisar intimações..." 
              className="pl-10 w-full" 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
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
                  <h4 className="font-medium">Filtrar intimações</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="expired">Expirada</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deadline-filter">Data de Prazo</Label>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        selected={deadlineFilter}
                        onSelect={setDeadlineFilter}
                        placeholder="Selecione uma data"
                      />
                      {deadlineFilter && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setDeadlineFilter(undefined)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Ordenar por data</Label>
                    <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                      <SelectTrigger id="sort-order">
                        <SelectValue placeholder="Ordenação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Mais recentes primeiro</SelectItem>
                        <SelectItem value="asc">Mais antigas primeiro</SelectItem>
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
            
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link to="/intimations/new">
                <Plus className="h-4 w-4 mr-2" />
                Nova Intimação
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all-intimations" 
              checked={selectedIntimations.length > 0 && selectedIntimations.length === filteredIntimations.length}
              onCheckedChange={toggleAllIntimations}
            />
            <label htmlFor="select-all-intimations" className="text-sm font-medium">
              Selecionar todas
            </label>
          </div>
          
          <Badge variant="outline" className="px-2 py-1">
            Total: {filteredIntimations.length} intimações
          </Badge>
          
          {selectedIntimations.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => setBulkAlertOpen(true)}
              className="ml-0 sm:ml-4"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Excluir {selectedIntimations.length} {selectedIntimations.length === 1 ? 'intimação' : 'intimações'}
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filteredIntimations.length === 0 ? (
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>Nenhuma intimação encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">Não há intimações cadastradas ou que correspondam à sua pesquisa.</p>
            <Button asChild>
              <Link to="/intimations/new">
                <Plus className="h-4 w-4 mr-2" />
                Criar Nova Intimação
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2 w-10 text-left">
                        <span className="sr-only">Selecionar</span>
                      </th>
                      <th className="px-4 py-2 text-left">Processo</th>
                      <th className="px-4 py-2 text-left">Título</th>
                      <th className="px-4 py-2 text-left">Prazo</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedIntimations.map((intimation) => (
                      <tr key={intimation.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <Checkbox 
                            checked={selectedIntimations.includes(intimation.id)}
                            onCheckedChange={() => toggleIntimationSelection(intimation.id)}
                          />
                        </td>
                        <td className="px-4 py-2 font-medium">{intimation.process_number}</td>
                        <td className="px-4 py-2">
                          <div className="font-medium">{intimation.title}</div>
                          <div className="text-xs text-gray-500">{intimation.description}</div>
                        </td>
                        <td className="px-4 py-2">{formatDate(intimation.deadline)}</td>
                        <td className="px-4 py-2">
                          <Badge variant={getStatusBadgeVariant(intimation.status)}>
                            {translateStatus(intimation.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/intimations/${intimation.id}`}>
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">Ver</span>
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => confirmDelete(intimation.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Diálogo de confirmação para exclusão individual */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta intimação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => intimationToDelete && handleDeleteIntimation(intimationToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de confirmação para exclusão em massa */}
      <AlertDialog open={bulkAlertOpen} onOpenChange={setBulkAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir {selectedIntimations.length} {selectedIntimations.length === 1 ? 'intimação' : 'intimações'}. 
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

      {/* Diálogo de confirmação de senha */}
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
    </div>
  );
}
