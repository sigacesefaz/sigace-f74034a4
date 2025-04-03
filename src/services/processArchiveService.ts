
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";

/**
 * Archives one or more processes with a specified reason
 * 
 * @param processIds Array of process IDs to archive
 * @param reason Reason for archiving
 * @returns Boolean indicating success or failure
 */
export const archiveProcesses = async (processIds: string[], reason: string): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient();
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      toast.error("Usuário não autenticado");
      return false;
    }
    
    // Update process status to "Arquivado"
    const { error: updateError } = await supabase
      .from('processes')
      .update({ status: "Arquivado" })
      .in('id', processIds);
    
    if (updateError) {
      console.error("Erro ao arquivar processos:", updateError);
      toast.error("Erro ao arquivar processos");
      return false;
    }
    
    // Record archive action in process_update_history
    const updateHistoryItems = processIds.map(processId => ({
      process_id: processId,
      update_type: "archive",
      previous_status: "Em andamento", // Could be improved with actual previous status
      new_status: "Arquivado",
      user_id: user.user?.id,
      details: { reason }
    }));
    
    const { error: historyError } = await supabase
      .from('process_update_history')
      .insert(updateHistoryItems);
    
    if (historyError) {
      console.error("Erro ao registrar histórico de arquivamento:", historyError);
      // Don't show an error to the user since the primary action succeeded
    }
    
    toast.success(`${processIds.length > 1 ? `${processIds.length} processos arquivados` : "Processo arquivado"} com sucesso!`);
    return true;
  } catch (error) {
    console.error("Erro ao arquivar processos:", error);
    toast.error("Ocorreu um erro ao arquivar os processos");
    return false;
  }
};

/**
 * Unarchives one or more processes with a specified reason
 * 
 * @param processIds Array of process IDs to unarchive
 * @param reason Reason for unarchiving
 * @returns Boolean indicating success or failure
 */
export const unarchiveProcesses = async (processIds: string[], reason: string): Promise<boolean> => {
  try {
    const supabase = getSupabaseClient();
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      toast.error("Usuário não autenticado");
      return false;
    }
    
    // Update process status to "Em andamento"
    const { error: updateError } = await supabase
      .from('processes')
      .update({ status: "Em andamento" })
      .in('id', processIds);
    
    if (updateError) {
      console.error("Erro ao desarquivar processos:", updateError);
      toast.error("Erro ao desarquivar processos");
      return false;
    }
    
    // Record unarchive action in process_update_history
    const updateHistoryItems = processIds.map(processId => ({
      process_id: processId,
      update_type: "unarchive",
      previous_status: "Arquivado",
      new_status: "Em andamento",
      user_id: user.user?.id,
      details: { reason }
    }));
    
    const { error: historyError } = await supabase
      .from('process_update_history')
      .insert(updateHistoryItems);
    
    if (historyError) {
      console.error("Erro ao registrar histórico de desarquivamento:", historyError);
      // Don't show an error to the user since the primary action succeeded
    }
    
    toast.success(`${processIds.length > 1 ? `${processIds.length} processos desarquivados` : "Processo desarquivado"} com sucesso!`);
    return true;
  } catch (error) {
    console.error("Erro ao desarquivar processos:", error);
    toast.error("Ocorreu um erro ao desarquivar os processos");
    return false;
  }
};
