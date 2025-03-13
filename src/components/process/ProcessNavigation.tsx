
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProcessNavigationProps {
  currentMovimentoIndex: number;
  totalMovimentos: number;
  handlePrevMovimento: () => void;
  handleNextMovimento: () => void;
}

export function ProcessNavigation({
  currentMovimentoIndex,
  totalMovimentos,
  handlePrevMovimento,
  handleNextMovimento
}: ProcessNavigationProps) {
  if (totalMovimentos <= 1) return null;
  
  return (
    <div className="flex items-center justify-between mt-4 bg-gray-50 p-2 rounded">
      <div className="flex-grow">
        <p className="text-sm text-gray-700">
          Movimento processual {currentMovimentoIndex + 1} de {totalMovimentos}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrevMovimento}
          disabled={currentMovimentoIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNextMovimento}
          disabled={currentMovimentoIndex === totalMovimentos - 1}
        >
          Próximo
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
