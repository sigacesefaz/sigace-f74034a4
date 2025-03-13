
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";

// Function to save the details of a process
export async function saveProcessDetails(processId: string | number, processData: DatajudProcess) {
  try {
    const { error: detailsError } = await supabase
      .from("process_details")
      .insert({
        process_id: processId,
        tribunal: processData.tribunal,
        data_ajuizamento: processData.dataAjuizamento,
        grau: processData.grau,
        nivele_sigilo: processData.nivelSigilo,
        formato: processData.formato,
        sistema: processData.sistema,
        classe: processData.classe,
        assuntos: processData.assuntos,
        orgao_julgador: processData.orgaoJulgador,
        movimentos: processData.movimentos,
        partes: processData.partes,
        data_hora_ultima_atualizacao: processData.dataHoraUltimaAtualizacao,
        json_completo: processData
      });
      
    if (detailsError) {
      console.error("Error inserting process details:", detailsError);
      throw detailsError;
    }
    
    return true;
  } catch (error) {
    console.error("Error saving process details:", error);
    return false;
  }
}

// Function to get process details by process ID
export async function getProcessDetailsById(processId: string) {
  const { data, error } = await supabase
    .from("process_details")
    .select("*")
    .eq("process_id", processId)
    .single();

  if (error) {
    console.error("Error fetching process details:", error);
    throw error;
  }

  return data;
}
