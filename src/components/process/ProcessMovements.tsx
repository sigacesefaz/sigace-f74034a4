import React, { useState, useEffect, useCallback } from "react";
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
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Filters } from "@/components/ui/filters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import debounce from 'lodash/debounce';

interface MovementFilter {
  startDate?: Date;
  endDate?: Date;
  codes?: number[];
  text?: string;
  ascending?: boolean;
}

interface ProcessMovementsProps {
  processId: string;
  hitId?: string;
  filter?: MovementFilter;
  defaultShowFilter?: boolean;
  defaultAscending?: boolean;
}

export function ProcessMovements({
  processId,
  hitId,
  filter,
  defaultShowFilter = false,
  defaultAscending = false
}: ProcessMovementsProps) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilter, setShowFilter] = useState(defaultShowFilter);
  const itemsPerPage = 5;

  // Filtros locais
  const [startDate, setStartDate] = useState<Date | undefined>(filter?.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(filter?.endDate);
  const [textFilter, setTextFilter] = useState<string>(filter?.text || "");
  const [appliedFilter, setAppliedFilter] = useState<MovementFilter | undefined>(filter);

  useEffect(() => {
    setAppliedFilter(filter);
  }, [filter]);

  useEffect(() => {
    fetchMovements();
  }, [processId, hitId, appliedFilter, currentPage]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      // Primeiro, vamos buscar apenas a contagem total
      const countQuery = supabase.from('process_movements')
        .select('*', { count: 'exact', head: true })
        .eq('process_id', processId);

      if (hitId) {
        countQuery.eq('hit_id', hitId);
      }

      // Aplicar os mesmos filtros na query de contagem
      if (appliedFilter) {
        if (appliedFilter.startDate) {
          countQuery.gte('data_hora', appliedFilter.startDate.toISOString());
        }
        if (appliedFilter.endDate) {
          countQuery.lte('data_hora', appliedFilter.endDate.toISOString());
        }
        if (appliedFilter.text) {
          countQuery.textSearch('nome', appliedFilter.text);
        }
        if (appliedFilter.codes && appliedFilter.codes.length > 0) {
          countQuery.in('codigo', appliedFilter.codes);
        }
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Calcular o número total de páginas
      const totalItems = count || 0;
      const calculatedTotalPages = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(calculatedTotalPages);

      // Ajustar a página atual se necessário
      const adjustedCurrentPage = Math.min(currentPage, calculatedTotalPages || 1);
      if (adjustedCurrentPage !== currentPage) {
        setCurrentPage(adjustedCurrentPage);
      }

      // Se não houver itens, não precisamos fazer a segunda query
      if (totalItems === 0) {
        setMovements([]);
        return;
      }

      // Calcular o offset correto
      const from = (adjustedCurrentPage - 1) * itemsPerPage;
      const to = Math.min(from + itemsPerPage - 1, totalItems - 1);

      // Fazer a query principal com o offset ajustado
      let query = supabase.from('process_movements')
        .select('*')
        .eq('process_id', processId)
        .order('data_hora', {
          ascending: appliedFilter?.ascending ?? defaultAscending
        })
        .range(from, to);

      if (hitId) {
        query = query.eq('hit_id', hitId);
      }

      // Aplicar os mesmos filtros na query principal
      if (appliedFilter) {
        if (appliedFilter.startDate) {
          query = query.gte('data_hora', appliedFilter.startDate.toISOString());
        }
        if (appliedFilter.endDate) {
          query = query.lte('data_hora', appliedFilter.endDate.toISOString());
        }
        if (appliedFilter.text) {
          query.textSearch('nome', appliedFilter.text);
        }
        if (appliedFilter.codes && appliedFilter.codes.length > 0) {
          query = query.in('codigo', appliedFilter.codes);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setMovements(data || []);
    } catch (error) {
      console.error("Erro ao buscar movimentos:", error);
      toast.error("Não foi possível carregar os movimentos do processo");
      setMovements([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const newFilter = { ...appliedFilter };
    
    if (textFilter) {
      newFilter.text = textFilter;
    } else {
      delete newFilter.text;
    }
    
    if (startDate) {
      newFilter.startDate = startDate;
    } else {
      delete newFilter.startDate;
    }
    
    if (endDate) {
      newFilter.endDate = endDate;
    } else {
      delete newFilter.endDate;
    }

    setAppliedFilter(Object.keys(newFilter).length > 0 ? newFilter : undefined);
    setCurrentPage(1);
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
    return <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>;
  }
  return <div className="space-y-3 max-h-[60vh] overflow-auto">
      <div className="flex flex-wrap items-center gap-2 sticky top-0 bg-white z-10 py-2 border-b">
        <div className="flex-none">
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="justify-start" />}
        </div>
        
        <div className="flex flex-1 items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAppliedFilter({
                  ...appliedFilter,
                  ascending: !(appliedFilter?.ascending ?? false)
                });
              }}
              className="h-7 px-2 text-xs"
            >
              {appliedFilter?.ascending ? (
                <ChevronUp className="h-3 w-3 mr-1" />
              ) : (
                <ChevronDown className="h-3 w-3 mr-1" />
              )}
              {appliedFilter?.ascending ? "Antigos Primeiro" : "Recentes Primeiro"}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Pesquisar no texto do movimento"
              value={textFilter}
              onChange={(e) => setTextFilter(e.target.value)}
              className="h-7 w-64 text-xs"
            />

            <div className="flex items-center gap-1">
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                placeholder="Data inicial"
                className="h-7 w-32 text-xs bg-white [&_button]:bg-blue-500 [&_button]:text-white [&_button:hover]:text-white [&_.rdp-day:hover]:text-white [&_.rdp-day_button:hover]:text-white [&_.rdp-button:hover]:text-white"
              />

              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                placeholder="Data final"
                className="h-7 w-32 text-xs bg-white [&_button]:bg-blue-500 [&_button]:text-white [&_button:hover]:text-white [&_.rdp-day:hover]:text-white [&_.rdp-day_button:hover]:text-white [&_.rdp-button:hover]:text-white"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleFilter}
              className="h-7 px-2 text-xs hover:bg-gray-100"
            >
              <Search className="h-3 w-3 mr-1" />
              Filtrar
            </Button>

            {(textFilter || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTextFilter("");
                  setStartDate(undefined);
                  setEndDate(undefined);
                  setAppliedFilter(undefined);
                  setCurrentPage(1);
                }}
                className="h-7 px-2 text-xs hover:bg-gray-100"
              >
                <X className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {movements.length === 0 ? (
        <div className="text-center py-2 text-gray-500 text-xs">
          <p>Nenhuma informação encontrada</p>
        </div>
      ) : (
        <div className="space-y-2 pb-1">
          {movements.map((movement, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-2 space-y-1 border border-gray-100"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-gray-900 font-medium text-xs">
                    #{movements.length - index + ((totalPages - currentPage) * itemsPerPage)} - {movement.nome}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {formatDate(movement.data_hora)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  {movement.codigo && (
                    <Badge variant="outline" className="text-gray-600 text-xs h-5 px-1">
                      Código: {movement.codigo}
                    </Badge>
                  )}
                  {movement.tipo && (
                    <Badge variant="secondary" className="bg-gray-100 text-xs h-5 px-1">
                      {movement.tipo}
                    </Badge>
                  )}
                </div>
              </div>
              {movement.complemento && (
                <div className="bg-gray-50 p-2 rounded-md text-gray-700 border border-gray-100 text-xs">
                  {movement.complemento}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>;
}