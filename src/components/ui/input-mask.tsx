import React, { useRef, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type MaskType = "cpf" | "cnpj" | "process";

interface InputMaskProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  mask: MaskType;
  value: string;
  onChange: (value: string) => void;
}

export function MaskedInput({ mask, value, onChange, className, ...props }: InputMaskProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const [isComplete, setIsComplete] = useState(false);

  const getMaxLength = (maskType: MaskType): number => {
    switch (maskType) {
      case "cpf":
        return 11;
      case "cnpj":
        return 14;
      case "process":
        return 20;
      default:
        return 0;
    }
  };

  const applyMask = (value: string, maskType: MaskType): string => {
    const digits = value.replace(/\D/g, '');
    
    switch (maskType) {
      case "cpf": {
        const cpf = digits.slice(0, 11);
        if (cpf.length <= 3) return cpf;
        if (cpf.length <= 6) return cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
        if (cpf.length <= 9) return cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
      }
      
      case "cnpj": {
        const cnpj = digits.slice(0, 14);
        if (cnpj.length <= 2) return cnpj;
        if (cnpj.length <= 5) return cnpj.replace(/^(\d{2})(\d{0,3})/, '$1.$2');
        if (cnpj.length <= 8) return cnpj.replace(/^(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
        if (cnpj.length <= 12) return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
      }
      
      case "process": {
        const proc = digits.slice(0, 20);
        if (proc.length <= 7) return proc;
        if (proc.length <= 9) return proc.replace(/^(\d{7})(\d{0,2})/, '$1-$2');
        if (proc.length <= 13) return proc.replace(/^(\d{7})(\d{2})(\d{0,4})/, '$1-$2.$3');
        if (proc.length <= 14) return proc.replace(/^(\d{7})(\d{2})(\d{4})(\d{0,1})/, '$1-$2.$3.$4');
        if (proc.length <= 16) return proc.replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{0,2})/, '$1-$2.$3.$4.$5');
        return proc.replace(/^(\d{7})(\d{2})(\d{4})(\d{1})(\d{2})(\d{0,4})/, '$1-$2.$3.$4.$5.$6');
      }
      
      default:
        return digits;
    }
  };

  const getPlaceholder = (): string => {
    switch (mask) {
      case "cpf":
        return "000.000.000-00";
      case "cnpj":
        return "00.000.000/0000-00";
      case "process":
        return "0000000-00.0000.0.00.0000";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digits = inputValue.replace(/\D/g, '');
    const maxLength = getMaxLength(mask);
    
    // Atualiza o valor local
    setLocalValue(digits);

    // Verifica se o número está completo
    const isInputComplete = digits.length === maxLength;
    setIsComplete(isInputComplete);

    // Se o número estiver completo, notifica o componente pai
    if (isInputComplete) {
      onChange(digits);
    }
  };

  // Efeito para sincronizar o valor externo com o valor local
  useEffect(() => {
    setLocalValue(value);
    setIsComplete(value.length === getMaxLength(mask));
  }, [value, mask]);

  return (
    <Input
      ref={inputRef}
      value={applyMask(localValue, mask)}
      onChange={handleChange}
      placeholder={getPlaceholder()}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        isComplete ? "border-green-500" : "",
        className
      )}
      {...props}
    />
  );
} 