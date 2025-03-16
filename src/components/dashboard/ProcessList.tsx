
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ProcessParties } from "@/components/process/ProcessParties";
import { Process } from "@/types/process";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProcessListProps {
  processes: Process[];
}

export function ProcessList({ processes }: ProcessListProps) {
  const [activeTab, setActiveTab] = useState("atual");
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [currentMovementIndex, setCurrentMovementIndex] = useState<Record<string, number>>({});

  // Separate current and previous processes
  const currentProcesses = processes.filter(process => !process.parent_id);
  const previousHits = processes.filter(process => process.parent_id);

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-sage-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      case "closed":
        return "bg-gray-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
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
              <Card 
                key={process.id} 
                className="p-4 glass-card hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleProcessSelect(process.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{process.number}</p>
                    <h3 className="font-medium mt-1">{process.title || "Processo sem título"}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {process.plaintiff || "Autor não informado"}
                    </p>
                  </div>
                  <Badge className={getStatusColor(process.status)}>
                    {process.status ? process.status.charAt(0).toUpperCase() + process.status.slice(1) : "Em andamento"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(process.created_at).toLocaleDateString('pt-BR')}
                </p>

                {/* Navegação de movimentos do processo */}
                {process.movimentacoes && process.movimentacoes.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">
                        Movimento {(currentMovementIndex[process.id] || 0) + 1} de {process.movimentacoes.length}
                      </span>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviousMovement(process.id);
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextMovement(process.id);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {getCurrentMovement(process.id) && (
                      <div 
                        className="p-3 bg-gray-50 rounded text-sm" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="font-medium">
                          {getCurrentMovement(process.id)?.nome || "Sem descrição"}
                        </div>
                        {getCurrentMovement(process.id)?.dataHora && (
                          <div className="text-gray-500 text-xs mt-1">
                            {new Date(getCurrentMovement(process.id)?.dataHora || "").toLocaleDateString('pt-BR', {
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
                    <Badge className={getStatusColor(process.status)}>
                      {process.status ? process.status.charAt(0).toUpperCase() + process.status.slice(1) : "Em andamento"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {new Date(process.created_at).toLocaleDateString('pt-BR')}
                  </p>

                  {/* Navegação de movimentos do processo */}
                  {process.movimentacoes && process.movimentacoes.length > 0 && (
                    <div className="mt-4 border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-700">
                          Movimento {(currentMovementIndex[process.id] || 0) + 1} de {process.movimentacoes.length}
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviousMovement(process.id);
                            }}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNextMovement(process.id);
                            }}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {getCurrentMovement(process.id) && (
                        <div 
                          className="p-3 bg-gray-50 rounded text-sm" 
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="font-medium">
                            {getCurrentMovement(process.id)?.nome || "Sem descrição"}
                          </div>
                          {getCurrentMovement(process.id)?.dataHora && (
                            <div className="text-gray-500 text-xs mt-1">
                              {new Date(getCurrentMovement(process.id)?.dataHora || "").toLocaleDateString('pt-BR', {
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
