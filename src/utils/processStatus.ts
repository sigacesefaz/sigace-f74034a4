
import { supabase } from "@/lib/supabase";

/**
 * Checks if a process should be marked as "Baixado" based on movement codes
 * @param movements Array of process movements
 * @returns true if the process should be marked as "Baixado", false otherwise
 */
export const shouldMarkAsBaixado = (movements: any[]): boolean => {
  if (!movements || !Array.isArray(movements)) {
    return false;
  }
  
  // Check if any movement has code 22 or 848
  return movements.some(movement => {
    const codigo = Number(movement.codigo);
    return codigo === 22 || codigo === 848;
  });
};

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
    
    // Check if any movement has code 22 or 848
    const shouldBeBaixado = shouldMarkAsBaixado(movements || []);
    
    // Update the process status accordingly
    const { error: updateError } = await supabase
      .from("processes")
      .update({ 
        status: shouldBeBaixado ? "Baixado" : "Em andamento",
        updated_at: new Date().toISOString()
      })
      .eq("id", processId);
      
    if (updateError) {
      console.error(`Error updating status for process ${processId}:`, updateError);
      return false;
    }
    
    console.log(`Process ${processId} status updated to ${shouldBeBaixado ? "Baixado" : "Em andamento"}`);
    return true;
  } catch (error) {
    console.error(`Error in updateProcessStatus for process ${processId}:`, error);
    return false;
  }
}

/**
 * Scans all process movements and updates their process statuses
 * @returns Number of processes updated
 */
export async function updateAllProcessStatuses(): Promise<number> {
  try {
    // Get all processes
    const { data: processes, error: processesError } = await supabase
      .from("processes")
      .select("id");
      
    if (processesError || !processes) {
      console.error("Error fetching processes:", processesError);
      return 0;
    }
    
    let updatedCount = 0;
    
    // Update each process status
    for (const process of processes) {
      const updated = await updateProcessStatus(process.id);
      if (updated) updatedCount++;
    }
    
    return updatedCount;
  } catch (error) {
    console.error("Error updating all process statuses:", error);
    return 0;
  }
}

/**
 * Checks movement codes in a list of hits to determine process status
 * @param hits Array of process hits from DataJud API
 * @returns "Baixado" if any movement has code 22 or 848, "Em andamento" otherwise
 */
export function determineStatusFromHits(hits: any[]): string {
  if (!hits || !Array.isArray(hits) || hits.length === 0) {
    return "Em andamento";
  }
  
  // Check each hit for movements with codes 22 or 848
  for (const hit of hits) {
    const movimentos = hit.process?.movimentos;
    
    if (movimentos && Array.isArray(movimentos)) {
      const hasBaixadoMovement = movimentos.some(
        (movimento: any) => movimento.codigo === 22 || movimento.codigo === 848
      );
      
      if (hasBaixadoMovement) {
        return "Baixado";
      }
    }
  }
  
  return "Em andamento";
}
