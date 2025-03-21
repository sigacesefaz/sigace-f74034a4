
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
    const { from, to, subject, html, headers, apiKey, devMode } = await req.json();
    
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
    
    // Se estiver em modo de desenvolvimento e o assunto contém "verificação",
    // extrair e retornar o código de verificação
    let devInfo = {};
    if (devMode && subject.toLowerCase().includes("verificação")) {
      // Extrair código de verificação do HTML com uma expressão regular
      const codeMatch = html.match(/(\d{6})/);
      if (codeMatch && codeMatch[1]) {
        devInfo = {
          devCode: codeMatch[1]
        };
      }
    }
    
    return new Response(
      JSON.stringify({
        ...data,
        ...devInfo
      }),
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
