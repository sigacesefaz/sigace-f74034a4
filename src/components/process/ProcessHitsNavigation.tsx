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
import { ProcessMovements } from "@/components/process/ProcessMovements";
import { ProcessDecisions } from "@/components/process/ProcessDecisions";
import { ProcessParties } from "@/components/process/ProcessParties";
import { ProcessDocuments } from "@/components/process/ProcessDocuments";

interface ProcessHitsNavigationProps {
  processId: string;
  hits: ProcessHit[];
  currentHitIndex?: number;
  onHitSelect?: (index: number) => void;
}

export function ProcessHitsNavigation({ processId, hits, currentHitIndex = 0, onHitSelect }: ProcessHitsNavigationProps) {
  const [internalHitIndex, setInternalHitIndex] = useState(currentHitIndex);
  const [activeTab, setActiveTab] = useState("eventos");

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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {totalHits} movimentações
            </span>
            
            {totalHits > 0 && (
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePreviousHit}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm mx-2">
                  {internalHitIndex + 1} / {totalHits}
                </span>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleNextHit}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
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

        {currentHit && (
          <div className="bg-white rounded-lg p-3 space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-gray-900">Detalhes do Movimento Processual</h4>
              <Badge variant="outline" className="text-xs">
                {currentHit.hit_index || `#${internalHitIndex + 1}`}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="space-y-2">
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Número do Processo</h5>
                  <p className="text-sm font-medium">{currentHit.numero_processo || "Não informado"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Classe</h5>
                  <p className="text-sm">{currentHit.classe?.nome || "Não informado"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Órgão Julgador</h5>
                  <p className="text-sm">{currentHit.orgao_julgador?.nome || "Não informado"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Tribunal</h5>
                  <p className="text-sm">{currentHit.tribunal || "Não informado"}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Data de Ajuizamento</h5>
                  <p className="text-sm">{formatDate(currentHit.data_ajuizamento)}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Status</h5>
                  <p className="text-sm">{currentHit.status || "Não informado"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Grau</h5>
                  <p className="text-sm">{currentHit.grau || "G1"}</p>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-gray-500">Última Atualização</h5>
                  <p className="text-sm">{formatDate(currentHit.data_hora_ultima_atualizacao)}</p>
                </div>
              </div>
            </div>

            {currentHit.assuntos && currentHit.assuntos.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <h5 className="text-xs font-medium text-gray-500 mb-2">Assuntos</h5>
                <div className="flex flex-wrap gap-2">
                  {currentHit.assuntos.map((assunto, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {assunto.nome}
                      {assunto.codigo && <span className="ml-1 opacity-75">({assunto.codigo})</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentHit && (
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-1 w-full h-8">
                <TabsTrigger value="eventos" className="text-xs px-2 py-1 h-6">Eventos</TabsTrigger>
                <TabsTrigger value="intimacoes" className="text-xs px-2 py-1 h-6">Intimações</TabsTrigger>
                <TabsTrigger value="documentos" className="text-xs px-2 py-1 h-6">Documentos</TabsTrigger>
                <TabsTrigger value="decisao" className="text-xs px-2 py-1 h-6">Decisão</TabsTrigger>
                <TabsTrigger value="partes" className="text-xs px-2 py-1 h-6">Partes</TabsTrigger>
                <TabsTrigger value="inteiro-teor" className="text-xs px-2 py-1 h-6">Inteiro Teor</TabsTrigger>
              </TabsList>

              <div className="border rounded-md p-2 mt-1 bg-white">
                <TabsContent value="eventos" className="mt-0 pt-0">
                  <ProcessMovements 
                    processId={processId} 
                    hitId={currentHit.id} 
                    filter={{
                      ascending: false
                    }}
                  />
                </TabsContent>

                <TabsContent value="intimacoes" className="mt-0 pt-0">
                  <ProcessMovements 
                    processId={processId} 
                    hitId={currentHit.id} 
                    filter={{
                      codes: [12265, 12266],
                      ascending: false
                    }} 
                  />
                </TabsContent>

                <TabsContent value="documentos" className="mt-0 pt-0">
                  <ProcessMovements 
                    processId={processId} 
                    hitId={currentHit.id} 
                    filter={{
                      codes: [581],
                      ascending: false
                    }} 
                  />
                </TabsContent>

                <TabsContent value="decisao" className="mt-0 pt-0">
                  <ProcessDecisions 
                    processId={processId} 
                    hitId={currentHit.id} 
                  />
                </TabsContent>

                <TabsContent value="partes" className="mt-0 pt-0">
                  <ProcessParties processId={processId} />
                </TabsContent>

                <TabsContent value="inteiro-teor" className="mt-0 pt-0">
                  <ProcessDocuments 
                    processId={processId} 
                    hitId={currentHit.id} 
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
