
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Use the environment variable for the JWT secret
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "sigace-jwt-secret-token-for-email-verification-2024";

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
    
    const { email, code, token } = await req.json();
    console.log(`Verifying code for email: ${email}`);
    
    // Validate required inputs
    if (!email || !code || !token) {
      return new Response(
        JSON.stringify({ error: "Email, code, and token are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Verify and decode the JWT token
    try {
      const { payload } = await jose.jwtVerify(
        token, 
        new TextEncoder().encode(JWT_SECRET)
      );
      
      console.log("Token verified, payload:", payload);
      
      // Verify that the email in the payload matches the email in the request
      if (payload.email !== email) {
        return new Response(
          JSON.stringify({ error: "Email mismatch" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Verify that the code in the payload matches the code in the request
      if (payload.code !== code) {
        return new Response(
          JSON.stringify({ error: "Invalid verification code" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // All checks passed, verification successful
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Code verified successfully",
          processNumber: payload.processNumber || null
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
      
    } catch (tokenError) {
      console.error("Token verification error:", tokenError);
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired token", 
          details: tokenError.message 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
  } catch (error) {
    console.error("Error in verify-code function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
