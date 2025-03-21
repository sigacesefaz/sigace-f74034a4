
import { DatajudAPIResponse } from "@/types/datajud";
import { formatProcessNumberForQuery } from "./datajudTransformers";

export async function callDatajudApi(courtEndpoint: string, processNumber: string, size: number = 10): Promise<DatajudAPIResponse> {
  const formattedNumber = formatProcessNumberForQuery(processNumber);
  
  const requestBody = {
    endpoint: courtEndpoint,
    query: {
      match: {
        "numeroProcesso": formattedNumber
      }
    },
    size
  };
  
  console.log("Request body:", JSON.stringify(requestBody, null, 2));
  
  const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/datajud-proxy`;
  console.log("Usando a URL da função edge:", functionUrl);
  
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error with DataJud API: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
}
