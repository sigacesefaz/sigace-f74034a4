
import { supabase } from "@/lib/supabase";
import { DatajudProcess } from "@/types/datajud";

// Function to save the subjects of a process
export async function saveProcessSubjects(processId: string | number, subjects: DatajudProcess["assuntos"]) {
  if (!subjects || subjects.length === 0) return;
  
  try {
    // Get the current user to set as user_id
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const subjectsData = subjects.map((subject, index) => ({
      process_id: processId,
      codigo: subject.codigo,
      nome: subject.nome || "",
      principal: index === 0, // Consider the first as main
      user_id: user.id
    }));
    
    const { error } = await supabase
      .from("process_subjects")
      .insert(subjectsData);
      
    if (error) {
      console.error("Error inserting subjects:", error);
    }
  } catch (error) {
    console.error("Error inserting process subjects:", error);
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
