
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from 'date-fns';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface SystemUpdateConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  time: string;
  days?: number[];
  last_check?: string;
  next_check?: string;
}

export function AutoUpdateConfig() {
  const [config, setConfig] = useState<SystemUpdateConfig>({
    enabled: false,
    frequency: 'daily',
    time: '03:00', // Default para 3 AM
    days: [],
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'auto_update_config')
        .single();

      if (error) throw error;
      if (data?.value) {
        setConfig(data.value as SystemUpdateConfig);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configurações de atualização automática');
    }
  };

  const handleSave = async () => {
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'auto_update_config',
          value: config
        });

      if (error) throw error;

      toast.success('Configurações de atualização automática salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configurações de atualização automática');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atualização Automática de Processos</CardTitle>
        <CardDescription>
          Configure quando o sistema deve verificar automaticamente por atualizações em todos os processos cadastrados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: !!checked }))}
            />
            <label htmlFor="enabled" className="text-sm font-medium leading-none">
              Ativar atualização automática do sistema
            </label>
          </div>

          {config.enabled && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Frequência</label>
                <Select
                  value={config.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'custom') => setConfig(prev => ({ ...prev, frequency: value }))}
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
                <p className="text-sm text-gray-500">
                  Recomendamos agendar as atualizações para horários de menor movimento.
                </p>
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
                  Última verificação: {format(new Date(config.last_check), 'dd/MM/yyyy HH:mm')}
                </div>
              )}
            </>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave}>
              Salvar Configurações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
