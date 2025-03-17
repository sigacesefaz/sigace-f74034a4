import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MaskedInput } from "@/components/ui/input-mask";

interface ProcessSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function ProcessSearchInput({ value, onChange, disabled = false }: ProcessSearchInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="processNumber">Número do Processo</Label>
      <MaskedInput
        id="processNumber"
        mask="process"
        value={value}
        onChange={onChange}
        className="flex h-10 w-full"
        placeholder="0000000-00.0000.0.00.0000"
        disabled={disabled}
      />
    </div>
  );
}
