
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if today is the day we should run updates
    const today = new Date();
    const currentDay = today.getDate();
    
    // Get the configuration for which day to run updates
    const { data: config } = await supabase
      .from("system_configuration")
      .select("update_processes_day")
      .single();
      
    const updateDay = config?.update_processes_day || 1;
    
    // Only run if today is the scheduled update day
    if (currentDay === updateDay) {
      console.log(`Today (${currentDay}) is the scheduled update day (${updateDay}). Running process updates...`);
      
      // Call our update-process function
      const response = await fetch(`${supabaseUrl}/functions/v1/update-process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({})  // Empty body for bulk update
      });
      
      const result = await response.json();
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Scheduled process update completed",
          result
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } else {
      console.log(`Today (${currentDay}) is not the scheduled update day (${updateDay}). Skipping.`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `Today (${currentDay}) is not the scheduled update day (${updateDay}). No updates performed.`
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in scheduled-process-update function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});
