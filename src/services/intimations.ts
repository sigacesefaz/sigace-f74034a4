
import { supabase } from "@/lib/supabase";

export interface Intimation {
  id: string;
  process_number: string;
  status: string;
  created_at: string;
  title: string;
  description: string;
  deadline?: string;
  process_id?: string;
}

export async function getIntimations() {
  try {
    const { data, error } = await supabase
      .from('intimations')
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
      .from('intimations')
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
    const { data, error } = await supabase
      .from('intimations')
      .insert(intimationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar intimação:', error);
    throw error;
  }
}

export async function updateIntimation(id: string, updates: Partial<Intimation>) {
  try {
    const { data, error } = await supabase
      .from('intimations')
      .update(updates)
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
