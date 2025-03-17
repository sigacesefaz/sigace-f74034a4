// Import necessary modules and types
import { supabase } from '@/lib/supabase';

// Function to update the process status
export const updateProcessStatus = async (processId: string | number, status: string): Promise<boolean> => {
  try {
    // Convert processId to string to handle different types
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
