
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";

interface MovementFilter {
  startDate?: Date;
  endDate?: Date;
  code?: number;
  codes?: number[];
  text?: string;
}

interface ProcessMovementsProps {
  processId: string;
  hitId?: string;
  filter?: MovementFilter;
}

export function ProcessMovements({ processId, hitId, filter }: ProcessMovementsProps) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchMovements();
  }, [processId, hitId, filter, currentPage]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('process_movements')
        .select('*', { count: 'exact' })
        .eq('process_id', processId)
        .order('data_hora', { ascending: false });
      
      if (hitId) {
        query = query.eq('hit_id', hitId);
      }

      // Aplicar filtros
      if (filter) {
        if (filter.startDate) {
          query = query.gte('data_hora', filter.startDate.toISOString());
        }
        
        if (filter.endDate) {
          query = query.lte('data_hora', filter.endDate.toISOString());
        }
        
        if (filter.code) {
          query = query.eq('codigo', filter.code);
        }
        
        if (filter.codes && filter.codes.length > 0) {
          query = query.in('codigo', filter.codes);
        }
        
        if (filter.text) {
          query = query.ilike('nome', `%${filter.text}%`);
        }
      }
      
      // Aplicar paginação
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
      
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      setMovements(data || []);
      setTotalPages(count ? Math.ceil(count / itemsPerPage) : 1);
    } catch (error) {
      console.error("Erro ao buscar movimentos:", error);
      toast.error("Não foi possível carregar os movimentos do processo");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
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

  if (movements.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>Nenhuma informação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movements.map((movement, index) => (
        <div key={index} className="bg-white rounded-lg p-3 space-y-2 border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-gray-900 font-medium">
                {movement.nome}
              </p>
              <p className="text-gray-600 text-sm">
                {formatDate(movement.data_hora)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {movement.codigo && (
                <Badge variant="outline" className="text-gray-600">
                  Código: {movement.codigo}
                </Badge>
              )}
              {movement.tipo && (
                <Badge variant="secondary" className="bg-gray-100">
                  {movement.tipo}
                </Badge>
              )}
            </div>
          </div>
          {movement.complemento && (
            <div className="bg-gray-50 p-3 rounded-md text-gray-700 border border-gray-100 text-sm">
              {movement.complemento}
            </div>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
