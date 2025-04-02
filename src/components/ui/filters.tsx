
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";
import { useIsMobileOrTablet } from "@/hooks/use-mobile";

interface FiltersProps {
  onFilter: (filters: { startDate?: Date; endDate?: Date; code?: string; text?: string; }) => void;
  onResetFilter: () => void;
  showDateFilter?: boolean;
  showCodeFilter?: boolean;
  initialValues?: { startDate?: Date; endDate?: Date; code?: string; text?: string; };
}

export function Filters({ 
  onFilter, 
  onResetFilter, 
  showDateFilter = true, 
  showCodeFilter = true,
  initialValues = {}
}: FiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(initialValues.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialValues.endDate);
  const [codeFilter, setCodeFilter] = useState<string>(initialValues.code || "");
  const [textFilter, setTextFilter] = useState<string>(initialValues.text || "");
  const isMobileOrTablet = useIsMobileOrTablet();

  const handleApplyFilter = () => {
    const filters: { startDate?: Date; endDate?: Date; code?: string; text?: string; } = {};
    
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (codeFilter.trim()) filters.code = codeFilter.trim();
    if (textFilter.trim()) filters.text = textFilter.trim();
    
    onFilter(filters);
  };

  const handleResetFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCodeFilter("");
    setTextFilter("");
    onResetFilter();
  };

  return (
    <div className="bg-gray-50 p-3 rounded-md space-y-4 mb-4 border">
      <div className={`grid gap-4 ${isMobileOrTablet ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        <div>
          <Label htmlFor="textFilter" className="mb-1 block">Pesquisar por texto</Label>
          <Input
            id="textFilter"
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            placeholder="Buscar por texto..."
            className="w-full"
          />
        </div>
        
        {showCodeFilter && (
          <div>
            <Label htmlFor="codeFilter" className="mb-1 block">Código</Label>
            <Input
              id="codeFilter"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              placeholder="Filtrar por código..."
              className="w-full"
            />
          </div>
        )}
        
        {showDateFilter && (
          <>
            <div>
              <Label htmlFor="startDate" className="mb-1 block">Data inicial</Label>
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="endDate" className="mb-1 block">Data final</Label>
              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={handleResetFilter}
          className="w-full sm:w-auto"
        >
          <X className="mr-2 h-4 w-4" /> Limpar
        </Button>
        <Button 
          onClick={handleApplyFilter}
          className="w-full sm:w-auto"
        >
          <Search className="mr-2 h-4 w-4" /> Aplicar
        </Button>
      </div>
    </div>
  );
}
