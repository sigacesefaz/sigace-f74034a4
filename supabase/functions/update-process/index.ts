import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get request data
    const requestData = await req.json();
    const { processId, userId, updateType = "manual" } = requestData;
    
    console.log(`Processing update for process ID: ${processId}, update type: ${updateType}`);
    
    // If processId is specified, update just that process
    if (processId) {
      return await updateSingleProcess(supabase, processId, userId, updateType);
    } 
    // Otherwise update all processes (for scheduled updates)
    else {
      return await updateAllProcesses(supabase, updateType);
    }
  } catch (error) {
    console.error("Error in update-process function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function updateSingleProcess(supabase, processId, userId, updateType) {
  // Get the process details including the number
  const { data: process, error: processError } = await supabase
    .from("processes")
    .select("number, court, metadata")
    .eq("id", processId)
    .single();
    
  if (processError) {
    console.error("Error fetching process:", processError);
    return new Response(
      JSON.stringify({ success: false, error: processError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
  
  // Call DataJud API to get updated process data
  console.log(`Fetching updated data for process number: ${process.number} from court: ${process.court}`);
  
  // Simulate API call here - in a real scenario, you would call the actual DataJud API
  // For this example, we'll just simulate finding a new movement
  const newDataFound = true;
  const previousHits = process.metadata?.hits || [];
  const newHit = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    description: `Automatic update on ${new Date().toISOString()}`,
    type: "MOVEMENT",
    content: "This is a simulated new movement from an update."
  };
  
  // Only update if new data is found
  if (newDataFound) {
    const updatedHits = [...previousHits, newHit];
    
    // Update the process with the new data
    const { data: updateResult, error: updateError } = await supabase
      .from("processes")
      .update({
        metadata: {
          ...process.metadata,
          hits: updatedHits,
          last_updated: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", processId)
      .select();
      
    if (updateError) {
      console.error("Error updating process:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Record the update in the history
    const { error: historyError } = await supabase
      .from("process_update_history")
      .insert({
        process_id: processId,
        update_type: updateType,
        update_date: new Date().toISOString(),
        user_id: userId,
        details: {
          new_hits: 1,
          previous_status: process.metadata?.status,
          new_status: process.metadata?.status // Same in this case, but could be different
        }
      });
      
    if (historyError) {
      console.error("Error recording update history:", historyError);
      // We don't fail the request if just the history recording fails
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Process updated successfully", 
        newData: true,
        process: updateResult[0]
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } else {
    // Record that we checked but found no updates
    const { error: historyError } = await supabase
      .from("process_update_history")
      .insert({
        process_id: processId,
        update_type: updateType,
        update_date: new Date().toISOString(),
        user_id: userId,
        details: {
          new_hits: 0
        }
      });
      
    if (historyError) {
      console.error("Error recording update history:", historyError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "No new data found for process", 
        newData: false 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function updateAllProcesses(supabase, updateType) {
  // Get all processes to be updated
  const { data: processes, error: processesError } = await supabase
    .from("processes")
    .select("id, user_id, number, court");
    
  if (processesError) {
    console.error("Error fetching processes:", processesError);
    return new Response(
      JSON.stringify({ success: false, error: processesError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
  
  console.log(`Found ${processes.length} processes to update`);
  
  // Update each process
  const updateResults = [];
  for (const process of processes) {
    try {
      const response = await updateSingleProcess(
        supabase, 
        process.id, 
        process.user_id, 
        updateType
      );
      
      const result = await response.json();
      updateResults.push({
        processId: process.id,
        success: result.success,
        newData: result.newData
      });
    } catch (error) {
      console.error(`Error updating process ${process.id}:`, error);
      updateResults.push({
        processId: process.id,
        success: false,
        error: error.message
      });
    }
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Completed update of ${processes.length} processes`,
      results: updateResults,
      updatedCount: updateResults.filter(r => r.success && r.newData).length,
      failedCount: updateResults.filter(r => !r.success).length
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
