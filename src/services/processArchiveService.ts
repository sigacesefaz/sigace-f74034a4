
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Arquiva um processo ou uma lista de processos
 * @param processIds ID do processo ou array de IDs de processos para arquivar
 * @param reason Motivo do arquivamento
 */
export async function archiveProcesses(processIds: string | string[], reason: string): Promise<boolean> {
  try {
    toast.loading("Arquivando processo(s)...");
    const ids = Array.isArray(processIds) ? processIds : [processIds];
    
    // Atualiza o status dos processos
    const { data, error } = await supabase
      .from("processes")
      .update({ status: "Arquivado" })
      .in("id", ids)
      .select();
    
    if (error) {
      console.error("Erro ao arquivar processo(s):", error);
      toast.dismiss();
      toast.error(`Erro ao arquivar processo(s): ${error.message}`);
      return false;
    }
    
    // Registra o histórico de arquivamento para cada processo
    for (const processId of ids) {
      await supabase.from("process_update_history").insert({
        process_id: processId,
        update_type: "archive",
        previous_status: "Em andamento",
        new_status: "Arquivado",
        details: { reason }
      });
    }
    
    toast.dismiss();
    toast.success(`${ids.length} processo(s) arquivado(s) com sucesso!`);
    return true;
  } catch (error) {
    console.error("Erro ao arquivar processo(s):", error);
    toast.dismiss();
    toast.error("Erro ao arquivar processo(s)");
    return false;
  }
}

/**
 * Desarquiva um processo ou uma lista de processos
 * @param processIds ID do processo ou array de IDs de processos para desarquivar
 * @param reason Motivo do desarquivamento
 */
export async function unarchiveProcesses(processIds: string | string[], reason: string): Promise<boolean> {
  try {
    toast.loading("Desarquivando processo(s)...");
    const ids = Array.isArray(processIds) ? processIds : [processIds];
    
    // Atualiza o status dos processos
    const { data, error } = await supabase
      .from("processes")
      .update({ status: "Em andamento" })
      .in("id", ids)
      .select();
    
    if (error) {
      console.error("Erro ao desarquivar processo(s):", error);
      toast.dismiss();
      toast.error(`Erro ao desarquivar processo(s): ${error.message}`);
      return false;
    }
    
    // Registra o histórico de desarquivamento para cada processo
    for (const processId of ids) {
      await supabase.from("process_update_history").insert({
        process_id: processId,
        update_type: "unarchive",
        previous_status: "Arquivado",
        new_status: "Em andamento",
        details: { reason }
      });
    }
    
    toast.dismiss();
    toast.success(`${ids.length} processo(s) desarquivado(s) com sucesso!`);
    return true;
  } catch (error) {
    console.error("Erro ao desarquivar processo(s):", error);
    toast.dismiss();
    toast.error("Erro ao desarquivar processo(s)");
    return false;
  }
}
