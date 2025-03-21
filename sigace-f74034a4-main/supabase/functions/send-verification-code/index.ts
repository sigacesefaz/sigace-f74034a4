
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Use the environment variable for the Resend API key
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY environment variable is not set");
}

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "sigace-jwt-secret-token-for-email-verification-2024";
// The verified email address for Resend
const VERIFIED_EMAIL = Deno.env.get("VERIFIED_EMAIL") || "sigace@sefaz.to.gov.br";
if (!VERIFIED_EMAIL) {
  console.error("VERIFIED_EMAIL environment variable is not set");
}

serve(async (req) => {
  console.log(`Request method: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const requestBody = await req.json();
    const { email, processNumber } = requestBody;
    
    console.log(`Processing request for email: ${email}, process: ${processNumber}`);
    console.log("Full request body:", JSON.stringify(requestBody));
    
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

    // Validate process number
    if (!processNumber) {
      return new Response(
        JSON.stringify({ error: "Process number is required" }),
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
    
    console.log("Attempting to send verification code");
    console.log("From:", VERIFIED_EMAIL);
    console.log("To:", email);
    console.log("Process Number:", processNumber);
    console.log("Verification Code:", verificationCode);
    
    try {
      // Send the verification email via Resend API
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `SIGACE <${VERIFIED_EMAIL}>`,
          to: [email], // Send to the actual recipient email
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
                Esta é uma mensagem automática. Por favor, não responda a este email.
              </p>
            </div>
          `
        })
      });

      const resendStatus = resendResponse.status;
      console.log(`Resend API response status: ${resendStatus}`);

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text();
        console.error("Error from Resend API:", resendError);
        
        // Parse the error response if possible
        let errorDetails;
        try {
          errorDetails = JSON.parse(resendError);
        } catch {
          errorDetails = { message: resendError };
        }
        
        return new Response(
          JSON.stringify({ 
            error: "Failed to send verification email",
            details: errorDetails
          }),
          {
            status: resendResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const resendResult = await resendResponse.json();
      console.log("Email sent successfully:", resendResult);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Verification code sent",
          token,
          devCode: verificationCode // Remove this in production
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (resendError) {
      console.error("Error sending email via Resend:", resendError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send verification email", 
          details: resendError.message,
          type: "resend_api_error"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in send-verification-code:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message,
        type: "server_error"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
