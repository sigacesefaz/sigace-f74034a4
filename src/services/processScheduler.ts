
import { getSupabaseClient } from '@/lib/supabase';
import { checkProcessStatus } from '@/lib/tjto';
import { addMinutes, isAfter, parseISO } from 'date-fns';
import { Process, ProcessHit, ScheduleConfig } from '@/types/process';
import { generateUpdateReport } from './reportService';

interface SystemUpdateConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  time: string;
  days?: number[];
  last_check?: string;
  next_check?: string;
}

async function saveProcessHit(supabase: any, processId: string, hit: ProcessHit, userId: string) {
  const { error } = await supabase
    .from('process_hits')
    .insert({
      process_id: processId,
      hit_id: hit.hit_id,
      data: hit,
      user_id: userId,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Erro ao salvar hit do processo:', error);
    throw error;
  }
}

async function updateProcessInformation(process: Process): Promise<{ hit: ProcessHit | null; oldStatus: string }> {
  const supabase = getSupabaseClient();
  const oldStatus = process.status;
  
  try {
    const hit = await checkProcessStatus(process.number);
    
    if (!hit) {
      console.error(`Não foi possível obter informações do processo ${process.number}`);
      return { hit: null, oldStatus };
    }

    // Atualiza o processo no banco de dados
    const { error: updateError } = await supabase
      .from('processes')
      .update({
        status: hit.situacao.nome,
        last_movement: hit.movimentos?.[0]?.data || null,
        movements: hit.movimentos || [],
        last_check: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', process.id);

    if (updateError) {
      console.error(`Erro ao atualizar processo ${process.number}:`, updateError);
    }

    return { hit, oldStatus };
  } catch (error) {
    console.error(`Erro ao verificar processo ${process.number}:`, error);
    return { hit: null, oldStatus };
  }
}

async function calculateNextCheck(config: ScheduleConfig): Promise<string> {
  const now = new Date();
  let nextCheck = new Date(now);

  switch (config.frequency) {
    case 'daily':
      if (config.time) {
        const [hours, minutes] = config.time.split(':').map(Number);
        nextCheck.setHours(hours, minutes, 0, 0);
        if (nextCheck <= now) {
          nextCheck.setDate(nextCheck.getDate() + 1);
        }
      }
      break;

    case 'weekly':
      if (typeof config.dayOfWeek === 'number') {
        const currentDay = now.getDay();
        const daysUntilNext = (config.dayOfWeek - currentDay + 7) % 7;
        nextCheck.setDate(now.getDate() + daysUntilNext);
        if (config.time) {
          const [hours, minutes] = config.time.split(':').map(Number);
          nextCheck.setHours(hours, minutes, 0, 0);
        }
        if (nextCheck <= now) {
          nextCheck.setDate(nextCheck.getDate() + 7);
        }
      }
      break;

    case 'custom':
      if (config.interval) {
        nextCheck = new Date(now.getTime() + config.interval * 60000);
      }
      break;
  }

  return nextCheck.toISOString();
}

export async function checkScheduledUpdates(): Promise<void> {
  const supabase = getSupabaseClient();
  const now = new Date();

  try {
    // Fix: Changed query approach to avoid the 'is.not.null' filter issue
    // Get all processes first, then filter in memory
    const { data: allProcesses, error } = await supabase
      .from('processes')
      .select('*');

    if (error) {
      console.error('Erro ao buscar processos:', error);
      return;
    }

    if (!allProcesses || allProcesses.length === 0) {
      return;
    }

    // Filter processes with schedule_config in memory
    const rawProcesses = allProcesses.filter(proc => 
      proc.schedule_config && 
      proc.schedule_config.enabled && 
      proc.schedule_config.nextCheck && 
      proc.schedule_config.nextCheck < now.toISOString()
    );

    if (rawProcesses.length === 0) {
      return;
    }

    // Converte os dados brutos para o tipo Process
    const processes = rawProcesses.map(raw => ({
      id: raw.id,
      number: raw.number,
      title: raw.title,
      description: raw.description,
      status: raw.status,
      last_movement: raw.last_movement,
      movements: raw.movements,
      created_at: raw.created_at,
      updated_at: raw.updated_at,
      last_check: raw.last_check,
      user_id: raw.user_id,
      schedule_config: raw.schedule_config as ScheduleConfig
    })) as Process[];

    const updates: { process: Process; hit: ProcessHit; oldStatus: string }[] = [];

    // Atualiza cada processo
    for (const process of processes) {
      const result = await updateProcessInformation(process);
      if (result.hit) {
        updates.push({ process, hit: result.hit, oldStatus: result.oldStatus });
      }

      // Calcula e atualiza próxima verificação
      if (process.schedule_config) {
        const nextCheck = await calculateNextCheck(process.schedule_config);
        await supabase
          .from('processes')
          .update({
            schedule_config: {
              ...process.schedule_config,
              lastCheck: now.toISOString(),
              nextCheck
            }
          })
          .eq('id', process.id);
      }
    }

    // Gera e envia relatório se houver atualizações
    if (updates.length > 0) {
      await generateUpdateReport(processes, updates);
    }
  } catch (error) {
    console.error('Erro ao executar verificações agendadas:', error);
  }
}

// Função para atualização manual de um processo específico
export async function updateProcessInformationManual(process: Process): Promise<void> {
  const result = await updateProcessInformation(process);
  if (result.hit) {
    await generateUpdateReport([process], [{
      process,
      hit: result.hit,
      oldStatus: result.oldStatus
    }]);
  }
}
