
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Updates the status of a process based on its movements
 * @param processId The ID of the process to update
 * @returns true if the process was updated, false otherwise
 */
export async function updateProcessStatus(processId: string | number): Promise<boolean> {
  try {
    // Get all movements for this process
    const { data: movements, error: movementsError } = await supabase
      .from("process_movements")
      .select("codigo")
      .eq("process_id", processId);
      
    if (movementsError) {
      console.error(`Error fetching movements for process ${processId}:`, movementsError);
      return false;
    }
    
    if (!movements || !Array.isArray(movements)) {
      return false;
    }
    
    // Check if any movement has code 22 or 848
    const hasBaixadoMovement = movements.some(
      movement => {
        const codigo = Number(movement.codigo);
        return codigo === 22 || codigo === 848;
      }
    );
    
    // Update the process status accordingly
    const { error: updateError } = await supabase
      .from("processes")
      .update({ 
        status: hasBaixadoMovement ? "Baixado" : "Em andamento",
        updated_at: new Date().toISOString()
      })
      .eq("id", processId);
      
    if (updateError) {
      console.error(`Error updating status for process ${processId}:`, updateError);
      return false;
    }
    
    console.log(`Process ${processId} status updated to ${hasBaixadoMovement ? "Baixado" : "Em andamento"}`);
    return true;
  } catch (error) {
    console.error(`Error in updateProcessStatus for process ${processId}:`, error);
    return false;
  }
}

/**
 * Scans all processes and updates their status based on their movements
 */
export async function updateAllProcessStatuses(): Promise<number> {
  try {
    toast.loading("Atualizando status dos processos...");
    
    // Get all processes
    const { data: processes, error: processesError } = await supabase
      .from("processes")
      .select("id");
      
    if (processesError || !processes) {
      console.error("Error fetching processes:", processesError);
      toast.error("Erro ao buscar processos");
      return 0;
    }
    
    let updatedCount = 0;
    let totalCount = processes.length;
    
    // Update each process status
    for (const process of processes) {
      const updated = await updateProcessStatus(process.id);
      if (updated) updatedCount++;
    }
    
    toast.dismiss();
    toast.success(`Status de ${updatedCount} de ${totalCount} processos atualizados com sucesso!`);
    
    return updatedCount;
  } catch (error) {
    console.error("Error updating all process statuses:", error);
    toast.dismiss();
    toast.error("Erro ao atualizar status dos processos");
    return 0;
  }
}
