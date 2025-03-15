
import React from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/format";
import { DatajudMovement } from "@/types/datajud";
import { FileText, Check, AlertCircle, Clock, ArrowRight } from "lucide-react";

interface ProcessMovementsProps {
  movimentos: any[];
  currentIndex?: number;
}

export function ProcessMovements({ movimentos = [], currentIndex = 0 }: ProcessMovementsProps) {
  // Garantir que o índice está dentro dos limites
  const safeIndex = Math.min(Math.max(0, currentIndex), movimentos.length - 1);
  const currentMovimento = movimentos[safeIndex];

  if (!movimentos.length) {
    return (
      <div className="bg-white rounded-lg p-4 text-center">
        <div className="text-gray-500">Nenhuma movimentação encontrada para este processo.</div>
      </div>
    );
  }

  // Determinar o tipo de badge a ser exibido com base no tipo de movimento
  const getBadgeVariant = (tipo?: string) => {
    if (!tipo) return "secondary";
    
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("conclus") || tipoLower.includes("decisão") || tipoLower.includes("despacho")) {
      return "default";
    }
    if (tipoLower.includes("juntada") || tipoLower.includes("petição")) {
      return "outline";
    }
    if (tipoLower.includes("audiência") || tipoLower.includes("sessão")) {
      return "secondary";
    }
    if (tipoLower.includes("sentença")) {
      return "destructive";
    }
    
    return "secondary";
  };
  
  // Ícone para o tipo de movimento
  const getMovementIcon = (tipo?: string) => {
    if (!tipo) return <FileText className="h-4 w-4" />;
    
    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("conclus") || tipoLower.includes("decisão") || tipoLower.includes("despacho")) {
      return <ArrowRight className="h-4 w-4" />;
    }
    if (tipoLower.includes("sentença") || tipoLower.includes("julgado")) {
      return <Check className="h-4 w-4" />;
    }
    if (tipoLower.includes("audiência") || tipoLower.includes("sessão")) {
      return <Clock className="h-4 w-4" />;
    }
    if (tipoLower.includes("intimação") || tipoLower.includes("citação")) {
      return <AlertCircle className="h-4 w-4" />;
    }
    
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getMovementIcon(currentMovimento.tipo)}
          <h3 className="font-medium">
            Movimento {safeIndex + 1} de {movimentos.length}
          </h3>
        </div>
        
        <Badge variant={getBadgeVariant(currentMovimento.tipo)} className="capitalize">
          {currentMovimento.tipo || "Movimento"}
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-medium">
            {currentMovimento.nome || currentMovimento.descricao || "Movimento processual"}
          </h4>
          <p className="text-sm text-gray-500">
            {formatDateTime(currentMovimento.dataHora || currentMovimento.data)}
          </p>
          {currentMovimento.codigo && (
            <Badge variant="outline" className="mt-1">
              Código: {currentMovimento.codigo}
            </Badge>
          )}
        </div>
        
        {(currentMovimento.complemento || currentMovimento.complementosTabelados?.length > 0) && (
          <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
            {currentMovimento.complemento && (
              <div className="text-gray-700 text-sm whitespace-pre-line">
                {typeof currentMovimento.complemento === 'string' 
                  ? currentMovimento.complemento 
                  : Array.isArray(currentMovimento.complemento)
                    ? currentMovimento.complemento.join('\n')
                    : JSON.stringify(currentMovimento.complemento)
                }
              </div>
            )}
            
            {currentMovimento.complementosTabelados?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <h5 className="text-sm font-medium mb-1">Complementos:</h5>
                <ul className="text-sm space-y-1">
                  {currentMovimento.complementosTabelados.map((complemento: any, idx: number) => (
                    <li key={idx} className="flex justify-between">
                      <span className="text-gray-600">{complemento.nome || complemento.descricao}:</span>
                      <span className="font-medium">{complemento.valor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
