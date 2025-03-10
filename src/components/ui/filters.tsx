import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from '@radix-ui/react-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FiltersProps {
  onFilter: (filters: {
    startDate?: Date;
    endDate?: Date;
    processNumber?: string;
    processCode?: string;
    name?: string;
  }) => void;
}

export function Filters({ onFilter }: FiltersProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [processNumber, setProcessNumber] = React.useState('');
  const [processCode, setProcessCode] = React.useState('');
  const [name, setName] = React.useState('');

  const handleFilter = () => {
    onFilter({
      startDate: date,
      processNumber,
      processCode,
      name
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="date">Data</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="processNumber">Número do Processo</Label>
          <Input
            id="processNumber"
            placeholder="Digite o número"
            value={processNumber}
            onChange={(e) => setProcessNumber(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="processCode">Código do Processo</Label>
          <Input
            id="processCode"
            placeholder="Digite o código"
            value={processCode}
            onChange={(e) => setProcessCode(e.target.value)}
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            placeholder="Digite o nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleFilter}>Aplicar Filtros</Button>
      </div>
    </div>
  );
}
