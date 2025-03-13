
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";
import { toast } from "@/hooks/use-toast";

export async function saveProcess(processMovimentos: any[], selectedCourt: string, setImportProgress: (progress: number) => void) {
  if (!processMovimentos || processMovimentos.length === 0 || !selectedCourt) {
    toast("Dados do processo incompletos", "", { variant: "destructive" });
    return false;
  }
  
  setImportProgress(5); // Iniciar a barra de progresso
  
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

    // Obter o processo principal (primeiro movimento processual)
    const mainMovimento = processMovimentos[0];
    const mainProcess = mainMovimento.process;
    
    setImportProgress(10);

    // Verificar se o processo já existe
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

    console.log("Dados do processo a ser inserido:", {
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
      metadata: JSON.stringify(mainProcess) // Convertendo o objeto para string
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
        metadata: JSON.stringify(mainProcess) // Convertendo o objeto para string
      })
      .select('id')
      .single();
      
    setImportProgress(40);

    if (insertError) {
      console.error("Erro ao inserir processo principal:", insertError);
      console.error("Detalhes do erro:", {
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

    // Armazenar os detalhes do processo principal
    try {
      const { error: detailsError } = await supabase
        .from("process_details")
        .insert({
          process_id: mainProcessId,
          tribunal: mainProcess.tribunal,
          data_ajuizamento: mainProcess.dataAjuizamento,
          grau: mainProcess.grau,
          nivele_sigilo: mainProcess.nivelSigilo,
          formato: mainProcess.formato,
          sistema: mainProcess.sistema,
          classe: mainProcess.classe,
          assuntos: mainProcess.assuntos,
          orgao_julgador: mainProcess.orgaoJulgador,
          movimentos: mainProcess.movimentos,
          partes: mainProcess.partes,
          data_hora_ultima_atualizacao: mainProcess.dataHoraUltimaAtualizacao,
          json_completo: mainProcess // Armazenar o JSON completo
        });
        
      setImportProgress(60);

      if (detailsError) {
        console.error("Erro ao inserir detalhes do processo principal:", detailsError);
      }
    } catch (error) {
      console.error("Erro ao inserir detalhes do processo principal:", error);
    }

    // Processar os movimentos e assuntos em paralelo para otimizar
    setImportProgress(65);
    
    const savePromises = [];
    
    // Processar os movimentos do processo principal
    if (mainProcess.movimentos && mainProcess.movimentos.length > 0) {
      savePromises.push(saveProcessMovements(mainProcessId, mainProcess.movimentos));
    }
    
    // Processar os assuntos do processo principal
    if (mainProcess.assuntos && mainProcess.assuntos.length > 0) {
      savePromises.push(saveProcessSubjects(mainProcessId, mainProcess.assuntos));
    }
    
    // Processar as partes do processo principal
    if (mainProcess.partes && mainProcess.partes.length > 0) {
      savePromises.push(saveProcessParties(mainProcessId, mainProcess.partes));
    }
    
    // Esperar todas as operações paralelas terminarem
    await Promise.all(savePromises);
    setImportProgress(90);
    
    // Processar os movimentos processuais adicionais (mesma numeração processual, mas diferentes movimentos)
    if (processMovimentos.length > 1) {
      // Aqui vamos anexar todos os movimentos adicionais ao processo principal
      // em vez de criar processos separados
      for (let i = 1; i < processMovimentos.length; i++) {
        const additionalMovimento = processMovimentos[i];
        const additionalProcess = additionalMovimento.process;
        
        // Verificamos se tem movimentos adicionais e adicionamos ao processo principal
        if (additionalProcess.movimentos && additionalProcess.movimentos.length > 0) {
          await saveProcessMovements(mainProcessId, additionalProcess.movimentos);
        }
      }
    }
    
    setImportProgress(100);

    toast("Processo importado com sucesso", "", { variant: "success" });
    return true;
  } catch (error) {
    console.error("Erro ao importar processo:", error);
    
    // Exibir mensagem de erro mais detalhada
    if (error instanceof Error) {
      toast("Erro ao importar processo", error.message, { variant: "destructive" });
    } else {
      toast("Erro ao importar processo", "", { variant: "destructive" });
    }
    
    setImportProgress(0);
    return false;
  }
}

// Função para salvar os movimentos de um processo
export async function saveProcessMovements(processId: string | number, movements: DatajudProcess["movimentos"]) {
  if (!movements || movements.length === 0) return;
  
  try {
    // Preparar todos os movimentos para inserção em batch (lotes)
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
    
    // Inserir os lotes em paralelo
    await Promise.all(batches.map(async batch => {
      const { error } = await supabase
        .from("process_movements")
        .insert(batch);
        
      if (error) {
        console.error("Erro ao inserir lote de movimentos:", error);
      }
    }));
    
    // Processar os complementos tabelados em uma segunda passagem
    // Este é um exemplo simplificado, você precisaria rastrear IDs
    for (const movement of movements) {
      if (movement.complementosTabelados && Array.isArray(movement.complementosTabelados) && movement.complementosTabelados.length > 0) {
        // Obter o ID do movimento principal
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
          
          // Inserir os lotes de complementos em paralelo
          await Promise.all(complementoBatches.map(async batch => {
            const { error } = await supabase
              .from("process_movements")
              .insert(batch);
              
            if (error) {
              console.error("Erro ao inserir lote de complementos:", error);
            }
          }));
        }
      }
    }
  } catch (error) {
    console.error("Erro ao inserir movimentos do processo:", error);
  }
}

// Função para salvar os assuntos de um processo
export async function saveProcessSubjects(processId: string | number, subjects: DatajudProcess["assuntos"]) {
  if (!subjects || subjects.length === 0) return;
  
  try {
    const subjectsData = subjects.map((subject, index) => ({
      process_id: processId,
      codigo: subject.codigo,
      nome: subject.nome || "",
      principal: index === 0 // Considerar o primeiro como principal
    }));
    
    const { error } = await supabase
      .from("process_subjects")
      .insert(subjectsData);
      
    if (error) {
      console.error("Erro ao inserir assuntos:", error);
    }
  } catch (error) {
    console.error("Erro ao inserir assuntos do processo:", error);
  }
}

// Função para salvar as partes do processo
export async function saveProcessParties(processId: string | number, parties: any[]) {
  if (!parties || parties.length === 0) return;
  
  try {
    const partiesData = parties.map(party => ({
      process_id: processId,
      nome: party.nome || "",
      papel: party.papel || "",
      tipo_pessoa: party.tipoPessoa || "",
      documento: party.documento || "",
      advogados: party.advogados || [],
      json_completo: party
    }));
    
    const { error } = await supabase
      .from("process_parties")
      .insert(partiesData);
      
    if (error) {
      console.error("Erro ao inserir partes:", error);
    }
  } catch (error) {
    console.error("Erro ao inserir partes do processo:", error);
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

    // Verificar se o processo já existe
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
    console.error("Erro ao cadastrar processo:", error);
    toast("Erro ao cadastrar processo", "", { variant: "destructive" });
    return false;
  }
}
