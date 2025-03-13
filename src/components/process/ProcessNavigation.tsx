
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 bg-gray-50 p-2 rounded">
      <div className="flex-grow mb-2 sm:mb-0">
        <p className="text-xs sm:text-sm text-gray-700">
          Movimento processual {currentMovimentoIndex + 1} de {totalMovimentos}
        </p>
      </div>
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrevMovimento}
          disabled={currentMovimentoIndex === 0}
          className="text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          <span className="hidden xs:inline">Anterior</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNextMovimento}
          disabled={currentMovimentoIndex === totalMovimentos - 1}
          className="text-xs sm:text-sm"
        >
          <span className="hidden xs:inline">Próximo</span>
          <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
