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
    const { action } = requestData;
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = now.getFullYear();
    
    // Check if we're tracking or checking the limit
    if (action === "track") {
      // Track email sent
      return await trackEmail(supabase, currentMonth, currentYear);
    } else {
      // Check if we've hit the limit
      return await checkEmailLimit(supabase, currentMonth, currentYear);
    }
  } catch (error) {
    console.error("Error in email-tracker function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function trackEmail(supabase, month, year) {
  // First, get current count
  const { data: trackingData, error: trackingError } = await supabase
    .from("email_tracking")
    .select("id, count")
    .eq("month", month)
    .eq("year", year)
    .single();
    
  if (trackingError && trackingError.code !== "PGRST116") { // Not found error
    console.error("Error fetching email tracking:", trackingError);
    return new Response(
      JSON.stringify({ success: false, error: trackingError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  let updateResult;
  
  // If we have a record, update it
  if (trackingData) {
    const { data, error: updateError } = await supabase
      .from("email_tracking")
      .update({
        count: trackingData.count + 1
      })
      .eq("id", trackingData.id)
      .select();
      
    if (updateError) {
      console.error("Error updating email count:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    updateResult = data[0];
  } 
  // Otherwise, create a new record
  else {
    const { data, error: insertError } = await supabase
      .from("email_tracking")
      .insert({
        month,
        year,
        count: 1
      })
      .select();
      
    if (insertError) {
      console.error("Error inserting email count:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: insertError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    updateResult = data[0];
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Email tracked successfully", 
      count: updateResult.count,
      month: updateResult.month,
      year: updateResult.year
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function checkEmailLimit(supabase, month, year) {
  // Get system configuration for email limit
  const { data: systemConfig, error: configError } = await supabase
    .from("system_configuration")
    .select("email_monthly_limit")
    .single();
    
  if (configError) {
    console.error("Error fetching system configuration:", configError);
    return new Response(
      JSON.stringify({ success: false, error: configError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
  
  const emailLimit = systemConfig.email_monthly_limit || 3000;
  
  // Get current count for this month
  const { data: trackingData, error: trackingError } = await supabase
    .from("email_tracking")
    .select("count")
    .eq("month", month)
    .eq("year", year)
    .single();
    
  if (trackingError && trackingError.code !== "PGRST116") { // Not found error
    console.error("Error fetching email tracking:", trackingError);
    return new Response(
      JSON.stringify({ success: false, error: trackingError.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
  
  // If we don't have a record, we haven't sent any emails yet
  const currentCount = trackingData?.count || 0;
  const canSendEmails = currentCount < emailLimit;
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      canSendEmails, 
      currentCount, 
      limit: emailLimit,
      remaining: emailLimit - currentCount,
      month,
      year
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
