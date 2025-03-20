
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Use the environment variable for the secret
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
    const { email, code, token } = await req.json();
    
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
        throw new Error("Email mismatch");
      }
      
      // Verify the code matches
      if (payload.code !== code) {
        throw new Error("Invalid verification code");
      }
      
      // Get the process number from the token
      const processNumber = payload.processNumber;
      
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
