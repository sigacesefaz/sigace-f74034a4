
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";
import { toast } from "@/hooks/use-toast";
import { saveProcessMovements } from "./process-movements";
import { saveProcessSubjects } from "./process-subjects";
import { saveProcessDetails } from "./process-details";
import { saveProcessParties } from "./process-parties";

export async function saveProcess(processMovimentos: any[], selectedCourt: string, setImportProgress: (progress: number) => void) {
  if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
    toast("Dados do processo incompletos", "", { variant: "destructive" });
    return false;
  }
  
  setImportProgress(5); // Start progress bar
  
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    
    if (!user) {
      toast("Usuário não autenticado", "", { variant: "destructive" });
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
      toast("Este processo já foi cadastrado anteriormente", "", { variant: "destructive" });
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plaintiff: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.nome || "",
      plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || "",
      is_parent: true,
      parent_id: null,
      metadata: JSON.stringify(mainProcess)
    });

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
        parent_id: null,
        metadata: JSON.stringify(mainProcess)
      })
      .select('id')
      .single();
      
    setImportProgress(40);

    if (insertError) {
      console.error("Error inserting main process:", insertError);
      console.error("Error details:", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      toast("Erro ao importar processo", { 
        description: insertError.message,
        variant: "destructive" 
      });
      setImportProgress(0);
      return false;
    }

    if (!newProcess?.id) {
      toast("Erro ao obter ID do processo principal criado", "", { variant: "destructive" });
      setImportProgress(0);
      return false;
    }

    const mainProcessId = newProcess.id;
    
    setImportProgress(50);

    // Store main process details
    await saveProcessDetails(mainProcessId, mainProcess);
    setImportProgress(60);

    // Process movements and subjects in parallel to optimize
    setImportProgress(65);
    
    const savePromises = [];
    
    // Process the main process movements
    if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
      savePromises.push(saveProcessMovements(mainProcessId, mainProcess.movimentos));
    }
    
    // Process the main process subjects
    if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
      savePromises.push(saveProcessSubjects(mainProcessId, mainProcess.assuntos));
    }
    
    // Process the main process parties
    if (mainProcess.partes && mainProcess.partes.length > 0) {
      savePromises.push(saveProcessParties(mainProcessId, mainProcess.partes));
    }
    
    // Wait for all parallel operations to complete
    await Promise.all(savePromises);
    setImportProgress(90);
    
    // Process additional procedural movements (same process number, but different movements)
    if (processMovimentos.length > 1) {
      // Here we attach all additional movements to the main process
      // instead of creating separate processes
      for (let i = 1; i < processMovimentos.length; i++) {
        const additionalMovimento = processMovimentos[i];
        const additionalProcess = additionalMovimento.process;
        
        // Check if there are additional movements and add them to the main process
        if (additionalProcess.movimentos && additionalProcess.movimentos.length > 0) {
          await saveProcessMovements(mainProcessId, additionalProcess.movimentos);
        }
      }
    }
    
    setImportProgress(100);

    toast("Processo importado com sucesso", "", { variant: "success" });
    return true;
  } catch (error) {
    console.error("Error importing process:", error);
    
    // Display more detailed error message
    if (error instanceof Error) {
      toast("Erro ao importar processo", error.message, { variant: "destructive" });
    } else {
      toast("Erro ao importar processo", "", { variant: "destructive" });
    }
    
    setImportProgress(0);
    return false;
  }
}

export async function createManualProcess(processData: any) {
  try {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) {
      toast("Usuário não autenticado", "", { variant: "destructive" });
      return false;
    }

    // Check if the process already exists
    const { data: existingProcess } = await supabase
      .from("processes")
      .select("id")
      .eq("number", processData.number)
      .maybeSingle();

    if (existingProcess) {
      toast("Este processo já foi cadastrado anteriormente", "", { variant: "destructive" });
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
    
    toast("Processo cadastrado com sucesso", "", { variant: "success" });
    return true;
  } catch (error) {
    console.error("Error registering process:", error);
    toast("Erro ao cadastrar processo", "", { variant: "destructive" });
    return false;
  }
}

// Function to delete a process and its related data
export async function deleteProcess(processId: string) {
  try {
    // First delete related data
    await supabase.from('process_movements').delete().eq('process_id', processId);
    await supabase.from('process_subjects').delete().eq('process_id', processId);
    await supabase.from('process_details').delete().eq('process_id', processId);
    await supabase.from('process_parties').delete().eq('process_id', processId);
    
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

// Function to get all processes
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

// Function to get a process by ID
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
