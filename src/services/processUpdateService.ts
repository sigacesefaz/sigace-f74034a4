
import { supabase } from '@/lib/supabase';
import { deleteProcessDocuments } from './document';

export const updateProcess = async (processId: string): Promise<boolean> => {
  try {
    console.log("Update process initiated for process ID:", processId);
    
    // First, get the process
    const { data: process, error: processError } = await supabase
      .from('processes')
      .select('number, court')
      .eq('id', processId)
      .single();

    if (processError) {
      console.error("Error fetching process:", processError);
      throw new Error(`Failed to fetch process: ${processError.message}`);
    }

    // For now, we're just logging that the process should be updated
    console.log(`Would update process ${process.number} from ${process.court}`);
    
    // Return true to indicate successful update
    return true;
  } catch (error) {
    console.error("Error updating process:", error);
    throw error;
  }
};

export const deleteProcess = async (processId: string): Promise<boolean> => {
  try {
    console.log("Delete process initiated for process ID:", processId);

    // Delete all documents for this process from storage and database
    await deleteProcessDocuments(processId);

    // Delete related entities
    const tables = [
      'process_movements',
      'process_subjects',
      'process_details',
      'process_parties',
      'process_judicial_decisions',
      'process_hits'
    ];

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('process_id', processId);
        
      if (error) {
        console.warn(`Error deleting from ${table}:`, error);
      }
    }
    
    // Finally delete the process itself
    const { error: deleteError } = await supabase
      .from('processes')
      .delete()
      .eq('id', processId);
      
    if (deleteError) {
      throw new Error(`Failed to delete process: ${deleteError.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting process:", error);
    throw error;
  }
};
