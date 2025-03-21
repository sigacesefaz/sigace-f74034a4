
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { from, to, subject, html, headers, apiKey, testMode } = await req.json();
    
    if (!apiKey) {
      throw new Error("API key não fornecida");
    }

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios faltando (to, subject, html)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const resend = new Resend(apiKey);
    
    // Log request details for debugging
    console.log(`Enviando e-mail para ${to} com assunto "${subject}"`);
    console.log(`Modo de teste: ${testMode ? 'Sim' : 'Não'}`);
    
    // Extract verification code if available (before sending)
    let verificationCode = null;
    if (html && (subject.toLowerCase().includes("verifica") || subject.toLowerCase().includes("código"))) {
      // Look for 6 digit codes in the HTML
      const matches = html.match(/\b(\d{6})\b/g);
      if (matches && matches.length > 0) {
        verificationCode = matches[0];
        console.log("Extracted verification code:", verificationCode);
      }
    }
    
    const data = await resend.emails.send({
      from: from || "Sigace <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      headers
    });

    console.log("Resposta do Resend:", data);
    
    // Prepare response
    const response = {
      ...data
    };
    
    // Only add verification code to the response if testMode is true
    if (verificationCode && testMode === true) {
      console.log("Test mode is enabled, including verification code in response");
      response.devCode = verificationCode;
    } else {
      console.log("Test mode is disabled, not including verification code in response");
    }
    
    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro no envio de e-mail:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
