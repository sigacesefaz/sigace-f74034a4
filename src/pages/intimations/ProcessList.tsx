
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProcessList as ProcessListComponent } from '@/pages/processes/ProcessList';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function ProcessList() {
  const { data: processes = [], isLoading } = useQuery({
    queryKey: ['processes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading processes:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  const handleDeleteProcess = async (id: string) => {
    try {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return;
    } catch (error) {
      console.error('Error deleting process:', error);
      throw error;
    }
  };

  const handleRefreshProcess = async (id: string) => {
    console.log("Refreshing process", id);
    // This would typically involve refreshing the process from an external API
    return Promise.resolve();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Processos</h1>
        <Button asChild>
          <Link to="/dashboard/processes/new">Novo Processo</Link>
        </Button>
      </div>
      
      <ProcessListComponent 
        processes={processes}
        isLoading={isLoading}
        onDelete={handleDeleteProcess}
        onRefresh={handleRefreshProcess}
      />
    </div>
  );
}
