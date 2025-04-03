
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ProcessUpdateHistory } from "@/types/process";

export async function updateProcess(processId: string | number, courtEndpoint?: string): Promise<boolean> {
  try {
    toast.loading("Atualizando processo...");
    
    const { data, error } = await supabase.functions.invoke("update-process", {
      body: { processId, courtEndpoint }
    });
    
    if (error) {
      console.error("Erro ao atualizar processo:", error);
      toast.dismiss();
      toast.error(`Erro ao atualizar processo: ${error.message}`);
      return false;
    }
    
    toast.dismiss();
    
    if (data.newHits > 0) {
      toast.success(`Processo atualizado com sucesso! ${data.newHits} nova(s) movimentação(ões) encontrada(s).`);
    } else {
      toast.success("Processo atualizado, mas nenhuma nova movimentação encontrada.");
    }
    
    return true;
  } catch (error) {
    console.error("Erro em updateProcess:", error);
    toast.dismiss();
    toast.error("Erro ao atualizar processo");
    return false;
  }
}

export async function getProcessUpdateHistory(processId: string | number): Promise<ProcessUpdateHistory[]> {
  try {
    const { data, error } = await supabase
      .from("process_update_history")
      .select("*")
      .eq("process_id", processId)
      .order("update_date", { ascending: false });
    
    if (error) {
      console.error("Error fetching process update history:", error);
      throw error;
    }
    
    // Cast the data to ProcessUpdateHistory type
    return (data || []) as ProcessUpdateHistory[];
  } catch (error) {
    console.error("Error in getProcessUpdateHistory:", error);
    throw error;
  }
}

export async function getSystemConfiguration() {
  try {
    const { data, error } = await supabase
      .from("system_configuration")
      .select("*")
      .single();
    
    if (error) {
      console.error("Error fetching system configuration:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getSystemConfiguration:", error);
    throw error;
  }
}

export async function updateSystemConfiguration(updates: any) {
  try {
    const { data, error } = await supabase
      .from("system_configuration")
      .update(updates)
      .eq("id", updates.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating system configuration:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in updateSystemConfiguration:", error);
    throw error;
  }
}
