import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarIcon, ChevronDown, ChevronUp, ChevronRight, FileText } from "lucide-react";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: "document" | "hearing" | "decision" | "movement" | "deadline";
  status?: "completed" | "pending" | "canceled";
  metadata?: any;
}

interface ProcessTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  maxItems?: number;
  onLoadMore?: () => void;
  hasMoreEvents?: boolean;
}

export function ProcessTimeline({
  events,
  isLoading = false,
  title = "Timeline do Processo",
  emptyMessage = "Não há eventos registrados",
  maxItems = 5,
  onLoadMore,
  hasMoreEvents = false
}: ProcessTimelineProps) {
  const [visibleEvents, setVisibleEvents] = useState<TimelineEvent[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (events) {
      setVisibleEvents(showAll ? events : events.slice(0, maxItems));
    }
  }, [events, showAll, maxItems]);

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Data inválida";
    }
  };

  // Fix string concatenation operations
  const getTimeAgo = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `há ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
      } else if (diffHours < 24) {
        return `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
      } else {
        return `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
      }
    } catch (error) {
      return "data desconhecida";
    }
  };

  return (
    <Card className="w-full">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="relative">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {visibleEvents.map((event) => (
              <li key={event.id} className="py-4 px-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-gray-500 text-sm">{getTimeAgo(event.date)}</div>
                    <div className="text-gray-500 text-sm">{formatEventDate(event.date)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-semibold">{event.title}</h4>
                      {event.type === "deadline" && (
                        <Badge variant="destructive">Prazo</Badge>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                    {event.metadata && event.metadata.documentType && (
                      <div className="flex items-center mt-2">
                        <FileText className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {event.metadata.documentType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 text-center text-gray-500">{emptyMessage}</div>
        )}

        {events && events.length > maxItems && (
          <div className="p-4 flex justify-center">
            {onLoadMore && hasMoreEvents ? (
              <Button onClick={onLoadMore}>Carregar Mais</Button>
            ) : (
              <Button onClick={() => setShowAll(!showAll)}>
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Ver Menos
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Ver Mais
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
