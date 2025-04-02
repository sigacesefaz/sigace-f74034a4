import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres",
  }),
  type: z.enum(["citation", "subpoena", "sentence", "decision", "defense", "other"]),
  deadline: z.string().nullable().optional(),
  intimation_date: z.string().optional(),
  content: z.string(),
  process_number: z.string().optional(),
  process_id: z.string().optional(),
  court: z.string().optional(),
  court_division: z.string().optional(),
  subject: z.string().optional(),
  filing_date: z.string().optional(),
  instance: z.string().optional(),
  judgment_body: z.string().optional(),
  intimated_name: z.string().min(2, {
    message: "O nome do intimado deve ter pelo menos 2 caracteres",
  }),
  intimated_document: z.string().min(2, {
    message: "O documento do intimado deve ter pelo menos 2 caracteres",
  }),
  intimated_person_type: z.string(),
  intimated_address: z.string().optional(),
  intimated_phone: z.string().optional(),
  intimated_email: z.string().optional(),
  intimated_registration: z.string().optional(),
  creator_is_intimated: z.boolean().default(false),
  creator_name: z.string().optional(),
  creator_document: z.string().optional(),
  creator_address: z.string().optional(),
  creator_phone: z.string().optional(),
  creator_email: z.string().optional(),
  intimation_method: z.string(),
  receipt_type: z.string().optional(),
});

export type IntimationFormValues = z.infer<typeof formSchema>;

export function IntimationForm({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: IntimationFormValues) => void;
  onBack: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [intimationDate, setIntimationDate] = useState<Date | undefined>(new Date());
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<IntimationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "subpoena",
      content: "",
      deadline: "",
      process_number: "",
      court: "",
      court_division: "",
      intimated_name: "",
      intimated_document: "",
      intimated_person_type: "physical",
      creator_is_intimated: false,
      intimation_method: "electronic",
      intimation_date: new Date().toISOString(),
    },
  });

  const handleFormSubmit = async (data: IntimationFormValues) => {
    if (data.deadline) {
      try {
        const deadlineDate = new Date(data.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(deadlineDate.getTime())) {
          data.deadline = null; // If invalid date, set to null
        } else if (deadlineDate < today) {
          toast({
            title: "Data inválida",
            description: "O prazo não pode ser uma data anterior à data atual.",
            variant: "destructive"
          });
          return;
        }
      } catch (error) {
        data.deadline = null; // If error parsing date, set to null
      }
    }
    
    setIsSubmitting(true);
    try {
      let formData = { ...data };
      
      if (data.court && !data.court_division) {
        formData.court_division = data.court;
      } else if (!data.court_division) {
        formData.court_division = "Vara Geral";
      }
      
      if (intimationDate) {
        formData.intimation_date = intimationDate.toISOString();
      } else {
        formData.intimation_date = new Date().toISOString();
      }
      
      if (data.creator_is_intimated) {
        formData = {
          ...formData,
          creator_name: data.intimated_name,
          creator_document: data.intimated_document,
          creator_address: data.intimated_address,
          creator_phone: data.intimated_phone,
          creator_email: data.intimated_email,
        };
      }
      
      if (receiptFile) {
        formData.receipt_file = receiptFile as any;
      }
      
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao processar formulário:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchCreatorIsIntimated = form.watch("creator_is_intimated");
  const watchIntimatedPersonType = form.watch("intimated_person_type");
  
  const getDaysUntilDeadline = (deadlineDate?: string) => {
    if (!deadlineDate) return null;
    
    const deadline = new Date(deadlineDate);
    const today = new Date();
    
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Prazo expirado há ${Math.abs(diffDays)} dia(s)`;
    } else if (diffDays === 0) {
      return "Prazo vence hoje";
    } else {
      return `${diffDays} dia(s) restante(s)`;
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs defaultValue="intimation" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="intimation">Dados da Intimação</TabsTrigger>
              <TabsTrigger value="intimated">Pessoa Intimada</TabsTrigger>
              <TabsTrigger value="creator">Cadastrante</TabsTrigger>
            </TabsList>
            
            <TabsContent value="intimation" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título da intimação" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="citation">Citação</SelectItem>
                        <SelectItem value="subpoena">Intimação</SelectItem>
                        <SelectItem value="sentence">Sentença</SelectItem>
                        <SelectItem value="decision">Decisão</SelectItem>
                        <SelectItem value="defense">Defesa</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Data da Intimação</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={intimationDate ? new Date(intimationDate).toLocaleDateString('pt-BR') : ""}
                    readOnly
                    className="bg-gray-100"
                  />
                </FormControl>
                <FormDescription>
                  A data da intimação é definida automaticamente e não pode ser alterada.
                </FormDescription>
              </FormItem>
              
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prazo para Cumprimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    {field.value && (
                      <div className="text-sm text-blue-600 font-medium">
                        {getDaysUntilDeadline(field.value)}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição da intimação" rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="process_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Processo</FormLabel>
                      <FormControl>
                        <Input placeholder="0000000-00.0000.0.00.0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="court"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tribunal</FormLabel>
                      <FormControl>
                        <Input placeholder="TJTO" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="court_division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vara/Divisão</FormLabel>
                    <FormControl>
                      <Input placeholder="Vara Cível" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="intimation_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Intimação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de intimação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electronic">Eletrônica</SelectItem>
                        <SelectItem value="postal">Postal</SelectItem>
                        <SelectItem value="officer">Oficial de Justiça</SelectItem>
                        <SelectItem value="other">Outra</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="receipt_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comprovante de Recebimento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de comprovante" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reading">Confirmação de Leitura</SelectItem>
                        <SelectItem value="ar">AR</SelectItem>
                        <SelectItem value="personally">Pessoalmente</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Anexar Comprovante</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)}
                  />
                </FormControl>
                <FormDescription>
                  Arquivos permitidos: PDF, DOC, DOCX, JPG, JPEG, PNG
                </FormDescription>
              </FormItem>
            </TabsContent>
            
            <TabsContent value="intimated" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="intimated_person_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pessoa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de pessoa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Pessoa Física</SelectItem>
                        <SelectItem value="legal">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="intimated_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="intimated_document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchIntimatedPersonType === "physical" ? "CPF" : "CNPJ"}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {watchIntimatedPersonType === "physical" && (
                <FormField
                  control={form.control}
                  name="intimated_registration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Matrícula (12 números-2 números)</FormLabel>
                      <FormControl>
                        <Input placeholder="000000000000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="intimated_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço (opcional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="intimated_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="intimated_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="creator" className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="creator_is_intimated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>O cadastrante é a pessoa intimada</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              
              {!watchCreatorIsIntimated && (
                <>
                  <FormField
                    control={form.control}
                    name="creator_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="creator_document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="creator_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço (opcional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="creator_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone (opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="creator_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail (opcional)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
      </Form>
    </div>
  );
}
