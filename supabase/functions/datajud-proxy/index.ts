
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get the request body
    const body = await req.json();
    const endpoint = body.endpoint;
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Endpoint parameter is required" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Remove endpoint from the request body before sending to API
    const { endpoint: _, ...requestData } = body;
    
    // Forward the request to DataJud API
    const apiUrl = `https://api-publica.datajud.cnj.jus.br/${endpoint}/_search`;
    
    console.log(`Proxying request to: ${apiUrl}`);
    console.log(`Request body: ${JSON.stringify(requestData)}`);
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `APIKey ${API_KEY}`,
      },
      body: JSON.stringify(requestData),
    });

    console.log(`Response status: ${response.status}`);
    
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in datajud-proxy:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
