import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProcessMovement {
  id: string;
  nome: string;
  data_hora: string;
  complemento?: string;
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
  const [selectedHit, setSelectedHit] = useState<ProcessHit | null>(null);

  if (!hits || hits.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Nenhuma movimentação processual encontrada.
      </div>
    );
  }

  // Ordena os hits do mais recente para o mais antigo
  const sortedHits = [...hits].sort((a, b) => 
    new Date(b.data_ajuizamento).getTime() - new Date(a.data_ajuizamento).getTime()
  );

  const [expandedHitId, setExpandedHitId] = useState<string | null>(null);

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto pb-4">
        <div className="flex space-x-8">
          {sortedHits.map((hit) => (
            <div key={hit.id} className="flex flex-col items-center min-w-max">
              <div className="w-3 h-3 rounded-full bg-blue-500 mb-2"></div>
              <button
                className="text-center"
                onClick={() => setExpandedHitId(expandedHitId === hit.id ? null : hit.id)}
              >
                <h3 className="font-medium">{hit.nome}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(hit.data_ajuizamento), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-400 mx-auto mt-1 transition-transform ${
                    expandedHitId === hit.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedHitId === hit.id && (
                <div className="mt-4 w-full">
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hit.movements?.map((mov) => (
                        <div key={mov.id} className="bg-white rounded-lg shadow p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm">{mov.nome}</h4>
                              <p className="text-xs text-gray-500 mt-1">
                                Código: {mov.id}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(new Date(mov.data_hora), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          </div>
                          {mov.complemento && (
                            <p className="mt-2 text-xs text-gray-600">
                              {mov.complemento}
                            </p>
                          )}
                          <p className="mt-2 text-xs text-blue-500 font-medium">
                            {formatDistanceToNow(new Date(mov.data_hora), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
