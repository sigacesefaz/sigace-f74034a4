
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
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
  const [allHits, setAllHits] = useState<any[]>([]);

  useEffect(() => {
    // Process the hits when processes change
    const processedHits = getAllHits();
    setAllHits(processedHits);
  }, [processes]);

  // Get all hits and sort them by updated_at (most recent first)
  const getAllHits = () => {
    let allHitsArray: any[] = [];
    
    if (!processes || !Array.isArray(processes)) {
      console.warn("Processes is not an array:", processes);
      return [];
    }
    
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
        allHitsArray = [...allHitsArray, ...processHits];
      }
    });
    
    // Sort by data_hora_ultima_atualizacao or updated_at in descending order (most recent first)
    return allHitsArray.sort((a, b) => {
      const dateA = a.data_hora_ultima_atualizacao || a.updated_at || '';
      const dateB = b.data_hora_ultima_atualizacao || b.updated_at || '';
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1; // b comes first
      if (!dateB) return -1; // a comes first
      
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  // Get the most recent hit for the "Atual" tab
  const currentHit = allHits.length > 0 ? allHits[0] : null;
  
  // Get all other hits for the "Anteriores" tab
  const previousHits = allHits.slice(1);
  
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Data desconhecida";
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  const renderHitCard = (hit: any) => {
    if (!hit) return null;
    
    return (
      <Card 
        key={hit.hit_id || hit.id} 
        className="p-4 glass-card hover:shadow-md transition-all cursor-pointer"
        onClick={() => handleProcessSelect(hit.processId)}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{hit.processNumber || hit.numero_processo || "Número não disponível"}</p>
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
          Última atualização: {formatDate(hit.data_hora_ultima_atualizacao || hit.updated_at)}
        </p>
        {hit.orgao_julgador && (
          <p className="text-sm mt-2">
            <span className="font-medium">Órgão Julgador:</span> {hit.orgao_julgador.nome}
          </p>
        )}
        
        {/* Mostrar alguns movimentos recentes associados a este hit, se disponíveis */}
        {hit.movimentos && hit.movimentos.length > 0 && (
          <div className="mt-3 border-t pt-2">
            <p className="text-sm font-medium">Movimentos recentes:</p>
            <ul className="text-sm mt-1">
              {hit.movimentos.slice(0, 2).map((movimento: any, index: number) => (
                <li key={index} className="text-muted-foreground">
                  {movimento.nome} - {formatDate(movimento.data_hora)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
  };

  console.log("Current hit:", currentHit);
  console.log("Previous hits:", previousHits);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="atual" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full">
          <TabsTrigger value="atual" className="flex-1">Atual</TabsTrigger>
          <TabsTrigger value="anteriores" className="flex-1">
            Anteriores <Badge className="ml-2">{previousHits.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="partes" className="flex-1">Partes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="atual" className="space-y-4 mt-4">
          {currentHit ? (
            renderHitCard(currentHit)
          ) : (
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhuma informação atual disponível</p>
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
