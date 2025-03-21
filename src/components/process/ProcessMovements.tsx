
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovementDocuments } from "@/components/document/MovementDocuments";

interface ProcessMovementsProps {
  movements: any[];
  processId: string;
}

export function ProcessMovements({ movements, processId }: ProcessMovementsProps) {
  const [expandedMovements, setExpandedMovements] = useState<{[key: string]: boolean}>({});

  if (!movements || movements.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Nenhum movimento processual encontrado.</p>
      </div>
    );
  }

  const toggleExpand = (movementId: string) => {
    setExpandedMovements(prev => ({
      ...prev,
      [movementId]: !prev[movementId]
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return "Data não disponível";
    }
  };

  return (
    <div className="space-y-4">
      {movements.map((movement) => (
        <div 
          key={movement.id} 
          className="border rounded-lg overflow-hidden"
        >
          <div 
            className="bg-gray-50 p-4 flex justify-between items-start cursor-pointer"
            onClick={() => toggleExpand(movement.id)}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{movement.nome || "Movimento sem título"}</h3>
                <div className="flex items-center space-x-2">
                  {expandedMovements[movement.id] ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>{formatDate(movement.data_hora)}</span>
                {movement.tipo && (
                  <Badge variant="outline" className="font-normal">
                    {movement.tipo}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {expandedMovements[movement.id] && (
            <div className="p-4 border-t">
              {movement.complemento && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Complemento:</h4>
                  <p className="text-sm text-gray-700">{movement.complemento}</p>
                </div>
              )}
              
              <MovementDocuments 
                processId={processId} 
                movementId={movement.id} 
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
