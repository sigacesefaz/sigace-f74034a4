
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBreakpoint, useIsMobile, useIsMobileOrTablet, useIsXSmall } from "@/hooks/use-mobile";
import { ProcessBadge, EventBadge, MovementBadge, SubjectBadge, StatusBadge, DateInfoBadge } from "@/components/process/ProcessBadge";
import { ChevronDown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProcessNavigation } from "@/components/process/ProcessNavigation";
import { ProcessParties } from "@/components/process/ProcessParties";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ProcessListProps {
  processes: Process[];
}

export function ProcessList({ processes }: ProcessListProps) {
  const [activeTab, setActiveTab] = useState("atual");
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [currentMovementIndex, setCurrentMovementIndex] = useState<Record<string, number>>({});
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  const isMobileOrTablet = useIsMobileOrTablet();
  const breakpoint = useBreakpoint();
  const isXSmall = useIsXSmall();
  const isSmallScreen = breakpoint === 'xsmall' || breakpoint === 'mobile';

  const currentProcesses = processes.filter(process => !process.parent_id);
  const previousHits = processes.filter(process => process.parent_id);

  const handleProcessSelect = (id: string) => {
    setSelectedProcessId(id);
    setActiveTab("partes");
  };

  const handlePreviousMovement = (processId: string) => {
    setCurrentMovementIndex(prev => {
      const currentIndex = prev[processId] || 0;
      const process = processes.find(p => p.id === processId);
      const movements = process?.movimentacoes || [];
      const maxIndex = movements.length - 1;
      return {
        ...prev,
        [processId]: currentIndex > 0 ? currentIndex - 1 : maxIndex > 0 ? maxIndex : 0
      };
    });
  };

  const handleNextMovement = (processId: string) => {
    setCurrentMovementIndex(prev => {
      const currentIndex = prev[processId] || 0;
      const process = processes.find(p => p.id === processId);
      const movements = process?.movimentacoes || [];
      const maxIndex = movements.length - 1;
      return {
        ...prev,
        [processId]: currentIndex < maxIndex ? currentIndex + 1 : 0
      };
    });
  };

  const getProcessMovements = (processId: string) => {
    const process = processes.find(p => p.id === processId);
    return process?.movimentacoes || [];
  };

  const getCurrentMovement = (processId: string) => {
    const movements = getProcessMovements(processId);
    const index = currentMovementIndex[processId] || 0;
    return movements[index] || null;
  };

  const toggleDetails = (processId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [processId]: !prev[processId]
    }));
  };

  const getUniqueClasses = (movements: any[]) => {
    return [...new Set(movements.map(m => m.nome))];
  };

  function formatDate(dateString?: string, includeTime = false) {
    if (!dateString) return "Não informada";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Data inválida";
      const formatString = includeTime ? 'dd/MM/yyyy HH:mm:ss' : 'dd/MM/yyyy';
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(includeTime ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : {})
      }).format(date);
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="atual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`w-full ${isMobile ? 'flex-wrap' : ''}`}>
          <TabsTrigger value="atual" className={isMobile ? 'flex-1' : ''}>Atual</TabsTrigger>
          <TabsTrigger value="anteriores" className={isMobile ? 'flex-1' : ''}>
            Anteriores <span className="ml-2 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">{previousHits.length}</span>
          </TabsTrigger>
          <TabsTrigger value="partes" className={isMobile ? 'flex-1' : ''}>Partes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="atual" className="space-y-4 mt-4">
          {currentProcesses.length > 0 ? (
            currentProcesses.map((process) => (
              <Card key={process.id} className="mb-4 overflow-hidden">
                <CardHeader className={cn(
                  "cursor-pointer", 
                  isXSmall ? "p-2" : isSmallScreen ? "p-2.5" : "p-3"
                )} onClick={() => toggleDetails(process.id)}>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Número do processo sozinho na primeira linha */}
                      <span className={cn(
                        "font-medium text-gray-700 break-all block mb-1", 
                        isXSmall ? "text-xs" : isSmallScreen ? "text-sm" : "text-base"
                      )}>
                        {process.number}
                      </span>
                      
                      {/* Badges movidos para uma linha abaixo */}
                      <div className="flex flex-wrap mt-2 gap-1">
                        {process.metadata?.eventos && process.metadata.eventos.length > 0 && (
                          <EventBadge 
                            count={process.metadata.eventos.length} 
                            label={isXSmall ? "ev." : "eventos"}
                            className={isSmallScreen ? "max-w-[95px]" : ""}
                          />
                        )}
                        
                        {process.movimentacoes && process.movimentacoes.length > 0 && (
                          <MovementBadge 
                            count={process.movimentacoes.length} 
                            label={isSmallScreen ? "mov." : "movimentação processual"}
                            className={isSmallScreen ? "max-w-[95px]" : ""} 
                          />
                        )}

                        <StatusBadge 
                          label={process.title || "Processo Judicial"}
                          className={isSmallScreen ? "max-w-[95px]" : ""}
                        />
                        
                        {process.metadata?.assuntos && process.metadata.assuntos.length > 0 && (
                          <SubjectBadge 
                            label={process.metadata.assuntos[0].nome} 
                            code={process.metadata.assuntos[0].codigo}
                            className={isSmallScreen ? "max-w-[95px]" : ""}
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap mt-1 gap-1">
                        <DateInfoBadge 
                          label="Data Ajuizamento" 
                          value={formatDate(process.metadata?.dataAjuizamento)}
                        />
                        
                        <DateInfoBadge 
                          label="Tribunal" 
                          value={process.court || "Não informado"}
                        />
                      </div>

                      <div className="flex flex-wrap mt-1 gap-1">
                        <DateInfoBadge 
                          label="Grau" 
                          value={process.metadata?.grau || "G1"}
                        />
                      </div>

                      <div className="flex flex-wrap text-xs text-gray-500 mt-1">
                        <div className={cn("mr-4", isXSmall ? "text-[0.6rem]" : "")}>
                          Criado em: {formatDate(process.created_at)}
                        </div>
                        <div className={isXSmall ? "text-[0.6rem]" : ""}>
                          Última Atualização: {formatDate(process.updated_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <StatusBadge 
                        label={process.status || "Em andamento"}
                        className={cn(
                          process.status === "Baixado" && "bg-red-600",
                          isSmallScreen ? "max-w-[95px]" : ""
                        )}
                      />
                      <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showDetails[process.id] ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>

                {showDetails[process.id] && (
                  <CardContent className={cn(
                    isXSmall ? "p-2" : isSmallScreen ? "p-2.5" : "p-3",
                    "px-4"  // Adicionado espaçamento horizontal mínimo
                  )}>
                    <div className={cn(
                      "mt-2 border-t pt-3",
                      isXSmall ? "pt-2" : ""
                    )}>
                      <h4 className={cn(
                        "font-medium mb-2",
                        isXSmall ? "text-xs" : isSmallScreen ? "text-sm" : ""
                      )}>
                        Detalhes do Processo
                      </h4>
                      
                      {process.movimentacoes && process.movimentacoes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {getUniqueClasses(process.movimentacoes).map((classe, index) => {
                            const isCurrentClass = getCurrentMovement(process.id)?.nome === classe;
                            const displayClass = isSmallScreen && classe.length > (isXSmall ? 8 : 12) 
                              ? classe.substring(0, isXSmall ? 8 : 12) + '...' 
                              : classe;
                            return (
                              <StatusBadge 
                                key={index}
                                label={displayClass}
                                className={cn(
                                  isCurrentClass ? "bg-primary" : "bg-gray-400",
                                  isSmallScreen ? "max-w-[95px]" : ""
                                )}
                              />
                            );
                          })}
                        </div>
                      )}

                      {process.movimentacoes && process.movimentacoes.length > 0 && (
                        <div className="mt-2">
                          <ProcessNavigation
                            currentMovimentoIndex={currentMovementIndex[process.id] || 0}
                            totalMovimentos={process.movimentacoes.length}
                            handlePrevMovimento={(e) => {
                              e?.stopPropagation();
                              handlePreviousMovement(process.id);
                            }}
                            handleNextMovimento={(e) => {
                              e?.stopPropagation();
                              handleNextMovement(process.id);
                            }}
                          />

                          {getCurrentMovement(process.id) && (
                            <div 
                              className={cn(
                                "p-3 bg-gray-50 rounded text-sm mt-2 break-words",
                                isXSmall ? "p-2 text-xs" : isSmallScreen ? "p-2 text-xs" : ""
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className={cn(
                                "font-medium",
                                isXSmall ? "text-xs" : ""
                              )}>
                                {getCurrentMovement(process.id)?.nome || "Sem descrição"}
                              </div>
                              {getCurrentMovement(process.id)?.data_hora && (
                                <div className={cn(
                                  "text-gray-500 text-xs mt-1",
                                  isXSmall ? "text-[0.6rem]" : ""
                                )}>
                                  {formatDate(getCurrentMovement(process.id)?.data_hora || "", true)}
                                </div>
                              )}
                              {getCurrentMovement(process.id)?.complemento && (
                                <div className={cn(
                                  "mt-2 text-xs bg-white p-2 rounded border overflow-x-auto",
                                  isXSmall ? "p-1.5 text-[0.6rem]" : ""
                                )}>
                                  <pre className="whitespace-pre-wrap break-words">
                                    {getCurrentMovement(process.id)?.complemento}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhum processo encontrado</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="anteriores" className="mt-4">
          {previousHits.length > 0 ? (
            <div className="space-y-4">
              {previousHits.map((process) => (
                <Card 
                  key={process.id} 
                  className={cn(
                    "glass-card hover:shadow-md transition-all cursor-pointer",
                    isXSmall ? "p-2" : isSmallScreen ? "p-3" : "p-4"
                  )}
                  onClick={() => handleProcessSelect(process.id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn(
                        "text-muted-foreground break-all",
                        isXSmall ? "text-[0.6rem]" : "text-xs sm:text-sm"
                      )}>
                        {process.number}
                      </p>
                      <h3 className={cn(
                        "font-medium mt-1 line-clamp-2",
                        isXSmall ? "text-xs" : "text-sm"
                      )}>
                        {process.title || "Processo sem título"}
                      </h3>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <StatusBadge 
                        label={process.status || "Em andamento"}
                        className={cn(
                          process.status === "Baixado" && "bg-red-600",
                          isSmallScreen ? "max-w-[95px]" : ""
                        )}
                      />
                    </div>
                  </div>
                  <p className={cn(
                    "text-muted-foreground mt-2",
                    isXSmall ? "text-[0.6rem]" : "text-xs sm:text-sm"
                  )}>
                    {formatDate(process.created_at)}
                  </p>

                  <Button 
                    variant="outline" 
                    size={isXSmall ? "xs" : isSmallScreen ? "sm" : "sm"}
                    className={cn(
                      "mt-2", 
                      isSmallScreen ? "w-full text-xs h-7 py-0" : "w-auto"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDetails(process.id);
                    }}
                  >
                    {showDetails[process.id] ? "Ocultar Detalhes" : "Detalhes do Processo"}
                  </Button>

                  {showDetails[process.id] && (
                    <div className={cn(
                      "mt-4 border-t pt-3",
                      isXSmall ? "pt-2" : ""
                    )}>
                      <h4 className={cn(
                        "font-medium mb-2",
                        isXSmall ? "text-xs" : isSmallScreen ? "text-sm" : ""
                      )}>
                        Detalhes do Processo
                      </h4>
                      
                      {process.movimentacoes && process.movimentacoes.length > 0 && (
                        <div className="mt-2">
                          <ProcessNavigation
                            currentMovimentoIndex={currentMovementIndex[process.id] || 0}
                            totalMovimentos={process.movimentacoes.length}
                            handlePrevMovimento={(e) => {
                              e?.stopPropagation();
                              handlePreviousMovement(process.id);
                            }}
                            handleNextMovimento={(e) => {
                              e?.stopPropagation();
                              handleNextMovement(process.id);
                            }}
                          />

                          {getCurrentMovement(process.id) && (
                            <div 
                              className={cn(
                                "p-3 bg-gray-50 rounded text-sm mt-2 break-words",
                                isXSmall ? "p-2 text-xs" : isSmallScreen ? "p-2 text-xs" : ""
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className={cn(
                                "font-medium",
                                isXSmall ? "text-xs" : ""
                              )}>
                                {getCurrentMovement(process.id)?.nome || "Sem descrição"}
                              </div>
                              {getCurrentMovement(process.id)?.data_hora && (
                                <div className={cn(
                                  "text-gray-500 text-xs mt-1",
                                  isXSmall ? "text-[0.6rem]" : ""
                                )}>
                                  {formatDate(getCurrentMovement(process.id)?.data_hora || "", true)}
                                </div>
                              )}
                              {getCurrentMovement(process.id)?.complemento && (
                                <div className={cn(
                                  "mt-2 text-xs bg-white p-2 rounded border overflow-x-auto",
                                  isXSmall ? "p-1.5 text-[0.6rem]" : ""
                                )}>
                                  <pre className="whitespace-pre-wrap break-words">
                                    {getCurrentMovement(process.id)?.complemento}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhum processo anterior encontrado</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="partes" className="mt-4">
          {selectedProcessId ? (
            <ProcessParties processId={selectedProcessId} />
          ) : (
            <div className="text-center p-8 border rounded-md flex flex-col items-center gap-3">
              <ExclamationTriangleIcon className="h-10 w-10 text-amber-500" />
              <p className="text-lg font-medium">Selecione um processo</p>
              <p className="text-muted-foreground">
                Para visualizar ou gerenciar as partes, selecione um processo nas abas "Atual" ou "Anteriores"
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
