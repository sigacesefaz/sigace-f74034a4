
import { Process } from "@/types/process";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ProcessListProps {
  processes: Process[];
}

export function ProcessList({ processes }: ProcessListProps) {
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-500 text-white";
    
    switch (status.toLowerCase()) {
      case "active":
      case "em andamento":
        return "bg-sage-500 text-white";
      case "pending":
      case "pendente":
        return "bg-yellow-500 text-white";
      case "closed":
      case "arquivado":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-4">
      {processes.map((process) => (
        <Card key={process.id} className="p-4 glass-card hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{process.number}</p>
              <h3 className="font-medium mt-1">{process.title}</h3>
              
              {process.movimentacoes && process.movimentacoes.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Último movimento: {process.movimentacoes[0].descricao || process.movimentacoes[0].nome || "Sem descrição"}
                </p>
              )}
            </div>
            <Badge className={getStatusColor(process.status)}>
              {process.status ? process.status.charAt(0).toUpperCase() + process.status.slice(1) : "Não definido"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {process.created_at ? format(new Date(process.created_at), "dd/MM/yyyy") : "Data não disponível"}
          </p>
        </Card>
      ))}
    </div>
  );
}
