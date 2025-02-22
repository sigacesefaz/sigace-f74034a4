
import { createClient } from '@supabase/supabase-js';
import type { Process } from '@/types/process';

// Fornecer valores padrão para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getProcesses() {
  const { data, error } = await supabase
    .from('processes')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getProcess(id: string) {
  const { data, error } = await supabase
    .from('processes')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createProcess(process: Omit<Process, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('processes')
    .insert(process)
    .select()
    .single();
  return { data, error };
}

export async function updateProcess(id: string, updates: Partial<Process>) {
  const { data, error } = await supabase
    .from('processes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function getProcessNotifications(processId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('process_id', processId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getProcessIntimations(processId: string) {
  const { data, error } = await supabase
    .from('intimations')
    .select('*')
    .eq('process_id', processId)
    .order('created_at', { ascending: false });
  return { data, error };
}
