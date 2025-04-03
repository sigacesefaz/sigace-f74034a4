
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface FilingDateFilterProps {
  onChange: (date: Date | undefined) => void;
  value: Date | undefined;
}

export function FilingDateFilter({ onChange, value }: FilingDateFilterProps) {
  const [open, setOpen] = useState(false);
  
  const handleSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };
  
  const clearFilter = () => {
    onChange(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
          <Calendar className="h-4 w-4 mr-1" />
          Data Ajuizamento: {value ? format(value, 'dd/MM/yyyy', { locale: ptBR }) : "Todas"}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Data de Ajuizamento</h4>
        </div>
        <CalendarComponent
          mode="single"
          selected={value}
          onSelect={handleSelect}
          locale={ptBR}
          className="rounded-md border"
        />
        <div className="p-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilter} 
            className="w-full"
          >
            Limpar filtro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
