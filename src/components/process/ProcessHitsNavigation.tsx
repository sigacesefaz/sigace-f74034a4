
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcessHit {
  id: string;
  hit_index?: string;
  hit_id?: string;
  tribunal?: string;
  numero_processo?: string;
  data_ajuizamento?: string;
  classe?: {
    nome?: string;
    codigo?: string;
  };
  orgao_julgador?: {
    nome?: string;
    codigo?: string;
  };
  data_hora_ultima_atualizacao?: string;
  // Add other properties as needed
}

interface ProcessHitsNavigationProps {
  processId: string;
  hits: ProcessHit[];
}

export function ProcessHitsNavigation({ processId, hits }: ProcessHitsNavigationProps) {
  const [currentHitIndex, setCurrentHitIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const currentHit = hits && hits.length > 0 ? hits[currentHitIndex] : null;
  const totalHits = hits?.length || 0;

  const handlePreviousHit = () => {
    if (currentHitIndex > 0) {
      setCurrentHitIndex(currentHitIndex - 1);
    } else {
      setCurrentHitIndex(totalHits - 1); // Wrap around to the last hit
    }
  };

  const handleNextHit = () => {
    if (currentHitIndex < totalHits - 1) {
      setCurrentHitIndex(currentHitIndex + 1);
    } else {
      setCurrentHitIndex(0); // Wrap around to the first hit
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {isOpen ? "Ocultar Movimentações" : "Ver Movimentações"}
                <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <span className="text-sm text-gray-500">
              {totalHits} movimentações
            </span>
          </div>
          
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
                        className={`p-2 text-sm rounded cursor-pointer ${currentHitIndex === idx ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          setCurrentHitIndex(idx);
                          setIsOpen(true);
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

        <CollapsibleContent className="space-y-2">
          {totalHits > 0 && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">
                Movimentação {currentHitIndex + 1} de {totalHits}
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
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">
                          {currentHit.classe?.nome || `Movimentação ${currentHitIndex + 1}`}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {currentHit.hit_index || `#${currentHitIndex + 1}`}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">Tribunal:</span> {currentHit.tribunal || "Não informado"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Número:</span> {currentHit.numero_processo || "Não informado"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Data:</span> {formatDate(currentHit.data_hora_ultima_atualizacao || currentHit.data_ajuizamento)}
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Órgão:</span> {currentHit.orgao_julgador?.nome || "Não informado"}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details">
                    <div className="text-sm space-y-2">
                      <p className="text-gray-600">ID: {currentHit.id}</p>
                      <p className="text-gray-600">Hit ID: {currentHit.hit_id || "Não informado"}</p>
                      <p className="text-gray-600">Data de Ajuizamento: {formatDate(currentHit.data_ajuizamento)}</p>
                      <p className="text-gray-600">Última Atualização: {formatDate(currentHit.data_hora_ultima_atualizacao)}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
