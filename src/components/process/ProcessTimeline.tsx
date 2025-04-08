import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProcessMovements } from './ProcessMovements';

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
  const [selectedHit, setSelectedHit] = useState<string | null>(null);

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

  return (
    <div className="w-full">
      <div className="flex overflow-x-auto pb-4">
        <div className="flex space-x-8">
          {sortedHits.map((hit) => (
            <div key={hit.id} className="flex flex-col items-center min-w-max">
              <div className="w-3 h-3 rounded-full bg-blue-500 mb-2"></div>
              <button
                className="text-center"
                onClick={() => setSelectedHit(selectedHit === hit.id ? null : hit.id)}
              >
                <h3 className="font-medium">{hit.nome}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(hit.data_ajuizamento), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </p>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-400 mx-auto mt-1 transition-transform ${
                    selectedHit === hit.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {selectedHit === hit.id && processId && (
                <div className="mt-4 w-full min-w-[600px]">
                  <div className="border-t border-gray-200 pt-4">
                    <ProcessMovements 
                      processId={processId}
                      hitId={hit.id}
                      filter={{
                        ascending: false
                      }}
                    />
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