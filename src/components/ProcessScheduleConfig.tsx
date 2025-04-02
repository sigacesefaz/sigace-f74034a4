
import { useState } from 'react';
import { Process, ScheduleConfig } from '@/types/process';
import { getSupabaseClient } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ProcessScheduleConfigProps {
  process: Process;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleUpdate: (updatedProcess: Process) => void;
}

interface RawProcess {
  [key: string]: unknown;
  id: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  last_movement?: string;
  movements?: { data: string; descricao: string }[];
  created_at: string;
  updated_at: string;
  last_check?: string;
  user_id: string;
  schedule_config?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    time?: string;
    dayOfWeek?: number;
    interval?: number;
    lastCheck?: string;
    nextCheck?: string;
  };
}

export function ProcessScheduleConfig({
  process,
  open,
  onOpenChange,
  onScheduleUpdate,
}: ProcessScheduleConfigProps) {
  const [config, setConfig] = useState<ScheduleConfig>(
    process.schedule_config || {
      enabled: false,
      frequency: 'daily',
      time: '08:00',
    }
  );

  const handleSave = async () => {
    const supabase = getSupabaseClient();

    try {
      const { data: rawData, error } = await supabase
        .from('processes')
        .update({
          schedule_config: {
            ...config,
            lastCheck: null,
            nextCheck: new Date().toISOString(),
          },
        })
        .eq('id', process.id)
        .select()
        .single();

      if (error) throw error;

      // Converte os dados brutos para o tipo Process
      const rawProcess = rawData as unknown as RawProcess;
      const updatedProcess: Process = {
        id: rawProcess.id,
        number: rawProcess.number,
        title: rawProcess.title,
        description: rawProcess.description,
        status: rawProcess.status,
        last_movement: rawProcess.last_movement,
        movements: rawProcess.movements,
        created_at: rawProcess.created_at,
        updated_at: rawProcess.updated_at,
        last_check: rawProcess.last_check,
        user_id: rawProcess.user_id,
        schedule_config: rawProcess.schedule_config as ScheduleConfig,
      };

      onScheduleUpdate(updatedProcess);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar configuração de agendamento:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar Atualização Automática</DialogTitle>
          <DialogDescription>
            Configure a frequência de verificação automática de atualizações para este processo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="schedule-enabled">Ativar atualização automática</Label>
            <Switch
              id="schedule-enabled"
              checked={config.enabled}
              onCheckedChange={(checked) =>
                setConfig((prev) => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequência</Label>
            <Select
              value={config.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'custom') =>
                setConfig((prev) => ({ ...prev, frequency: value }))
              }
              disabled={!config.enabled}
            >
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diariamente</SelectItem>
                <SelectItem value="weekly">Semanalmente</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.frequency === 'daily' && (
            <div className="grid gap-2">
              <Label htmlFor="time">Horário</Label>
              <Input
                id="time"
                type="time"
                value={config.time || '08:00'}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, time: e.target.value }))
                }
                disabled={!config.enabled}
              />
            </div>
          )}

          {config.frequency === 'weekly' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="day">Dia da Semana</Label>
                <Select
                  value={String(config.dayOfWeek || 0)}
                  onValueChange={(value) =>
                    setConfig((prev) => ({
                      ...prev,
                      dayOfWeek: parseInt(value, 10),
                    }))
                  }
                  disabled={!config.enabled}
                >
                  <SelectTrigger id="day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Domingo</SelectItem>
                    <SelectItem value="1">Segunda-feira</SelectItem>
                    <SelectItem value="2">Terça-feira</SelectItem>
                    <SelectItem value="3">Quarta-feira</SelectItem>
                    <SelectItem value="4">Quinta-feira</SelectItem>
                    <SelectItem value="5">Sexta-feira</SelectItem>
                    <SelectItem value="6">Sábado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={config.time || '08:00'}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, time: e.target.value }))
                  }
                  disabled={!config.enabled}
                />
              </div>
            </>
          )}

          {config.frequency === 'custom' && (
            <div className="grid gap-2">
              <Label htmlFor="interval">Intervalo (minutos)</Label>
              <Input
                id="interval"
                type="number"
                min="5"
                max="1440"
                value={config.interval || 60}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    interval: parseInt(e.target.value, 10),
                  }))
                }
                disabled={!config.enabled}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
