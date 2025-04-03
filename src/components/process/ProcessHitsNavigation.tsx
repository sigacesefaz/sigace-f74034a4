
import React, { useState, useEffect } from "react";
import { getMovementsByProcessId } from "@/services/process-movements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ProcessHitsNavigationProps {
  processId: string;
  hits?: any[];
  processNumber?: string;
  onHitSelect?: (hitId: string) => void;
}

export function ProcessHitsNavigation({
  processId,
  hits = [],
  processNumber,
  onHitSelect
}: ProcessHitsNavigationProps) {
  const [currentHitIndex, setCurrentHitIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("timeline");

  const currentHit = hits && hits[currentHitIndex];
  const hasMultipleHits = hits && hits.length > 1;

  const handlePreviousHit = () => {
    if (currentHitIndex > 0) {
      setCurrentHitIndex(currentHitIndex - 1);
      if (onHitSelect) onHitSelect(hits[currentHitIndex - 1].id);
    }
  };

  const handleNextHit = () => {
    if (currentHitIndex < hits.length - 1) {
      setCurrentHitIndex(currentHitIndex + 1);
      if (onHitSelect) onHitSelect(hits[currentHitIndex + 1].id);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const handleCopyNumber = () => {
    if (processNumber) {
      navigator.clipboard.writeText(processNumber);
      toast.success("Número do processo copiado!");
    }
  };

  if (!hits || hits.length === 0) {
    return null;
  }

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return format(date, "'em' dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "";
    }
  };

  const processEvents = currentHit?.movements?.map((mov: any) => ({
    id: mov.id || `${mov.codigo}-${mov.data_hora}`,
    date: mov.data_hora,
    title: mov.nome,
    description: mov.complemento,
    type: "movement",
    metadata: {
      codigo: mov.codigo
    }
  })) || [];

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Processo {processNumber}
            {processNumber && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCopyNumber} 
                className="h-6 w-6 ml-1"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {currentHit?.title || "Consulta"} {formatDateForDisplay(currentHit?.created_at)}
          </p>
        </div>
        
        {hasMultipleHits && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousHit} 
              disabled={currentHitIndex === 0}
              className="h-8 px-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <span className="text-sm">
              {currentHitIndex + 1} / {hits.length}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextHit} 
              disabled={currentHitIndex === hits.length - 1}
              className="h-8 px-2"
            >
              Próxima <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <Tabs 
        defaultValue="timeline" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline" className="pt-2">
          <ProcessTimeline 
            processId={processId}
            hitId={currentHit?.id}
          />
        </TabsContent>
        <TabsContent value="movimentos" className="pt-2">
          <Card className="p-4">
            <h4 className="text-md font-medium mb-4">Movimentos Processuais</h4>
            {currentHit?.movements && currentHit.movements.length > 0 ? (
              <div className="space-y-3">
                {currentHit.movements.map((mov: any, index: number) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between">
                      <h5 className="font-medium">{mov.nome}</h5>
                      <span className="text-sm text-muted-foreground">{formatDate(mov.data_hora)}</span>
                    </div>
                    {mov.complemento && (
                      <p className="mt-1 text-sm">{mov.complemento}</p>
                    )}
                    {mov.codigo && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100">
                          Código: {mov.codigo}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">Nenhum movimento encontrado.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
