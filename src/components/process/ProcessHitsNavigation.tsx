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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs as MuiTabs, Tab as MuiTab } from '@mui/material';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ProcessHit, Process } from "@/types/process";
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
          
          <div className="flex-shrink-0 ml-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Lista completa
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto max-h-[80vh]" align="end" sideOffset={5}>
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
            <div className="md:overflow-x-auto">
              <div className="md:hidden space-y-2 mb-4">
                {[
                  { 
                    value: "eventos", 
                    icon: <CalendarDays className="h-4 w-4" />, 
                    label: "Eventos", 
                    bgColor: "bg-[rgb(46,48,146)]",
                    textColor: "text-white"
                  },
                  { 
                    value: "intimacoes", 
                    icon: <Bell className="h-4 w-4" />, 
                    label: "Intimações", 
                    bgColor: "bg-[rgb(220,38,38)]",
                    textColor: "text-white"
                  },
                  { 
                    value: "documentos", 
                    icon: <FileText className="h-4 w-4" />, 
                    label: "Documentos", 
                    bgColor: "bg-[rgb(243,232,255)]",
                    textColor: "text-[rgb(46,48,146)]"
                  },
                  { 
                    value: "decisao", 
                    icon: <Gavel className="h-4 w-4" />, 
                    label: "Decisões", 
                    bgColor: "bg-[rgb(254,195,11)]",
                    textColor: "text-black"
                  }
                ].map((tab) => (
                  <button
                    key={tab.value}
                    className={`w-full flex items-center px-4 py-2 rounded-md ${activeTab === tab.value ? tab.bgColor : 'bg-gray-100'} ${activeTab === tab.value ? tab.textColor : 'text-gray-700'}`}
                    onClick={() => setActiveTab(tab.value)}
                  >
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="hidden md:block">
                <MuiTabs 
                  value={activeTab}
                  onChange={(event: React.SyntheticEvent, newValue: string) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons={false}
                  className="mb-4"
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: '0.75rem',
                      minHeight: '36px',
                      padding: '6px 16px',
                      minWidth: 'unset'
                    }
                  }}
                >
                <MuiTab 
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Eventos"
                  value="eventos"
                  className="min-w-0"
                  sx={{
                    'backgroundColor': 'rgb(46 48 146)',
                    'color': 'white',
                    '&.Mui-selected': {
                      'backgroundColor': 'rgb(36 38 136)',
                      'color': 'white'
                    },
                    'borderRadius': '8px 8px 0 0'
                  }}
                />
                <MuiTab
                  icon={<Bell className="h-4 w-4" />}
                  label="Intimações"
                  value="intimacoes"
                  className="min-w-0"
                  sx={{
                    'backgroundColor': 'rgb(220 38 38)',
                    'color': 'white',
                    '&.Mui-selected': {
                      'backgroundColor': 'rgb(210 28 28)',
                      'color': 'white'
                    },
                    'borderRadius': '8px 8px 0 0'
                  }}
                />
                <MuiTab
                  icon={<FileText className="h-4 w-4" />}
                  label="Documentos" 
                  value="documentos"
                  className="min-w-0"
                  sx={{
                    'backgroundColor': 'rgb(243 232 255)',
                    'color': 'rgb(46 48 146)',
                    '&.Mui-selected': {
                      'backgroundColor': 'rgb(233 222 245)',
                      'color': 'rgb(46 48 146)'
                    },
                    'borderRadius': '8px 8px 0 0'
                  }}
                />
                <MuiTab
                  icon={<Gavel className="h-4 w-4" />}
                  label="Decisões"
                  value="decisao"
                  className="min-w-0"
                  sx={{
                    'backgroundColor': 'rgb(254 195 11)',
                    'color': 'black',
                    '&.Mui-selected': {
                      'backgroundColor': 'rgb(244 185 1)',
                      'color': 'black'
                    },
                    'borderRadius': '8px 8px 0 0'
                  }}
                />
                </MuiTabs>
              </div>
            </div>

              <div className="border rounded-md p-2 md:p-3 mt-1 mb-2 md:mb-4 bg-white min-h-[600px] md:min-h-[800px] flex flex-col md:flex-row md:gap-4 overflow-visible">
                <div className="overflow-y-auto w-full md:flex-1 px-1">
                  {activeTab === "eventos" && (
                    <ProcessMovements 
                      processId={processId} 
                      hitId={currentHit.id} 
                      filter={{
                        ascending: false
                      }}
                    />
                  )}

                  {activeTab === "intimacoes" && (
                    <ProcessMovements 
                      processId={processId} 
                      hitId={currentHit.id} 
                      filter={{
                        codes: [12265, 12266],
                        ascending: false
                      }} 
                    />
                  )}

                  {activeTab === "documentos" && (
                    <ProcessMovements 
                      processId={processId} 
                      hitId={currentHit.id} 
                      filter={{
                        codes: [581],
                        ascending: false
                      }} 
                    />
                  )}

                  {activeTab === "decisao" && (
                    <ProcessDecisions 
                      processId={processId} 
                      hitId={currentHit.id} 
                    />
                  )}

                  {activeTab === "partes" && (
                    <ProcessParties processId={processId} />
                  )}

                  {activeTab === "inteiro-teor" && (
                    <ProcessDocuments 
                      processId={processId} 
                      hitId={currentHit.id} 
                    />
                  )}
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
