import React from "react";
import { DatajudParty } from "@/types/datajud";
import { formatCPF, formatCNPJ } from "@/utils/masks";
import { Badge } from "@/components/ui/badge";

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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-semibold">{currentMovement?.nome}</h2>
          <Badge variant="secondary">
            {movements.length} movimentações
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueClasses.map((classe, index) => {
            const isCurrentClass = currentMovement?.nome === classe;
            return (
              <Badge 
                key={index} 
                variant={isCurrentClass ? "default" : "outline"}
                className={isCurrentClass ? "bg-primary text-primary-foreground" : ""}
              >
                {classe}
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
      <h3 className="text-base sm:text-lg font-semibold">Partes do Processo</h3>
      <div className="space-y-3 sm:space-y-4">
        {parties.map((parte, index) => (
          <div key={index} className="border rounded-md p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between">
              <div>
                <h4 className="font-medium text-sm sm:text-base">{parte.nome}</h4>
                <p className="text-xs sm:text-sm text-gray-600">Papel: {parte.papel}</p>
                <p className="text-xs sm:text-sm text-gray-600">Tipo: {parte.tipoPessoa}</p>
                {parte.documento && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    Documento: {parte.tipoPessoa === "FISICA" ? formatCPF(parte.documento) : formatCNPJ(parte.documento)}
                  </p>
                )}
              </div>
            </div>
            
            {parte.advogados && parte.advogados.length > 0 && (
              <div className="mt-2 sm:mt-3">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Advogados:</p>
                <ul className="text-xs sm:text-sm pl-4 sm:pl-5 list-disc space-y-1 mt-1">
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
