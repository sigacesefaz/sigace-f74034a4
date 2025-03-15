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
      cnj_number: mainProcess.numeroProcesso,
      court_id: mainProcess.tribunal,
      instance: mainProcess.grau,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      plaintiff: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.nome || "",
      plaintiff_document: mainProcess.partes?.find(p => p.papel?.includes("AUTOR") || p.papel?.includes("REQUERENTE"))?.documento || "",
      is_parent: true,
      parent_id: null,
      metadata: JSON.stringify(mainProcess)
    });

    // Insert the main process
    const { data: newProcess, error: insertError } = await supabase
      .from("processes")
      .insert({
        number: mainProcess.numeroProcesso,
        title: `${mainProcess.classe?.nome || 'Processo'} - ${mainProcess.numeroProcesso}`,
        description: mainProcess.assuntos?.map(a => a.nome).join(", ") || "",
        status: mainProcess.situacao?.nome || "Em andamento",
        court: mainProcess.tribunal,
        cnj_number: mainProcess.numeroProcesso,
        court_id: mainProcess.tribunal,
        instance: mainProcess.grau,
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
    setImportProgress(55);

    // Store each hit (procedural movement)
    for (let i = 0; i < processMovimentos.length; i++) {
      const hitData = processMovimentos[i];
      const hitSource = hitData.process;
      
      // Save process hit
      const { data: newHit, error: hitError } = await supabase
        .from("process_hits")
        .insert({
          process_id: mainProcessId,
          hit_index: hitData.index || '',
          hit_id: hitData.id || '',
          hit_score: hitData.score || 0,
          tribunal: hitSource.tribunal,
          numero_processo: hitSource.numeroProcesso,
          data_ajuizamento: hitSource.dataAjuizamento,
          grau: hitSource.grau,
          nivel_sigilo: hitSource.nivelSigilo || 0,
          formato: hitSource.formato,
          sistema: hitSource.sistema,
          classe: hitSource.classe,
          orgao_julgador: hitSource.orgaoJulgador,
          data_hora_ultima_atualizacao: hitSource.dataHoraUltimaAtualizacao,
          valor_causa: hitSource.valorCausa,
          situacao: hitSource.situacao,
          user_id: user.id
        })
        .select('id')
        .single();
        
      if (hitError) {
        console.error(`Error saving hit ${i}:`, hitError);
        continue;
      }
      
      if (!newHit?.id) {
        console.error(`No ID returned for hit ${i}`);
        continue;
      }
      
      // Save hit-specific data
      const hitId = newHit.id;
      
      // Save movements for this hit
      if (hitSource.movimentos && hitSource.movimentos.length > 0) {
        for (const movimento of hitSource.movimentos) {
          try {
            const { error: movementError } = await supabase
              .from("process_movements")
              .insert({
                process_id: mainProcessId,
                hit_id: hitId,
                codigo: movimento.codigo,
                nome: movimento.nome || "",
                data_hora: movimento.dataHora,
                tipo: movimento.tipo || "",
                complemento: Array.isArray(movimento.complemento) ? movimento.complemento.join(", ") : (movimento.complemento || ""),
                complementos_tabelados: movimento.complementosTabelados || [],
                orgao_julgador: movimento.orgaoJulgador || {},
                json_completo: movimento,
                user_id: user.id
              });

            if (movementError) {
              console.error(`Error saving movement ${movimento.codigo}:`, movementError);
            }
          } catch (error) {
            console.error(`Error processing movement ${movimento.codigo}:`, error);
          }
        }
      }
      
      // Save subjects for this hit
      if (hitSource.assuntos && hitSource.assuntos.length > 0) {
        for (let j = 0; j < hitSource.assuntos.length; j++) {
          const assunto = hitSource.assuntos[j];
          try {
            const { error: subjectError } = await supabase
              .from("process_subjects")
              .insert({
                process_id: mainProcessId,
                hit_id: hitId,
                codigo: assunto.codigo,
                nome: assunto.nome || "",
                principal: j === 0, // First subject is primary
                user_id: user.id
              });

            if (subjectError) {
              console.error(`Error saving subject ${assunto.nome}:`, subjectError);
            }
          } catch (error) {
            console.error(`Error processing subject ${assunto.nome}:`, error);
          }
        }
      }
      
      setImportProgress(55 + Math.floor((i + 1) / processMovimentos.length * 35));
    }
    
    // Process the main process parties
    setImportProgress(90);
    if (mainProcess.partes && mainProcess.partes.length > 0) {
      await saveProcessParties(mainProcessId, mainProcess.partes);
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
