
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

// Define proper CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Get environment variables
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "sigace-jwt-secret-token-for-email-verification-2024";
const VERIFIED_EMAIL = Deno.env.get("VERIFIED_EMAIL") || "sigace@sefaz.to.gov.br";

// Log environment variables availability (without exposing values)
console.log("Environment check:");
console.log(`RESEND_API_KEY available: ${Boolean(RESEND_API_KEY)}`);
console.log(`JWT_SECRET available: ${Boolean(JWT_SECRET)}`);
console.log(`VERIFIED_EMAIL available: ${Boolean(VERIFIED_EMAIL)}`);

serve(async (req) => {
  console.log(`Request method: ${req.method}`);
  console.log(`Request URL: ${req.url}`);
  
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
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    const { email, processNumber } = requestBody;
    console.log(`Processing request for email: ${email}, process: ${processNumber}`);
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.error("Invalid email:", email);
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
      console.error("Missing process number");
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
    
    console.log("Sending verification code");
    console.log("From:", VERIFIED_EMAIL);
    console.log("To:", email);
    console.log("Process Number:", processNumber);
    console.log("Verification Code:", verificationCode);
    
    try {
      if (!RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY environment variable is not set");
      }
      
      // Send the verification email via Resend API
      console.log("Preparing to call Resend API");
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: `SIGACE <${VERIFIED_EMAIL}>`,
          to: [VERIFIED_EMAIL], // Using verified email in test mode
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
                <strong>OBSERVAÇÃO PARA DESENVOLVIMENTO:</strong> Este email foi enviado para ${VERIFIED_EMAIL} ao invés do destinatário real (${email}) porque estamos em modo de teste do Resend. Em produção, com um domínio verificado, os emails serão enviados diretamente para os usuários.
              </p>
            </div>
          `
        })
      });

      const resendStatus = resendResponse.status;
      console.log(`Resend API response status: ${resendStatus}`);

      // Log the full response body for debugging
      const responseText = await resendResponse.text();
      console.log("Resend API response body:", responseText);

      if (!resendResponse.ok) {
        // Parse the error response if possible
        let errorDetails;
        try {
          errorDetails = JSON.parse(responseText);
        } catch {
          errorDetails = { message: responseText };
        }
        
        console.error("Error from Resend API:", errorDetails);
        
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

      // Parse the successful response as JSON
      let resendResult;
      try {
        resendResult = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Error parsing Resend API response:", jsonError);
        resendResult = { id: "unknown", message: responseText };
      }
      
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
    console.error("Error in send-verification-code-v2:", error);
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
