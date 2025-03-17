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
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { Filters } from "@/components/ui/filters";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
interface MovementFilter {
  startDate?: Date;
  endDate?: Date;
  code?: string; // Alterado para string para compatibilidade
  codes?: number[];
  text?: string;
}
interface ProcessMovementsProps {
  processId: string;
  hitId?: string;
  filter?: MovementFilter;
  defaultShowFilter?: boolean;
}
export function ProcessMovements({
  processId,
  hitId,
  filter,
  defaultShowFilter = false
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
  const [codeFilter, setCodeFilter] = useState<string>(filter?.code || "");
  const [textFilter, setTextFilter] = useState<string>(filter?.text || "");
  const [appliedFilter, setAppliedFilter] = useState<MovementFilter | undefined>(undefined);
  useEffect(() => {
    fetchMovements();
  }, [processId, hitId, appliedFilter, currentPage]);
  const fetchMovements = async () => {
    try {
      setLoading(true);
      let query = supabase.from('process_movements').select('*', {
        count: 'exact'
      }).eq('process_id', processId).order('data_hora', {
        ascending: false
      });
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
          // Converter para número se possível
          const codeNum = parseInt(appliedFilter.code);
          if (!isNaN(codeNum)) {
            query = query.eq('codigo', codeNum);
          }
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
      const {
        data,
        error,
        count
      } = await query;
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
  const handleApplyFilter = (filters: {
    startDate?: Date;
    endDate?: Date;
    code?: string;
    text?: string;
  }) => {
    // Converter o filtro recebido para o formato MovementFilter
    const newFilter: MovementFilter = {};
    if (filters.startDate) newFilter.startDate = filters.startDate;
    if (filters.endDate) newFilter.endDate = filters.endDate;
    if (filters.code) newFilter.code = filters.code;
    if (filters.text) newFilter.text = filters.text;
    setAppliedFilter(Object.keys(newFilter).length > 0 ? newFilter : undefined);
    setCurrentPage(1);
  };
  const handleResetFilter = () => {
    setAppliedFilter(undefined);
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
      <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-2">
        <div className="flex-1">
          {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="justify-start" />}
        </div>
        <div className="flex gap-2">
          
        </div>
      </div>
      
      <Collapsible open={showFilter} onOpenChange={setShowFilter}>
        <CollapsibleContent>
          <div className="bg-gray-50 p-3 rounded-md space-y-4 mb-4 border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="textFilter">Pesquisar por texto</Label>
                <Input id="textFilter" value={textFilter} onChange={e => setTextFilter(e.target.value)} placeholder="Buscar por texto..." />
              </div>
              
              <div>
                <Label htmlFor="codeFilter">Código</Label>
                <Input id="codeFilter" value={codeFilter} onChange={e => setCodeFilter(e.target.value)} placeholder="Filtrar por código..." />
              </div>
              
              <div>
                <Label htmlFor="startDate">Data inicial</Label>
                <DatePicker selected={startDate} onSelect={setStartDate} className="w-full" />
              </div>
              
              <div>
                <Label htmlFor="endDate">Data final</Label>
                <DatePicker selected={endDate} onSelect={setEndDate} className="w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleResetFilter}>
                <X className="mr-2 h-4 w-4" /> Limpar
              </Button>
              <Button onClick={() => handleApplyFilter({
              startDate,
              endDate,
              code: codeFilter,
              text: textFilter
            })}>
                <Search className="mr-2 h-4 w-4" /> Aplicar
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {appliedFilter && Object.keys(appliedFilter).length > 0 && <div className="text-xs text-gray-600 mb-1">
          Filtros aplicados: {appliedFilter.text ? `Texto: "${appliedFilter.text}"` : ''} 
          {appliedFilter.code ? ` Código: ${appliedFilter.code}` : ''} 
          {appliedFilter.startDate ? ` De: ${format(appliedFilter.startDate, 'dd/MM/yyyy')}` : ''} 
          {appliedFilter.endDate ? ` Até: ${format(appliedFilter.endDate, 'dd/MM/yyyy')}` : ''}
          <Button variant="ghost" size="sm" onClick={handleResetFilter} className="ml-2 h-5 px-2 text-xs">
            <X className="h-3 w-3 mr-1" /> Limpar
          </Button>
        </div>}

      {movements.length === 0 ? <div className="text-center py-2 text-gray-500 text-xs">
          <p>Nenhuma informação encontrada</p>
        </div> : <div className="space-y-2 pb-1">
          {movements.map((movement, index) => <div key={index} className="bg-white rounded-lg p-2 space-y-1 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-gray-900 font-medium text-xs">
                    {movement.nome}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {formatDate(movement.data_hora)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  {movement.codigo && <Badge variant="outline" className="text-gray-600 text-xs h-5 px-1">
                      Código: {movement.codigo}
                    </Badge>}
                  {movement.tipo && <Badge variant="secondary" className="bg-gray-100 text-xs h-5 px-1">
                      {movement.tipo}
                    </Badge>}
                </div>
              </div>
              {movement.complemento && <div className="bg-gray-50 p-2 rounded-md text-gray-700 border border-gray-100 text-xs">
                  {movement.complemento}
                </div>}
            </div>)}
        </div>}
    </div>;
}