
import { supabase } from '@/lib/supabase';
import { Process, ProcessUpdateHistory } from '@/types/process';

export async function updateProcess(processId: string | number): Promise<boolean> {
  try {
    console.log(`Starting process update for process ID: ${processId}`);
    
    // First, get the current process status
    const { data: process, error: processError } = await supabase
      .from('processes')
      .select('status')
      .eq('id', processId)
      .single();
    
    if (processError) {
      console.error('Error fetching process for update:', processError);
      return false;
    }
    
    const previousStatus = process?.status || 'unknown';

    // Call the Edge Function to update the process
    const { data, error } = await supabase.functions.invoke('update-process', {
      body: { processId }
    });
    
    if (error) {
      console.error('Error updating process via function:', error);
      return false;
    }
    
    // Log the update history
    const { data: newProcess, error: newProcessError } = await supabase
      .from('processes')
      .select('status')
      .eq('id', processId)
      .single();
    
    if (!newProcessError) {
      const newStatus = newProcess?.status || 'unknown';
      
      // Only log if there was an actual change
      if (previousStatus !== newStatus) {
        await supabase.from('process_update_history').insert({
          process_id: processId,
          update_type: 'status_change',
          previous_status: previousStatus,
          new_status: newStatus,
          details: { manual_update: true },
          update_date: new Date().toISOString()
        });
      }
    }
    
    console.log(`Process update completed for process ID: ${processId}`);
    return true;
  } catch (error) {
    console.error('Error in updateProcess function:', error);
    return false;
  }
}

export async function getProcessUpdateHistory(processId: string | number): Promise<ProcessUpdateHistory[]> {
  try {
    const { data, error } = await supabase
      .from('process_update_history')
      .select('*')
      .eq('process_id', processId)
      .order('update_date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Properly cast data to ProcessUpdateHistory[] type
    return (data as unknown) as ProcessUpdateHistory[];
  } catch (error) {
    console.error('Error fetching process update history:', error);
    return [];
  }
}
