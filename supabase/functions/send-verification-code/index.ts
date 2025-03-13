
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "super-secret-jwt-token-for-verification";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Resend API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { email, processNumber } = await req.json();
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Generate a 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create a JWT token that includes the email and code
    const token = await new jose.SignJWT({ 
      email, 
      code: verificationCode,
      processNumber 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // Code expires in 15 minutes
      .sign(new TextEncoder().encode(JWT_SECRET));
    
    // Send the verification email
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "SIGACE <onboarding@resend.dev>",
        to: email,
        subject: "Seu código de verificação para consulta pública",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>SIGACE - Sistema de Gestão de Ações Contra o Estado</h2>
            <p>Você solicitou a consulta ao processo <strong>${processNumber}</strong>.</p>
            <p>Para prosseguir com o acesso, utilize o código de verificação abaixo:</p>
            <div style="text-align: center; padding: 20px; background-color: #f5f5f5; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
              ${verificationCode}
            </div>
            <p style="margin-top: 20px;">Este código é válido por 15 minutos.</p>
            <p style="font-size: 12px; color: #777; margin-top: 40px;">
              Esta é uma mensagem automática. Por favor, não responda a este email.<br>
              Se você não solicitou este código, pode ignorar esta mensagem.
            </p>
          </div>
        `
      })
    });
    
    const resendResult = await resendResponse.json();
    
    if (!resendResponse.ok) {
      console.error("Error sending email:", resendResult);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent",
        token 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("Error in send-verification-code:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
