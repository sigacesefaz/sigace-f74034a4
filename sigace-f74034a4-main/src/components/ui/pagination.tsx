
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
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

  // Layout mais minimalista com menos botões
  const renderPageButtons = () => {
    const pageButtons = [];
    const maxButtons = 3; // Reduzindo para estilo mais minimalista
    
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Primeira página
    if (startPage > 1) {
      pageButtons.push(
        <Button
          key="first"
          variant="outline"
          size="sm"
          onClick={() => goToPage(1)}
          className="w-7 h-7 p-0 text-xs"
        >
          1
        </Button>
      );
      
      if (startPage > 2) {
        pageButtons.push(
          <span key="ellipsis1" className="mx-1 text-gray-500">...</span>
        );
      }
    }
    
    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="w-7 h-7 p-0 text-xs"
        >
          {i}
        </Button>
      );
    }
    
    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(
          <span key="ellipsis2" className="mx-1 text-gray-500">...</span>
        );
      }
      
      pageButtons.push(
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => goToPage(totalPages)}
          className="w-7 h-7 p-0 text-xs"
        >
          {totalPages}
        </Button>
      );
    }
    
    return pageButtons;
  };

  return (
    <div className={`flex items-center space-x-1 ${className || ''}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-7 h-7 p-0"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
      
      {renderPageButtons()}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-7 h-7 p-0"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
