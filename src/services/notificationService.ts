
import { getSupabaseClient } from '@/lib/supabase';
import { Process, ProcessHit, ProcessNotification } from '@/types/process';
import { sendEmail } from '@/lib/email';

interface NotificationPreference {
  id: string;
  user_id: string;
  notify_status_change: boolean;
  notify_new_movements: boolean;
  notify_email: boolean;
  email: string;
  created_at: string;
  updated_at: string;
}

async function getNotificationPreferences(userId: string): Promise<NotificationPreference | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Erro ao buscar preferências de notificação:', error);
    return null;
  }

  return data;
}

async function createSystemNotification(
  title: string,
  message: string,
  type: ProcessNotification['type'],
  processId: string,
  userId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  
  const notification: Omit<ProcessNotification, 'id' | 'created_at' | 'updated_at'> = {
    title,
    message,
    type,
    process_id: processId,
    user_id: userId,
    read: false
  };

  const { error } = await supabase
    .from('process_notifications')
    .insert(notification);

  if (error) {
    console.error('Erro ao criar notificação:', error);
    throw error;
  }
}

async function sendEmailNotification(
  email: string,
  title: string,
  message: string
): Promise<void> {
  try {
    await sendEmail({
      to: email,
      subject: title,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${title}</h2>
          <p>${message}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">
            Esta é uma notificação automática do sistema SIGACE.
            Por favor, não responda este email.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

export async function notifyProcessUpdates(
  process: Process,
  hit: ProcessHit,
  oldStatus: string
): Promise<void> {
  const preferences = await getNotificationPreferences(process.user_id);
  if (!preferences) return;

  const statusChanged = oldStatus !== hit.situacao.nome;
  const hasNewMovements = hit.movimentos.length > 0;

  // Notificações do sistema
  if (statusChanged && preferences.notify_status_change) {
    await createSystemNotification(
      'Alteração de Status',
      `O processo ${process.number} mudou de status: ${oldStatus} → ${hit.situacao.nome}`,
      'update',
      process.id,
      process.user_id
    );
  }

  if (hasNewMovements && preferences.notify_new_movements) {
    await createSystemNotification(
      'Novos Movimentos',
      `O processo ${process.number} recebeu ${hit.movimentos.length} novo(s) movimento(s)`,
      'update',
      process.id,
      process.user_id
    );
  }

  // Notificações por email
  if (preferences.notify_email && preferences.email) {
    let emailMessage = `Atualizações no processo ${process.number}:\n\n`;
    
    if (statusChanged) {
      emailMessage += `- Status alterado: ${oldStatus} → ${hit.situacao.nome}\n`;
    }
    
    if (hasNewMovements) {
      emailMessage += `- ${hit.movimentos.length} novo(s) movimento(s)\n`;
      hit.movimentos.forEach(mov => {
        emailMessage += `  • ${mov.data_hora}: ${mov.nome}\n`;
      });
    }

    await sendEmailNotification(
      preferences.email,
      `Atualizações no Processo ${process.number}`,
      emailMessage
    );
  }
}
