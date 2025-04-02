import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProcessHeaderDataProps {
  processId: string;
  hitId?: string;
}

interface LatestData {
  classe: string;
  tribunal: string;
  grau: string;
  dataAjuizamento: string;
  dataAtualizacao: string;
  status?: string;
  assuntos: Array<{
    nome: string;
  }>;
  movimentos?: Array<{
    nome: string;
    data_hora: string;
    codigo?: number;
  }>;
}

interface Process {
  id: string;
  title?: string;
  court?: string;
  instance?: string;
  created_at: string;
  updated_at: string;
}

interface ProcessDetails {
  classe?: {
    nome: string;
  } | null;
  tribunal?: string;
  grau?: string;
  data_ajuizamento?: string;
  data_hora_ultima_atualizacao?: string;
  status?: string;
}

interface DatabaseHit {
  id: string;
  tribunal: string;
  data_ajuizamento: string;
  grau: string;
  classe: {
    nome: string;
  };
  data_hora_ultima_atualizacao: string;
}

interface DatabaseMovement {
  id: string;
  data_hora: string;
  nome: string;
  tipo: string;
}

interface DatabaseSubject {
  codigo: string;
  nome: string;
}

export function ProcessHeaderData({ processId, hitId }: ProcessHeaderDataProps) {
  const [loading, setLoading] = useState(false);
  const [latestData, setLatestData] = useState<LatestData | null>(null);

  useEffect(() => {
    fetchLatestData();
  }, [processId, hitId]);

  const fetchLatestData = async () => {
    try {
      setLoading(true);

      // Busca o processo principal
      const { data: process, error: processError } = await supabase
        .from('processes')
        .select('*')
        .eq('id', processId)
        .single() as { data: Process | null; error: any };

      if (processError) {
        console.error("Erro ao buscar processo:", processError);
        return;
      }

      // Busca os detalhes do processo
      const { data: processDetails, error: detailsError } = await supabase
        .from('process_details')
        .select('*')
        .eq('process_id', processId)
        .single() as { data: ProcessDetails | null; error: any };

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error("Erro ao buscar detalhes:", detailsError);
      }

      // Busca a movimentação mais recente
      const { data: movements, error: movementsError } = await supabase
        .from('process_movements')
        .select('*')
        .eq('process_id', processId)
        .order('data_hora', { ascending: false });

      if (movementsError) {
        console.error("Erro ao buscar movimentações:", movementsError);
        return;
      }

      // Busca os assuntos
      const { data: subjects, error: subjectsError } = await supabase
        .from('process_subjects')
        .select('*')
        .eq('process_id', processId)
        .eq('principal', true);

      if (subjectsError) {
        console.error("Erro ao buscar assuntos:", subjectsError);
        return;
      }

      if (process) {
        const details = processDetails || {};
        let classeObj = null;
        if (details.classe) {
          classeObj = { nome: details.classe };
        } else if (typeof details.classe === 'object' && details.classe) {
          classeObj = details.classe;
        }

        const processSubjects = (subjects as any[] || []).map(subject => ({
          codigo: subject.codigo,
          nome: subject.nome
        }));

        setLatestData({
          classe: classeObj?.nome || process.title || "Não informado",
          tribunal: process.court || details.tribunal || "Não informado",
          grau: process.instance || details.grau || "Não informado",
          dataAjuizamento: details.data_ajuizamento || process.created_at,
          dataAtualizacao: movements?.[0]?.data_hora || details.data_hora_ultima_atualizacao || process.updated_at,
          assuntos: processSubjects,
          movimentos: movements as any[] || undefined,
          status: details.status || "Em andamento"
        });
      }
    } catch (error) {
      console.error("Erro ao processar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm:ss", {
        locale: ptBR
      });
    } catch {
      return "Data inválida";
    }
  };

  // Função para obter classes únicas das movimentações
  const getUniqueClasses = (movements: Array<{ nome: string }> = []) => {
    return [...new Set(movements.map(m => m.nome))];
  };

  if (loading) {
    return <div className="animate-pulse space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
    </div>;
  }

  if (!latestData) {
    return <div className="text-gray-500 text-sm">Nenhum dado disponível</div>;
  }

  return (
    <div>
      {latestData && (
        <>
          <div className="flex flex-col gap-2">
            {/* Badge de movimentações */}
            {latestData.movimentos && latestData.movimentos.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {latestData.movimentos.length} movimentações
                </Badge>
              </div>
            )}

            {/* Badge de status */}
            <div className="flex items-center gap-2">
              <Badge 
                variant={latestData.status === "Baixado" ? "destructive" : "secondary"}
                className={cn(
                  "text-xs",
                  latestData.status === "Baixado" && "bg-red-600 text-white"
                )}
              >
                {latestData.status || "Em andamento"}
              </Badge>
            </div>

            {/* Título e demais informações */}
            <div className="mt-2">
              <h2 className="text-lg font-semibold">{latestData.classe}</h2>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{latestData.tribunal}</span>
              <Badge variant="outline" className="text-xs">
                {latestData.tribunal}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Ajuizamento:</span> {formatDate(latestData.dataAjuizamento)}
              </div>
              <div>
                <span className="font-medium">Última atualização:</span> {formatDate(latestData.dataAtualizacao)}
              </div>
            </div>

            {latestData.assuntos && latestData.assuntos.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {latestData.assuntos.map((assunto, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {assunto.nome}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 