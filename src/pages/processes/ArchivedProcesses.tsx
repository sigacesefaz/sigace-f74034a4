
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProcessList } from "./ProcessList";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";
import { ProcessArchiveDialog } from "@/components/process/ProcessArchiveDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";

export default function ArchivedProcesses() {
  const {
    data: processesData,
    isLoading: processesLoading,
    refetch
  } = useQuery({
    queryKey: ['archived-processes'],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('processes')
        .select('*, archive_info:process_archive_info(*)')
        .eq('status', 'Arquivado')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('processes').delete().eq('id', id);
      await refetch();
      toast.success("Processo excluído com sucesso!");
    } catch (error) {
      console.error("Error deleting process:", error);
      toast.error("Erro ao excluir processo");
    }
  };

  const handleUnarchive = async (processId: string, reason: string) => {
    try {
      const supabase = getSupabaseClient();
      
      // Update process status
      await supabase
        .from('processes')
        .update({ 
          status: "Em andamento",
          updated_at: new Date().toISOString()
        })
        .eq('id', processId);

      // Add unarchive reason
      await supabase
        .from('process_archive_info')
        .insert({
          process_id: processId,
          action: 'unarchive',
          reason: reason,
          date: new Date().toISOString()
        });

      await refetch();
      toast.success("Processo desarquivado com sucesso!");
    } catch (error) {
      console.error("Erro ao desarquivar processo:", error);
      toast.error("Erro ao desarquivar processo");
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Processos Arquivados</h1>
          <Badge variant="secondary" className="text-sm">
            Total: {processesData?.length || 0} processos
          </Badge>
        </div>
        <ProcessList 
          processes={processesData || []}
          isLoading={processesLoading}
          onDelete={handleDelete}
          onRefresh={refetch}
          showArchiveInfo={true}
          onUnarchive={handleUnarchive}
          hideNewProcessButton={true}
        />
      </div>
    </MainLayout>
  );
}
