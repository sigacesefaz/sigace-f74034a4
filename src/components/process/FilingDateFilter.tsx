
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FilingDateFilterProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  sortOrder: "none" | "oldest" | "recent";
  onSortOrderChange: (order: "none" | "oldest" | "recent") => void;
}

export function FilingDateFilter({
  date,
  onDateChange,
  sortOrder,
  onSortOrderChange
}: FilingDateFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className={cn(
            "h-8 border-dashed",
            date ? "text-foreground" : "text-muted-foreground"
          )}>
            <Calendar className="h-3.5 w-3.5 mr-2" />
            {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Filtrar por data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Data de Ajuizamento</h4>
              <p className="text-xs text-muted-foreground">
                Selecione uma data para filtrar processos
              </p>
            </div>
          </div>
          <DatePicker 
            mode="single"
            selected={date}
            onSelect={onDateChange}
            locale={ptBR}
            className="p-3"
          />
          <div className="flex justify-end gap-2 p-3 border-t">
            {date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateChange(undefined)}
              >
                Limpar
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            <Calendar className="h-4 w-4 mr-2" />
            {sortOrder === "none" 
              ? "Ordernar por ajuizamento" 
              : sortOrder === "recent" 
                ? "Mais recente primeiro" 
                : "Mais antigo primeiro"
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-1">
          <div className="flex flex-col gap-1">
            <button 
              onClick={() => onSortOrderChange("none")} 
              className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${sortOrder === "none" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Ordenação padrão
            </button>
            <button 
              onClick={() => onSortOrderChange("recent")} 
              className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${sortOrder === "recent" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Ajuizamento - Mais recente primeiro
            </button>
            <button 
              onClick={() => onSortOrderChange("oldest")} 
              className={`flex items-center px-2 py-1 text-sm rounded-md transition-colors ${sortOrder === "oldest" ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"}`}
            >
              Ajuizamento - Mais antigo primeiro
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
