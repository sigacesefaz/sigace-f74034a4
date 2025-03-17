import { supabase } from "@/lib/supabase";
import { DatajudProcess, DatajudMovimentoProcessual } from "@/types/datajud";
import { toast } from "sonner";
import { saveProcessMovements } from "./process-movements";
import { saveProcessSubjects } from "./process-subjects";
import { saveProcessDetails } from "./process-details";
import { saveProcessParties } from "./process-parties";

export async function saveProcess(processMovimentos: DatajudMovimentoProcessual[], selectedCourt: string, setImportProgress: (progress: number) => void): Promise<boolean | 'PROCESS_EXISTS'> {
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
    const numeroProcesso = mainProcess.numeroProcesso;
    
    setImportProgress(10);

    // Check if the process already exists
    const { data: existingProcess } = await supabase
      .from("processes")
      .select("id")
      .eq("number", numeroProcesso)
      .maybeSingle();

    if (existingProcess) {
      toast.error("Este processo já foi cadastrado anteriormente");
      setImportProgress(0);
      return 'PROCESS_EXISTS';
    }
    
    setImportProgress(15);

    console.log("Process data to be inserted:", {
      number: numeroProcesso,
      title: `${mainProcess.classe?.nome || 'Processo'} - ${numeroProcesso}`,
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
        number: numeroProcesso,
        title: `${mainProcess.classe?.nome || 'Processo'} - ${numeroProcesso}`,
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
      
    setImportProgress(20);

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
    
    setImportProgress(30);

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

    setImportProgress(40);

    // STEP 4: Create hit records for EACH movimento processual
    // Esta é a principal mudança - salvar cada hit individual
    console.log(`Salvando ${processMovimentos.length} hits para o processo ${mainProcessId}`);
    const processedHits: string[] = [];
    let successfulHits = 0;
    
    for (let i = 0; i < processMovimentos.length; i++) {
      const movimento = processMovimentos[i];
      const hitId = movimento.id || '';
      
      // Verificar se já processamos este hit (evitar duplicidades)
      if (processedHits.includes(hitId)) {
        console.log(`Hit ${hitId} já foi processado, pulando...`);
        continue;
      }
      
      processedHits.push(hitId);
      
      try {
        console.log(`Salvando hit #${i+1}: ${hitId}`);
        const { data: newHit, error: hitError } = await supabase
          .from("process_hits")
          .insert({
            process_id: mainProcessId,
            hit_id: hitId,
            hit_score: movimento.score || 0,
            tribunal: movimento.process.tribunal,
            numero_processo: movimento.process.numeroProcesso,
            data_ajuizamento: movimento.process.dataAjuizamento,
            grau: movimento.process.grau,
            nivel_sigilo: movimento.process.nivelSigilo || 0,
            formato: movimento.process.formato,
            sistema: movimento.process.sistema,
            classe: movimento.process.classe,
            orgao_julgador: movimento.process.orgaoJulgador,
            data_hora_ultima_atualizacao: movimento.process.dataHoraUltimaAtualizacao,
            valor_causa: movimento.process.valorCausa,
            situacao: movimento.process.situacao,
            user_id: user.id
          })
          .select()
          .single();
          
        if (hitError) {
          console.error(`Erro ao salvar hit ${hitId}:`, hitError);
        } else {
          console.log(`Hit ${hitId} salvo com ID: ${newHit.id}`);
          successfulHits++;
          
          // STEP 5: Store movements for this hit
          if (movimento.process.movimentos && movimento.process.movimentos.length > 0) {
            try {
              console.log(`Salvando ${movimento.process.movimentos.length} movimentos para o hit ${newHit.id}`);
              const saveMovementsResult = await saveProcessMovements(
                mainProcessId, 
                movimento.process.movimentos, 
                newHit.id
              );
              console.log(`Movimentos salvos para hit ${hitId}:`, saveMovementsResult);
            } catch (movError) {
              console.error(`Erro ao salvar movimentos para hit ${hitId}:`, movError);
            }
          }
          
          // STEP 6: Store subjects for this hit
          if (movimento.process.assuntos && movimento.process.assuntos.length > 0) {
            try {
              console.log(`Salvando ${movimento.process.assuntos.length} assuntos para o hit ${newHit.id}`);
              const saveSubjectsResult = await saveProcessSubjects(
                mainProcessId, 
                movimento.process.assuntos, 
                newHit.id
              );
              console.log(`Assuntos salvos para hit ${hitId}:`, saveSubjectsResult);
            } catch (subError) {
              console.error(`Erro ao salvar assuntos para hit ${hitId}:`, subError);
            }
          }
        }
      } catch (error) {
        console.error(`Erro ao salvar hit ${hitId}:`, error);
      }
      
      // Atualizar o progresso com base no número de hits processados
      const progressStep = 50 / processMovimentos.length;
      setImportProgress(40 + Math.round((i + 1) * progressStep));
    }
    
    console.log(`Processamento completo: ${successfulHits} de ${processMovimentos.length} hits foram salvos com sucesso`);
    
    setImportProgress(100);
    
    if (successfulHits > 0) {
      toast.success(`Processo importado com sucesso (${successfulHits} movimento(s) processado(s))`);
      return true;
    } else {
      toast.error("Erro: Nenhum movimento processual foi salvo");
      return false;
    }
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
