
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
import { ProcessHit } from "@/types/process";

interface ProcessHitsNavigationProps {
  processId: string;
  hits: ProcessHit[];
  currentHitIndex?: number;
  onHitSelect?: (index: number) => void;
}

export function ProcessHitsNavigation({ processId, hits, currentHitIndex = 0, onHitSelect }: ProcessHitsNavigationProps) {
  const [internalHitIndex, setInternalHitIndex] = useState(currentHitIndex);
  const [isOpen, setIsOpen] = useState(false);
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
                        className={`p-2 text-sm rounded cursor-pointer ${internalHitIndex === idx ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                        onClick={() => {
                          setInternalHitIndex(idx);
                          setIsOpen(true);
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

        <CollapsibleContent className="space-y-2">
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
                      
                      <div className="space-y-3">
                        <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                          <p className="font-semibold text-indigo-800 mb-2 text-sm">Número do Processo</p>
                          <p className="text-sm text-indigo-700">{currentHit.numero_processo || "Não informado"}</p>
                        </div>
                        
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                          <p className="font-semibold text-purple-800 mb-2 text-sm">Classe</p>
                          <p className="text-sm text-purple-700">
                            {currentHit.classe?.nome || "Não informado"}
                            {currentHit.classe?.codigo && ` (${currentHit.classe.codigo})`}
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="font-semibold text-blue-800 mb-2 text-sm">Tribunal</p>
                          <p className="text-sm text-blue-700">{currentHit.tribunal || "Não informado"}</p>
                        </div>
                        
                        <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
                          <p className="font-semibold text-cyan-800 mb-2 text-sm">Grau</p>
                          <p className="text-sm text-cyan-700">{currentHit.grau || "Não informado"}</p>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <p className="font-semibold text-green-800 mb-2 text-sm">Assuntos</p>
                          <div className="text-sm text-green-700">
                            {currentHit.assuntos ? (
                              <ul className="list-disc pl-5">
                                {currentHit.assuntos.map((assunto, idx) => (
                                  <li key={idx}>{assunto.nome} ({assunto.codigo})</li>
                                ))}
                              </ul>
                            ) : (
                              "Não informado"
                            )}
                          </div>
                        </div>
                        
                        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                          <p className="font-semibold text-amber-800 mb-2 text-sm">Data de Ajuizamento</p>
                          <p className="text-sm text-amber-700">{formatDate(currentHit.data_ajuizamento)}</p>
                        </div>
                        
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                          <p className="font-semibold text-orange-800 mb-2 text-sm">Última Atualização</p>
                          <p className="text-sm text-orange-700">{formatDate(currentHit.data_hora_ultima_atualizacao)}</p>
                        </div>
                        
                        <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                          <p className="font-semibold text-rose-800 mb-2 text-sm">Órgão Julgador</p>
                          <p className="text-sm text-rose-700">
                            {currentHit.orgao_julgador?.nome || "Não informado"}
                            {currentHit.orgao_julgador?.codigo && ` (${currentHit.orgao_julgador.codigo})`}
                          </p>
                        </div>
                        
                        <div className="bg-fuchsia-50 p-3 rounded-lg border border-fuchsia-100">
                          <p className="font-semibold text-fuchsia-800 mb-2 text-sm">Sistema</p>
                          <p className="text-sm text-fuchsia-700">{currentHit.sistema?.nome || "Não informado"}</p>
                        </div>
                        
                        <div className="bg-violet-50 p-3 rounded-lg border border-violet-100">
                          <p className="font-semibold text-violet-800 mb-2 text-sm">Formato</p>
                          <p className="text-sm text-violet-700">{currentHit.formato?.nome || "Não informado"}</p>
                        </div>
                      </div>
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
