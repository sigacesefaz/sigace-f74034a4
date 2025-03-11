import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Movement } from "@/types/process";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProcessMovementsProps {
  movimentos: Movement[];
  currentIndex?: number;
}

export function ProcessMovements({ movimentos, currentIndex = 0 }: ProcessMovementsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const sortedMovimentos = [...movimentos].sort((a, b) => {
    const dateA = new Date(a.data).getTime();
    const dateB = new Date(b.data).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(sortedMovimentos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovimentos = sortedMovimentos.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  // Atualiza a página quando o currentIndex muda para mostrar a movimentação atual
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < sortedMovimentos.length) {
      const targetPage = Math.floor(currentIndex / itemsPerPage) + 1;
      setCurrentPage(targetPage);
    }
  }, [currentIndex, sortedMovimentos.length]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-gray-900">
            Eventos Processuais ({sortedMovimentos.length})
          </h3>
          {sortedMovimentos.length > 0 && (
            <span className="text-xs text-blue-600 font-medium">
              Exibindo evento {currentIndex + 1} de {sortedMovimentos.length}
            </span>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1 text-sm">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-6 px-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-600 min-w-[3rem] text-center">
              {currentPage}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-6 px-1.5"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {currentMovimentos.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">
            Nenhum evento encontrado.
          </p>
        ) : (
          currentMovimentos.map((movimento, index) => {
            const isCurrentMovement = index + startIndex === currentIndex;
            return (
              <div
                key={movimento.id}
                className={`bg-white p-2 rounded-lg space-y-1 text-sm transition-all duration-200 ${
                  isCurrentMovement ? "ring-2 ring-blue-500 bg-blue-50 shadow-sm" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-gray-900 flex-1">{movimento.descricao}</p>
                  <p className="text-gray-500 whitespace-nowrap">
                    {formatDate(movimento.data)}
                  </p>
                </div>
                {movimento.complemento && (
                  <p className="text-gray-600">{movimento.complemento}</p>
                )}
                {movimento.tipo && (
                  <p className="text-gray-500 text-xs">Tipo: {movimento.tipo}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
