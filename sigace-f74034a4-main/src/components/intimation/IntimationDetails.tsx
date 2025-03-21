import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatajudProcess } from "@/types/datajud";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Updated interface to ensure correct types
export interface IntimationDetailsProps {
  process?: DatajudProcess;
  intimation?: Partial<{
    title: string;
    description: string;
    type: string;
    deadline: string;
  }>;
  onConfirm: (formData: any) => Promise<void>;
  onBack: () => void;
}
export function IntimationDetails({
  process,
  intimation,
  onConfirm,
  onBack
}: IntimationDetailsProps) {
  const [title, setTitle] = useState(intimation?.title || process?.classe?.nome || "");
  const [description, setDescription] = useState(intimation?.description || "");
  const [type, setType] = useState(intimation?.type || "notice");
  const [deadline, setDeadline] = useState(intimation?.deadline || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Intimated person fields
  const [intimatedName, setIntimatedName] = useState("");
  const [intimatedDocument, setIntimatedDocument] = useState("");
  const [intimatedAddress, setIntimatedAddress] = useState("");
  const [intimatedPhone, setIntimatedPhone] = useState("");
  const [intimatedEmail, setIntimatedEmail] = useState("");
  const [intimatedRegistration, setIntimatedRegistration] = useState("");
  const [intimatedPersonType, setIntimatedPersonType] = useState("physical");

  // Creator fields
  const [creatorIsIntimated, setCreatorIsIntimated] = useState(false);
  const [creatorName, setCreatorName] = useState("");
  const [creatorDocument, setCreatorDocument] = useState("");
  const [creatorAddress, setCreatorAddress] = useState("");
  const [creatorPhone, setCreatorPhone] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");

  // Intimation method and receipt
  const [intimationMethod, setIntimationMethod] = useState("electronic");
  const [receiptType, setReceiptType] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", {
        locale: ptBR
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = {
        title,
        description,
        type,
        deadline,
        process_id: process?.numeroProcesso ? process.numeroProcesso : null,
        
        // Process data from API
        subject: process?.assuntos && process.assuntos.length > 0 ? process.assuntos[0].nome : null,
        filing_date: process?.dataAjuizamento,
        instance: process?.grau,
        judgment_body: process?.orgaoJulgador?.nome,
        
        // Intimated person data
        intimated_name: intimatedName,
        intimated_document: intimatedDocument,
        intimated_address: intimatedAddress,
        intimated_phone: intimatedPhone,
        intimated_email: intimatedEmail,
        intimated_registration: intimatedRegistration,
        
        // Creator data
        creator_is_intimated: creatorIsIntimated,
        creator_name: creatorIsIntimated ? intimatedName : creatorName,
        creator_document: creatorIsIntimated ? intimatedDocument : creatorDocument,
        creator_address: creatorIsIntimated ? intimatedAddress : creatorAddress,
        creator_phone: creatorIsIntimated ? intimatedPhone : creatorPhone,
        creator_email: creatorIsIntimated ? intimatedEmail : creatorEmail,
        
        // Intimation method and receipt
        intimation_method: intimationMethod,
        receipt_type: receiptType,
        // Note: We'll need to handle file upload separately
      };
      await onConfirm(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Detalhes da Intimação</h3>
        <p className="text-sm text-gray-500">
          Revise e confirme os detalhes da intimação
        </p>
      </div>

      {process && <Card className="mb-4">
          <CardContent className="space-y-2 pt-6">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Número Processo</Label>
                <p className="text-sm font-medium">{process.numeroProcesso}</p>
              </div>
              <div>
                <Label className="text-xs">Tribunal</Label>
                <p className="text-sm font-medium">{process.tribunal || "Não informado"}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs">Classe</Label>
              <p className="text-sm font-medium">{process.classe?.nome || "Não informado"}</p>
            </div>
            <div>
              <Label className="text-xs">Assunto</Label>
              <p className="text-sm font-medium">
                {process.assuntos && process.assuntos.length > 0 ? process.assuntos[0].nome : "Não informado"}
              </p>
            </div>
            <div>
              <Label className="text-xs">Data de Ajuizamento</Label>
              <p className="text-sm font-medium">
                {process.dataAjuizamento ? formatDate(process.dataAjuizamento) : "Não informado"}
              </p>
            </div>
            <div>
              <Label className="text-xs">Grau</Label>
              <p className="text-sm font-medium">
                {process.grau || "Não informado"}
              </p>
            </div>
            <div>
              <Label className="text-xs">Órgão Julgador</Label>
              <p className="text-sm font-medium">
                {process.orgaoJulgador?.nome || "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs defaultValue="intimation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="intimation">Dados da Intimação</TabsTrigger>
            <TabsTrigger value="intimated">Pessoa Intimada</TabsTrigger>
            <TabsTrigger value="creator">Cadastrante</TabsTrigger>
          </TabsList>
          
          <TabsContent value="intimation" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Intimação</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="notice">Notificação</SelectItem>
                  <SelectItem value="citation">Citação</SelectItem>
                  <SelectItem value="subpoena">Intimação</SelectItem>
                  <SelectItem value="sentence">Sentença</SelectItem>
                  <SelectItem value="decision">Decisão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo</Label>
              <Input id="deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intimation_method">Forma de Intimação</Label>
              <Select value={intimationMethod} onValueChange={setIntimationMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de intimação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electronic">Eletrônica</SelectItem>
                  <SelectItem value="postal">Postal</SelectItem>
                  <SelectItem value="officer">Oficial de Justiça</SelectItem>
                  <SelectItem value="other">Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt_type">Comprovante de Recebimento</Label>
              <Select value={receiptType} onValueChange={setReceiptType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de comprovante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reading">Confirmação de Leitura</SelectItem>
                  <SelectItem value="ar">AR</SelectItem>
                  <SelectItem value="personally">Pessoalmente</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt_file">Anexar Comprovante</Label>
              <Input 
                id="receipt_file" 
                type="file" 
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                onChange={e => setReceiptFile(e.target.files ? e.target.files[0] : null)} 
              />
              <p className="text-xs text-gray-500">
                Arquivos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="intimated" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="intimated_person_type">Tipo de Pessoa</Label>
              <Select value={intimatedPersonType} onValueChange={setIntimatedPersonType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de pessoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Pessoa Física</SelectItem>
                  <SelectItem value="legal">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="intimated_name">Nome Completo</Label>
              <Input 
                id="intimated_name" 
                value={intimatedName} 
                onChange={e => setIntimatedName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intimated_document">
                {intimatedPersonType === "physical" ? "CPF" : "CNPJ"}
              </Label>
              <Input 
                id="intimated_document" 
                value={intimatedDocument} 
                onChange={e => setIntimatedDocument(e.target.value)} 
                required 
              />
            </div>
            
            {intimatedPersonType === "physical" && (
              <div className="space-y-2">
                <Label htmlFor="intimated_registration">Matrícula (12 números-2 números)</Label>
                <Input 
                  id="intimated_registration" 
                  value={intimatedRegistration} 
                  onChange={e => setIntimatedRegistration(e.target.value)}
                  placeholder="000000000000-00" 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="intimated_address">Endereço (opcional)</Label>
              <Textarea 
                id="intimated_address" 
                value={intimatedAddress} 
                onChange={e => setIntimatedAddress(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intimated_phone">Telefone (opcional)</Label>
              <Input 
                id="intimated_phone" 
                value={intimatedPhone} 
                onChange={e => setIntimatedPhone(e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intimated_email">E-mail (opcional)</Label>
              <Input 
                id="intimated_email" 
                value={intimatedEmail} 
                onChange={e => setIntimatedEmail(e.target.value)} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="creator" className="space-y-4 pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="creator_is_intimated" 
                checked={creatorIsIntimated} 
                onCheckedChange={(checked) => setCreatorIsIntimated(checked === true)}
              />
              <Label htmlFor="creator_is_intimated">
                O cadastrante é a pessoa intimada
              </Label>
            </div>
            
            {!creatorIsIntimated && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="creator_name">Nome Completo</Label>
                  <Input 
                    id="creator_name" 
                    value={creatorName} 
                    onChange={e => setCreatorName(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creator_document">CPF/CNPJ</Label>
                  <Input 
                    id="creator_document" 
                    value={creatorDocument} 
                    onChange={e => setCreatorDocument(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creator_address">Endereço (opcional)</Label>
                  <Textarea 
                    id="creator_address" 
                    value={creatorAddress} 
                    onChange={e => setCreatorAddress(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creator_phone">Telefone (opcional)</Label>
                  <Input 
                    id="creator_phone" 
                    value={creatorPhone} 
                    onChange={e => setCreatorPhone(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creator_email">E-mail (opcional)</Label>
                  <Input 
                    id="creator_email" 
                    value={creatorEmail} 
                    onChange={e => setCreatorEmail(e.target.value)} 
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Intimação"}
          </Button>
        </div>
      </form>
    </div>;
}
