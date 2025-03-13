
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

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
      // Verify and decode the JWT token
      const { payload } = await jose.jwtVerify(
        token,
        new TextEncoder().encode(JWT_SECRET)
      );
      
      // Check if the token belongs to the same email
      if (payload.email !== email) {
        throw new Error("Token does not match email");
      }
      
      // Verify the code matches
      if (payload.code !== code) {
        return new Response(
          JSON.stringify({ error: "Invalid verification code" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      // Code is valid, return success
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Code verified successfully",
          process: payload.processNumber
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
      
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
  } catch (error) {
    console.error("Error in verify-code:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
