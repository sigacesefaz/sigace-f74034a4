
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ProcessIntimation } from "@/types/process";
import { cn } from "@/lib/utils";
import { searchProcesses, courts } from "@/services/datajud";
import { Skeleton } from "@/components/ui/skeleton";
import { Court } from "@/types/datajud";

// Definição dos esquemas para validação
const personSchema = z.object({
  full_name: z.string().min(3, "Nome completo é obrigatório"),
  document: z.string().min(11, "CPF é obrigatório"),
  registration: z.string().min(1, "Matrícula é obrigatória"),
  bond: z.string().min(1, "Vínculo é obrigatório"),
});

const intimationSchema = z.object({
  process_number: z.string().min(1, "Número do processo é obrigatório"),
  court: z.string().min(1, "Tribunal é obrigatório"),
  court_division: z.string().min(1, "Vara/Unidade é obrigatória"),
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  intimation_date: z.date({
    required_error: "Data da intimação é obrigatória",
  }),
  deadline: z.date({
    required_error: "Prazo é obrigatório",
  }),
  type: z.enum(["defense", "hearing", "payment", "document", "other"]),
  method: z.enum(["official_gazette", "mail", "officer", "electronic"]),
  observations: z.string().optional(),
  parties: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      lawyer: z
        .object({
          name: z.string().optional(),
          oab: z.string().optional(),
          contact: z.string().optional(),
        })
        .optional(),
    })
  ).default([{ name: "", role: "" }]),
  person: personSchema,
});

type IntimationFormData = z.infer<typeof intimationSchema>;

type FormMode = "search" | "form";

export default function NewIntimation() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [processNumber, setProcessNumber] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<Court>(courts.ESTADUAL[0]);
  const [formMode, setFormMode] = useState<FormMode>("search");

  const form = useForm<IntimationFormData>({
    resolver: zodResolver(intimationSchema),
    defaultValues: {
      type: "defense",
      method: "electronic",
      parties: [{ name: "", role: "" }],
      person: {
        full_name: "",
        document: "",
        registration: "",
        bond: "",
      },
    },
  });

  const handleSearch = async () => {
    if (!processNumber.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Remove caracteres não numéricos
      const cleanNumber = processNumber.replace(/\D/g, '');
      const results = await searchProcesses(selectedCourt.endpoint, cleanNumber);
      setSearchResults(results);
      setHasSearched(true);
      
      if (results.length === 0) {
        toast.info("Nenhum processo encontrado");
      }
    } catch (error) {
      toast.error("Erro ao buscar processos");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessSelect = (process: any) => {
    // Preencher os dados do formulário com as informações do processo
    form.setValue("process_number", process.numeroProcesso);
    form.setValue("court", process.tribunal || selectedCourt.name);
    form.setValue("court_division", process.orgaoJulgador?.nome || "");
    form.setValue("title", `Intimação - ${process.classe?.nome || "Processo"}`);
    
    // Mudar para o modo de formulário
    setFormMode("form");
  };

  const handleManualEntry = () => {
    form.setValue("process_number", processNumber);
    form.setValue("court", selectedCourt.name);
    setFormMode("form");
  };

  const onSubmit = async (data: IntimationFormData) => {
    setIsSubmitting(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("intimations").insert({
        process_number: data.process_number,
        court: data.court,
        court_division: data.court_division,
        title: data.title,
        content: data.content,
        status: "pending",
        created_by: user.id,
        intimation_date: data.intimation_date.toISOString(),
        deadline: data.deadline.toISOString(),
        type: data.type,
        method: data.method,
        observations: data.observations,
        parties: data.parties,
        // Adicionando os dados da pessoa que está fazendo o cadastro
        history: [{
          id: crypto.randomUUID(),
          date: new Date().toISOString(),
          user: data.person.full_name,
          action: "Criação da intimação",
          details: `Cadastrado por ${data.person.full_name} (${data.person.document}) - Matrícula: ${data.person.registration}/${data.person.bond}`
        }]
      });

      if (error) throw error;

      toast.success("Intimação cadastrada com sucesso!");
      navigate("/intimations");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar intimação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProcessNumber(e.target.value);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nova Intimação</h1>
        <p className="text-gray-600">Cadastre uma nova intimação judicial</p>
      </div>

      {formMode === "search" ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Buscar Processo</h3>
              <p className="text-sm text-gray-500">
                Informe o número do processo para a intimação
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <FormLabel htmlFor="court">Tribunal</FormLabel>
                <Select 
                  value={selectedCourt.id}
                  onValueChange={(value) => {
                    const court = Object.values(courts)
                      .flat()
                      .find(c => c.id === value);
                    if (court) setSelectedCourt(court);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tribunal" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(courts)
                      .filter(([key]) => 
                        key === "ESTADUAL" || key === "FEDERAL" || key === "SUPERIOR"
                      )
                      .map(([courtType, courtsList]) => (
                        <div key={courtType}>
                          <div className="px-2 py-1.5 text-sm font-semibold">
                            {courtType === "ESTADUAL" ? "Justiça Estadual" : 
                            courtType === "FEDERAL" ? "Justiça Federal" : 
                            "Tribunais Superiores"}
                          </div>
                          {courtsList.map((court) => (
                            <SelectItem key={court.id} value={court.id}>
                              {court.name}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <FormLabel htmlFor="processNumber">Número do Processo</FormLabel>
                <Input
                  id="processNumber"
                  value={processNumber}
                  onChange={handleProcessNumberChange}
                  className="flex h-10 w-full"
                  placeholder="0000000-00.0000.0.00.0000"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="button" 
                onClick={handleSearch} 
                disabled={!processNumber || isLoading}
              >
                Buscar Processo
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}

            {!isLoading && hasSearched && searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm font-medium">
                  {`${searchResults.length} processos encontrados`}
                </div>

                <div className="space-y-3">
                  {searchResults.slice(0, 5).map((process, index) => (
                    <Card 
                      key={index} 
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
                      onClick={() => handleProcessSelect(process)}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="font-medium">{process.classe?.nome || "Sem classe"}</div>
                        <div className="text-sm text-muted-foreground font-mono">{process.numeroProcesso}</div>
                        <div className="text-xs text-gray-500">{process.tribunal}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {!isLoading && hasSearched && searchResults.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">
                  Não foi possível encontrar o processo. Deseja cadastrar manualmente?
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleManualEntry}
                >
                  Cadastro Manual
                </Button>
              </div>
            )}

            {!isLoading && !hasSearched && (
              <div className="flex items-center justify-center border rounded-lg p-8">
                <img 
                  src="/lovable-uploads/c12c62a2-89a4-41d7-8de4-f3a85e88f80b.png" 
                  alt="Processo não encontrado" 
                  className="max-w-xs mx-auto mb-4" 
                />
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Busque um processo pelo número
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <>
          <Button variant="ghost" className="mb-4" onClick={() => setFormMode("search")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a Busca
          </Button>
          <Card className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="process_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Processo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0000000-00.0000.0.00.0000" />
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tribunal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TJSP">TJSP</SelectItem>
                            <SelectItem value="TJRJ">TJRJ</SelectItem>
                            <SelectItem value="TRF3">TRF3</SelectItem>
                            <SelectItem value="TJTO">TJTO</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="court_division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vara/Unidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: 1ª Vara Cível" />
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
                        <FormLabel>Tipo de Intimação</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="defense">Apresentação de Defesa</SelectItem>
                            <SelectItem value="hearing">Audiência</SelectItem>
                            <SelectItem value="payment">Pagamento</SelectItem>
                            <SelectItem value="document">Documentos</SelectItem>
                            <SelectItem value="other">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meio de Intimação</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o meio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="official_gazette">Diário Oficial</SelectItem>
                            <SelectItem value="mail">Correios</SelectItem>
                            <SelectItem value="officer">Oficial de Justiça</SelectItem>
                            <SelectItem value="electronic">Meio Eletrônico</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="intimation_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data da Intimação</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Prazo</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título da intimação" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva o conteúdo da intimação"
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Dados do Responsável pelo Cadastro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="person.full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo*</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome completo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="person.document"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF*</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="000.000.000-00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="person.registration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matrícula*</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Matrícula (até 12 números)" 
                              maxLength={12}
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/\D/g, '');
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="person.bond"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vínculo*</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Vínculo (até 3 números)"
                              maxLength={3}
                              onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/\D/g, '');
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Observações adicionais"
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormMode("search")}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </>
      )}
    </div>
  );
}
