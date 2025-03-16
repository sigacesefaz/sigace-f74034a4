
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function checks if it's time to run the monthly process update
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the system configuration
    const { data: systemConfig, error: configError } = await supabase
      .from("system_configuration")
      .select("update_processes_day")
      .single();
      
    if (configError) {
      console.error("Error fetching system configuration:", configError);
      return new Response(
        JSON.stringify({ success: false, error: configError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Check if today is the configured day for updates
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    const updateDay = systemConfig.update_processes_day || 1;
    
    console.log(`Current day: ${dayOfMonth}, Configured update day: ${updateDay}`);
    
    if (dayOfMonth === updateDay) {
      console.log("It's time to run the monthly process update!");
      
      // Call the update-process function for all processes
      const response = await fetch(`${supabaseUrl}/functions/v1/update-process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({})
      });
      
      const result = await response.json();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Monthly process update initiated", 
          result 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.log("Not time for monthly update yet");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Not time for monthly update yet", 
          currentDay: dayOfMonth,
          updateDay: updateDay
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error in scheduled-process-update function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
