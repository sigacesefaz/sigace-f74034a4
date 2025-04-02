
import { supabase } from "@/lib/supabase";

export interface Intimation {
  id: string;
  process_number: string;
  status: string;
  created_at: string;
  title: string;
  content: string;
  deadline?: string | null;
  process_id?: string;
  type?: "citation" | "subpoena" | "sentence" | "decision" | "defense" | "other";
  intimation_date: string;
  created_by?: string;
  court?: string;
  court_division?: string;
  receipt_file?: string;
  receipt_type?: string;
  receipt_data?: Uint8Array | null;
  receipt_mime_type?: string;
}

export async function getIntimations() {
  try {
    const { data, error } = await supabase
      .from('process_intimations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar intimações:', error);
    throw error;
  }
}

export async function getIntimation(id: string) {
  try {
    const { data, error } = await supabase
      .from('process_intimations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao buscar intimação ${id}:`, error);
    throw error;
  }
}

export async function createIntimation(intimationData: Omit<Intimation, 'id' | 'created_at'>) {
  try {
    console.log("Starting createIntimation with data:", { 
      ...intimationData, 
      receipt_file: intimationData.receipt_file ? "FILE_PRESENT" : null
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    intimationData.created_by = user.id;
    
    if (!intimationData.type || !isValidIntimationType(intimationData.type)) {
      console.log("Tipo de intimação inválido ou não especificado, usando 'other'");
      intimationData.type = "other";
    }
    
    const processData = await handleProcessConnection(intimationData, user.id);
    intimationData.process_id = processData.process_id;
    intimationData.process_number = processData.process_number;
    
    if (!intimationData.court_division) {
      intimationData.court_division = intimationData.court || "Vara Geral";
    }

    if (!intimationData.intimation_date) {
      intimationData.intimation_date = new Date().toISOString();
    }
    
    let processedData = { ...intimationData };
    
    if (!processedData.deadline || processedData.deadline === "") {
      processedData.deadline = null;
    } else {
      try {
        const deadlineDate = new Date(processedData.deadline);
        if (isNaN(deadlineDate.getTime())) {
          processedData.deadline = null;
        }
      } catch (e) {
        processedData.deadline = null;
      }
    }

    let receipt_file_name = null;
    let receipt_mime_type = null;
    let receipt_data = null;
    
    if (processedData.receipt_file && typeof processedData.receipt_file !== 'string') {
      const file = processedData.receipt_file as unknown as File;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Tipo de arquivo não permitido. Formatos aceitos: PDF, JPG, PNG");
      }
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        receipt_data = new Uint8Array(arrayBuffer);
        receipt_file_name = file.name;
        receipt_mime_type = file.type;
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        throw error;
      }
    }

    if (processedData.receipt_file && typeof processedData.receipt_file !== 'string') {
      delete processedData.receipt_file;
    }

    const finalData = {
      ...processedData,
      receipt_file: receipt_file_name,
      receipt_mime_type: receipt_mime_type,
      receipt_data: receipt_data
    };

    Object.keys(finalData).forEach(key => {
      if (finalData[key] === undefined) {
        delete finalData[key];
      }
    });

    console.log("Enviando dados para criar intimação:", { 
      ...finalData, 
      process_id: finalData.process_id,
      receipt_data: finalData.receipt_data ? "BINARY_DATA" : null 
    });

    const { data, error } = await supabase
      .from('process_intimations')
      .insert(finalData)
      .select()
      .single();

    if (error) {
      console.error("Erro durante insert:", error);
      throw error;
    }
    
    console.log("Intimação criada com sucesso:", data);
    return data;
  } catch (error) {
    console.error('Erro ao criar intimação:', error);
    throw error;
  }
}

async function handleProcessConnection(intimationData: any, userId: string) {
  console.log("Handling process connection with data:", { 
    process_id: intimationData.process_id,
    process_number: intimationData.process_number
  });
  
  if (intimationData.process_id && isValidUUID(intimationData.process_id)) {
    console.log("Valid process_id provided:", intimationData.process_id);
    
    const { data: processExists } = await supabase
      .from('processes')
      .select('id, number')
      .eq('id', intimationData.process_id)
      .maybeSingle();
    
    if (processExists) {
      console.log("Process exists, using it:", processExists);
      return { 
        process_id: processExists.id, 
        process_number: processExists.number || intimationData.process_number 
      };
    } else {
      console.log("Process ID provided but not found in database");
    }
  }

  if (intimationData.process_number && intimationData.process_number.trim() !== '') {
    console.log("Using process_number to find process:", intimationData.process_number);
    
    const { data: existingProcess } = await supabase
      .from('processes')
      .select('id')
      .eq('number', intimationData.process_number)
      .maybeSingle();
      
    if (existingProcess) {
      console.log("Existing process found:", existingProcess);
      return { process_id: existingProcess.id, process_number: intimationData.process_number };
    }
    
    console.log("Process not found, creating a minimal record");
    const { data: newProcess, error } = await supabase
      .from('processes')
      .insert({
        number: intimationData.process_number,
        title: intimationData.title || 'Intimação',
        description: intimationData.content || 'Intimação automática',
        court: intimationData.court || 'Não informado',
        status: 'pending',
        user_id: userId
      })
      .select()
      .single();
        
    if (error) {
      console.error("Error creating process:", error);
      throw new Error("Não foi possível criar o processo relacionado à intimação");
    }
      
    if (newProcess) {
      console.log("New process created:", newProcess);
      return { process_id: newProcess.id, process_number: intimationData.process_number };
    }
  }
  
  throw new Error("É necessário informar um número de processo válido");
}

export async function updateIntimation(id: string, updates: Partial<Intimation>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    updates.updated_by = user.id;
    
    if (updates.type && !isValidIntimationType(updates.type)) {
      console.log("Tipo de intimação inválido, usando 'other'");
      updates.type = "other";
    }
    
    if (updates.process_id && !isValidUUID(updates.process_id)) {
      delete updates.process_id;
    }
    
    if (updates.court && !updates.court_division) {
      updates.court_division = updates.court;
    }

    if (!updates.intimation_date) {
      updates.intimation_date = new Date().toISOString();
    }
    
    let processedUpdates = { ...updates };
    
    if (processedUpdates.deadline === "") {
      delete processedUpdates.deadline;
    } else if (processedUpdates.deadline) {
      try {
        const deadlineDate = new Date(processedUpdates.deadline);
        if (isNaN(deadlineDate.getTime())) {
          delete processedUpdates.deadline;
        }
      } catch (e) {
        delete processedUpdates.deadline;
      }
    }

    let receipt_file_name = null;
    let receipt_mime_type = null;
    let receipt_data = null;
    
    if (processedUpdates.receipt_file && typeof processedUpdates.receipt_file !== 'string') {
      const file = processedUpdates.receipt_file as unknown as File;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Tipo de arquivo não permitido. Formatos aceitos: PDF, JPG, PNG");
      }
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        receipt_data = new Uint8Array(arrayBuffer);
        receipt_file_name = file.name;
        receipt_mime_type = file.type;
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
        throw error;
      }
    }

    if (processedUpdates.receipt_file && typeof processedUpdates.receipt_file !== 'string') {
      delete processedUpdates.receipt_file;
    }

    const { data, error } = await supabase
      .from('process_intimations')
      .update({
        ...processedUpdates,
        receipt_file: receipt_file_name,
        receipt_mime_type: receipt_mime_type,
        receipt_data: receipt_data
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar intimação ${id}:`, error);
    throw error;
  }
}

export async function deleteIntimation(id: string) {
  try {
    console.log("[deleteIntimation] Iniciando exclusão da intimação ID:", id);
    
    if (!id) {
      console.error("[deleteIntimation] ID de intimação não fornecido");
      throw new Error("ID de intimação não fornecido");
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("[deleteIntimation] Usuário não autenticado");
      throw new Error("Usuário não autenticado");
    }
    
    console.log("[deleteIntimation] Usuário autenticado:", user.id);
    
    // First, check if the record exists
    const { data: existingRecord, error: checkError } = await supabase
      .from('process_intimations')
      .select('id')
      .eq('id', id)
      .maybeSingle();
      
    if (checkError) {
      console.error("[deleteIntimation] Erro ao verificar existência da intimação:", checkError);
      throw checkError;
    }
    
    if (!existingRecord) {
      console.error("[deleteIntimation] Intimação não encontrada com ID:", id);
      throw new Error(`Intimação com ID ${id} não encontrada.`);
    }
    
    console.log("[deleteIntimation] Intimação encontrada, executando exclusão para ID:", id);
    
    // Now proceed with deletion
    const { data, error } = await supabase
      .from('process_intimations')
      .delete()
      .eq('id', id)
      .select();
      
    if (error) {
      console.error("[deleteIntimation] Erro ao excluir:", error);
      throw error;
    }
    
    // Double-check that something was deleted
    if (!data || data.length === 0) {
      console.error("[deleteIntimation] Nenhum registro foi excluído após tentativa");
      throw new Error("Falha ao excluir intimação mesmo após verificar sua existência.");
    }
    
    console.log("[deleteIntimation] Registro excluído com sucesso:", data);
    
    return { success: true, data };
  } catch (error) {
    console.error(`[deleteIntimation] Erro ao excluir intimação ${id}:`, error);
    throw error;
  }
}

function isValidUUID(uuid: string) {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

function isValidIntimationType(type: string): boolean {
  const validTypes = ["citation", "subpoena", "sentence", "decision", "defense", "other"];
  return validTypes.includes(type);
}
