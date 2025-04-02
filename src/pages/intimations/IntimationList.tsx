
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntimations, deleteIntimation as deleteIntimationService } from "@/services/intimations";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Search, Trash2, Loader2, Filter, X, Calendar, Eye, Printer, Share2, RefreshCcw, ChevronDown, FileCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatProcessNumber } from "@/utils/masks";
import { DocumentViewer } from "@/components/ui/document-viewer";

interface Intimation {
  id: string;
  title: string;
  description: string;
  process_number: string;
  deadline: string;
  status: string;
  created_at: string;
  content?: string;
  court?: string;
  court_division?: string;
  intimation_date?: string;
  type?: string;
  created_by?: string;
  intimated_name?: string;
  observations?: string;
  intimation_method?: string;
  receipt_type?: string;
  receipt_file?: string;
  intimated_document?: string;
  intimated_registration?: string;
  intimated_address?: string;
  intimated_phone?: string;
  intimated_email?: string;
  creator_is_intimated?: boolean;
  creator_name?: string;
  creator_document?: string;
  creator_address?: string;
  creator_phone?: string;
  creator_email?: string;
  subject?: string;
  filing_date?: string;
  judgment_body?: string;
  instance?: string;
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
  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});
  const [viewingReceipt, setViewingReceipt] = useState<{ open: boolean, url: string, mimeType: string }>({
    open: false,
    url: '',
    mimeType: 'application/pdf'
  });
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
      console.log("[IntimationListPage.handleDeleteIntimation] Tentando excluir intimação:", intimationId);
      
      const result = await deleteIntimationService(intimationId);
      console.log("[IntimationListPage.handleDeleteIntimation] Exclusão bem-sucedida, resultado:", result);
      
      setIntimations(prevIntimations => 
        prevIntimations.filter(intimation => intimation.id !== intimationId)
      );
      
      setFilteredIntimations(prevFiltered =>
        prevFiltered.filter(intimation => intimation.id !== intimationId)
      );
      
      toast.success("Intimação excluída com sucesso");
    } catch (error) {
      console.error("[IntimationListPage.handleDeleteIntimation] Erro ao excluir intimação:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao excluir intimação");
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
      console.log("[IntimationListPage.handleBulkDelete] Tentando excluir intimações em massa:", selectedIntimations);

      const failedDeletions: string[] = [];
      const successfulDeletions: string[] = [];
      
      for (const intimationId of selectedIntimations) {
        try {
          await deleteIntimationService(intimationId);
          console.log("[IntimationListPage.handleBulkDelete] Intimação excluída com sucesso:", intimationId);
          successfulDeletions.push(intimationId);
        } catch (error) {
          console.error(`[IntimationListPage.handleBulkDelete] Erro ao excluir intimação ${intimationId}:`, error);
          failedDeletions.push(intimationId);
          // Continue tentando excluir as outras intimações mesmo se uma falhar
        }
      }

      setIntimations(prevIntimations => 
        prevIntimations.filter(intimation => !successfulDeletions.includes(intimation.id))
      );
      
      setFilteredIntimations(prevFiltered =>
        prevFiltered.filter(intimation => !successfulDeletions.includes(intimation.id))
      );
      
      setSelectedIntimations([]);
      
      if (failedDeletions.length > 0) {
        if (successfulDeletions.length > 0) {
          toast.warning(`${successfulDeletions.length} intimações excluídas com sucesso. ${failedDeletions.length} intimações não puderam ser excluídas.`);
        } else {
          toast.error(`Nenhuma intimação foi excluída. Verifique os registros para mais detalhes.`);
        }
      } else {
        toast.success(`${successfulDeletions.length} intimações excluídas com sucesso`);
      }
    } catch (error) {
      console.error("[IntimationListPage.handleBulkDelete] Erro ao excluir intimações:", error);
      toast.error("Erro ao excluir intimações");
    } finally {
      setIsDeleting(false);
      setBulkAlertOpen(false);
      setPasswordConfirmOpen(false);
    }
  };

  const verifyPassword = async (password: string): Promise<boolean> => {
    try {
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
      setSelectedIntimations([]);
    } else {
      setSelectedIntimations(filteredIntimations.map(intimation => intimation.id));
    }
  };

  const toggleCollapsible = (intimationId: string) => {
    setOpenCollapsibles(prev => ({
      ...prev,
      [intimationId]: !prev[intimationId]
    }));
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setDeadlineFilter(undefined);
    setSortOrder("desc");
  };

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

  const translateType = (type?: string) => {
    const typeMap: Record<string, string> = {
      'defense': 'Defesa',
      'hearing': 'Audiência',
      'payment': 'Pagamento',
      'document': 'Documento',
      'other': 'Outro',
      'citation': 'Citação',
      'subpoena': 'Intimação',
      'sentence': 'Sentença',
      'decision': 'Decisão'
    };
    return type ? typeMap[type] || type : 'N/A';
  };

  function translateIntimationMethod(method?: string): string {
    const methodMap: Record<string, string> = {
      'electronic': 'Eletrônica',
      'postal': 'Postal',
      'officer': 'Oficial de Justiça',
      'other': 'Outro'
    };
    return method ? methodMap[method] || method : 'N/A';
  }

  function translateReceiptType(type?: string): string {
    const typeMap: Record<string, string> = {
      'reading': 'Confirmação de Leitura',
      'ar': 'AR',
      'personally': 'Pessoalmente',
      'other': 'Outro'
    };
    return type ? typeMap[type] || type : 'N/A';
  }

  const handleViewReceipt = async (receiptFilePath: string) => {
    if (!receiptFilePath) {
      toast.error("Não há comprovante para visualizar");
      return;
    }

    try {
      setViewingReceipt({
        open: true,
        url: '',
        mimeType: 'application/pdf'
      });
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(receiptFilePath, 3600);
      
      if (error) {
        console.error("Erro ao gerar URL para o arquivo:", error);
        toast.error("Não foi possvel acessar o comprovante");
        setViewingReceipt({
          ...viewingReceipt,
          open: false
        });
        return;
      }
      
      let mimeType = 'application/pdf';
      if (receiptFilePath.toLowerCase().endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (receiptFilePath.toLowerCase().match(/\.(jpg|jpeg)$/)) {
        mimeType = 'image/jpeg';
      } else if (receiptFilePath.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      } else if (receiptFilePath.toLowerCase().match(/\.(doc|docx)$/)) {
        mimeType = 'application/msword';
      } 
      
      setViewingReceipt({
        open: true,
        url: data.signedUrl,
        mimeType: mimeType
      });
      
    } catch (error) {
      console.error("Erro ao visualizar comprovante:", error);
      toast.error("Não foi possível visualizar o comprovante");
      setViewingReceipt({
        ...viewingReceipt,
        open: false
      });
    }
  };

  const PaginationComponent = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Próximo
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {viewingReceipt.open && (
        <DocumentViewer
          open={viewingReceipt.open}
          onOpenChange={(open) => setViewingReceipt({ ...viewingReceipt, open })}
          url={viewingReceipt.url}
          mimeType={viewingReceipt.mimeType}
        />
      )}
      
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
            {paginatedIntimations.map((intimation) => (
              <Card key={intimation.id} className="overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Checkbox 
                        className="mt-1"
                        checked={selectedIntimations.includes(intimation.id)}
                        onCheckedChange={() => toggleIntimationSelection(intimation.id)}
                      />
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium mb-1">{intimation.title}</h3>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-gray-500 mb-2">
                          <span>Processo: <span className="font-medium">{formatProcessNumber(intimation.process_number)}</span></span>
                          <span>Prazo: <span className="font-medium">{formatDate(intimation.deadline)}</span></span>
                          <span>Status: <Badge variant={getStatusBadgeVariant(intimation.status)}>{translateStatus(intimation.status)}</Badge></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      <Button variant="ghost" size="icon" title="Atualizar" onClick={() => {/* handle update */}}>
                        <RefreshCcw className="h-4 w-4" />
                        <span className="sr-only">Atualizar</span>
                      </Button>
                      <Button variant="ghost" size="icon" title="Imprimir" onClick={() => {/* handle print */}}>
                        <Printer className="h-4 w-4" />
                        <span className="sr-only">Imprimir</span>
                      </Button>
                      <Button variant="ghost" size="icon" title="Visualizar" asChild>
                        <Link to={`/intimations/${intimation.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Visualizar</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Compartilhar" onClick={() => {/* handle share */}}>
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Compartilhar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Excluir"
                        onClick={() => confirmDelete(intimation.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Collapsible
                    open={openCollapsibles[intimation.id]}
                    onOpenChange={() => toggleCollapsible(intimation.id)}
                    className="border rounded-md"
                  >
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex w-full justify-between p-3 hover:bg-gray-50"
                      >
                        <span className="font-medium">Detalhes da Intimação</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${openCollapsibles[intimation.id] ? 'rotate-180' : ''}`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 border-t bg-gray-50">
                      <Tabs defaultValue="process">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="process">Dados do Processo</TabsTrigger>
                          <TabsTrigger value="general">Dados da Intimação</TabsTrigger>
                          <TabsTrigger value="intimated">Pessoa Intimada</TabsTrigger>
                          <TabsTrigger value="creator">Cadastrante</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="process" className="pt-4 space-y-4">
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <dt className="text-gray-500">Número do Processo:</dt>
                              <dd>{formatProcessNumber(intimation.process_number)}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Tribunal:</dt>
                              <dd>{intimation.court || 'Não informado'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Vara/Seção:</dt>
                              <dd>{intimation.court_division || 'Não informado'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Assunto:</dt>
                              <dd>{intimation.subject || 'Não informado'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Data da Distribuição:</dt>
                              <dd>{intimation.filing_date ? formatDate(intimation.filing_date) : 'Não informado'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Órgão Julgador:</dt>
                              <dd>{intimation.judgment_body || 'Não informado'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Instância:</dt>
                              <dd>{intimation.instance || 'Primeira Instância'}</dd>
                            </div>
                          </dl>
                        </TabsContent>

                        <TabsContent value="general" className="pt-4 space-y-4">
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <dt className="text-gray-500">Tipo:</dt>
                              <dd>{translateType(intimation.type)}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Forma de Intimação:</dt>
                              <dd>{translateIntimationMethod(intimation.intimation_method)}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Data da Intimação:</dt>
                              <dd>{formatDate(intimation.intimation_date || '')}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Prazo:</dt>
                              <dd>{formatDate(intimation.deadline)}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Comprovante de Recebimento:</dt>
                              <dd className="flex items-center gap-2">
                                {intimation.receipt_type ? translateReceiptType(intimation.receipt_type) : 'Não informado'}
                                {intimation.receipt_file && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleViewReceipt(intimation.receipt_file)}
                                    title="Visualizar comprovante"
                                  >
                                    <FileCheck className="h-4 w-4 text-blue-600" />
                                  </Button>
                                )}
                              </dd>
                            </div>
                            <div className="md:col-span-2">
                              <dt className="text-gray-500">Conteúdo:</dt>
                              <dd className="whitespace-pre-line">{intimation.content || 'Não informado'}</dd>
                            </div>
                          </dl>
                        </TabsContent>
                        
                        <TabsContent value="intimated" className="pt-4 space-y-4">
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <dt className="text-gray-500">Nome:</dt>
                              <dd>{intimation.intimated_name || 'Não informado'}</dd>
                            </div>
                            <div>
                              <dt className="text-gray-500">Documento:</dt>
                              <dd>{intimation.intimated_document || 'Não informado'}</dd>
                            </div>
                            {intimation.intimated_registration && (
                              <div>
                                <dt className="text-gray-500">Matrícula:</dt>
                                <dd>{intimation.intimated_registration}</dd>
                              </div>
                            )}
                            {intimation.intimated_address && (
                              <div>
                                <dt className="text-gray-500">Endereço:</dt>
                                <dd>{intimation.intimated_address}</dd>
                              </div>
                            )}
                            {intimation.intimated_phone && (
                              <div>
                                <dt className="text-gray-500">Telefone:</dt>
                                <dd>{intimation.intimated_phone}</dd>
                              </div>
                            )}
                            {intimation.intimated_email && (
                              <div>
                                <dt className="text-gray-500">E-mail:</dt>
                                <dd>{intimation.intimated_email}</dd>
                              </div>
                            )}
                          </dl>
                        </TabsContent>
                        
                        <TabsContent value="creator" className="pt-4 space-y-4">
                          {intimation.creator_is_intimated ? (
                            <p className="text-sm italic">O cadastrante é a mesma pessoa intimada.</p>
                          ) : (
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <dt className="text-gray-500">Nome:</dt>
                                <dd>{intimation.creator_name || 'Não informado'}</dd>
                              </div>
                              <div>
                                <dt className="text-gray-500">Documento:</dt>
                                <dd>{intimation.creator_document || 'Não informado'}</dd>
                              </div>
                              {intimation.creator_address && (
                                <div>
                                  <dt className="text-gray-500">Endereço:</dt>
                                  <dd>{intimation.creator_address}</dd>
                                </div>
                              )}
                              {intimation.creator_phone && (
                                <div>
                                  <dt className="text-gray-500">Telefone:</dt>
                                  <dd>{intimation.creator_phone}</dd>
                                </div>
                              )}
                              {intimation.creator_email && (
                                <div>
                                  <dt className="text-gray-500">E-mail:</dt>
                                  <dd>{intimation.creator_email}</dd>
                                </div>
                              )}
                            </dl>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </Card>
            ))}
          </div>
          
          <PaginationComponent />
        </>
      )}

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Intimação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta intimação?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => intimationToDelete && handleDeleteIntimation(intimationToDelete)} 
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkAlertOpen} onOpenChange={setBulkAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Intimações</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedIntimations.length} intimações selecionadas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
