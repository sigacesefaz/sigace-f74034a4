
import { createClient } from '@supabase/supabase-js';
import type { Process } from '@/types/process';

// Fornecer valores padrão para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rhwtvaqsakxpumamnzgo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJod3R2YXFzYWt4cHVtYW1uemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzI3MjcsImV4cCI6MjA1NTgwODcyN30.5sW7XFeZaTItEF_76UVyW4xpJASOB-DX5Ivr_g1tfgE';

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
