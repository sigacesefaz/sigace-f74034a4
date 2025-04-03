
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

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
  const [scale, setScale] = useState(1);
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filtrar eventos com base no tipo e termo de busca
  const filteredEvents = sortedEvents.filter(event => {
    const matchesType = filteredTypes.length === 0 || !filteredTypes.includes(event.type);
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesType && matchesSearch;
  });

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
  
  // Atualiza a posição de rolagem quando o container é redimensionado
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const updateScrollPosition = () => {
      setScrollPosition(container.scrollLeft);
    };
    
    container.addEventListener('scroll', updateScrollPosition);
    
    return () => {
      container.removeEventListener('scroll', updateScrollPosition);
    };
  }, []);

  // Função para controlar o zoom
  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prevScale => {
      if (direction === 'in') {
        return Math.min(prevScale + 0.2, 2); // Limite máximo de zoom: 2x
      } else {
        return Math.max(prevScale - 0.2, 0.6); // Limite mínimo de zoom: 0.6x
      }
    });
  };

  // Toggle de filtro por tipo
  const toggleFilterType = (type: string) => {
    setFilteredTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  // Verifica se há botões de navegação para mostrar
  const shouldShowNavButtons = () => {
    if (!containerRef.current) return false;
    return containerRef.current.scrollWidth > containerRef.current.clientWidth;
  };

  // Calcula se está no início ou no fim para desabilitar os botões
  const isAtStart = scrollPosition <= 0;
  const isAtEnd = containerRef.current 
    ? scrollPosition >= containerRef.current.scrollWidth - containerRef.current.clientWidth - 10 
    : false;

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

  // Obtenha os tipos únicos presentes nos eventos
  const eventTypes = Array.from(new Set(events.map(event => event.type)));

  // Função para obter cor baseada no tipo de evento
  const getEventColor = (type: string): string => {
    switch (type) {
      case 'document': return 'bg-blue-100 border-blue-300';
      case 'hearing': return 'bg-green-100 border-green-300';
      case 'decision': return 'bg-purple-100 border-purple-300';
      case 'movement': return 'bg-yellow-100 border-yellow-300';
      case 'deadline': return 'bg-red-100 border-red-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  // Função para obter badge color baseada no status
  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 hover:bg-green-600';
      case 'pending': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'canceled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        
        <div className="flex space-x-2">
          {/* Controles de Zoom */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleZoom('out')}
                  disabled={scale <= 0.6}
                  className="h-8 w-8"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Diminuir zoom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => handleZoom('in')}
                  disabled={scale >= 2}
                  className="h-8 w-8"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aumentar zoom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Filtro por tipo */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium mb-2">Tipo de evento</h4>
                {eventTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`filter-${type}`} 
                      checked={!filteredTypes.includes(type)}
                      onCheckedChange={() => toggleFilterType(type)} 
                    />
                    <Label htmlFor={`filter-${type}`} className="capitalize">
                      {type === 'document' ? 'Documento' : 
                       type === 'hearing' ? 'Audiência' : 
                       type === 'decision' ? 'Decisão' : 
                       type === 'movement' ? 'Movimentação' : 
                       type === 'deadline' ? 'Prazo' : type}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <>
          <div className="relative">
            <div
              ref={containerRef}
              className="flex overflow-x-auto scroll-smooth p-4"
              style={{ scrollBehavior: 'smooth' }}
              tabIndex={0}
              aria-label="Timeline de eventos do processo"
              role="region"
            >
              <AnimatePresence>
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.05 
                    }}
                    className={cn(
                      "flex-shrink-0 rounded-md border mr-4 last:mr-0 shadow-sm hover:shadow-md transition-all",
                      getEventColor(event.type)
                    )}
                    style={{ 
                      width: `${48 * scale}px`, 
                      padding: `${12 * scale}px` 
                    }}
                    tabIndex={0}
                    role="article"
                    aria-label={`Evento: ${event.title}`}
                  >
                    {event.status && (
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "mb-2", 
                          getStatusBadgeColor(event.status)
                        )}
                      >
                        {event.status === 'completed' ? 'Concluído' :
                         event.status === 'pending' ? 'Pendente' :
                         event.status === 'canceled' ? 'Cancelado' : event.status}
                      </Badge>
                    )}
                    <div 
                      className="text-sm font-medium mb-1"
                      style={{ fontSize: `${14 * scale}px` }}
                    >
                      {event.title}
                    </div>
                    <div 
                      className="text-xs text-gray-500"
                      style={{ fontSize: `${12 * scale}px` }}
                    >
                      {formatEventDate(event.date)}
                    </div>
                    <div 
                      className="text-xs text-gray-500"
                      style={{ fontSize: `${12 * scale}px` }}
                    >
                      {getTimeAgo(event.date)}
                    </div>
                    {event.description && (
                      <div 
                        className="text-xs text-gray-600 mt-2 line-clamp-3"
                        style={{ fontSize: `${12 * scale}px` }}
                      >
                        {event.description}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/75 hover:bg-white",
                isAtStart ? "opacity-50 cursor-not-allowed" : "opacity-100"
              )}
              onClick={() => handleScroll('left')}
              disabled={isAtStart}
              aria-label="Rolar para a esquerda"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/75 hover:bg-white",
                isAtEnd ? "opacity-50 cursor-not-allowed" : "opacity-100"
              )}
              onClick={() => handleScroll('right')}
              disabled={isAtEnd}
              aria-label="Rolar para a direita"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
