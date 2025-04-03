
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Filter, 
  LayoutGrid,
  Clock,
  List,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { Filters } from "@/components/ui/filters";

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

type ViewMode = "linear" | "cards";
type Density = "compact" | "normal" | "expanded";

export function ProcessHorizontalTimeline({
  events,
  title = "Linha do Tempo",
  emptyMessage = "Não há eventos registrados",
  className
}: ProcessHorizontalTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scale, setScale] = useState(1);
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("linear");
  const [density, setDensity] = useState<Density>("normal");
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [codeFilter, setCodeFilter] = useState("");
  
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filtrar eventos com base no tipo, termo de busca, datas e código
  const filteredEvents = sortedEvents.filter(event => {
    const matchesType = filteredTypes.length === 0 || !filteredTypes.includes(event.type);
    
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (event.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const eventDate = new Date(event.date);
    
    const matchesYear = !yearFilter || eventDate.getFullYear() === yearFilter;
    
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (eventDate >= dateRange.from && eventDate <= dateRange.to);
    
    const matchesCode = !codeFilter || 
      (event.metadata?.codigo?.toString().includes(codeFilter) || false);
    
    return matchesType && matchesSearch && matchesYear && matchesDateRange && matchesCode;
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

  // Mover para um evento específico
  const jumpToEvent = (index: number) => {
    if (index >= 0 && index < filteredEvents.length) {
      setSelectedEventIndex(index);
      
      const container = containerRef.current;
      const timeline = timelineRef.current;
      
      if (container && timeline) {
        const eventElements = timeline.querySelectorAll("[data-event-index]");
        if (eventElements[index]) {
          const eventElement = eventElements[index] as HTMLElement;
          const eventLeft = eventElement.offsetLeft;
          const centerPosition = eventLeft - (container.clientWidth / 2) + (eventElement.offsetWidth / 2);
          
          container.scrollTo({ 
            left: centerPosition, 
            behavior: 'smooth' 
          });
          
          setScrollPosition(centerPosition);
        }
      }
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
      return format(date, "dd MMM", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Obtenha os tipos únicos presentes nos eventos
  const eventTypes = Array.from(new Set(events.map(event => event.type)));
  
  // Obtenha os anos únicos presentes nos eventos
  const eventYears = Array.from(
    new Set(
      events
        .map(event => {
          try {
            return new Date(event.date).getFullYear();
          } catch {
            return null;
          }
        })
        .filter(Boolean) as number[]
    )
  ).sort((a, b) => a - b);

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

  // Função para obter cor do ponto na linha do tempo
  const getPointColor = (type: string): string => {
    switch (type) {
      case 'document': return 'bg-blue-500';
      case 'hearing': return 'bg-green-500';
      case 'decision': return 'bg-purple-500';
      case 'movement': return 'bg-yellow-500';
      case 'deadline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDensityClass = () => {
    switch (density) {
      case 'compact': return 'gap-6';
      case 'expanded': return 'gap-16';
      default: return 'gap-10';
    }
  };

  // Aplicar filtros
  const handleFilter = (filters: { startDate?: Date; endDate?: Date; code?: string; text?: string }) => {
    if (filters.startDate && filters.endDate) {
      setDateRange({ from: filters.startDate, to: filters.endDate });
    } else {
      setDateRange(undefined);
    }
    
    setCodeFilter(filters.code || "");
    setSearchTerm(filters.text || "");
  };

  // Resetar filtros
  const handleResetFilter = () => {
    setDateRange(undefined);
    setCodeFilter("");
    setSearchTerm("");
    setYearFilter(null);
    setFilteredTypes([]);
  };

  // Renderiza a timeline no estilo da imagem de referência
  const renderSimpleTimeline = () => {
    if (filteredEvents.length === 0) return null;
    
    // Pegar primeiro e último evento
    const firstEvent = filteredEvents[0];
    const lastEvent = filteredEvents[filteredEvents.length - 1];
    
    // Selecionar até 3-5 eventos para exibir na linha (incluindo o primeiro e o último)
    const totalIndicators = Math.min(5, filteredEvents.length);
    const eventsToShow: TimelineEvent[] = [];
    
    if (filteredEvents.length <= totalIndicators) {
      eventsToShow.push(...filteredEvents);
    } else {
      // Incluir primeiro e último evento
      eventsToShow.push(firstEvent);
      
      // Adicionar eventos intermediários
      const step = Math.floor(filteredEvents.length / (totalIndicators - 1));
      for (let i = 1; i < totalIndicators - 1; i++) {
        eventsToShow.push(filteredEvents[i * step]);
      }
      
      // Adicionar último evento se ainda não estiver incluído
      if (eventsToShow[eventsToShow.length - 1] !== lastEvent) {
        eventsToShow.push(lastEvent);
      }
    }
    
    // Selecionar o evento atualmente focado (se houver)
    const currentEvent = selectedEventIndex !== null ? filteredEvents[selectedEventIndex] : null;
    
    return (
      <div className="relative mt-4 mb-8 px-8">
        {/* Linha Horizontal */}
        <div className="h-0.5 bg-gray-300 absolute top-4 left-0 right-0 z-0"></div>
        
        {/* Marcadores de eventos */}
        <div className="flex justify-between relative">
          {eventsToShow.map((event, index) => (
            <div 
              key={event.id} 
              className="flex flex-col items-center relative z-10"
            >
              {/* Ponto na linha */}
              <div 
                className={cn(
                  "w-4 h-4 rounded-full border-2 border-white mt-2",
                  currentEvent && currentEvent.id === event.id 
                    ? "bg-gray-700 w-6 h-6" 
                    : "bg-white"
                )}
              ></div>
              {/* Data */}
              <div className="text-xs text-gray-600 mt-2">
                {formatEventDate(event.date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderiza o card de evento atual
  const renderCurrentEventCard = () => {
    if (selectedEventIndex === null || filteredEvents.length === 0) {
      return (
        <div className="mt-6 p-4 bg-white rounded-lg border shadow-sm">
          <div className="text-center text-gray-500">
            {filteredEvents.length > 0 
              ? "Selecione um evento na linha do tempo" 
              : "Nenhum evento disponível"}
          </div>
        </div>
      );
    }
    
    const event = filteredEvents[selectedEventIndex];
    return (
      <div className="mt-6 p-6 bg-white rounded-lg border shadow-sm">
        <div className="flex items-start">
          {event.metadata?.avatar ? (
            <img 
              src={event.metadata.avatar} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full mr-4"
            />
          ) : (
            <div className={cn(
              "w-12 h-12 rounded-full mr-4 flex items-center justify-center text-white",
              getPointColor(event.type)
            )}>
              {event.type.substring(0, 1).toUpperCase()}
            </div>
          )}
          
          <div>
            <h3 className="text-xl font-bold">{event.title}</h3>
            <p className="text-sm text-gray-600">{formatFullDate(event.date)}</p>
            
            {event.description && (
              <div className="mt-4 text-gray-700">
                {event.description}
              </div>
            )}
            
            {event.metadata?.codigo && (
              <div className="mt-2">
                <Badge variant="outline" className="bg-gray-100">
                  Código: {event.metadata.codigo}
                </Badge>
              </div>
            )}
            
            <div className="mt-4">
              <Button className="text-white">Ler mais</Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className="p-4 border-b flex justify-between flex-wrap gap-2 items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        
        <div className="flex space-x-2 flex-wrap gap-2">
          {/* Layout Selector */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setViewMode(viewMode === 'linear' ? 'cards' : 'linear')}
                  className="h-8 w-8"
                >
                  {viewMode === 'linear' ? <LayoutGrid className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Alternar visualização</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Density Selector */}
          {viewMode === 'linear' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setDensity(density === 'normal' ? 'compact' : density === 'compact' ? 'expanded' : 'normal')}
                    className="h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Alterar densidade: {density}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
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
          
          {/* Filtro por ano */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ano</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium mb-2">Filtrar por ano</h4>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setYearFilter(null)}
                    className={`w-full justify-start ${!yearFilter ? 'bg-blue-50' : ''}`}
                  >
                    Todos os anos
                  </Button>
                  
                  {eventYears.map(year => (
                    <Button 
                      key={year} 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setYearFilter(year)}
                      className={`w-full justify-start ${yearFilter === year ? 'bg-blue-50' : ''}`}
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

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

          {/* Jump to Event */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <span>Ir para</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2 max-h-[200px] overflow-auto">
                <h4 className="font-medium mb-2">Selecionar evento</h4>
                {filteredEvents.map((event, index) => (
                  <Button 
                    key={event.id} 
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left text-xs"
                    onClick={() => jumpToEvent(index)}
                  >
                    <div className={cn("w-2 h-2 rounded-full mr-2", getPointColor(event.type))}></div>
                    <span className="truncate">{formatEventDate(event.date)} - {event.title}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Área de filtros avançados */}
      <div className="px-4 py-2 border-b">
        <Filters 
          onFilter={handleFilter}
          onResetFilter={handleResetFilter}
          showDateFilter={true}
          showCodeFilter={true}
          initialValues={{
            startDate: dateRange?.from,
            endDate: dateRange?.to,
            code: codeFilter,
            text: searchTerm
          }}
        />
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="p-4 text-center text-gray-500">{emptyMessage}</div>
      ) : (
        <>
          {/* Timeline simplificada conforme imagem de referência */}
          {renderSimpleTimeline()}
          
          {/* Card do evento atual */}
          {renderCurrentEventCard()}
          
          <div className="relative p-4">
            <div
              ref={containerRef}
              className="flex overflow-x-auto scroll-smooth p-4"
              style={{ scrollBehavior: 'smooth' }}
              tabIndex={0}
              aria-label="Timeline de eventos do processo"
              role="region"
            >
              {viewMode === 'linear' ? (
                <div 
                  ref={timelineRef}
                  className="relative min-w-full py-6"
                >
                  {/* Linha do tempo */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>
                  
                  {/* Eventos na linha do tempo */}
                  <div className={cn("relative flex items-center min-w-full", getDensityClass())}>
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        key={event.id}
                        data-event-index={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={cn(
                          "flex flex-col items-center relative",
                          index === selectedEventIndex ? "z-10" : "z-0"
                        )}
                        style={{ flex: '0 0 auto' }}
                        onClick={() => setSelectedEventIndex(index)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Evento: ${event.title}`}
                      >
                        {/* Ponto na linha */}
                        <div 
                          className={cn(
                            "w-4 h-4 rounded-full z-10 border-2 border-white shadow-sm cursor-pointer",
                            getPointColor(event.type),
                            index === selectedEventIndex ? "w-6 h-6" : ""
                          )}
                        ></div>
                        
                        {/* Conteúdo do evento */}
                        <AnimatePresence>
                          {(index === selectedEventIndex || density !== 'compact') && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className={cn(
                                "absolute top-6 pt-2 flex flex-col items-center",
                                index % 2 === 0 ? "-translate-y-full -top-6 pb-2" : "translate-y-0 top-6 pt-2"
                              )}
                              style={{ 
                                width: `${Math.max(100, 150 * scale)}px`,
                                maxWidth: `${Math.max(100, 200 * scale)}px`
                              }}
                            >
                              <div 
                                className={cn(
                                  "rounded-md border p-2 shadow-sm w-full",
                                  getEventColor(event.type),
                                  index === selectedEventIndex ? "ring-2 ring-primary ring-opacity-50" : ""
                                )}
                              >
                                {event.status && (
                                  <Badge 
                                    variant="secondary" 
                                    className={cn(
                                      "mb-1 text-xs", 
                                      getStatusBadgeColor(event.status)
                                    )}
                                  >
                                    {event.status === 'completed' ? 'Concluído' :
                                     event.status === 'pending' ? 'Pendente' :
                                     event.status === 'canceled' ? 'Cancelado' : event.status}
                                  </Badge>
                                )}
                                <div 
                                  className="text-sm font-medium mb-1 truncate"
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
                                {event.description && index === selectedEventIndex && (
                                  <div 
                                    className="text-xs text-gray-600 mt-1 line-clamp-2"
                                    style={{ fontSize: `${12 * scale}px` }}
                                  >
                                    {event.description}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
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
                        width: `${248 * scale}px`, 
                        padding: `${12 * scale}px` 
                      }}
                      tabIndex={0}
                      role="article"
                      aria-label={`Evento: ${event.title}`}
                      onClick={() => setSelectedEventIndex(index)}
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
              )}
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
