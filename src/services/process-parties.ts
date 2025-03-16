
import { supabase } from "@/lib/supabase";
import { Party } from "@/types/process";
import { DatajudProcess } from "@/types/datajud";

// Function to save the parties of a process
export async function saveProcessParties(processId: string | number, parties: any[]) {
  if (!parties || parties.length === 0) {
    console.log("No parties to save");
    return true;
  }
  
  try {
    console.log(`Saving ${parties.length} parties for process ID:`, processId);
    
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
      .from("process_parties")
      .insert(partiesData);
      
    if (error) {
      console.error("Error inserting parties:", error);
      return false;
    }
    
    console.log(`${parties.length} parties saved successfully`);
    return true;
  } catch (error) {
    console.error("Error inserting process parties:", error);
    return false;
  }
}

export async function getPartiesByProcessId(processId: string | number): Promise<Party[]> {
  try {
    const { data, error } = await supabase
      .from("process_parties")
      .select("*")
      .eq("process_id", processId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching parties:", error);
      throw error;
    }

    // Map database data to Party interface
    const mappedData: Party[] = data.map(party => ({
      id: party.id,
      name: party.name,
      document: party.document,
      type: party.type,
      subtype: party.subtype,
      personType: party.person_type,
      process_id: party.process_id
    }));

    return mappedData;
  } catch (error) {
    console.error("Error fetching parties:", error);
    throw error;
  }
}

export async function createParty(partyData: Omit<Party, "id"> & { process_id: string | number }): Promise<Party> {
  try {
    // Get the current user to set as user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const { data, error } = await supabase
      .from("process_parties")
      .insert({
        process_id: partyData.process_id,
        name: partyData.name,
        type: partyData.type,
        subtype: partyData.subtype,
        person_type: partyData.personType,
        document: partyData.document,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating party:", error);
      throw error;
    }

    // Map database response to Party interface
    return {
      id: data.id,
      name: data.name,
      document: data.document,
      type: data.type,
      subtype: data.subtype,
      personType: data.person_type,
      process_id: data.process_id
    } as Party;
  } catch (error) {
    console.error("Error creating party:", error);
    throw error;
  }
}

export async function updateParty(id: string, partyData: Partial<Omit<Party, "id">>): Promise<Party> {
  try {
    // Convert from Party to database format
    const dbData: any = {};
    if (partyData.name !== undefined) dbData.name = partyData.name;
    if (partyData.document !== undefined) dbData.document = partyData.document;
    if (partyData.type !== undefined) dbData.type = partyData.type;
    if (partyData.subtype !== undefined) dbData.subtype = partyData.subtype;
    if (partyData.personType !== undefined) dbData.person_type = partyData.personType;

    const { data, error } = await supabase
      .from("process_parties")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating party:", error);
      throw error;
    }

    // Map database response to Party interface
    return {
      id: data.id,
      name: data.name,
      document: data.document,
      type: data.type,
      subtype: data.subtype,
      personType: data.person_type,
      process_id: data.process_id
    } as Party;
  } catch (error) {
    console.error("Error updating party:", error);
    throw error;
  }
}

export async function deleteParty(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("process_parties")
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
