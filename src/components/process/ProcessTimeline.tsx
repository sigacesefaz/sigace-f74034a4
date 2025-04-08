
import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProcessMovements } from './ProcessMovements';
import { Badge } from '@/components/ui/badge';

interface ProcessMovement {
  id: string;
  nome: string;
  data_hora: string;
  complemento?: string;
  complementos_tabelados?: Array<{
    nome: string;
    valor: number;
    codigo: number;
    descricao: string;
  }>;
}

interface ProcessHit {
  id: string;
  nome: string;
  data_ajuizamento: string;
  numero_processo?: string;
  movements?: ProcessMovement[];
}

interface ProcessTimelineProps {
  hits: ProcessHit[];
  processId?: string;
}

export function ProcessTimeline({ hits, processId }: ProcessTimelineProps) {
  const [selectedHitId, setSelectedHitId] = useState<string | null>(null);

  if (!hits || hits.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Nenhuma movimentação processual encontrada.
      </div>
    );
  }

  const sortedHits = [...hits].sort((a, b) => 
    new Date(b.data_ajuizamento).getTime() - new Date(a.data_ajuizamento).getTime()
  );

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <ScrollArea className="w-full max-h-[600px]">
      <div className="space-y-4 p-4">
        {sortedHits.map((hit) => (
          <div key={hit.id} className="relative">
            <div className="flex items-start space-x-4">
              <div className="min-w-[3px] h-full bg-blue-500" />
              <div className="flex-1">
                <button
                  className="w-full text-left bg-white rounded-lg p-4 shadow-sm hover:shadow transition-shadow"
                  onClick={() => setSelectedHitId(selectedHitId === hit.id ? null : hit.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{hit.nome}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(hit.data_ajuizamento)}
                      </p>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        selectedHitId === hit.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {selectedHitId === hit.id && hit.movements && hit.movements.length > 0 && (
                  <div className="mt-4 pl-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-3">Movimentações do Hit</h4>
                      <div className="space-y-3">
                        {hit.movements.map((movement) => (
                          <div 
                            key={movement.id} 
                            className="bg-white rounded-lg p-3 shadow-sm"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-sm">{movement.nome}</h5>
                                {movement.complemento && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {movement.complemento}
                                  </p>
                                )}
                                {movement.complementos_tabelados && 
                                 movement.complementos_tabelados.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {movement.complementos_tabelados.map((comp, idx) => (
                                      <Badge 
                                        key={idx}
                                        variant="secondary" 
                                        className="text-xs"
                                      >
                                        {comp.nome}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatDate(movement.data_hora)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
