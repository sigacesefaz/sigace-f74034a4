import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Trash, Edit, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

interface ProcessDecisionsProps {
  processId: string;
  hitId?: string;
}

interface Decision {
  id: string;
  process_id: string;
  hit_id?: string;
  title: string;
  description: string;
  decision_type: string;
  judge: string;
  decision_date: string;
  created_at: string;
  updated_at: string;
}

export function ProcessDecisions({ processId, hitId }: ProcessDecisionsProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [decisionToDelete, setDecisionToDelete] = useState<string | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [decisionType, setDecisionType] = useState("");
  const [judge, setJudge] = useState("");
  const [decisionDate, setDecisionDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchDecisions();
  }, [processId, hitId]);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('process_judicial_decisions')
        .select('*')
        .eq('process_id', processId)
        .order('created_at', { ascending: false });
      
      if (hitId) {
        query = query.eq('hit_id', hitId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setDecisions(data || []);
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
    setDecisionType("");
    setJudge("");
    setDecisionDate(undefined);
    setEditingDecision(null);
  };

  const handleEdit = (decision: Decision) => {
    setEditingDecision(decision);
    setTitle(decision.title);
    setDescription(decision.description);
    setDecisionType(decision.decision_type);
    setJudge(decision.judge);
    setDecisionDate(decision.decision_date ? new Date(decision.decision_date) : undefined);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('process_judicial_decisions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setDecisions(prevDecisions => prevDecisions.filter(decision => decision.id !== id));
      toast.success("Decisão excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir decisão:", error);
      toast.error("Não foi possível excluir a decisão");
    } finally {
      setDecisionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const decisionData = {
        process_id: processId,
        hit_id: hitId,
        title,
        description,
        decision_type: decisionType,
        judge,
        decision_date: decisionDate?.toISOString(),
      };
      
      if (editingDecision) {
        // Update existing decision
        const { error } = await supabase
          .from('process_judicial_decisions')
          .update(decisionData)
          .eq('id', editingDecision.id);
        
        if (error) {
          throw error;
        }
        
        toast.success("Decisão atualizada com sucesso");
      } else {
        // Create new decision
        const { data, error } = await supabase
          .from('process_judicial_decisions')
          .insert(decisionData)
          .select();
        
        if (error) {
          throw error;
        }
        
        toast.success("Decisão adicionada com sucesso");
      }
      
      // Refresh decisions list
      fetchDecisions();
      
      // Reset form and close dialog
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erro ao salvar decisão:", error);
      toast.error("Não foi possível salvar a decisão");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Decisões do Processo</h3>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-1" /> Nova Decisão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDecision ? "Editar Decisão" : "Nova Decisão"}</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da decisão judicial
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decision_type">Tipo de Decisão</Label>
                <Input
                  id="decision_type"
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value)}
                  placeholder="Ex: Sentença, Despacho, etc."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="judge">Juiz</Label>
                <Input
                  id="judge"
                  value={judge}
                  onChange={(e) => setJudge(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decision_date">Data da Decisão</Label>
                <DatePicker
                  selected={decisionDate}
                  onSelect={setDecisionDate}
                  className="w-full"
                  placeholder="Selecione a data da decisão"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Conteúdo da Decisão</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDecision ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {decisions.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>Nenhuma informação encontrada</p>
        </div>
      ) : (
        decisions.map((decision) => (
          <div key={decision.id} className="bg-white rounded-lg p-3 space-y-2 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{decision.title}</h4>
                <div className="flex gap-2 items-center text-sm text-gray-600">
                  <span>Por: {decision.judge}</span>
                  <span>•</span>
                  <span>{formatDate(decision.decision_date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge>{decision.decision_type}</Badge>
                <Button variant="ghost" size="icon" onClick={() => handleEdit(decision)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => {
                    setDecisionToDelete(decision.id);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-md text-gray-700 border border-gray-100 text-sm whitespace-pre-line">
              {decision.description}
            </div>
          </div>
        ))
      )}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Decisão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta decisão? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDecisionToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => decisionToDelete && handleDelete(decisionToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
