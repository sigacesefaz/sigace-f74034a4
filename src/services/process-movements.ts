
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";

// Function to save the movements of a process
export async function saveProcessMovements(processId: string | number, movements: DatajudProcess["movimentos"], hitId?: string) {
  if (!movements || movements.length === 0) {
    console.log("No movements to save");
    return true;
  }
  
  try {
    console.log(`Saving ${movements.length} movements for process ID:`, processId);
    
    // Get the current user to set as user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // For smaller batches, save movements directly
    if (movements.length <= 10) {
      const movementsData = movements.map(movement => ({
        process_id: processId,
        hit_id: hitId || null,
        codigo: movement.codigo, 
        nome: movement.nome || "",
        data_hora: movement.dataHora,
        tipo: movement.tipo || "",
        complemento: Array.isArray(movement.complemento) 
          ? movement.complemento.join(", ") 
          : (movement.complemento || ""),
        complementos_tabelados: movement.complementosTabelados || [],
        orgao_julgador: movement.orgaoJulgador || {},
        movimento_principal_id: null,
        json_completo: movement,
        user_id: user.id
      }));
      
      const { error } = await supabase
        .from("process_movements")
        .insert(movementsData);
        
      if (error) {
        console.error("Error inserting movements batch:", error);
        return false;
      }
      
      console.log(`All ${movements.length} movements successfully inserted`);
      return true;
    }
    
    // For larger sets, save movements in batches of 10
    const batchSize = 10;
    let successCount = 0;
    
    for (let i = 0; i < movements.length; i += batchSize) {
      const batch = movements.slice(i, Math.min(i + batchSize, movements.length));
      const batchData = batch.map(movement => ({
        process_id: processId,
        hit_id: hitId || null,
        codigo: movement.codigo, 
        nome: movement.nome || "",
        data_hora: movement.dataHora,
        tipo: movement.tipo || "",
        complemento: Array.isArray(movement.complemento) 
          ? movement.complemento.join(", ") 
          : (movement.complemento || ""),
        complementos_tabelados: movement.complementosTabelados || [],
        orgao_julgador: movement.orgaoJulgador || {},
        movimento_principal_id: null,
        json_completo: movement,
        user_id: user.id
      }));
      
      try {
        const { error } = await supabase
          .from("process_movements")
          .insert(batchData);
          
        if (error) {
          console.error(`Error inserting batch ${i/batchSize + 1}:`, error);
        } else {
          successCount += batch.length;
          console.log(`Batch ${i/batchSize + 1} inserted successfully (${batch.length} movements)`);
        }
      } catch (err) {
        console.error(`Error processing batch ${i/batchSize + 1}:`, err);
      }
      
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`Inserted ${successCount} out of ${movements.length} movements`);
    return successCount > 0;
  } catch (error) {
    console.error("Error inserting process movements:", error);
    return false;
  }
}

// Function to get movements by process ID
export async function getMovementsByProcessId(processId: string) {
  try {
    const { data, error } = await supabase
      .from("process_movements")
      .select("*")
      .eq("process_id", processId)
      .order("data_hora", { ascending: false });

    if (error) {
      console.error("Error fetching movements:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching movements:", error);
    throw error;
  }
}
