
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";

// Function to save the subjects of a process
export async function saveProcessSubjects(processId: string | number, subjects: DatajudProcess["assuntos"], hitId?: string) {
  if (!subjects || subjects.length === 0) {
    console.log("No subjects to save");
    return true;
  }
  
  try {
    console.log(`Saving ${subjects.length} subjects for process ID:`, processId);
    
    // Get the current user to set as user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const subjectsData = subjects.map((subject, index) => ({
      process_id: processId,
      hit_id: hitId || null,
      codigo: subject.codigo,
      nome: subject.nome || "",
      principal: index === 0, // Consider the first as main
      user_id: user.id
    }));
    
    // For a small number of subjects, insert them all at once
    if (subjects.length <= 10) {
      const { error } = await supabase
        .from("process_subjects")
        .insert(subjectsData);
        
      if (error) {
        console.error("Error inserting subjects:", error);
        return false;
      }
      
      console.log(`${subjects.length} subjects saved successfully`);
      return true;
    }
    
    // For a larger number, save in batches
    const batchSize = 10;
    let successCount = 0;
    
    for (let i = 0; i < subjectsData.length; i += batchSize) {
      const batch = subjectsData.slice(i, Math.min(i + batchSize, subjectsData.length));
      
      try {
        const { error } = await supabase
          .from("process_subjects")
          .insert(batch);
          
        if (error) {
          console.error(`Error inserting subjects batch ${i/batchSize + 1}:`, error);
        } else {
          successCount += batch.length;
          console.log(`Subjects batch ${i/batchSize + 1} inserted successfully (${batch.length} subjects)`);
        }
      } catch (err) {
        console.error(`Error processing subjects batch ${i/batchSize + 1}:`, err);
      }
    }
    
    console.log(`Inserted ${successCount} out of ${subjects.length} subjects`);
    return successCount > 0;
  } catch (error) {
    console.error("Error inserting process subjects:", error);
    return false;
  }
}

// Function to get subjects by process ID
export async function getSubjectsByProcessId(processId: string) {
  try {
    const { data, error } = await supabase
      .from("process_subjects")
      .select("*")
      .eq("process_id", processId);

    if (error) {
      console.error("Error fetching subjects:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
}
