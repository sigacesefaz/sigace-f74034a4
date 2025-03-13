
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";

// Function to save the movements of a process
export async function saveProcessMovements(processId: string | number, movements: DatajudProcess["movimentos"]) {
  if (!movements || movements.length === 0) return;
  
  try {
    // Prepare movements for batch insertion
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < movements.length; i += batchSize) {
      const batch = movements.slice(i, i + batchSize).map(movement => ({
        process_id: processId,
        codigo: movement.codigo, 
        nome: movement.nome || "",
        data_hora: movement.dataHora,
        tipo: movement.tipo || "",
        complemento: Array.isArray(movement.complemento) ? movement.complemento.join(", ") : (movement.complemento || ""),
        complementos_tabelados: movement.complementosTabelados || [],
        orgao_julgador: movement.orgaoJulgador || {},
        movimento_principal_id: null,
        json_completo: movement
      }));
      
      batches.push(batch);
    }
    
    // Insert batches in parallel
    await Promise.all(batches.map(async batch => {
      const { error } = await supabase
        .from("process_movements")
        .insert(batch);
        
      if (error) {
        console.error("Error inserting movement batch:", error);
      }
    }));
    
    // Process tabled complements in a second pass
    for (const movement of movements) {
      if (movement.complementosTabelados && Array.isArray(movement.complementosTabelados) && movement.complementosTabelados.length > 0) {
        // Get the ID of the main movement
        const { data: insertedMovement } = await supabase
          .from("process_movements")
          .select("id")
          .eq("process_id", processId)
          .eq("codigo", movement.codigo)
          .eq("data_hora", movement.dataHora)
          .order("id", { ascending: false })
          .limit(1)
          .single();
          
        if (insertedMovement) {
          const complementoBatches = [];
          
          for (let i = 0; i < movement.complementosTabelados.length; i += batchSize) {
            const complementoBatch = movement.complementosTabelados.slice(i, i + batchSize).map(complemento => ({
              process_id: processId,
              codigo: complemento.codigo || movement.codigo,
              nome: complemento.nome || complemento.descricao || "Complemento",
              data_hora: movement.dataHora,
              tipo: "COMPLEMENTO_TABELADO",
              complemento: complemento.descricao || "",
              complementos_tabelados: [],
              orgao_julgador: movement.orgaoJulgador || {},
              movimento_principal_id: insertedMovement.id,
              json_completo: complemento
            }));
            
            complementoBatches.push(complementoBatch);
          }
          
          // Insert complement batches in parallel
          await Promise.all(complementoBatches.map(async batch => {
            const { error } = await supabase
              .from("process_movements")
              .insert(batch);
              
            if (error) {
              console.error("Error inserting complement batch:", error);
            }
          }));
        }
      }
    }
  } catch (error) {
    console.error("Error inserting process movements:", error);
  }
}

// Function to get movements by process ID
export async function getMovementsByProcessId(processId: string) {
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
}
