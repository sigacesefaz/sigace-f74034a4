import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";

const resend = new Resend(resendApiKey);

// Configurar os headers CORS para permitir requisições do localhost e da origem de produção
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Permitir todas as origens em desenvolvimento
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400", // Cache preflight por 24 horas
  "Access-Control-Allow-Credentials": "true"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (req.method === "GET") {
      // Get the current email count for the current month
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const { data: emailTracking } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();
        
      // Get the monthly limit from system configuration
      const { data: systemConfig } = await supabase
        .from("system_configuration")
        .select("email_monthly_limit")
        .single();
        
      const emailCount = emailTracking?.count || 0;
      const emailLimit = systemConfig?.email_monthly_limit || 3000;
      const emailsRemaining = emailLimit - emailCount;
      
      return new Response(
        JSON.stringify({
          success: true,
          currentMonth,
          currentYear,
          emailCount,
          emailLimit,
          emailsRemaining,
          limitReached: emailCount >= emailLimit
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else if (req.method === "POST") {
      // This endpoint sends an email and tracks it
      const { to, subject, html, from } = await req.json();
      
      if (!to || !subject || !html) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Check if we've hit the monthly limit
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      // Get the current email count
      const { data: emailTracking } = await supabase
        .from("email_tracking")
        .select("*")
        .eq("month", currentMonth)
        .eq("year", currentYear)
        .single();
        
      // Get the limit from system configuration
      const { data: systemConfig } = await supabase
        .from("system_configuration")
        .select("email_monthly_limit")
        .single();
        
      const emailLimit = systemConfig?.email_monthly_limit || 3000;
      const currentCount = emailTracking?.count || 0;
      
      if (currentCount >= emailLimit) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Email monthly limit reached. Service will resume on the first day of the next month."
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      
      // Send email via Resend
      const emailResponse = await resend.emails.send({
        from: from || "SIGACE <sigace@sefaz.to.gov.br>",
        to: [to],
        subject,
        html
      });
      
      if (emailResponse.error) {
        throw new Error(`Failed to send email: ${emailResponse.error}`);
      }
      
      // Update email count in the database
      const { error: upsertError } = await supabase
        .from("email_tracking")
        .upsert(
          { 
            month: currentMonth, 
            year: currentYear, 
            count: currentCount + 1 
          },
          { 
            onConflict: "month,year",
            ignoreDuplicates: false 
          }
        );
      
      if (upsertError) {
        console.error("Error updating email count:", upsertError);
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          emailId: emailResponse.id,
          message: "Email sent and tracked successfully",
          currentCount: currentCount + 1,
          remainingEmails: emailLimit - (currentCount + 1)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
      );
    }
  } catch (error) {
    console.error("Error in email-tracker function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
