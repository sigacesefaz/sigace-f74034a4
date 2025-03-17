
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Search, X } from "lucide-react";

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="textFilter">Pesquisar por texto</Label>
          <Input
            id="textFilter"
            value={textFilter}
            onChange={(e) => setTextFilter(e.target.value)}
            placeholder="Buscar por texto..."
          />
        </div>
        
        {showCodeFilter && (
          <div>
            <Label htmlFor="codeFilter">Código</Label>
            <Input
              id="codeFilter"
              value={codeFilter}
              onChange={(e) => setCodeFilter(e.target.value)}
              placeholder="Filtrar por código..."
            />
          </div>
        )}
        
        {showDateFilter && (
          <>
            <div>
              <Label htmlFor="startDate">Data inicial</Label>
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="endDate">Data final</Label>
              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleResetFilter}
        >
          <X className="mr-2 h-4 w-4" /> Limpar
        </Button>
        <Button 
          onClick={handleApplyFilter}
        >
          <Search className="mr-2 h-4 w-4" /> Aplicar
        </Button>
      </div>
    </div>
  );
}
