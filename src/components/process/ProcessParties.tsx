import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Party, PartyPersonType } from "@/types/process";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash, Edit, User, IdCard, Users } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface ProcessPartiesProps {
  processId: string;
}
export function ProcessParties({
  processId
}: ProcessPartiesProps) {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [type, setType] = useState("");
  const [subtype, setSubtype] = useState("");
  const [personType, setPersonType] = useState<PartyPersonType>("physical");
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const partyTypes = [{
    value: "author",
    label: "Autor(a)"
  }, {
    value: "defendant",
    label: "Réu(ré)"
  }, {
    value: "other",
    label: "Outro"
  }];
  const partySubtypes = [{
    value: "individual",
    label: "Pessoa Física"
  }, {
    value: "company",
    label: "Pessoa Jurídica"
  }, {
    value: "public_entity",
    label: "Entidade Pública"
  }, {
    value: "other",
    label: "Outro"
  }];
  useEffect(() => {
    fetchParties();
  }, [processId]);
  useEffect(() => {
    if (editingParty) {
      setName(editingParty.name || "");
      setDocument(editingParty.document || "");
      setType(editingParty.type || "");
      setSubtype(editingParty.subtype || "");
      setPersonType(editingParty.personType as PartyPersonType || "physical");
    } else {
      resetForm();
    }
  }, [editingParty]);
  const fetchParties = async () => {
    try {
      setLoading(true);
      const {
        data,
        error
      } = await supabase.from('process_parties').select('*').eq('process_id', processId);
      if (error) {
        throw error;
      }
      setParties(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / itemsPerPage));
    } catch (error) {
      console.error("Erro ao buscar partes:", error);
      toast.error("Não foi possível carregar as partes do processo");
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setName("");
    setDocument("");
    setType("");
    setSubtype("");
    setPersonType("physical");
    setEditingParty(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !type) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    try {
      setFormLoading(true);
      const partyData = {
        name: name.trim(),
        document: document.trim() || null,
        type: type,
        subtype: subtype || null,
        personType: personType,
        process_id: processId
      };
      if (editingParty) {
        const {
          data,
          error
        } = await supabase.from('process_parties').update(partyData).eq('id', editingParty.id).select().single();
        if (error) {
          throw error;
        }
        setParties(prev => prev.map(party => party.id === editingParty.id ? {
          ...party,
          ...data
        } : party));
        toast.success("Parte atualizada com sucesso!");
      } else {
        const {
          data,
          error
        } = await supabase.from('process_parties').insert(partyData).select().single();
        if (error) {
          throw error;
        }
        setParties(prev => [...prev, data]);
        toast.success("Parte adicionada com sucesso!");
      }
      resetForm();
      setIsFormOpen(false);
      fetchParties();
    } catch (error) {
      console.error("Erro ao salvar parte:", error);
      toast.error("Não foi possível salvar a parte. Por favor, tente novamente.");
    } finally {
      setFormLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!partyToDelete) return;
    try {
      const {
        error
      } = await supabase.from('process_parties').delete().eq('id', partyToDelete);
      if (error) {
        throw error;
      }
      setParties(prev => prev.filter(party => party.id !== partyToDelete));
      toast.success("Parte excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir parte:", error);
      toast.error("Não foi possível excluir a parte. Por favor, tente novamente.");
    } finally {
      setPartyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  const getPartyTypeLabel = (type: string) => {
    const found = partyTypes.find(t => t.value === type);
    return found ? found.label : type;
  };
  const getPartySubtypeLabel = (subtype: string) => {
    const found = partySubtypes.find(t => t.value === subtype);
    return found ? found.label : subtype;
  };
  const paginatedParties = parties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  if (loading) {
    return <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Partes do Processo</h3>
        <Button size="sm" onClick={() => {
        setEditingParty(null);
        resetForm();
        setIsFormOpen(true);
      }}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar Parte
        </Button>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParty ? "Editar Parte" : "Nova Parte"}</DialogTitle>
            <DialogDescription>
              {editingParty ? "Edite os detalhes da parte selecionada." : "Preencha os detalhes da nova parte."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nome da parte" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document">Documento</Label>
              <Input id="document" value={document} onChange={e => setDocument(e.target.value)} placeholder="CPF ou CNPJ" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {partyTypes.map(type => <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subtype">Subtipo</Label>
              <Select value={subtype} onValueChange={setSubtype}>
                <SelectTrigger id="subtype">
                  <SelectValue placeholder="Selecione o subtipo" />
                </SelectTrigger>
                <SelectContent>
                  {partySubtypes.map(subtype => <SelectItem key={subtype.value} value={subtype.value}>
                      {subtype.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Pessoa</Label>
              <div className="flex items-center space-x-2">
                <Button variant={personType === "physical" ? "default" : "outline"} size="sm" onClick={() => setPersonType(() => 'physical' as PartyPersonType)}>
                  Física
                </Button>
                <Button variant={personType === "legal" ? "default" : "outline"} size="sm" onClick={() => setPersonType(() => 'legal' as PartyPersonType)}>
                  Jurídica
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
              resetForm();
              setIsFormOpen(false);
            }} disabled={formLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Salvando..." : editingParty ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {parties.length === 0 ? <div className="text-center py-8 border rounded-md">
          <Users className="h-12 w-12 mx-auto text-gray-300" />
          <p className="mt-2 text-gray-500">
            Nenhuma parte encontrada. Clique em "Adicionar Parte" para adicionar.
          </p>
        </div> : <div className="space-y-3">
          {paginatedParties.map(party => <Card key={party.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{party.name}</h4>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    {party.document && <div className="flex items-center gap-1">
                        <IdCard className="h-3 w-3" />
                        <span>{party.document}</span>
                      </div>}
                    {party.type && <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{getPartyTypeLabel(party.type)}</span>
                      </div>}
                    {party.subtype && <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{getPartySubtypeLabel(party.subtype)}</span>
                      </div>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => {
              setEditingParty(party);
              setIsFormOpen(true);
            }} title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => {
              setPartyToDelete(party.id);
              setDeleteDialogOpen(true);
            }} title="Excluir">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>)}
        </div>}
      
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Parte</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta parte? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartyToDelete(null)}>
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
