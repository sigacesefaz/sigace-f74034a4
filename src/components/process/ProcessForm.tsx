import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaskedInput } from "@/components/ui/input-mask";

interface ProcessFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
}

export function ProcessForm({ onSubmit, onCancel, initialData }: ProcessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: initialData || {
      number: '',
      title: '',
      description: '',
      status: 'Em andamento',
      court: '',
      plaintiff: '',
      plaintiff_type: 'physical',
      plaintiff_document: ''
    }
  });

  const onSubmitForm = async (data: any) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="number">Número do Processo</Label>
            <MaskedInput
              id="number"
              mask="process"
              value={watch('number')}
              onChange={(value) => setValue('number', value)}
              placeholder="0000000-00.0000.0.00.0000"
              className="w-full"
            />
            {errors.number && <p className="text-sm text-red-500">{errors.number.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="court">Tribunal</Label>
            <Select 
              value={watch('court')} 
              onValueChange={(value) => setValue('court', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tribunal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TJTO">TJTO</SelectItem>
                <SelectItem value="TJSP">TJSP</SelectItem>
                <SelectItem value="TJRJ">TJRJ</SelectItem>
                <SelectItem value="TJMG">TJMG</SelectItem>
                <SelectItem value="STJ">STJ</SelectItem>
                <SelectItem value="STF">STF</SelectItem>
              </SelectContent>
            </Select>
            {errors.court && <p className="text-sm text-red-500">{errors.court.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            {...register('title', { required: 'O título é obrigatório' })}
            placeholder="Título do processo"
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Descrição do processo"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={watch('status')} 
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Suspenso">Suspenso</SelectItem>
                <SelectItem value="Baixado">Baixado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plaintiff">Nome do Autor</Label>
            <Input
              id="plaintiff"
              {...register('plaintiff')}
              placeholder="Nome do autor/requerente"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="plaintiff_document">
            {watch('plaintiff_type') === "physical" ? "CPF do Autor" : "CNPJ do Autor"}
          </Label>
          <Input
            id="plaintiff_document"
            {...register('plaintiff_document')}
            placeholder="CPF/CNPJ do autor"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar' : 'Cadastrar'}
        </Button>
      </div>
    </form>
  );
}
