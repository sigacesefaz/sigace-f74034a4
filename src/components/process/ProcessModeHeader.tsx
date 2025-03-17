
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type FormMode = "search" | "details" | "manual";

interface ProcessModeHeaderProps {
  currentMode: FormMode;
  onBack: () => void;
}

export function ProcessModeHeader({ currentMode, onBack }: ProcessModeHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center mb-6">
      <Button 
        variant="ghost" 
        onClick={onBack} 
        className="mr-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar
      </Button>
      <h1 className="text-2xl font-bold">
        {currentMode === "search" ? "Novo Processo" : 
         currentMode === "details" ? "Detalhes do Processo" : 
         "Cadastro Manual de Processo"}
      </h1>
    </div>
  );
}
