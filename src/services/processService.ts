import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";
import { toast } from "sonner";
import { saveProcessMovements } from "./process-movements";
import { saveProcessSubjects } from "./process-subjects";
import { saveProcessDetails } from "./process-details";
import { saveProcessParties } from "./process-parties";

export async function saveProcess(processMovimentos: any[], selectedCourt: string, setImportProgress: (progress: number) => void) {
  if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
    toast.error("Dados do processo incompletos");
    return false;
  }
  
  setImportProgress(5); // Start progress bar
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Usuário não autenticado");
      setImportProgress(0);
      return false;
    }

    // Get the main process (first procedural movement)
    const mainMovimento = processMovimentos[0];
    const mainProcess = mainMovimento.process;
    
    setImportProgress(10);

    // Check if the process already exists
    const { data: existingProcess } = await supabase
      .from("processes")
      .select("id")
      .eq("number", mainProcess.numeroProcesso)
      .maybeSingle();

    if (existingProcess) {
      toast.error("Este processo já foi cadastrado anteriormente");
      setImportProgress(0);
      return false;
    }
    
    setImportProgress(20);

    console.log("Process data to be inserted:", {
      number: mainProcess.numeroProcesso,
      title: `${mainProcess.classe?.nome || 'Processo'} - ${mainProcess.numeroProcesso}`,
      description: mainProcess.assuntos?.map(a => a.nome).join(", ") || "",
      status: mainProcess.situacao?.nome || "Em andamento",
      court: mainProcess.tribunal,
      user_id: user.id,
      plaintiff: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.nome || "",
      plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || ""
    });

    // Insert the main process - STEP 1
    const { data: newProcess, error: insertError } = await supabase
      .from("processes")
      .insert({
        number: mainProcess.numeroProcesso,
        title: `${mainProcess.classe?.nome || 'Processo'} - ${mainProcess.numeroProcesso}`,
        description: mainProcess.assuntos?.map(a => a.nome).join(", ") || "",
        status: mainProcess.situacao?.nome || "Em andamento",
        court: mainProcess.tribunal,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        plaintiff: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.nome || "",
        plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || "",
        is_parent: true,
        parent_id: null
      })
      .select()
      .single();
      
    setImportProgress(30);

    if (insertError) {
      console.error("Error inserting main process:", insertError);
      toast.error(`Erro ao importar processo: ${insertError.message}`);
      setImportProgress(0);
      return false;
    }

    if (!newProcess?.id) {
      toast.error("Erro ao obter ID do processo principal criado");
      setImportProgress(0);
      return false;
    }

    const mainProcessId = newProcess.id;
    console.log("Main process created with ID:", mainProcessId);
    
    // STEP 2: Store process details
    try {
      console.log("Saving process details for ID:", mainProcessId);
      const saveDetailsResult = await saveProcessDetails(mainProcessId, mainProcess);
      console.log("Process details saved:", saveDetailsResult);
    } catch (error) {
      console.error("Error saving process details:", error);
      // Continue with the import even if details fail
    }
    
    setImportProgress(50);

    // STEP 3: Store process parties
    try {
      if (mainProcess.partes && mainProcess.partes.length > 0) {
        console.log("Saving process parties:", mainProcess.partes.length);
        const savePartiesResult = await saveProcessParties(mainProcessId, mainProcess.partes);
        console.log("Process parties saved:", savePartiesResult);
      }
    } catch (error) {
      console.error("Error saving process parties:", error);
      // Continue with the import even if parties fail
    }

    setImportProgress(70);

    // STEP 4: Create a hit record for the main process
    let mainHitId: string | null = null;
    try {
      console.log("Creating main hit for process ID:", mainProcessId);
      const { data: newHit, error: hitError } = await supabase
        .from("process_hits")
        .insert({
          process_id: mainProcessId,
          hit_id: mainMovimento.id || '',
          hit_score: mainMovimento.score || 0,
          tribunal: mainProcess.tribunal,
          numero_processo: mainProcess.numeroProcesso,
          data_ajuizamento: mainProcess.dataAjuizamento,
          grau: mainProcess.grau,
          nivel_sigilo: mainProcess.nivelSigilo || 0,
          formato: mainProcess.formato,
          sistema: mainProcess.sistema,
          classe: mainProcess.classe,
          orgao_julgador: mainProcess.orgaoJulgador,
          data_hora_ultima_atualizacao: mainProcess.dataHoraUltimaAtualizacao,
          valor_causa: mainProcess.valorCausa,
          situacao: mainProcess.situacao,
          user_id: user.id
        })
        .select()
        .single();
        
      if (hitError) {
        console.error("Error saving main hit:", hitError);
      } else {
        console.log("Main hit saved with ID:", newHit.id);
        mainHitId = newHit.id;
      }
    } catch (error) {
      console.error("Error creating main hit:", error);
    }
    
    setImportProgress(80);

    // STEP 5: Store movements
    if (mainHitId && mainProcess.movimentos && mainProcess.movimentos.length > 0) {
      try {
        console.log("Saving process movements:", mainProcess.movimentos.length);
        const saveMovementsResult = await saveProcessMovements(mainProcessId, mainProcess.movimentos, mainHitId);
        console.log("Process movements saved:", saveMovementsResult);
      } catch (error) {
        console.error("Error saving process movements:", error);
      }
    }
    
    setImportProgress(90);

    // STEP 6: Store subjects
    if (mainHitId && mainProcess.assuntos && mainProcess.assuntos.length > 0) {
      try {
        console.log("Saving process subjects:", mainProcess.assuntos.length);
        const saveSubjectsResult = await saveProcessSubjects(mainProcessId, mainProcess.assuntos, mainHitId);
        console.log("Process subjects saved:", saveSubjectsResult);
      } catch (error) {
        console.error("Error saving process subjects:", error);
      }
    }
    
    setImportProgress(100);
    
    toast.success("Processo importado com sucesso");
    return true;
  } catch (error) {
    console.error("Error importing process:", error);
    
    if (error instanceof Error) {
      toast.error(`Erro ao importar processo: ${error.message}`);
    } else {
      toast.error("Erro ao importar processo");
    }
    
    setImportProgress(0);
    return false;
  }
}

export async function createManualProcess(processData: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Usuário não autenticado");
      return false;
    }

    // Check if the process already exists
    const { data: existingProcess } = await supabase
      .from("processes")
      .select("id")
      .eq("number", processData.number)
      .maybeSingle();

    if (existingProcess) {
      toast.error("Este processo já foi cadastrado anteriormente");
      return false;
    }
    
    const {
      error
    } = await supabase.from("processes").insert({
      ...processData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user.id,
      is_parent: true,
      parent_id: null
    });
    
    if (error) throw error;
    
    toast.success("Processo cadastrado com sucesso");
    return true;
  } catch (error) {
    console.error("Error registering process:", error);
    toast.error("Erro ao cadastrar processo");
    return false;
  }
}

export async function deleteProcess(processId: string) {
  try {
    // First delete related data - these will cascade due to our FK constraints
    // but we're being explicit to ensure data is properly cleaned up
    await supabase.from('process_movements').delete().eq('process_id', processId);
    await supabase.from('process_subjects').delete().eq('process_id', processId);
    await supabase.from('process_details').delete().eq('process_id', processId);
    await supabase.from('process_parties').delete().eq('process_id', processId);
    await supabase.from('process_hits').delete().eq('process_id', processId);
    await supabase.from('process_judicial_decisions').delete().eq('process_id', processId);
    
    // Then delete the process itself
    const { error } = await supabase.from('processes').delete().eq('id', processId);
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting process:", error);
    throw error;
  }
}

export async function getProcesses() {
  try {
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching processes:", error);
    throw error;
  }
}

export async function getProcessById(processId: string) {
  try {
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .eq('id', processId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching process:", error);
    throw error;
  }
}
