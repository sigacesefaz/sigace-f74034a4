
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import ProcessParties from "@/components/process/ProcessParties";
import { Process } from "@/types/process";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessListProps {
  processes: Process[];
}

export function ProcessList({ processes }: ProcessListProps) {
  const [activeTab, setActiveTab] = useState("atual");
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [previousHitIndex, setPreviousHitIndex] = useState(0);

  // Get all hits and sort them by updated_at (most recent first)
  const getAllHits = () => {
    let allHits: any[] = [];
    
    processes.forEach(process => {
      if (process.hits && Array.isArray(process.hits) && process.hits.length > 0) {
        // Add process ID and parent info to each hit
        const processHits = process.hits.map(hit => ({
          ...hit,
          processId: process.id,
          processNumber: process.number,
          processTitle: process.title,
          processPlaintiff: process.plaintiff
        }));
        allHits = [...allHits, ...processHits];
      }
    });
    
    // Sort by updated_at in descending order (most recent first)
    return allHits.sort((a, b) => {
      const dateA = a.data_hora_ultima_atualizacao || a.updated_at || '';
      const dateB = b.data_hora_ultima_atualizacao || b.updated_at || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  const sortedHits = getAllHits();
  
  // Get the most recent hit for the "Atual" tab
  const currentHit = sortedHits.length > 0 ? sortedHits[0] : null;
  
  // Get all other hits for the "Anteriores" tab
  const previousHits = sortedHits.slice(1);
  
  const handleProcessSelect = (id: string) => {
    setSelectedProcessId(id);
    setActiveTab("partes");
  };

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

  const navigatePreviousHits = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setPreviousHitIndex(Math.max(0, previousHitIndex - 1));
    } else {
      setPreviousHitIndex(Math.min(previousHits.length - 1, previousHitIndex + 1));
    }
  };

  const renderHitCard = (hit: any) => (
    <Card 
      key={hit.hit_id || hit.id} 
      className="p-4 glass-card hover:shadow-md transition-all cursor-pointer"
      onClick={() => handleProcessSelect(hit.processId)}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{hit.processNumber || hit.numero_processo}</p>
          <h3 className="font-medium mt-1">{hit.processTitle || "Processo sem título"}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {hit.processPlaintiff || "Autor não informado"}
          </p>
        </div>
        <Badge className={getStatusColor(hit.situacao?.nome || "active")}>
          {hit.situacao?.nome || "Em andamento"}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Última atualização: {new Date(hit.data_hora_ultima_atualizacao || hit.updated_at).toLocaleDateString('pt-BR')}
      </p>
      {hit.orgao_julgador && (
        <p className="text-sm mt-2">
          <span className="font-medium">Órgão Julgador:</span> {hit.orgao_julgador.nome}
        </p>
      )}
    </Card>
  );

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
          {currentHit ? (
            renderHitCard(currentHit)
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhum processo encontrado</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="anteriores" className="mt-4">
          {previousHits.length > 0 ? (
            <div className="space-y-4">
              {previousHits[previousHitIndex] && renderHitCard(previousHits[previousHitIndex])}
              
              {previousHits.length > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigatePreviousHits('prev')}
                    disabled={previousHitIndex === 0}
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {previousHitIndex + 1} de {previousHits.length}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={() => navigatePreviousHits('next')}
                    disabled={previousHitIndex === previousHits.length - 1}
                    size="sm"
                  >
                    Próximo <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
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
