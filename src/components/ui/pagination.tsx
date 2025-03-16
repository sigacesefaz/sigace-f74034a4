
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string; // Adicionando propriedade className opcional
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  // Não exibir paginação se só houver uma página
  if (totalPages <= 1) {
    return null;
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Renderizar no máximo 5 botões de página
  const renderPageButtons = () => {
    const pageButtons = [];
    const maxButtons = 5;
    const halfMaxButtons = Math.floor(maxButtons / 2);
    
    let startPage = Math.max(1, currentPage - halfMaxButtons);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Adicionar botão para primeira página
    if (startPage > 1) {
      pageButtons.push(
        <Button
          key="first"
          variant="outline"
          size="sm"
          onClick={() => goToPage(1)}
          className="w-8 h-8 p-0"
        >
          1
        </Button>
      );
      
      if (startPage > 2) {
        pageButtons.push(
          <span key="ellipsis1" className="mx-1">...</span>
        );
      }
    }
    
    // Adicionar botões de páginas
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="w-8 h-8 p-0"
        >
          {i}
        </Button>
      );
    }
    
    // Adicionar botão para última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(
          <span key="ellipsis2" className="mx-1">...</span>
        );
      }
      
      pageButtons.push(
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => goToPage(totalPages)}
          className="w-8 h-8 p-0"
        >
          {totalPages}
        </Button>
      );
    }
    
    return pageButtons;
  };

  return (
    <div className={`flex items-center justify-center space-x-2 mt-4 ${className || ''}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {renderPageButtons()}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
