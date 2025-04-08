
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProcessList } from "./ProcessList";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabase";

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
        .select('*')
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
    } catch (error) {
      console.error("Error deleting process:", error);
      throw error;
    }
  };

  const handleRefresh = async (id: string) => {
    await refetch();
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Processos Arquivados</h1>
        <ProcessList 
          processes={processesData || []}
          isLoading={processesLoading}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      </div>
    </MainLayout>
  );
}
