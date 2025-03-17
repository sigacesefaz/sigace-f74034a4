
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ProcessUpdateHistory } from "@/types/process";

export async function updateProcess(processId: string | number, courtEndpoint?: string): Promise<boolean> {
  try {
    toast.loading("Updating process...");
    
    const { data, error } = await supabase.functions.invoke("update-process", {
      body: { processId, courtEndpoint }
    });
    
    if (error) {
      console.error("Error updating process:", error);
      toast.dismiss();
      toast.error(`Error updating process: ${error.message}`);
      return false;
    }
    
    toast.dismiss();
    
    if (data.newHits > 0) {
      toast.success(`Process updated successfully! ${data.newHits} new movement(s) found.`);
    } else {
      toast.success("Process updated, but no new movements found.");
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateProcess:", error);
    toast.dismiss();
    toast.error("Error updating process");
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
