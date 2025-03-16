
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, X } from 'lucide-react';

export interface FiltersProps {
  onFilter: (filters: {
    startDate?: Date;
    endDate?: Date;
    code?: string;
    text?: string;
  }) => void;
  onResetFilter: () => void;
  showCodeFilter?: boolean;
  showDateFilter?: boolean;
  initialValues?: {
    startDate?: Date;
    endDate?: Date;
    code?: string;
    text?: string;
  };
}

export function Filters({ 
  onFilter, 
  onResetFilter,
  showCodeFilter = true,
  showDateFilter = true,
  initialValues = {}
}: FiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(initialValues.startDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialValues.endDate);
  const [code, setCode] = useState(initialValues.code || '');
  const [text, setText] = useState(initialValues.text || '');

  const handleFilter = () => {
    onFilter({
      startDate,
      endDate,
      code: code.trim() ? code : undefined,
      text: text.trim() ? text : undefined
    });
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCode('');
    setText('');
    onResetFilter();
  };

  return (
    <div className="bg-gray-50 p-3 rounded-md border mb-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showDateFilter && (
          <>
            <div>
              <Label htmlFor="startDate">Data inicial</Label>
              <DatePicker
                selected={startDate}
                onSelect={setStartDate}
                className="w-full"
                placeholder="Selecione a data inicial"
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data final</Label>
              <DatePicker
                selected={endDate}
                onSelect={setEndDate}
                className="w-full"
                placeholder="Selecione a data final"
              />
            </div>
          </>
        )}
        {showCodeFilter && (
          <div>
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Filtrar por código"
            />
          </div>
        )}
        <div>
          <Label htmlFor="text">Texto</Label>
          <Input
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Filtrar por texto"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          <X className="h-4 w-4 mr-1" /> Limpar
        </Button>
        <Button onClick={handleFilter}>
          <Search className="h-4 w-4 mr-1" /> Aplicar
        </Button>
      </div>
    </div>
  );
}
