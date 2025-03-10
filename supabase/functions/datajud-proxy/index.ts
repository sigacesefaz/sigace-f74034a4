
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
    
    // URL base para a API do DataJud
    const apiUrl = `https://api-publica.datajud.cnj.jus.br/api_publica_${endpoint}/_search`;
    
    console.log(`Proxying request to: ${apiUrl}`);
    console.log(`Request body: ${JSON.stringify(requestData)}`);
    
    // Aumentar o timeout para 120 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 segundos de timeout
    
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `APIKey ${API_KEY}`,
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Response status: ${response.status}`);
      
      // Verificar se a resposta é OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response from DataJud API: ${errorText}`);
        
        return new Response(
          JSON.stringify({ 
            error: `Error from DataJud API: ${response.status} ${response.statusText}`,
            details: errorText 
          }),
          {
            status: response.status,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders,
            },
          }
        );
      }
      
      const data = await response.json();
      console.log(`Response data structure: ${Object.keys(data).join(', ')}`);
      console.log(`Response hits count: ${data.hits?.hits?.length || 0}`);
      
      // Return complete hits array with source data
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error("Error in datajud-proxy:", error);
    
    const errorMessage = error.name === 'AbortError' 
      ? "Timeout: A requisição excedeu o tempo limite"
      : error.message || "Internal server error";
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        stack: error.stack
      }),
      {
        status: error.name === 'AbortError' ? 408 : 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
