import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, RefreshCw } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ProcessCard } from "@/components/dashboard/ProcessCard";
import { confirm } from "@/components/ui/confirm-dialog";

import { updateProcess } from "@/services/processUpdateService";

export default function ProcessListPage() {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    fetchProcesses();
  }, [session]);

  const fetchProcesses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("processes")
        .select("*")
        .like("number", `%${search}%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching processes:", error);
        toast({
          title: "Erro ao carregar processos",
          description: "Não foi possível carregar a lista de processos.",
          variant: "destructive",
        });
      } else {
        setProcesses(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProcess = async (processId: string | number) => {
    const confirmed = await confirm({
      title: "Excluir Processo",
      description: "Tem certeza de que deseja excluir este processo? Esta ação não pode ser desfeita.",
    });

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("processes")
        .delete()
        .eq("id", processId);

      if (error) {
        console.error("Error deleting process:", error);
        toast({
          title: "Erro ao excluir processo",
          description: "Não foi possível excluir o processo. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Processo Excluído",
          description: "O processo foi excluído com sucesso.",
        });
        await fetchProcesses(); // Refresh the list after deletion
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add this handler for updating processes
  const handleUpdateProcess = async (processId: string | number) => {
    setIsLoading(true);
    const userId = session?.user?.id;
    if (!userId) {
      toast({
        title: "Erro na atualização",
        description: "Você precisa estar logado para atualizar processos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    await updateProcess(processId, userId);
    
    // Refresh the list to show updated data
    await fetchProcesses();
    setIsLoading(false);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lista de Processos</h1>
        <Button onClick={() => navigate("/processes/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Processo
        </Button>
      </div>

      <div className="mb-4">
        <Label htmlFor="search">Pesquisar</Label>
        <Input
          type="text"
          id="search"
          placeholder="Número do processo"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchProcesses();
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Update the process cards to include the update button handler */}
        {processes.map((process) => (
          <ProcessCard
            key={process.id}
            process={process}
            onClick={() => navigate(`/processes/${process.id}`)}
            onDelete={() => handleDeleteProcess(process.id)}
            onUpdate={() => handleUpdateProcess(process.id)}
          />
        ))}
      </div>
    </div>
  );
}
