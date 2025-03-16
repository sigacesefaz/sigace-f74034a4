
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ProcessUpdateHistory } from "@/types/process";

export async function updateProcess(processId: string | number, userId: string): Promise<boolean> {
  try {
    // Call the update-process edge function
    const { data, error } = await supabase.functions.invoke('update-process', {
      body: {
        processId,
        userId,
        updateType: 'manual'
      }
    });
    
    if (error) {
      console.error("Error updating process:", error);
      toast({
        title: "Erro na atualização",
        description: "Não foi possível atualizar o processo. Tente novamente mais tarde.",
        variant: "destructive",
      });
      return false;
    }
    
    if (data.newData) {
      toast({
        title: "Processo Atualizado",
        description: "Novas informações foram encontradas e adicionadas ao processo.",
      });
    } else {
      toast({
        title: "Processo Verificado",
        description: "Nenhuma nova informação foi encontrada para este processo.",
      });
    }
    
    return data.success;
  } catch (error) {
    console.error("Error calling update process function:", error);
    toast({
      title: "Erro na atualização",
      description: "Ocorreu um erro ao tentar atualizar o processo.",
      variant: "destructive",
    });
    return false;
  }
}

export async function getProcessUpdateHistory(processId: string | number): Promise<ProcessUpdateHistory[]> {
  try {
    const { data, error } = await supabase
      .from('process_update_history')
      .select('*')
      .eq('process_id', processId)
      .order('update_date', { ascending: false });
      
    if (error) {
      console.error("Error fetching update history:", error);
      return [];
    }
    
    // Convert data to match ProcessUpdateHistory interface with proper type casting
    const history: ProcessUpdateHistory[] = data.map(item => ({
      id: item.id,
      process_id: item.process_id,
      update_type: item.update_type,
      update_date: item.update_date,
      details: item.details,
      user_id: item.user_id
    }));
    
    return history;
  } catch (error) {
    console.error("Error in getProcessUpdateHistory:", error);
    return [];
  }
}
