import { useQuery } from "@tanstack/react-query";
import { ProcessList } from "@/components/dashboard/ProcessList";
import { getProcesses } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Plus } from "lucide-react";
export default function Processes() {
  const {
    data: processes,
    isLoading
  } = useQuery({
    queryKey: ["processes"],
    queryFn: async () => {
      const {
        data,
        error
      } = await getProcesses();
      if (error) throw error;
      return data;
    }
  });
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }
  return <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Processos</h1>
          <p className="text-gray-600">Gerencie seus processos judiciais</p>
        </div>
        <Link to="/processes/new">
          <Button className="text-slate-50">
            <Plus className="mr-2 h-4 w-4" />
            Novo Processo
          </Button>
        </Link>
      </div>

      {processes && processes.length > 0 ? <ProcessList processes={processes} /> : <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum processo</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando um novo processo judicial.
          </p>
        </div>}
    </div>;
}