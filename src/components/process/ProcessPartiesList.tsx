
import React from "react";
import { DatajudParty } from "@/types/datajud";
import { formatCPF, formatCNPJ } from "@/utils/masks";
import { Badge } from "@/components/ui/badge";
import { useBreakpoint } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ProcessPartiesListProps {
  parties: DatajudParty[] | undefined;
  movements?: Array<{
    id: string;
    nome: string;
    data_hora: string;
    complemento?: string;
    codigo?: string;
    tipo?: string;
  }>;
  currentMovementIndex?: number;
}

export function ProcessPartiesList({ parties, movements, currentMovementIndex = 0 }: ProcessPartiesListProps) {
  const breakpoint = useBreakpoint();
  const isSmallScreen = breakpoint === 'xsmall' || breakpoint === 'mobile';
  const isXSmall = breakpoint === 'xsmall';
  
  // Função para obter classes únicas das movimentações
  const getUniqueClasses = (movements: any[] = []) => {
    return [...new Set(movements.map(m => m.nome))];
  };

  // Renderiza o cabeçalho com os badges
  const renderHeader = () => {
    if (!movements || movements.length === 0) return null;

    const uniqueClasses = getUniqueClasses(movements);
    const currentMovement = movements[currentMovementIndex];

    return (
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className={cn(
            "font-semibold",
            isXSmall ? "text-sm" : isSmallScreen ? "text-base" : "text-lg"
          )}>
            {currentMovement?.nome}
          </h2>
          <Badge variant="secondary" className={isSmallScreen ? "text-[0.6rem] px-1.5 py-0.25 h-4" : ""}>
            {movements.length} movimentações
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueClasses.map((classe, index) => {
            const isCurrentClass = currentMovement?.nome === classe;
            const displayClass = isSmallScreen && classe.length > (isXSmall ? 8 : 12) 
              ? classe.substring(0, isXSmall ? 8 : 12) + '...' 
              : classe;
              
            return (
              <Badge 
                key={index} 
                variant={isCurrentClass ? "default" : "outline"}
                className={cn(
                  isCurrentClass ? "bg-primary text-primary-foreground" : "",
                  isSmallScreen ? "text-[0.6rem] px-1.5 py-0.25 h-4" : "",
                  "max-w-[150px] truncate"
                )}
                title={classe}
              >
                {displayClass}
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  if (!parties || parties.length === 0) {
    return (
      <>
        {renderHeader()}
        <p className="text-gray-500">Nenhuma parte encontrada</p>
      </>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {renderHeader()}
      <h3 className={cn(
        "font-semibold",
        isXSmall ? "text-sm" : isSmallScreen ? "text-base" : "text-lg"
      )}>
        Partes do Processo
      </h3>
      <div className="space-y-3 sm:space-y-4">
        {parties.map((parte, index) => (
          <div key={index} className={cn(
            "border rounded-md",
            isXSmall ? "p-2" : isSmallScreen ? "p-2.5" : "p-3 sm:p-4"
          )}>
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div>
                <h4 className={cn(
                  "font-medium",
                  isXSmall ? "text-xs" : isSmallScreen ? "text-sm" : "text-base"
                )}>
                  {parte.nome}
                </h4>
                <p className={cn(
                  "text-gray-600",
                  isXSmall ? "text-[0.6rem]" : isSmallScreen ? "text-xs" : "text-sm"
                )}>
                  Papel: {parte.papel}
                </p>
                <p className={cn(
                  "text-gray-600",
                  isXSmall ? "text-[0.6rem]" : isSmallScreen ? "text-xs" : "text-sm"
                )}>
                  Tipo: {parte.tipoPessoa}
                </p>
                {parte.documento && (
                  <p className={cn(
                    "text-gray-600",
                    isXSmall ? "text-[0.6rem]" : isSmallScreen ? "text-xs" : "text-sm"
                  )}>
                    Documento: {parte.tipoPessoa === "FISICA" ? formatCPF(parte.documento) : formatCNPJ(parte.documento)}
                  </p>
                )}
              </div>
            </div>
            
            {parte.advogados && parte.advogados.length > 0 && (
              <div className="mt-2 sm:mt-3">
                <p className={cn(
                  "font-medium text-gray-600",
                  isXSmall ? "text-[0.6rem]" : isSmallScreen ? "text-xs" : "text-sm"
                )}>
                  Advogados:
                </p>
                <ul className={cn(
                  "pl-4 sm:pl-5 list-disc space-y-1 mt-1",
                  isXSmall ? "text-[0.6rem]" : isSmallScreen ? "text-xs" : "text-sm"
                )}>
                  {parte.advogados.map((advogado, i) => (
                    <li key={i}>{advogado.nome} (OAB: {advogado.inscricao})</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
