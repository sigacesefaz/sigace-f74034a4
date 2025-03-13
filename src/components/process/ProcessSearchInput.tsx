
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProcessSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProcessSearchInput({ value, onChange, disabled = false }: ProcessSearchInputProps) {
  const handleProcessNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '').slice(0, 20); // Limitar a 20 caracteres numéricos
    
    // Aplicar máscara
    let maskedValue = '';
    if (numericValue.length > 0) {
      // Aplicar formato: 0000000-00.0000.0.00.0000
      const parts = [];
      if (numericValue.length > 0) parts.push(numericValue.slice(0, Math.min(7, numericValue.length)));
      if (numericValue.length > 7) parts.push('-' + numericValue.slice(7, Math.min(9, numericValue.length)));
      if (numericValue.length > 9) parts.push('.' + numericValue.slice(9, Math.min(13, numericValue.length)));
      if (numericValue.length > 13) parts.push('.' + numericValue.slice(13, Math.min(14, numericValue.length)));
      if (numericValue.length > 14) parts.push('.' + numericValue.slice(14, Math.min(16, numericValue.length)));
      if (numericValue.length > 16) parts.push('.' + numericValue.slice(16, Math.min(20, numericValue.length)));
      
      maskedValue = parts.join('');
    }
    
    onChange(maskedValue);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="processNumber">Número do Processo</Label>
      <Input
        id="processNumber"
        value={value}
        onChange={handleProcessNumberChange}
        className="flex h-10 w-full"
        placeholder="0000000-00.0000.0.00.0000"
        disabled={disabled}
      />
    </div>
  );
}
