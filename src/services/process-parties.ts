
import { supabase } from "@/lib/supabase";
import { PartyType } from "@/types/process";

export async function getPartiesByProcessId(processId: string) {
  const { data, error } = await supabase
    .from("process_parties")
    .select("*")
    .eq("process_id", processId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching parties:", error);
    throw error;
  }

  return data as PartyType[];
}

export async function createParty(partyData: Omit<PartyType, "id"> & { process_id: string }) {
  const { data, error } = await supabase
    .from("process_parties")
    .insert(partyData)
    .select()
    .single();

  if (error) {
    console.error("Error creating party:", error);
    throw error;
  }

  return data as PartyType;
}

export async function updateParty(id: string, partyData: Partial<Omit<PartyType, "id">>) {
  const { data, error } = await supabase
    .from("process_parties")
    .update(partyData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating party:", error);
    throw error;
  }

  return data as PartyType;
}

export async function deleteParty(id: string) {
  const { error } = await supabase
    .from("process_parties")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting party:", error);
    throw error;
  }

  return true;
}
