
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    // Obter a chave de API do Resend das variáveis de ambiente
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      throw new Error("RESEND_API_KEY não está definido nas variáveis de ambiente");
    }

    const resend = new Resend(apiKey);
    
    // Obter dados do corpo da requisição
    const { from, to, subject, html, headers } = await req.json();
    
    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields (to, subject, html)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Enviar e-mail
    console.log(`Enviando e-mail para ${to} com assunto "${subject}"`);
    
    const data = await resend.emails.send({
      from: from || "Sigace <onboarding@resend.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      headers
    });

    console.log("Resposta do Resend:", data);
    
    return new Response(
      JSON.stringify(data),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Erro no envio de e-mail:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
