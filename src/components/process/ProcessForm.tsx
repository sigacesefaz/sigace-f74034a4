
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { courts } from "@/services/datajud";
import { InputMask } from "@react-input/mask";

const processSchema = z.object({
  number: z.string().min(1, "Número do processo é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  type: z.string().min(1, "Tipo é obrigatório"),
  instance: z.string().min(1, "Instância é obrigatória"),
  court: z.string().min(1, "Tribunal é obrigatório"),
  description: z.string().optional(),
  plaintiff: z.string().optional(),
  plaintiff_document: z.string().optional(),
  defendant: z.string().optional(),
  defendant_document: z.string().optional(),
  judge: z.string().optional(),
  value: z.number().optional(),
});

type ProcessFormValues = z.infer<typeof processSchema>;

interface ProcessFormProps {
  onSubmit: (data: ProcessFormValues) => void;
  onCancel: () => void;
}

export function ProcessForm({ onSubmit, onCancel }: ProcessFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      status: "active",
      type: "liminar",
      instance: "primeira",
      court: courts.ESTADUAL[0].name, // Default to TJTO
    },
  });

  const handleSubmit = async (data: ProcessFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Processo*</FormLabel>
                <FormControl>
                  <InputMask
                    component={Input}
                    mask="0000000-00.0000.0.00.0000"
                    replacement={{ _: /\d/ }}
                    defaultValue={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="0000000-00.0000.0.00.0000"
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
                <FormLabel>Tribunal*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tribunal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {courts.ESTADUAL.map((court) => (
                      <SelectItem key={court.id} value={court.name}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <FormLabel>Título*</FormLabel>
              <FormControl>
                <Input placeholder="Título do processo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="closed">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="liminar">Liminar</SelectItem>
                    <SelectItem value="recurso">Recurso</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instância*</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma instância" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="primeira">Primeira</SelectItem>
                    <SelectItem value="segunda">Segunda</SelectItem>
                    <SelectItem value="superior">Superior</SelectItem>
                    <SelectItem value="supremo">Supremo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descrição detalhada do processo" 
                  className="resize-none min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plaintiff"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Autor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do autor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="plaintiff_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento do Autor</FormLabel>
                <FormControl>
                  <Input placeholder="CPF/CNPJ do autor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="defendant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Réu</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do réu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="defendant_document"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento do Réu</FormLabel>
                <FormControl>
                  <Input placeholder="CPF/CNPJ do réu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="judge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Juiz</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do juiz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Causa</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    step="0.01"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? undefined : value);
                    }}
                    value={field.value === undefined ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="text-white">
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="text-white">
            {isLoading ? "Salvando..." : "Salvar Processo"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
