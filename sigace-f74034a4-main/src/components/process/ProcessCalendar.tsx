import { useState, useMemo, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeStringValue, getSafeNestedValue } from "@/utils/data";
import { FileText, Users, Gavel, Bell, Calendar as CalendarIcon } from "lucide-react";

interface ProcessEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'movimento' | 'documento' | 'parte' | 'intimacao';
  metadata?: any;
  processNumber?: string;
}

interface ProcessCalendarProps {
  processes: Array<{
    id: string;
    number: string;
    type: string;
    metadata: any;
    created_at: string;
    updated_at: string;
  }>;
}

export function ProcessCalendar({ processes }: ProcessCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Log para debug
  useEffect(() => {
    console.log('ProcessCalendar - processes:', processes);
  }, [processes]);

  // Função para criar eventos a partir dos dados do processo
  const events = useMemo(() => {
    const allEvents: ProcessEvent[] = [];
    
    if (!Array.isArray(processes)) {
      console.log('Sem processos para mostrar');
      return allEvents;
    }

    processes.forEach(process => {
      if (!process?.metadata) return;

      // Adiciona data de ajuizamento
      const dataAjuizamento = getSafeNestedValue(process.metadata, 'dataAjuizamento');
      if (dataAjuizamento) {
        const date = parseISO(dataAjuizamento);
        if (isValid(date)) {
          allEvents.push({
            id: `ajuizamento-${process.id}`,
            date,
            title: 'Ajuizamento do Processo',
            description: `Processo ${safeStringValue(process.number)} ajuizado`,
            type: 'movimento',
            processNumber: process.number
          });
        }
      }

      // Adiciona movimentações
      const movimentos = Array.isArray(process.metadata?.movimentos) ? process.metadata.movimentos : [];
      
      movimentos.forEach((movimento: any) => {
        const dataMovimento = movimento.data || movimento.data_hora;
        if (dataMovimento) {
          const date = parseISO(dataMovimento);
          if (isValid(date)) {
            allEvents.push({
              id: `mov-${movimento.id || Math.random()}`,
              date,
              title: safeStringValue(movimento.descricao || movimento.nome),
              description: safeStringValue(movimento.complemento || ''),
              type: 'movimento',
              metadata: movimento,
              processNumber: process.number
            });
          }
        }
      });
    });

    // Log do total de eventos
    console.log('Total de eventos:', allEvents.length);

    // Ordena eventos por data (mais recentes primeiro)
    return allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [processes]);

  // Eventos do dia selecionado
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => 
      format(event.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
  }, [events, selectedDate]);

  // Função para renderizar o ícone do tipo de evento
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'movimento':
        return <Gavel className="h-4 w-4" />;
      case 'documento':
        return <FileText className="h-4 w-4" />;
      case 'parte':
        return <Users className="h-4 w-4" />;
      case 'intimacao':
        return <Bell className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  // Função para obter a cor do badge do evento
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'movimento':
        return 'bg-blue-100 text-blue-800';
      case 'documento':
        return 'bg-green-100 text-green-800';
      case 'parte':
        return 'bg-purple-100 text-purple-800';
      case 'intimacao':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Modifique os dias que têm eventos
  const modifiers = useMemo(() => {
    const eventDates = events.map(event => event.date);
    return {
      hasEvent: eventDates
    };
  }, [events]);

  // Estilo para os dias com eventos
  const modifiersStyles = {
    hasEvent: {
      fontWeight: 'bold',
      border: '2px solid var(--primary)',
      color: 'var(--primary)'
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Calendário de Processos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Eventos do Dia {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getEventBadgeColor(event.type)}`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline" className={getEventBadgeColor(event.type)}>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.description}
                        </p>
                        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                          <span>{format(event.date, "HH:mm", { locale: ptBR })}</span>
                          <span>Processo: {event.processNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum evento nesta data</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
