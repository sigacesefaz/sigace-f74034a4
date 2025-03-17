import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Decision } from "@/types/process";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Trash, Edit, Search, X, FileText, Calendar, User, Tag, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface ProcessDecisionsProps {
  processId: string;
  hitId?: string;
}
export function ProcessDecisions({
  processId,
  hitId
}: ProcessDecisionsProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [judge, setJudge] = useState("");
  const [decisionType, setDecisionType] = useState("");
  const [decisionDate, setDecisionDate] = useState<Date>(new Date());
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [decisionToDelete, setDecisionToDelete] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredDecisions, setFilteredDecisions] = useState<Decision[]>([]);
  const itemsPerPage = 5;
  const decisionTypes = [{
    value: "sentença",
    label: "Sentença"
  }, {
    value: "despacho",
    label: "Despacho"
  }, {
    value: "decisão_interlocutória",
    label: "Decisão Interlocutória"
  }, {
    value: "acórdão",
    label: "Acórdão"
  }, {
    value: "liminar",
    label: "Liminar"
  }, {
    value: "tutela_provisória",
    label: "Tutela Provisória"
  }, {
    value: "homologação",
    label: "Homologação"
  }, {
    value: "outro",
    label: "Outro"
  }];
  useEffect(() => {
    fetchDecisions();
  }, [processId, hitId]);
  useEffect(() => {
    if (decisions.length > 0) {
      applyFilters();
    }
  }, [decisions, searchText, currentPage]);
  useEffect(() => {
    if (editingDecision) {
      setTitle(editingDecision.title);
      setDescription(editingDecision.content);
      setJudge(editingDecision.judge || "");
      setDecisionType(editingDecision.decision_type);
      setDecisionDate(new Date(editingDecision.decision_date));
    } else {
      resetForm();
    }
  }, [editingDecision]);
  const fetchDecisions = async () => {
    try {
      setLoading(true);
      const processIdNum = parseInt(processId, 10);
      if (isNaN(processIdNum)) {
        throw new Error("Invalid process ID format");
      }

      // Usar diretamente o supabase client ao invés do customSupabaseQuery
      const {
        data,
        error
      } = await supabase.from('process_judicial_decisions').select('*').eq('process_id', processIdNum);
      if (error) {
        throw error;
      }
      console.log("Fetched decisions:", data);
      setDecisions(data || []);
      setFilteredDecisions(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / itemsPerPage));
    } catch (error) {
      console.error("Erro ao buscar decisões:", error);
      toast.error("Não foi possível carregar as decisões do processo");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setJudge("");
    setDecisionType("");
    setDecisionDate(new Date());
    setEditingDecision(null);
  };
  const applyFilters = () => {
    let filtered = [...decisions];
    if (searchText.trim() !== "") {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(dec => dec.title.toLowerCase().includes(searchLower) || dec.content.toLowerCase().includes(searchLower) || dec.judge && dec.judge.toLowerCase().includes(searchLower));
    }
    setFilteredDecisions(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };
  const handleFilterChange = (filters: {
    text?: string;
  }) => {
    setSearchText(filters.text || "");
    setCurrentPage(1);
  };
  const handleResetFilter = () => {
    setSearchText("");
    setCurrentPage(1);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !decisionType || !decisionDate) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    try {
      setFormLoading(true);
      const processIdNum = parseInt(processId, 10);
      if (isNaN(processIdNum)) {
        throw new Error("Invalid process ID format");
      }
      const decisionData = {
        title: title.trim(),
        content: description.trim(),
        judge: judge.trim() || null,
        decision_type: decisionType,
        decision_date: decisionDate.toISOString(),
        process_id: processIdNum,
        hit_id: hitId || null
      };
      let result;
      if (editingDecision) {
        // Usar diretamente o supabase client para atualização
        const {
          data,
          error
        } = await supabase.from('process_judicial_decisions').update(decisionData).eq('id', editingDecision.id).select().single();
        if (error) {
          console.error("Error updating decision:", error);
          throw error;
        }
        result = data;
        setDecisions(prev => prev.map(dec => dec.id === editingDecision.id ? {
          ...result
        } : dec));
        toast.success("Decisão atualizada com sucesso!");
      } else {
        console.log("Inserting decision with data:", decisionData);
        // Usar diretamente o supabase client para inserção
        const {
          data,
          error
        } = await supabase.from('process_judicial_decisions').insert(decisionData).select().single();
        if (error) {
          console.error("Error inserting decision:", error);
          throw error;
        }
        result = data;
        setDecisions(prev => [...prev, result]);
        toast.success("Decisão adicionada com sucesso!");
      }
      resetForm();
      setIsFormOpen(false);
      fetchDecisions();
    } catch (error) {
      console.error("Erro ao salvar decisão:", error);
      toast.error("Não foi possível salvar a decisão. Por favor, tente novamente.");
    } finally {
      setFormLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!decisionToDelete) return;
    try {
      // Usar diretamente o supabase client para exclusão
      const {
        error
      } = await supabase.from('process_judicial_decisions').delete().eq('id', decisionToDelete);
      if (error) {
        throw error;
      }
      setDecisions(prev => prev.filter(dec => dec.id !== decisionToDelete));
      setFilteredDecisions(prev => prev.filter(dec => dec.id !== decisionToDelete));
      toast.success("Decisão excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir decisão:", error);
      toast.error("Não foi possível excluir a decisão. Por favor, tente novamente.");
    } finally {
      setDecisionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  const getDecisionTypeLabel = (type: string) => {
    const found = decisionTypes.find(t => t.value === type);
    return found ? found.label : type;
  };
  const formatDecisionDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR
      });
    } catch {
      return "Data inválida";
    }
  };
  const paginatedDecisions = filteredDecisions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  if (loading) {
    return <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-2">
        <div className="flex-1">
          {filteredDecisions.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="justify-start" />}
        </div>
        <div className="flex gap-2 items-center">
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => {
              setEditingDecision(null);
              resetForm();
            }}>
                <Plus className="h-4 w-4 mr-1" /> Nova Decisão
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDecision ? "Editar Decisão" : "Nova Decisão"}</DialogTitle>
                <DialogDescription>
                  {editingDecision ? "Edite os detalhes da decisão judicial selecionada." : "Preencha os detalhes da nova decisão judicial."}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Sentença de procedência, Liminar deferida, etc." required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="decisionType">Tipo de Decisão *</Label>
                  <Select value={decisionType} onValueChange={setDecisionType}>
                    <SelectTrigger id="decisionType">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {decisionTypes.map(type => <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="judge">Juiz/Órgão Julgador</Label>
                  <Input id="judge" value={judge} onChange={e => setJudge(e.target.value)} placeholder="Nome do juiz ou órgão julgador" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="decisionDate">Data da Decisão *</Label>
                  <DatePicker selected={decisionDate} onSelect={setDecisionDate} className="w-full" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Conteúdo da Decisão *</Label>
                  <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descreva o conteúdo ou transcreva a parte relevante da decisão" rows={5} required />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {
                  resetForm();
                  setIsFormOpen(false);
                }} disabled={formLoading}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? "Salvando..." : editingDecision ? "Atualizar" : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Collapsible open={showFilter} onOpenChange={setShowFilter}>
        <CollapsibleContent>
          <div className="bg-gray-50 p-3 rounded-md space-y-4 mb-4 border">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="searchText">Pesquisar</Label>
                <Input id="searchText" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Buscar por título, descrição ou juiz..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleResetFilter}>
                <X className="mr-2 h-4 w-4" /> Limpar
              </Button>
              <Button onClick={() => applyFilters()}>
                <Search className="mr-2 h-4 w-4" /> Aplicar
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {filteredDecisions.length === 0 ? <div className="text-center py-4 border rounded-md">
          <FileText className="h-8 w-8 mx-auto text-gray-300" />
          <p className="mt-1 text-gray-500 text-xs">
            Nenhuma decisão encontrada.
          </p>
        </div> : <div className="space-y-2 max-h-[40vh] overflow-auto pb-1">
          {paginatedDecisions.map(decision => <Card key={decision.id} className="p-2 hover:shadow-sm transition-shadow">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-xs">{decision.title}</h4>
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" onClick={() => {
                setSelectedDecision(decision);
                setDetailDialogOpen(true);
              }} title="Visualizar" className="h-6 w-6">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                setEditingDecision(decision);
                setIsFormOpen(true);
              }} title="Editar" className="h-6 w-6">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-6 w-6" onClick={() => {
                setDecisionToDelete(decision.id);
                setDeleteDialogOpen(true);
              }} title="Excluir">
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500">
                  <div className="flex items-center gap-0.5">
                    <Tag className="h-3 w-3" />
                    <span>{getDecisionTypeLabel(decision.decision_type)}</span>
                  </div>
                  {decision.judge && <div className="flex items-center gap-0.5">
                      <User className="h-3 w-3" />
                      <span>{decision.judge}</span>
                    </div>}
                  <div className="flex items-center gap-0.5">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDecisionDate(decision.decision_date)}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-700 line-clamp-1">
                  {decision.content}
                </p>
              </div>
            </Card>)}
        </div>}
      
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedDecision?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>{selectedDecision?.decision_type && getDecisionTypeLabel(selectedDecision.decision_type)}</span>
                </div>
                {selectedDecision?.judge && <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{selectedDecision.judge}</span>
                  </div>}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{selectedDecision?.decision_date && formatDecisionDate(selectedDecision.decision_date)}</span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-md p-4 max-h-[60vh] overflow-y-auto bg-gray-50">
            <p className="whitespace-pre-wrap">{selectedDecision?.content}</p>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Decisão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta decisão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDecisionToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}