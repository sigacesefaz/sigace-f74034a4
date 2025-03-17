
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, ArrowLeft, ArrowRight } from "lucide-react";
import { DatajudMovement } from "@/types/datajud";
import { formatDate } from "@/lib/utils";

interface ProcessEventsProps {
  currentProcess: {
    movimentos: DatajudMovement[];
  };
}

export function ProcessEvents({ currentProcess }: ProcessEventsProps) {
  const [isTabsExpanded, setIsTabsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ordenar movimentos do mais recente para o mais antigo e calcular paginação
  const sortedMovimentos = [...(currentProcess.movimentos || [])].sort((a, b) => {
    return new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime();
  });

  const totalEventos = sortedMovimentos.length;
  const totalPages = Math.ceil(totalEventos / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageMovimentos = sortedMovimentos.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="mt-8 border-t pt-4">
      <Button
        variant="ghost"
        onClick={() => setIsTabsExpanded(!isTabsExpanded)}
        className="w-full flex justify-between items-center py-2 hover:bg-gray-100"
      >
        <span className="font-semibold">Informações dos Eventos</span>
        {isTabsExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </Button>
      
      {isTabsExpanded && (
        <div className="mt-4">
          <div className="space-y-4">
            {currentPageMovimentos.map((movimento, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">
                      #{totalEventos - startIndex - index} {movimento.nome}
                      {movimento.codigo && 
                        <span className="ml-2 text-sm text-gray-500">
                          (Código: {movimento.codigo})
                        </span>
                      }
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(movimento.dataHora)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Paginação */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
