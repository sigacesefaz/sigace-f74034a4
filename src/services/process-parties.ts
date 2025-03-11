
import { supabase } from "@/lib/supabase";
import { PartyType } from "@/types/process";

export async function getPartiesByProcessId(processId: string): Promise<PartyType[]> {
  try {
    const { data, error } = await supabase
      .from("process_parties")
      .select("*")
      .eq("process_id", processId);

    if (error) throw error;

    if (data && data.length > 0) {
      return data.map(party => ({
        id: party.id,
        document: party.document || "",
        name: party.name,
        type: party.type as "AUTHOR" | "DEFENDANT" | "MP",
        subtype: party.subtype || "",
        personType: party.person_type as "physical" | "legal"
      }));
    }

    return [];
  } catch (error) {
    console.error("Error fetching process parties:", error);
    throw error;
  }
}

export async function createParty(party: Omit<PartyType, "id"> & { process_id: string }): Promise<PartyType> {
  try {
    const { data, error } = await supabase
      .from("process_parties")
      .insert({
        process_id: party.process_id,
        name: party.name,
        type: party.type,
        subtype: party.subtype,
        person_type: party.personType,
        document: party.document
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      document: data.document || "",
      name: data.name,
      type: data.type as "AUTHOR" | "DEFENDANT" | "MP",
      subtype: data.subtype || "",
      personType: data.person_type as "physical" | "legal"
    };
  } catch (error) {
    console.error("Error creating process party:", error);
    throw error;
  }
}

export async function updateParty(partyId: string, party: Partial<PartyType>): Promise<void> {
  try {
    const updateData: any = {};
    
    if (party.name) updateData.name = party.name;
    if (party.type) updateData.type = party.type;
    if (party.subtype) updateData.subtype = party.subtype;
    if (party.personType) updateData.person_type = party.personType;
    if (party.document) updateData.document = party.document;

    const { error } = await supabase
      .from("process_parties")
      .update(updateData)
      .eq("id", partyId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating process party:", error);
    throw error;
  }
}

export async function deleteParty(partyId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("process_parties")
      .delete()
      .eq("id", partyId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting process party:", error);
    throw error;
  }
}
