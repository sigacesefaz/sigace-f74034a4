
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Use the environment variable for the secret
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
    
    if (!email || !code || !token) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    try {
      // Verify the JWT token
      const { payload } = await jose.jwtVerify(
        token, 
        new TextEncoder().encode(JWT_SECRET)
      );
      
      // Verify the email matches
      if (payload.email !== email) {
        console.error("Email mismatch:", payload.email, email);
        throw new Error("Email mismatch");
      }
      
      // Verify the code matches
      if (payload.code !== code) {
        console.error("Code mismatch:", payload.code, code);
        throw new Error("Invalid verification code");
      }
      
      // Get the process number from the token
      const processNumber = payload.processNumber;
      console.log("Verification successful for process:", processNumber);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          verified: true,
          processNumber 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      
      return new Response(
        JSON.stringify({ 
          error: "Invalid or expired code", 
          details: jwtError.message 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Error in verify-code:", error);
    
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
