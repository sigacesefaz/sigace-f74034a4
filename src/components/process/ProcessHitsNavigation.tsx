import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight,
  CalendarDays,
  Bell,
  FileText,
  Gavel,
  Users,
  FileSearch
} from "lucide-react";
import { ProcessTimeline } from "./ProcessTimeline";
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

  useEffect(() => {
    setInternalHitIndex(currentHitIndex);
  }, [currentHitIndex]);

  const handlePreviousHit = () => {
    let newIndex;
    if (internalHitIndex > 0) {
      newIndex = internalHitIndex - 1;
    } else {
      newIndex = totalHits - 1;
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
      newIndex = 0;
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
    <div className="w-full flex flex-col min-h-[600px]">
      <div className="space-y-3 px-2 md:px-0 flex-1 min-h-[400px]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 px-1 w-full">
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[200px]">
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
          
          <div className="flex-shrink-0">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Lista completa
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto" align="end" sideOffset={5}>
                <ScrollArea className="h-full">
                  <div className="p-4 w-full min-w-[300px]">
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
        </div>

        {currentHit && (
          <div className="bg-white rounded-lg p-2 md:p-3 space-y-2 md:space-y-3 mb-3 mx-0 md:mx-0 overflow-visible">
            <div className="flex items-center justify-between px-1 cursor-pointer">
              <h4 className="font-medium text-xs md:text-sm text-gray-900">Detalhes do Processo</h4>
              <Badge variant="outline" className="text-[10px] md:text-xs min-w-[36px] md:min-w-[50px] text-center">
                {currentHit.hit_index || `#${internalHitIndex + 1}`}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mt-1 md:mt-2 px-1">
              <div className="space-y-2 px-1">
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
              
              <div className="space-y-2 px-1">
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
              <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-100 px-1">
                <h5 className="text-[11px] md:text-xs font-medium text-gray-500 mb-1 md:mb-2">Assuntos</h5>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {currentHit.assuntos.map((assunto: {nome: string, codigo?: string}, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs min-w-[100px] md:min-w-0">
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
          <div className="px-0 md:px-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="w-full pb-1 md:pb-2">
                <TabsList className="mb-1 flex flex-wrap gap-1 min-h-[32px] md:min-h-[40px] px-1 md:px-2 py-1 md:py-1.5 w-full bg-white">
                    <TabsTrigger 
                    value="eventos" 
                    className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 flex-shrink-0 flex-grow
                      bg-[rgb(46_48_146)] hover:bg-[rgb(36_38_136)] text-white border border-[rgb(36_38_136)] hover:border-[rgb(26_28_126)]"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>Eventos</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="intimacoes" 
                    className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 flex-shrink-0 flex-grow
                      bg-[rgb(220_38_38)] hover:bg-[rgb(210_28_28)] text-white border border-[rgb(210_28_28)] hover:border-[rgb(200_18_18)]"
                  >
                    <Bell className="h-4 w-4" />
                    <span>Intimações</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documentos" 
                    className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 flex-shrink-0 flex-grow
                      bg-[rgb(243_232_255)] hover:bg-[rgb(233_222_245)] text-[rgb(46_48_146)] border border-[rgb(233_222_245)] hover:border-[rgb(223_212_235)]"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Documentos</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="partes" 
                    className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 flex-shrink-0 flex-grow
                      bg-[rgb(22_163_74)] hover:bg-[rgb(12_153_64)] text-white border border-[rgb(12_153_64)] hover:border-[rgb(2_143_54)]"
                  >
                    <Users className="h-4 w-4" />
                    <span>Partes</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="decisao" 
                    className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 flex-shrink-0 flex-grow
                      bg-[rgb(254_195_11)] hover:bg-[rgb(244_185_1)] text-black border border-[rgb(244_185_1)] hover:border-[rgb(234_175_0)]"
                  >
                    <Gavel className="h-4 w-4" />
                    <span>Decisão</span>
                  </TabsTrigger>
                    <TabsTrigger 
                    value="inteiro-teor" 
                    className="text-[10px] md:text-xs px-2 md:px-3 py-1 md:py-1.5 flex items-center gap-1 flex-shrink-0 flex-grow
                      bg-[rgb(59_130_246)] hover:bg-[rgb(49_120_236)] text-white border border-[rgb(49_120_236)] hover:border-[rgb(39_110_226)]"
                  >
                    <FileSearch className="h-4 w-4" />
                    <span>Inteiro Teor</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="border rounded-md p-2 md:p-3 mt-1 mb-2 md:mb-4 bg-white min-h-[600px] md:min-h-[800px] flex flex-col md:flex-row md:gap-4 overflow-visible">
                <div className="overflow-y-auto w-full md:flex-1 px-1">
                  <TabsContent value="eventos" className="mt-0 pt-0">
                    <ProcessMovements 
                      processId={processId} 
                      hitId={currentHit.id} 
                      filter={{
                        ascending: false
                      }}
                    />
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-4">Linha do Tempo do Processo</h3>
                      {hits.length > 0 ? (
                        <ProcessTimeline 
                          processId={processId}
                          hits={hits}
                          movements={hits.flatMap(hit => hit.movements || [])}
                        />
                      ) : (
                        <p className="text-sm text-gray-500">Nenhuma movimentação para exibir na timeline</p>
                      )}
                    </div>
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
              </div>
            </Tabs>
          </div>
        )}
      </div>
      
      {/* Adicionar a paginação no canto inferior direito */}
      {totalHits > 0 && (
        <div className="flex justify-end mt-4 px-2 md:px-0">
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
        </div>
      )}
    </div>
  );
}
