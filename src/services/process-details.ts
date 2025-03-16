
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";

// Function to save the details of a process
export async function saveProcessDetails(processId: string | number, processData: DatajudProcess) {
  try {
    console.log("Saving process details for process ID:", processId);
    
    // Get the current user to set as user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    // First check if details already exist
    const { data: existingDetails } = await supabase
      .from("process_details")
      .select("id")
      .eq("process_id", processId)
      .maybeSingle();
      
    if (existingDetails) {
      console.log("Process details already exist, skipping insertion");
      return true;
    }
    
    const { error: detailsError } = await supabase
      .from("process_details")
      .insert({
        process_id: processId,
        tribunal: processData.tribunal,
        data_ajuizamento: processData.dataAjuizamento,
        grau: processData.grau,
        nivel_sigilo: processData.nivelSigilo,
        formato: processData.formato,
        sistema: processData.sistema,
        classe: processData.classe,
        assuntos: processData.assuntos,
        orgao_julgador: processData.orgaoJulgador,
        movimentos: processData.movimentos,
        partes: processData.partes,
        data_hora_ultima_atualizacao: processData.dataHoraUltimaAtualizacao,
        json_completo: processData,
        user_id: user.id
      });
      
    if (detailsError) {
      console.error("Error inserting process details:", detailsError);
      throw detailsError;
    }
    
    console.log("Process details saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving process details:", error);
    throw error;
  }
}

// Function to get process details by process ID
export async function getProcessDetailsById(processId: string) {
  try {
    const { data, error } = await supabase
      .from("process_details")
      .select("*")
      .eq("process_id", processId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching process details:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching process details:", error);
    throw error;
  }
}
