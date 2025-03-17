
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";
import { searchProcesses, getProcessById } from "../shared/datajud.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { processId, courtEndpoint } = await req.json();
    
    if (!processId) {
      if (req.method === "POST") {
        // This is the scheduled update for all processes
        const { data: processes } = await supabase
          .from("processes")
          .select("id, number, court")
          .order("created_at", { ascending: false });
          
        if (!processes || processes.length === 0) {
          return new Response(
            JSON.stringify({ success: false, message: "No processes found to update" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }
        
        const results = [];
        for (const process of processes) {
          try {
            // Determine the court endpoint based on the process court field
            const endpoint = process.court.toLowerCase().includes("tjto") ? 
              "https://api-publica.datajud.cnj.jus.br/api/v2/jurimetria/tjto" : 
              "https://api-publica.datajud.cnj.jus.br/api/v2/jurimetria/stj";
              
            // Get the latest data for this process
            const updatedData = await getProcessById(endpoint, process.number);
            
            if (updatedData && updatedData.length > 0) {
              // Check for new hits
              const { data: existingHits } = await supabase
                .from("process_hits")
                .select("hit_id")
                .eq("process_id", process.id);
                
              const existingHitIds = existingHits ? existingHits.map(h => h.hit_id) : [];
              const newHits = updatedData.filter(hit => !existingHitIds.includes(hit.id));
              
              if (newHits.length > 0) {
                // Log the update history
                await supabase.from("process_update_history").insert({
                  process_id: process.id,
                  update_type: "automatic",
                  details: { new_hits: newHits.length },
                });
                
                // Save the new hits
                for (const hit of newHits) {
                  const movimento = hit;
                  await supabase.from("process_hits").insert({
                    process_id: process.id,
                    hit_id: movimento.id,
                    hit_score: movimento.score || 0,
                    tribunal: movimento.process.tribunal,
                    numero_processo: movimento.process.numeroProcesso,
                    data_ajuizamento: movimento.process.dataAjuizamento,
                    grau: movimento.process.grau,
                    nivel_sigilo: movimento.process.nivelSigilo || 0,
                    formato: movimento.process.formato,
                    sistema: movimento.process.sistema,
                    classe: movimento.process.classe,
                    orgao_julgador: movimento.process.orgaoJulgador,
                    data_hora_ultima_atualizacao: movimento.process.dataHoraUltimaAtualizacao,
                    valor_causa: movimento.process.valorCausa,
                    situacao: movimento.process.situacao,
                  });
                  
                  // Save movements for this hit
                  if (movimento.process.movimentos && movimento.process.movimentos.length > 0) {
                    for (const mov of movimento.process.movimentos) {
                      await supabase.from("process_movements").insert({
                        process_id: process.id,
                        hit_id: movimento.id,
                        codigo: mov.codigo,
                        nome: mov.nome,
                        data_hora: mov.dataHora,
                        tipo: mov.tipo || "N/A",
                        complemento: mov.complemento,
                        complementos_tabelados: mov.complementosTabelados || [],
                      });
                    }
                  }
                  
                  // Save subjects for this hit
                  if (movimento.process.assuntos && movimento.process.assuntos.length > 0) {
                    for (const assunto of movimento.process.assuntos) {
                      await supabase.from("process_subjects").insert({
                        process_id: process.id,
                        hit_id: movimento.id,
                        codigo: assunto.codigo,
                        nome: assunto.nome,
                        principal: false
                      });
                    }
                  }
                }
                
                results.push({
                  processId: process.id,
                  processNumber: process.number,
                  newHits: newHits.length,
                  success: true
                });
              } else {
                results.push({
                  processId: process.id,
                  processNumber: process.number,
                  newHits: 0,
                  success: true
                });
              }
            }
          } catch (error) {
            console.error(`Error updating process ${process.id}:`, error);
            results.push({
              processId: process.id,
              processNumber: process.number,
              error: error.message,
              success: false
            });
          }
        }
        
        return new Response(
          JSON.stringify({ success: true, results }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid request method or missing processId" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } else {
      // Manual update for a specific process
      const { data: process } = await supabase
        .from("processes")
        .select("number, court")
        .eq("id", processId)
        .single();
        
      if (!process) {
        return new Response(
          JSON.stringify({ success: false, message: "Process not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
      
      // Use provided courtEndpoint or determine from process.court
      const endpoint = courtEndpoint || (process.court.toLowerCase().includes("tjto") ? 
        "https://api-publica.datajud.cnj.jus.br/api/v2/jurimetria/tjto" : 
        "https://api-publica.datajud.cnj.jus.br/api/v2/jurimetria/stj");
        
      const updatedData = await getProcessById(endpoint, process.number);
      
      if (!updatedData || updatedData.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: "No data returned from Datajud API" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
      
      // Check for new hits
      const { data: existingHits } = await supabase
        .from("process_hits")
        .select("hit_id")
        .eq("process_id", processId);
        
      const existingHitIds = existingHits ? existingHits.map(h => h.hit_id) : [];
      const newHits = updatedData.filter(hit => !existingHitIds.includes(hit.id));
      
      if (newHits.length > 0) {
        // Log the update history
        await supabase.from("process_update_history").insert({
          process_id: processId,
          update_type: "manual",
          details: { new_hits: newHits.length },
        });
        
        // Save the new hits
        for (const hit of newHits) {
          const movimento = hit;
          await supabase.from("process_hits").insert({
            process_id: processId,
            hit_id: movimento.id,
            hit_score: movimento.score || 0,
            tribunal: movimento.process.tribunal,
            numero_processo: movimento.process.numeroProcesso,
            data_ajuizamento: movimento.process.dataAjuizamento,
            grau: movimento.process.grau,
            nivel_sigilo: movimento.process.nivelSigilo || 0,
            formato: movimento.process.formato,
            sistema: movimento.process.sistema,
            classe: movimento.process.classe,
            orgao_julgador: movimento.process.orgaoJulgador,
            data_hora_ultima_atualizacao: movimento.process.dataHoraUltimaAtualizacao,
            valor_causa: movimento.process.valorCausa,
            situacao: movimento.process.situacao,
          });
          
          // Save movements for this hit
          if (movimento.process.movimentos && movimento.process.movimentos.length > 0) {
            for (const mov of movimento.process.movimentos) {
              await supabase.from("process_movements").insert({
                process_id: processId,
                hit_id: movimento.id,
                codigo: mov.codigo,
                nome: mov.nome,
                data_hora: mov.dataHora,
                tipo: mov.tipo || "N/A",
                complemento: mov.complemento,
                complementos_tabelados: mov.complementosTabelados || [],
              });
            }
          }
          
          // Save subjects for this hit
          if (movimento.process.assuntos && movimento.process.assuntos.length > 0) {
            for (const assunto of movimento.process.assuntos) {
              await supabase.from("process_subjects").insert({
                process_id: processId,
                hit_id: movimento.id,
                codigo: assunto.codigo,
                nome: assunto.nome,
                principal: false
              });
            }
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            processId,
            processNumber: process.number,
            newHits: newHits.length 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        return new Response(
          JSON.stringify({ 
            success: true, 
            processId,
            processNumber: process.number,
            newHits: 0,
            message: "No new hits found" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
  } catch (error) {
    console.error("Error in update-process function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
