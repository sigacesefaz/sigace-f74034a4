
import { useState, useEffect } from "react";
import { ProcessItem } from "@/components/dashboard/ProcessItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRangePicker } from "@/components/date-range-picker"
import { getProcesses } from "@/services/process";
import { formatProcessNumber } from "@/lib/utils";

interface ProcessListProps {
  onSelectProcess: (processId: string) => void;
}

export function ProcessList({ onSelectProcess }: ProcessListProps) {
  const [processes, setProcesses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: addDays(new Date(), 30),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProcessType, setSelectedProcessType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getProcesses();
        setProcesses(data);
      } catch (error) {
        console.error("Error fetching processes:", error);
        toast({
          title: "Erro ao carregar processos",
          description: "Ocorreu um erro ao carregar a lista de processos.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const filteredProcesses = processes.filter((process) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      process.title.toLowerCase().includes(searchTerm) ||
      process.number.toLowerCase().includes(searchTerm)
    );
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleProcessTypeSelect = (value: string) => {
    setSelectedProcessType(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar processo..."
          value={searchQuery}
          onChange={handleFilterChange}
        />
        <div className="flex items-center space-x-2">
          <DateRangePicker date={dateRange} onDateChange={handleDateRangeChange} />
          <Button onClick={handleOpenDialog}>Novo Processo</Button>
        </div>
      </div>

      {isLoading ? (
        <p>Carregando processos...</p>
      ) : (
        filteredProcesses.map((process) => (
          <div key={process.id}>
            <div className="font-mono text-base text-gray-600">
              {formatProcessNumber(process.number || process.numeroProcesso)}
            </div>
          </div>
        ))
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar novo processo</DialogTitle>
            <DialogDescription>
              Selecione o tipo de processo que você deseja adicionar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="processType" className="text-right">
                Tipo de processo
              </label>
              <Select onValueChange={handleProcessTypeSelect} defaultValue={selectedProcessType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo de processo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="judicial">Judicial</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="tributario">Tributário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
