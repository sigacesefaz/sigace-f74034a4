
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const intimationSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.string().min(1, "Tipo é obrigatório"),
  deadline: z.string().optional(),
  process_number: z.string().optional(),
  process_id: z.string().optional(),
  court: z.string().optional(),
  subject: z.string().optional(),
  filing_date: z.string().optional(),
  instance: z.string().optional(),
  judgment_body: z.string().optional(),
  
  // Intimated person
  intimated_name: z.string().min(1, "Nome da pessoa intimada é obrigatório"),
  intimated_document: z.string().min(1, "Documento da pessoa intimada é obrigatório"),
  intimated_address: z.string().optional(),
  intimated_phone: z.string().optional(),
  intimated_email: z.string().optional(),
  intimated_registration: z.string().optional(),
  intimated_person_type: z.enum(["physical", "legal"]).default("physical"),
  
  // Creator
  creator_is_intimated: z.boolean().default(false),
  creator_name: z.string().optional(),
  creator_document: z.string().optional(),
  creator_address: z.string().optional(),
  creator_phone: z.string().optional(),
  creator_email: z.string().optional(),
  
  // Intimation method and receipt
  intimation_method: z.enum(["electronic", "postal", "officer", "other"]).default("electronic"),
  receipt_type: z.enum(["reading", "ar", "personally", "other"]).optional(),
});

type IntimationFormValues = z.infer<typeof intimationSchema>;

interface IntimationFormProps {
  onSubmit: (data: IntimationFormValues) => Promise<void>;
  onBack: () => void;
}

export function IntimationForm({ onSubmit, onBack }: IntimationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<IntimationFormValues>({
    resolver: zodResolver(intimationSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "notice",
      deadline: "",
      process_number: "",
      court: "",
      intimated_name: "",
      intimated_document: "",
      intimated_person_type: "physical",
      creator_is_intimated: false,
      intimation_method: "electronic",
    },
  });

  const intimatedPersonType = form.watch("intimated_person_type");
  const creatorIsIntimated = form.watch("creator_is_intimated");

  const handleSubmit = async (data: IntimationFormValues) => {
    setIsSubmitting(true);
    try {
      // If creator is the intimated person, copy intimated details to creator fields
      let formData = { ...data };
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
      
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Cadastro Manual de Intimação</h3>
          <p className="text-sm text-gray-500">
            Preencha os dados da intimação manualmente
          </p>
        </div>

        <Tabs defaultValue="process" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="process">Dados do Processo</TabsTrigger>
            <TabsTrigger value="intimation">Dados da Intimação</TabsTrigger>
            <TabsTrigger value="intimated">Pessoa Intimada</TabsTrigger>
            <TabsTrigger value="creator">Cadastrante</TabsTrigger>
          </TabsList>
          
          <TabsContent value="process" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="process_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Processo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0000000-00.0000.0.00.0000"
                      {...field}
                    />
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
                  <FormLabel>Vara/Comarca</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Vara/Comarca do processo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Assunto do processo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filing_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Ajuizamento</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grau</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Grau do processo"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="judgment_body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Órgão Julgador</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Órgão julgador"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="intimation" className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Intimação*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Título da intimação"
                      {...field}
                    />
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
                  <FormLabel>Tipo de Intimação*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="notice">Notificação</SelectItem>
                      <SelectItem value="citation">Citação</SelectItem>
                      <SelectItem value="subpoena">Intimação</SelectItem>
                      <SelectItem value="sentence">Sentença</SelectItem>
                      <SelectItem value="decision">Decisão</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da intimação"
                      className="min-h-[100px]"
                      {...field}
                    />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
            
            <div className="space-y-2">
              <FormLabel>Anexar Comprovante</FormLabel>
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
            <FormField
              control={form.control}
              name="intimated_person_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Pessoa</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                  <FormLabel>Nome Completo*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo da pessoa intimada"
                      {...field}
                    />
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
                    {intimatedPersonType === "physical" ? "CPF*" : "CNPJ*"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={intimatedPersonType === "physical" ? "CPF" : "CNPJ"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {intimatedPersonType === "physical" && (
              <FormField
                control={form.control}
                name="intimated_registration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matrícula (12 números-2 números)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000000000-00"
                        {...field}
                      />
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
                    <Textarea
                      placeholder="Endereço completo"
                      {...field}
                    />
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
                    <Input
                      placeholder="Telefone para contato"
                      {...field}
                    />
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
                    <Input
                      placeholder="E-mail para contato"
                      {...field}
                    />
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      O cadastrante é a pessoa intimada
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            {!creatorIsIntimated && (
              <>
                <FormField
                  control={form.control}
                  name="creator_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome completo do cadastrante"
                          {...field}
                        />
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
                        <Input
                          placeholder="CPF ou CNPJ do cadastrante"
                          {...field}
                        />
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
                        <Textarea
                          placeholder="Endereço completo"
                          {...field}
                        />
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
                        <Input
                          placeholder="Telefone para contato"
                          {...field}
                        />
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
                        <Input
                          placeholder="E-mail para contato"
                          {...field}
                        />
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
          <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
            Voltar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Intimação"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
