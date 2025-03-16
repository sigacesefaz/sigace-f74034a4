import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ProcessParties } from "@/components/process/ProcessParties";
import { Process } from "@/types/process";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ProcessListProps {
  processes: Process[];
}

export function ProcessList({ processes }: ProcessListProps) {
  const [activeTab, setActiveTab] = useState("atual");
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

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
