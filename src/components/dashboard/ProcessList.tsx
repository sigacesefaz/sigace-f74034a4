import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ProcessParties } from "@/components/process/ProcessParties";
import { Process } from "@/types/process";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { ProcessNavigation } from "@/components/process/ProcessNavigation";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface ProcessListProps {
  processes: Process[];
}

export function ProcessList({ processes }: ProcessListProps) {
  const [activeTab, setActiveTab] = useState("atual");
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [currentMovementIndex, setCurrentMovementIndex] = useState<Record<string, number>>({});
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  // Separate current and previous processes
  const currentProcesses = processes.filter(process => !process.parent_id);
  const previousHits = processes.filter(process => process.parent_id);

  // Updated function to determine badge styling based on status
  const getStatusBadgeProps = (status?: string) => {
    if (!status) return { variant: "secondary" as const };
    
    if (status === "Baixado") {
      return { 
        variant: "destructive" as const,
        className: "bg-red-600 text-white"
      };
    } 
    return { variant: "secondary" as const };
  };

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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="atual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="atual">Atual</TabsTrigger>
          <TabsTrigger value="anteriores">
            Anteriores <Badge className="ml-2">{previousHits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="partes">Partes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="atual" className="space-y-4 mt-4">
          {currentProcesses.length > 0 ? (
            currentProcesses.map((process) => (
              <Card key={process.id} className="mb-4">
                <CardHeader className="cursor-pointer" onClick={() => toggleDetails(process.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <CardTitle className="text-base">{process.number}</CardTitle>
                        <CardDescription className="text-sm">{process.title}</CardDescription>
                      </div>
                      {/* Adiciona o badge com o número de movimentações */}
                      {process.movimentacoes && process.movimentacoes.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {process.movimentacoes.length} movimentações
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge {...getStatusBadgeProps(process.status)}>
                        {process.status || "Em andamento"}
                      </Badge>
                      <ChevronDown className={`h-4 w-4 transform transition-transform ${showDetails[process.id] ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>

                {showDetails[process.id] && (
                  <CardContent>
                    <div className="mt-4 border-t pt-3">
                      <h4 className="font-medium mb-2">Detalhes do Processo</h4>
                      
                      {/* Badges das classes de movimentação */}
                      {process.movimentacoes && process.movimentacoes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {getUniqueClasses(process.movimentacoes).map((classe, index) => {
                            const isCurrentClass = getCurrentMovement(process.id)?.nome === classe;
                            return (
                              <Badge 
                                key={index} 
                                variant={isCurrentClass ? "default" : "outline"}
                                className={isCurrentClass ? "bg-primary text-primary-foreground" : ""}
                              >
                                {classe}
                              </Badge>
                            );
                          })}
                        </div>
                      )}

                      {/* Navegação de movimentos do processo */}
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
                              className="p-3 bg-gray-50 rounded text-sm mt-2" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-medium">
                                {getCurrentMovement(process.id)?.nome || "Sem descrição"}
                              </div>
                              {getCurrentMovement(process.id)?.data_hora && (
                                <div className="text-gray-500 text-xs mt-1">
                                  {new Date(getCurrentMovement(process.id)?.data_hora || "").toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              )}
                              {getCurrentMovement(process.id)?.complemento && (
                                <div className="mt-2 text-xs bg-white p-2 rounded border">
                                  {getCurrentMovement(process.id)?.complemento}
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
                  className="p-4 glass-card hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleProcessSelect(process.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{process.number}</p>
                      <h3 className="font-medium mt-1">{process.title || "Processo sem título"}</h3>
                    </div>
                    <Badge 
                      {...getStatusBadgeProps(process.status)}
                      className={cn(getStatusBadgeProps(process.status).className)}
                    >
                      {process.status || "Em andamento"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(process.created_at).toLocaleDateString('pt-BR')}
                  </p>

                  {/* Botão para exibir detalhes do processo */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDetails(process.id);
                    }}
                  >
                    {showDetails[process.id] ? "Ocultar Detalhes" : "Detalhes do Processo"}
                  </Button>

                  {/* Detalhes do Processo - Expandível */}
                  {showDetails[process.id] && (
                    <div className="mt-4 border-t pt-3">
                      <h4 className="font-medium mb-2">Detalhes do Processo</h4>
                      
                      {/* Navegação de movimentos do processo */}
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
                              className="p-3 bg-gray-50 rounded text-sm mt-2" 
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="font-medium">
                                {getCurrentMovement(process.id)?.nome || "Sem descrição"}
                              </div>
                              {getCurrentMovement(process.id)?.data_hora && (
                                <div className="text-gray-500 text-xs mt-1">
                                  {new Date(getCurrentMovement(process.id)?.data_hora || "").toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              )}
                              {getCurrentMovement(process.id)?.complemento && (
                                <div className="mt-2 text-xs bg-white p-2 rounded border">
                                  {getCurrentMovement(process.id)?.complemento}
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
