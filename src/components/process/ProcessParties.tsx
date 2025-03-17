import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash, Edit, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPartiesByProcessId, createParty, updateParty, deleteParty } from "@/services/process-parties";
import { PartyType, PartyPersonType } from "@/types/process";
import { MaskedInput } from "@/components/ui/input-mask";
import { formatCPF, formatCNPJ } from "@/utils/masks";

interface ProcessPartiesProps {
  processId: string;
}
export function ProcessParties({
  processId
}: ProcessPartiesProps) {
  const [parties, setParties] = useState<PartyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParty, setEditingParty] = useState<PartyType | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [filteredParties, setFilteredParties] = useState<PartyType[]>([]);

  // Form states
  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [type, setType] = useState<"autor" | "réu" | "terceiro" | "advogado" | "assistente" | "perito">("autor");
  const [subtype, setSubtype] = useState("");
  const [personType, setPersonType] = useState<PartyPersonType>("physical");
  useEffect(() => {
    fetchParties();
  }, [processId]);
  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredParties(parties);
    } else {
      const lowercaseSearch = searchText.toLowerCase();
      setFilteredParties(parties.filter(party => party.name.toLowerCase().includes(lowercaseSearch) || party.document?.toLowerCase().includes(lowercaseSearch) || false));
    }
  }, [searchText, parties]);
  const fetchParties = async () => {
    try {
      setLoading(true);
      const data = await getPartiesByProcessId(processId);
      setParties(data);
      setFilteredParties(data);
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
    setType("autor");
    setSubtype("");
    setPersonType("physical");
    setEditingParty(null);
  };
  const handleEdit = (party: PartyType) => {
    setEditingParty(party);
    setName(party.name);
    setDocument(party.document || "");
    setType(party.type as "autor" | "réu" | "terceiro" | "advogado" | "assistente" | "perito");
    setSubtype(party.subtype || "");
    setPersonType(party.personType || "physical");
    setIsFormOpen(true);
  };
  const handleDelete = async (id: string) => {
    try {
      await deleteParty(id);
      setParties(prevParties => prevParties.filter(party => party.id !== id));
      setFilteredParties(prevParties => prevParties.filter(party => party.id !== id));
      toast.success("Parte excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir parte:", error);
      toast.error("Não foi possível excluir a parte");
    } finally {
      setPartyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!name || !type) {
        toast.error("Nome e tipo são obrigatórios");
        return;
      }
      if (editingParty) {
        // Update existing party
        const updatedParty = await updateParty(editingParty.id, {
          name,
          document,
          type,
          subtype,
          personType
        });
        setParties(prevParties => prevParties.map(party => party.id === editingParty.id ? updatedParty : party));
        setFilteredParties(prevParties => prevParties.map(party => party.id === editingParty.id ? updatedParty : party));
        toast.success("Parte atualizada com sucesso");
      } else {
        // Create new party
        const newParty = await createParty({
          process_id: processId,
          name,
          document,
          type,
          subtype,
          personType
        });
        setParties(prevParties => [...prevParties, newParty]);
        setFilteredParties(prevParties => [...prevParties, newParty]);
        toast.success("Parte adicionada com sucesso");
      }

      // Reset form and close dialog
      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erro ao salvar parte:", error);
      toast.error("Não foi possível salvar a parte");
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>;
  }
  return <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Partes do Processo</h3>
        <div className="flex items-center gap-2">
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-1" /> Nova Parte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingParty ? "Editar Parte" : "Nova Parte"}</DialogTitle>
                <DialogDescription>
                  Preencha os dados da parte do processo
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personType">Tipo de Pessoa</Label>
                  <Select value={personType} onValueChange={(value: PartyPersonType) => setPersonType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Física</SelectItem>
                      <SelectItem value="legal">Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document">Documento</Label>
                  <MaskedInput
                    mask={personType === "physical" ? "cpf" : "cnpj"}
                    value={document || ""}
                    onChange={(value) => setDocument(value)}
                    placeholder={personType === "physical" ? "000.000.000-00" : "00.000.000/0000-00"}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={type} onValueChange={(value: "autor" | "réu" | "terceiro" | "advogado" | "assistente" | "perito") => setType(value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autor">Autor</SelectItem>
                      <SelectItem value="réu">Réu</SelectItem>
                      <SelectItem value="terceiro">Terceiro Interessado</SelectItem>
                      <SelectItem value="advogado">Advogado</SelectItem>
                      <SelectItem value="assistente">Assistente</SelectItem>
                      <SelectItem value="perito">Perito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtype">Subtipo</Label>
                  <Input id="subtype" value={subtype} onChange={e => setSubtype(e.target.value)} placeholder="Ex: Assistente de acusação, etc." />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingParty ? "Atualizar" : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {filteredParties.length === 0 ? <div className="text-center py-2 text-gray-500 text-xs">
          <p>Nenhuma informação encontrada</p>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredParties.map(party => <div key={party.id} className="bg-white rounded-lg p-2 space-y-1 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-1">
                  <User className="h-4 w-4 text-gray-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-xs">{party.name}</h4>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      <Badge variant="outline" className="text-xs h-5 px-1">{party.type}</Badge>
                      {party.subtype && <Badge variant="secondary" className="text-xs h-5 px-1">{party.subtype}</Badge>}
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs h-5 px-1">
                        {party.personType === "physical" ? "Pessoa Física" : "Pessoa Jurídica"}
                      </Badge>
                    </div>
                    {party.document && <p className="text-xs text-gray-500 mt-0.5">
                      Documento: {party.personType === "physical" ? formatCPF(party.document) : formatCNPJ(party.document)}
                    </p>}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(party)} className="h-6 w-6">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 h-6 w-6" onClick={() => {
                    setPartyToDelete(party.id);
                    setDeleteDialogOpen(true);
                  }}>
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>)}
        </div>}
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Parte</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta parte do processo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPartyToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => partyToDelete && handleDelete(partyToDelete)} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}