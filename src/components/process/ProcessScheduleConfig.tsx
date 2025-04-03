
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Process } from '@/types/process';
import { format, addDays, addWeeks, parseISO } from 'date-fns';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProcessScheduleConfigProps {
  process: Process;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleUpdate: (process: Process) => void;
}

export function ProcessScheduleConfig({ process, open, onOpenChange, onScheduleUpdate }: ProcessScheduleConfigProps) {
  const [config, setConfig] = useState(process.schedule_config || {
    enabled: false,
    frequency: 'daily',
    time: '08:00',
    days: [],
    last_check: process.updated_at,
    next_check: null
  });

  const calculateNextCheck = (frequency: string, time: string, days?: number[]) => {
    const [hours, minutes] = time.split(':').map(Number);
    let nextCheck = new Date();
    nextCheck.setHours(hours, minutes, 0, 0);

    switch (frequency) {
      case 'daily':
        if (nextCheck <= new Date()) {
          nextCheck = addDays(nextCheck, 1);
        }
        break;
      case 'weekly':
        if (days && days.length > 0) {
          while (!days.includes(nextCheck.getDay()) || nextCheck <= new Date()) {
            nextCheck = addDays(nextCheck, 1);
          }
        } else {
          nextCheck = addWeeks(nextCheck, 1);
        }
        break;
      default:
        if (nextCheck <= new Date()) {
          nextCheck = addDays(nextCheck, 1);
        }
    }

    return nextCheck;
  };

  const handleSave = async () => {
    try {
      const supabase = getSupabaseClient();
      
      const nextCheck = calculateNextCheck(config.frequency, config.time, config.days);
      const updatedConfig = {
        ...config,
        next_check: nextCheck.toISOString()
      };

      const { error } = await supabase
        .from('processes')
        .update({
          schedule_config: updatedConfig
        })
        .eq('id', process.id);

      if (error) throw error;

      const updatedProcess = {
        ...process,
        schedule_config: updatedConfig
      };

      onScheduleUpdate(updatedProcess);
      onOpenChange(false);
      toast.success('Agendamento configurado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao configurar agendamento');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar Atualização Automática</DialogTitle>
          <DialogDescription>
            Configure quando o sistema deve verificar automaticamente por atualizações neste processo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: !!checked }))}
            />
            <label htmlFor="enabled" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Ativar atualização automática
            </label>
          </div>

          {config.enabled && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequência</label>
                <Select
                  value={config.frequency}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Horário</label>
                <Input
                  type="time"
                  value={config.time}
                  onChange={(e) => setConfig(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              {config.frequency === 'weekly' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dias da Semana</label>
                  <div className="flex flex-wrap gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${index}`}
                          checked={config.days?.includes(index)}
                          onCheckedChange={(checked) => {
                            setConfig(prev => ({
                              ...prev,
                              days: checked
                                ? [...(prev.days || []), index]
                                : (prev.days || []).filter(d => d !== index)
                            }));
                          }}
                        />
                        <label htmlFor={`day-${index}`} className="text-sm">{day}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {config.last_check && (
                <div className="text-sm text-gray-500">
                  Última verificação: {format(parseISO(config.last_check), 'dd/MM/yyyy HH:mm')}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configuração
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
