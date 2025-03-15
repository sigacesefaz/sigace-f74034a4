
import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Users, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PartyType, PartyPersonType } from "@/types/process";
import { getPartiesByProcessId, createParty, updateParty, deleteParty } from "@/services/process-parties";

interface ProcessPartiesProps {
  processId: string;
}

export function ProcessParties({ processId }: ProcessPartiesProps) {
  const [parties, setParties] = useState<PartyType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<PartyType, "id"> & { id?: string }>({
    name: "",
    type: "AUTHOR",
    subtype: "",
    document: "",
    personType: "physical"
  });

  useEffect(() => {
    if (processId) {
      loadParties();
    }
  }, [processId]);

  const loadParties = async () => {
    try {
      setIsLoading(true);
      const data = await getPartiesByProcessId(processId);
      setParties(data);
    } catch (error) {
      console.error("Error loading parties:", error);
      toast.error("Não foi possível carregar as partes do processo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "AUTHOR",
      subtype: "",
      document: "",
      personType: "physical"
    });
    setEditMode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (editMode) {
        await updateParty(editMode, formData);
        toast.success("A parte foi atualizada com sucesso.");
      } else {
        await createParty({
          ...formData,
          process_id: processId
        });
        toast.success("A parte foi adicionada com sucesso.");
      }
      
      await loadParties();
      resetForm();
    } catch (error) {
      console.error("Error saving party:", error);
      toast.error("Não foi possível salvar a parte do processo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (party: PartyType) => {
    setFormData({
      name: party.name,
      type: party.type,
      subtype: party.subtype,
      document: party.document,
      personType: party.personType
    });
    setEditMode(party.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta parte?")) {
      try {
        setIsLoading(true);
        await deleteParty(id);
        await loadParties();
        toast.success("A parte foi excluída com sucesso.");
      } catch (error) {
        console.error("Error deleting party:", error);
        toast.error("Não foi possível excluir a parte do processo.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPartyTypeLabel = (type: string) => {
    switch (type) {
      case "AUTHOR": return "Autor";
      case "DEFENDANT": return "Réu";
      case "MP": return "Ministério Público";
      default: return type;
    }
  };

  const getPersonTypeLabel = (type: PartyPersonType) => {
    return type === "physical" ? "Pessoa Física" : "Pessoa Jurídica";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Partes do Processo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="document">Documento (CPF/CNPJ)</Label>
                <Input
                  id="document"
                  name="document"
                  value={formData.document}
                  onChange={handleInputChange}
                  placeholder="CPF ou CNPJ sem pontuação"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Parte</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de parte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTHOR">Autor</SelectItem>
                    <SelectItem value="DEFENDANT">Réu</SelectItem>
                    <SelectItem value="MP">Ministério Público</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.type === "MP" && (
                <div className="space-y-2">
                  <Label htmlFor="subtype">Subtipo</Label>
                  <Select
                    value={formData.subtype}
                    onValueChange={(value) => handleSelectChange("subtype", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o subtipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MPF">Ministério Público Federal</SelectItem>
                      <SelectItem value="MPE">Ministério Público Estadual</SelectItem>
                      <SelectItem value="MPT">Ministério Público do Trabalho</SelectItem>
                      <SelectItem value="MPM">Ministério Público Militar</SelectItem>
                      <SelectItem value="MPDFT">Ministério Público do DF e Territórios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {formData.type !== "MP" && (
                <div className="space-y-2">
                  <Label htmlFor="personType">Tipo de Pessoa</Label>
                  <Select
                    value={formData.personType}
                    onValueChange={(value) => handleSelectChange("personType", value as PartyPersonType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Pessoa Física</SelectItem>
                      <SelectItem value="legal">Pessoa Jurídica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              {editMode && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {editMode ? "Atualizar Parte" : "Adicionar Parte"}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 space-y-4">
            <h3 className="text-md font-medium">Partes cadastradas</h3>
            
            {isLoading && parties.length === 0 ? (
              <div className="text-center py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Carregando partes...</p>
              </div>
            ) : parties.length === 0 ? (
              <div className="text-center py-4 border rounded-md bg-gray-50">
                <p className="text-sm text-gray-500">Nenhuma parte cadastrada</p>
              </div>
            ) : (
              <div className="space-y-2">
                {parties.map((party) => (
                  <div 
                    key={party.id} 
                    className="p-3 border rounded-md flex justify-between items-center hover:bg-gray-50"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{party.name}</h4>
                        <div className="text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium mr-2">
                            {getPartyTypeLabel(party.type)}
                          </span>
                          {party.type === "MP" ? (
                            party.subtype && <span>{party.subtype}</span>
                          ) : (
                            <span>{getPersonTypeLabel(party.personType)}</span>
                          )}
                          {party.document && (
                            <span className="ml-2">• {party.document}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(party)}
                        className="h-8 px-2 text-blue-600"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(party.id)}
                        className="h-8 px-2 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProcessParties;
