
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { Filters } from "@/components/ui/filters";

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
  defaultShowFilter?: boolean;
}

export function ProcessMovements({ processId, hitId, filter, defaultShowFilter = false }: ProcessMovementsProps) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(defaultShowFilter);
  const itemsPerPage = 5;

  // Filtros locais
  const [startDate, setStartDate] = useState<Date | undefined>(filter?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(filter?.endDate);
  const [codeFilter, setCodeFilter] = useState<string>(filter?.code?.toString() || "");
  const [textFilter, setTextFilter] = useState<string>(filter?.text || "");
  const [appliedFilter, setAppliedFilter] = useState<MovementFilter | undefined>(undefined);

  useEffect(() => {
    fetchMovements();
  }, [processId, hitId, appliedFilter, currentPage]);

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
      if (appliedFilter) {
        if (appliedFilter.startDate) {
          query = query.gte('data_hora', appliedFilter.startDate.toISOString());
        }
        
        if (appliedFilter.endDate) {
          query = query.lte('data_hora', appliedFilter.endDate.toISOString());
        }
        
        if (appliedFilter.code) {
          query = query.eq('codigo', appliedFilter.code);
        }
        
        if (appliedFilter.codes && appliedFilter.codes.length > 0) {
          query = query.in('codigo', appliedFilter.codes);
        }
        
        if (appliedFilter.text) {
          query = query.ilike('nome', `%${appliedFilter.text}%`);
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
  
  const handleApplyFilter = (newFilter: MovementFilter) => {
    setAppliedFilter(Object.keys(newFilter).length > 0 ? newFilter : undefined);
    setCurrentPage(1);
  };
  
  const handleResetFilter = () => {
    setAppliedFilter(undefined);
    setCurrentPage(1);
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

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {appliedFilter && Object.keys(appliedFilter).length > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              Filtros aplicados: {appliedFilter.text ? `Texto: "${appliedFilter.text}"` : ''} 
              {appliedFilter.code ? ` Código: ${appliedFilter.code}` : ''} 
              {appliedFilter.startDate ? ` De: ${format(appliedFilter.startDate, 'dd/MM/yyyy')}` : ''} 
              {appliedFilter.endDate ? ` Até: ${format(appliedFilter.endDate, 'dd/MM/yyyy')}` : ''}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilter(!showFilter)}
          >
            {showFilter ? "Ocultar Filtros" : "Filtrar"}
          </Button>
          {appliedFilter && Object.keys(appliedFilter).length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetFilter}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>
      
      {showFilter && (
        <Filters 
          onFilter={handleApplyFilter}
          onResetFilter={handleResetFilter}
          showCodeFilter={true}
          showDateFilter={true}
        />
      )}

      {movements.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>Nenhuma informação encontrada</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
