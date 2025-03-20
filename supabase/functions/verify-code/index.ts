
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

// Define proper CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Use the environment variable for the secret
const JWT_SECRET = Deno.env.get("JWT_SECRET") || "sigace-jwt-secret-token-for-email-verification-2024";

// Log environment availability
console.log("Environment check:");
console.log(`JWT_SECRET available: ${Boolean(JWT_SECRET)}`);

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
    
    const { email, code, token } = requestBody;
    console.log(`Verifying code for email: ${email}`);
    
    if (!email || !code || !token) {
      console.error("Missing required parameters:", { email, code: Boolean(code), token: Boolean(token) });
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
      console.log("Attempting to verify JWT token");
      const { payload } = await jose.jwtVerify(
        token, 
        new TextEncoder().encode(JWT_SECRET)
      );
      
      console.log("JWT payload:", payload);
      
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
