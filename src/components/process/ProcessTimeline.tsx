import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Chrono } from "react-chrono";

interface ProcessMovement {
  id: string;
  process_id: number;
  nome: string;
  data_hora: string;
  codigo?: number;
  tipo?: string;
  complemento?: string;
}

interface ProcessHit {
  id: string;
  nome: string;
  data_hora: string;
}

interface ProcessTimelineProps {
  processId: string;
  hitId?: string;
  hits?: ProcessHit[];
  filter?: {
    startDate?: Date;
    endDate?: Date;
    ascending?: boolean;
  };
}

const getBadgeColor = (code: string) => {
  // Gera uma cor consistente baseada no código
  const colors = [
    '#FFD700', // Amarelo
    '#87CEEB', // Azul claro
    '#98FB98', // Verde claro
    '#FFA07A', // Salmão
    '#9370DB', // Roxo
    '#FF6347', // Tomate
    '#40E0D0', // Turquesa
    '#FF69B4', // Rosa
  ];
  
  // Gera um índice estável baseado no código
  const hash = code.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return colors[hash % colors.length];
};

export function ProcessTimeline({
  processId,
  hitId,
  filter,
}: ProcessTimelineProps) {
  const [movements, setMovements] = useState<ProcessMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetchMovements();
  }, [processId, hitId, filter]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('process_movements')
        .select('id, process_id, nome, data_hora, codigo, tipo, complemento')
        .eq('process_id', processId)
        .order('data_hora', { ascending: filter?.ascending ?? false });

      if (hitId) {
        query = query.eq('hit_id', hitId);
      }

      if (filter?.startDate) {
        query = query.gte('data_hora', filter.startDate.toISOString());
      }

      if (filter?.endDate) {
        query = query.lte('data_hora', filter.endDate.toISOString());
      }

      const { data, error } = await query.returns<ProcessMovement[]>();
      
      if (error) throw error;
      
      setMovements(data as ProcessMovement[] || []);
    } catch (error) {
      console.error("Erro ao buscar movimentos:", error);
      toast.error("Não foi possível carregar a timeline");
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR
      });
    } catch {
      return "Data inválida";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handlePrev = () => {
    setActiveIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveIndex(prev => Math.min(movements.length - 1, prev + 1));
  };

  return (
    <div className="h-[400px] flex flex-col">
      {movements.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum movimento encontrado</p>
      ) : (
        <Chrono
          items={movements.map(mov => ({
            title: format(new Date(mov.data_hora), "dd/MM/yyyy"),
            cardTitle: mov.nome,
            cardSubtitle: mov.codigo ? `Código: ${mov.codigo}` : undefined,
            cardDetailedText: mov.complemento,
          }))}
          mode="HORIZONTAL"
          activeItemIndex={activeIndex}
          onItemSelected={({ index }: { index: number }) => setActiveIndex(index)}
          theme={{
            primary: '#3b82f6',
            secondary: '#f3f4f6',
            cardBgColor: '#ffffff',
            titleColor: '#1f2937',
            titleColorActive: '#3b82f6',
            cardTitleColor: '#1f2937',
            cardSubtitleColor: '#6b7280',
            cardTextColor: '#374151',
          }}
          scrollable={{ scrollbar: true }}
          cardHeight={100}
          cardWidth={200}
          cardPositionHorizontal="TOP"
          cardPositionVertical="ALTERNATE"
          fontSizes={{
            title: '14px',
            cardTitle: '12px',
            cardSubtitle: '11px',
            cardText: '11px'
          }}
          classNames={{
            timeline: 'mx-auto',
            card: 'shadow-sm p-2',
          }}
          cardTitle={(item: {cardTitle: string; cardSubtitle?: string}) => (
            <div className="flex flex-col gap-1">
              <span>{item.cardTitle}</span>
              {item.cardSubtitle && (
                <Badge 
                  variant="outline" 
                  className="w-fit"
                  style={{
                    backgroundColor: getBadgeColor(item.cardSubtitle.replace('Código: ', ''))
                  }}
                >
                  Código: {item.cardSubtitle.replace('Código: ', '')}
                </Badge>
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
