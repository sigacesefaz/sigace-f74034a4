
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

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
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-gray-500">
        {totalMovimentos > 1 ? (
          <span>Movimento {currentMovimentoIndex + 1} de {totalMovimentos}</span>
        ) : (
          <span>Detalhes do Processo</span>
        )}
      </div>
      
      {totalMovimentos > 1 && (
        <div className="flex space-x-2">
          <Button
            size="icon"
            variant="outline"
            onClick={handlePrevMovimento}
            disabled={currentMovimentoIndex === 0}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleNextMovimento}
            disabled={currentMovimentoIndex === totalMovimentos - 1}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
