
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProcessHit } from "@/types/process";

interface ProcessHitsNavigationProps {
  processId: string;
  hits: ProcessHit[];
  currentHitIndex?: number;
  onHitSelect?: (index: number) => void;
}

export function ProcessHitsNavigation({ processId, hits, currentHitIndex = 0, onHitSelect }: ProcessHitsNavigationProps) {
  const [internalHitIndex, setInternalHitIndex] = useState(currentHitIndex);
  const [activeTab, setActiveTab] = useState("info");

  const currentHit = hits && hits.length > 0 ? hits[internalHitIndex] : null;
  const totalHits = hits?.length || 0;

  // Sincronizar o índice interno com o índice externo quando ele mudar
  useEffect(() => {
    setInternalHitIndex(currentHitIndex);
  }, [currentHitIndex]);

  const handlePreviousHit = () => {
    let newIndex;
    if (internalHitIndex > 0) {
      newIndex = internalHitIndex - 1;
    } else {
      newIndex = totalHits - 1; // Wrap around to the last hit
    }
    setInternalHitIndex(newIndex);
    if (onHitSelect) {
      onHitSelect(newIndex);
    }
  };

  const handleNextHit = () => {
    let newIndex;
    if (internalHitIndex < totalHits - 1) {
      newIndex = internalHitIndex + 1;
    } else {
      newIndex = 0; // Wrap around to the first hit
    }
    setInternalHitIndex(newIndex);
    if (onHitSelect) {
      onHitSelect(newIndex);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Não informada";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      return format(date, 'dd/MM/yyyy HH:mm:ss', {
        locale: ptBR
      });
    } catch {
      return "Data inválida";
    }
  };

  if (!hits || hits.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Nenhuma movimentação processual encontrada.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {totalHits} movimentações
          </span>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Lista completa
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <ScrollArea className="h-72">
                <div className="p-4">
                  <h4 className="font-medium mb-2">Todas as Movimentações</h4>
                  <div className="space-y-2">
                    {hits.map((hit, idx) => (
                      <div 
                        key={hit.id} 
                        className={`p-2 text-sm rounded cursor-pointer ${internalHitIndex === idx ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          setInternalHitIndex(idx);
                          if (onHitSelect) {
                            onHitSelect(idx);
                          }
                        }}
                      >
                        <div className="font-medium">{hit.classe?.nome || `Movimentação ${idx + 1}`}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(hit.data_hora_ultima_atualizacao || hit.data_ajuizamento)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>

        {totalHits > 0 && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">
              Movimentação {internalHitIndex + 1} de {totalHits}
            </span>
            <div className="flex gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handlePreviousHit}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleNextHit}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {currentHit && (
          <Card>
            <CardContent className="p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-2">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="eventos">Eventos</TabsTrigger>
                  <TabsTrigger value="intimacoes">Intimações</TabsTrigger>
                  <TabsTrigger value="decisao">Decisão</TabsTrigger>
                  <TabsTrigger value="partes">Partes</TabsTrigger>
                  <TabsTrigger value="inteiro-teor">Inteiro Teor</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">
                        {currentHit.classe?.nome || `Movimentação ${internalHitIndex + 1}`}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {currentHit.hit_index || `#${internalHitIndex + 1}`}
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="eventos">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Eventos do Processo</h4>
                    <p className="text-sm text-gray-500">Nenhum evento disponível.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="intimacoes">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Intimações do Processo</h4>
                    <p className="text-sm text-gray-500">Nenhuma intimação disponível.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="decisao">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Decisões do Processo</h4>
                    <p className="text-sm text-gray-500">Nenhuma decisão disponível.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="partes">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Partes do Processo</h4>
                    <p className="text-sm text-gray-500">Nenhuma parte disponível.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="inteiro-teor">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Inteiro Teor do Processo</h4>
                    <p className="text-sm text-gray-500">Nenhum documento de inteiro teor disponível.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
