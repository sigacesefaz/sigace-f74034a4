import { getSupabaseClient } from '@/lib/supabase';
import { Process, ProcessHit } from '@/types/process';
import { sendEmail, formatReportEmail } from '@/lib/email';

interface UpdateReport {
  id: string;
  date: string;
  total_processes: number;
  updated_processes: number;
  new_movements: number;
  status_changes: number;
  details: {
    process_number: string;
    old_status?: string;
    new_status?: string;
    new_movements?: number;
  }[];
  user_id: string;
  created_at: string;
}

interface NotificationPreference {
  email: string;
  notify_email: boolean;
}

async function getReportRecipients(): Promise<string[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('email')
    .eq('notify_email', true)
    .not('email', 'is', null);

  if (error) {
    console.error('Erro ao buscar destinatários do relatório:', error);
    return [];
  }

  return (data as NotificationPreference[]).map(pref => pref.email);
}

export async function generateUpdateReport(
  processes: Process[],
  updates: { process: Process; hit: ProcessHit; oldStatus: string }[]
): Promise<UpdateReport> {
  const supabase = getSupabaseClient();
  
  const report: Omit<UpdateReport, 'id' | 'created_at'> = {
    date: new Date().toISOString(),
    total_processes: processes.length,
    updated_processes: updates.length,
    new_movements: updates.reduce((acc, update) => acc + (update.hit.movimentos?.length || 0), 0),
    status_changes: updates.filter(update => update.oldStatus !== update.hit.situacao.nome).length,
    details: updates.map(update => ({
      process_number: update.process.number,
      old_status: update.oldStatus,
      new_status: update.hit.situacao.nome,
      new_movements: update.hit.movimentos?.length || 0
    })),
    user_id: processes[0]?.user_id || '' // Usando o user_id do primeiro processo como referência
  };

  // Salva o relatório no banco
  const { data: savedReport, error } = await supabase
    .from('update_reports')
    .insert(report)
    .select()
    .single();

  if (error) {
    console.error('Erro ao salvar relatório:', error);
    throw error;
  }

  const typedReport = savedReport as unknown as UpdateReport;

  // Envia o relatório por email para os destinatários configurados
  try {
    const recipients = await getReportRecipients();
    
    if (recipients.length > 0) {
      const emailHtml = formatReportEmail(
        report.date,
        report.total_processes,
        report.updated_processes,
        report.new_movements,
        report.status_changes,
        report.details
      );

      await Promise.all(recipients.map(email =>
        sendEmail({
          to: email,
          subject: `Relatório de Atualizações de Processos - ${new Date(report.date).toLocaleDateString('pt-BR')}`,
          text: 'Por favor, utilize um cliente de email que suporte HTML para visualizar este relatório.',
          html: emailHtml
        })
      ));
    }
  } catch (error) {
    console.error('Erro ao enviar relatório por email:', error);
    // Não lança o erro para não interromper o fluxo principal
  }

  return typedReport;
}

export async function getUpdateReports(
  startDate?: string,
  endDate?: string,
  userId?: string
): Promise<UpdateReport[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('update_reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('date', startDate);
  }
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao buscar relatórios:', error);
    throw error;
  }

  return (data as unknown as UpdateReport[]) || [];
} 