import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: "document" | "hearing" | "decision" | "movement" | "deadline";
  status?: "completed" | "pending" | "canceled";
  metadata?: any;
}

interface ProcessHorizontalTimelineProps {
  events: TimelineEvent[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function ProcessHorizontalTimeline({
  events,
  title = "Linha do Tempo",
  emptyMessage = "Não há eventos registrados",
  className
}: ProcessHorizontalTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? Math.max(0, scrollPosition - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
      
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
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

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      
      {events.length === 0 ? (
        <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <>
          <div className="relative">
            <div
              ref={containerRef}
              className="flex overflow-x-auto scroll-smooth p-4"
            >
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex-shrink-0 w-48 p-3 rounded-md border border-gray-200 mr-4 last:mr-0"
                >
                  <div className="text-sm font-medium">{event.title}</div>
                  <div className="text-xs text-gray-500">{formatEventDate(event.date)}</div>
                  <div className="text-xs text-gray-500">{getTimeAgo(event.date)}</div>
                  {event.description && (
                    <div className="text-xs text-gray-600 mt-2">{event.description}</div>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/75 hover:bg-white"
              onClick={() => handleScroll('left')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/75 hover:bg-white"
              onClick={() => handleScroll('right')}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
