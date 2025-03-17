import { supabase } from '@/lib/supabase';

// Fix the updateProcessStatus function to handle 'unknown' type
export const updateProcessStatus = async (processId: string | number, status: string): Promise<boolean> => {
  try {
    // Convert processId to string if it's not already
    const processIdStr = String(processId);
    
    const { error } = await supabase
      .from('processes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', processIdStr);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating process status:', error);
    return false;
  }
};
