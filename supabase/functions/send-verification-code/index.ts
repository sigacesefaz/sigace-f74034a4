
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Use the environment variable for the Resend API key
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_9MQLmpwh_CpZWoLjKWb5RsC6i2PPLKzWz";
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "super-secret-jwt-token-for-verification";
// The verified email address for Resend (in test mode, we can only send to this email)
const VERIFIED_EMAIL = "sigacesefaz@hotmail.com";

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
    
    console.log("Sending verification code to:", email);
    console.log("Process Number:", processNumber);
    console.log("Verification Code:", verificationCode);
    
    // In test mode, Resend only allows sending to verified emails
    // So we'll modify our approach:
    // 1. In production with a verified domain, we'll send to the user's email
    // 2. In test mode, we'll send to our verified email but include the intended recipient's info
    
    // Determine the recipient email (in test mode, use the verified email)
    const recipientEmail = VERIFIED_EMAIL;
    
    // Send the verification email
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "SIGACE <onboarding@resend.dev>",
        to: recipientEmail,
        subject: "Seu código de verificação para consulta pública",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>SIGACE - Sistema de Gestão de Ações Contra o Estado</h2>
            <p>Código de verificação para o usuário: <strong>${email}</strong></p>
            <p>Processo: <strong>${processNumber}</strong></p>
            <p>Para prosseguir com o acesso, utilize o código de verificação abaixo:</p>
            <div style="text-align: center; padding: 20px; background-color: #f5f5f5; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
              ${verificationCode}
            </div>
            <p style="margin-top: 20px;">Este código é válido por 15 minutos.</p>
            <p style="font-size: 12px; color: #777; margin-top: 40px;">
              Esta é uma mensagem automática. Por favor, não responda a este email.<br>
              <strong>OBSERVAÇÃO PARA DESENVOLVIMENTO:</strong> Este email foi enviado para ${recipientEmail} ao invés do destinatário real (${email}) porque estamos em modo de teste do Resend. Em produção, com um domínio verificado, os emails serão enviados diretamente para os usuários.
            </p>
          </div>
        `
      })
    });
    
    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error("Error from Resend API:", resendError);
      return new Response(
        JSON.stringify({ error: "Failed to send verification email", details: resendError }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const resendResult = await resendResponse.json();
    console.log("Email sent successfully:", resendResult);
    
    // In development mode, show the verification code in console for testing
    console.log(`[DEV MODE] Verification code for ${email}: ${verificationCode}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent",
        token,
        // Include the code directly in dev mode for testing purposes
        // (This should be removed in production)
        devCode: verificationCode
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
