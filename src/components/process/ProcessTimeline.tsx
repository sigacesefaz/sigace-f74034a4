
import React, { useState } from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProcessMovement {
  id: string;
  nome: string;
  data_hora: string;
  complemento?: string;
  codigo?: number;
  tipo?: string;
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
  onHitSelect?: (hitId: string) => void;
}

export function ProcessTimeline({ hits, processId }: ProcessTimelineProps) {
  const [expandedHits, setExpandedHits] = useState<Record<string, boolean>>({});

  if (!hits || hits.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic p-4">
        Nenhuma movimentação processual encontrada.
      </div>
    );
  }

  const toggleHit = (hitId: string) => {
    setExpandedHits(prev => ({
      ...prev,
      [hitId]: !prev[hitId]
    }));
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const sortedHits = [...hits].sort((a, b) => 
    new Date(b.data_ajuizamento).getTime() - new Date(a.data_ajuizamento).getTime()
  );

  return (
    <ScrollArea className="w-full max-h-[600px]">
      <div className="p-4">
        <Timeline position="alternate" className="w-full flex overflow-x-auto pb-4">
          {sortedHits.map((hit, index) => (
            <TimelineItem key={hit.id} className="min-w-[300px]">
              <TimelineSeparator className="flex flex-col items-center">
                <TimelineDot color="primary" />
                <TimelineConnector className="w-full h-[2px] mx-2" />
              </TimelineSeparator>
              <TimelineContent>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <Button
                    variant="ghost"
                    className="w-full text-left flex justify-between items-center"
                    onClick={() => toggleHit(hit.id)}
                  >
                    <div>
                      <h3 className="font-medium">{hit.nome}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(hit.data_ajuizamento)}
                      </p>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 transition-transform ${
                        expandedHits[hit.id] ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>

                  {expandedHits[hit.id] && hit.movements && hit.movements.length > 0 && (
                    <div className="mt-4">
                    <Timeline position="right" className="flex overflow-x-auto">
                      {hit.movements.map((movement) => (
                        <TimelineItem key={movement.id} className="min-w-[250px]">
                          <TimelineSeparator className="flex flex-col items-center">
                            <TimelineDot variant="outlined" color="secondary" />
                            <TimelineConnector className="w-full h-[2px] mx-2" />
                          </TimelineSeparator>
                            <TimelineContent>
                              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      {movement.nome}
                                    </h4>
                                    {movement.complemento && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        {movement.complemento}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs text-gray-500">
                                      {formatDate(movement.data_hora)}
                                    </span>
                                    {movement.codigo && (
                                      <Badge variant="outline" className="text-xs">
                                        Código: {movement.codigo}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                      </Timeline>
                    </div>
                  )}
                </Card>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </ScrollArea>
  );
}
