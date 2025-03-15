
import { supabase } from "@/lib/supabase";
import { PartyType } from "@/types/process";
import { DatajudProcess } from "@/types/datajud";

// Function to save the parties of a process
export async function saveProcessParties(processId: string | number, parties: any[]) {
  if (!parties || parties.length === 0) return;
  
  try {
    // Get the current user to set as user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const partiesData = parties.map(party => ({
      process_id: processId,
      name: party.nome || party.name || "",
      type: party.papel || party.type || "",
      person_type: party.personType || party.tipoPessoa || "",
      document: party.documento || party.document || "",
      subtype: party.subtype || "",
      user_id: user.id
    }));
    
    const { error } = await supabase
      .from("parties")
      .insert(partiesData);
      
    if (error) {
      console.error("Error inserting parties:", error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error inserting process parties:", error);
    throw error;
  }
}

export async function getPartiesByProcessId(processId: string) {
  try {
    const { data, error } = await supabase
      .from("parties")
      .select("*")
      .eq("process_id", processId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching parties:", error);
      throw error;
    }

    return data as PartyType[];
  } catch (error) {
    console.error("Error fetching parties:", error);
    throw error;
  }
}

export async function createParty(partyData: Omit<PartyType, "id"> & { process_id: string }) {
  try {
    // Get the current user to set as user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from("parties")
      .insert({
        ...partyData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating party:", error);
      throw error;
    }

    return data as PartyType;
  } catch (error) {
    console.error("Error creating party:", error);
    throw error;
  }
}

export async function updateParty(id: string, partyData: Partial<Omit<PartyType, "id">>) {
  try {
    const { data, error } = await supabase
      .from("parties")
      .update(partyData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating party:", error);
      throw error;
    }

    return data as PartyType;
  } catch (error) {
    console.error("Error updating party:", error);
    throw error;
  }
}

export async function deleteParty(id: string) {
  try {
    const { error } = await supabase
      .from("parties")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting party:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting party:", error);
    throw error;
  }
}
