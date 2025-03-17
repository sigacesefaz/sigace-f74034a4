import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, PencilIcon, Trash2Icon, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Process } from "@/types/process";
import { cn } from "@/lib/utils";

interface ProcessListProps {
  processes: Process[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onRefresh?: (id: string) => void;
}

export function ProcessList({ processes, isLoading, onDelete, onRefresh }: ProcessListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[150px] mt-2" />
              </div>
              <div className="space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!processes || processes.length === 0) {
    return <p>Nenhum processo encontrado.</p>;
  }

  return (
    <div className="grid gap-4">
      {processes.map((process) => (
        <ProcessItem key={process.id} process={process} onDelete={onDelete} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

export function ProcessItem({ process, onDelete, onRefresh }: { process: Process; onDelete?: (id: string) => void; onRefresh?: (id: string) => void }) {
  // Determine the appropriate badge variant based on status
  const getBadgeVariant = (status?: string) => {
    if (!status) return "secondary";
    
    // Map status string to valid badge variant
    switch (status.toLowerCase()) {
      case "baixado":
        return "destructive" as const;
      case "em andamento":
        return "default" as const;
      case "suspenso":
        return "outline" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="text-lg font-semibold">{process.title}</div>
          <div className="text-sm text-gray-500">{process.number}</div>
          <div className="text-sm text-gray-500">
            {process.description}
          </div>
          <Badge variant={getBadgeVariant(process.status)}>{process.status}</Badge>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex space-x-2">
            <Link to={`/processes/${process.id}`}>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            {onRefresh && (
              <Button variant="outline" size="icon" onClick={() => onRefresh(String(process.id))}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="icon" onClick={() => onDelete(String(process.id))}>
                <Trash2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <Clock className="h-3 w-3 inline-block mr-1" />
            Atualizado em: {format(new Date(process.updated_at), "dd/MM/yyyy HH:mm")}
          </div>
        </div>
      </div>
    </Card>
  );
}

