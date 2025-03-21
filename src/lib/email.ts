import { Resend } from 'resend';
import { supabase } from './supabase';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface ReportDetail {
  process_number: string;
  old_status?: string;
  new_status?: string;
  new_movements?: number;
}

interface SystemConfig {
  resend_api_key: string;
  resend_verified_email: string;
  resend_test_mode: boolean;
}

// Email de teste do Resend (sempre verificado)
const TEST_EMAIL = 'onboarding@resend.dev';

let resendInstance: Resend | null = null;
let config: {
  apiKey: string;
  verifiedEmail: string;
  testMode: boolean;
} | null = null;

async function getResendConfig() {
  if (!config) {
    const { data, error } = await supabase
      .from('system_configuration')
      .select('resend_api_key, resend_verified_email, resend_test_mode')
      .single();

    if (error) throw error;

    const typedData = data as SystemConfig;

    if (!typedData?.resend_api_key) {
      throw new Error('Resend não está configurado no sistema');
    }

    config = {
      apiKey: typedData.resend_api_key,
      verifiedEmail: typedData.resend_verified_email || TEST_EMAIL,
      testMode: typedData.resend_test_mode
    };

    resendInstance = new Resend(config.apiKey);
  }

  return config;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const currentConfig = await getResendConfig();
    
    if (!resendInstance || !currentConfig) {
      throw new Error('Resend não está configurado');
    }

    const fromEmail = currentConfig.testMode ? TEST_EMAIL : currentConfig.verifiedEmail;
    const fromName = 'SIGACE';

    await resendInstance.emails.send({
      from: `${fromName} <${fromEmail}>`,
      ...options,
      subject: currentConfig.testMode ? `[TESTE] ${options.subject}` : options.subject
    });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}

export function formatReportEmail(
  date: string,
  totalProcesses: number,
  updatedProcesses: number,
  newMovements: number,
  statusChanges: number,
  details: ReportDetail[]
): string {
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #7c3aed;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .summary {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .details {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        .status-change {
          color: #7c3aed;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Relatório de Atualizações de Processos</h1>
        <p>Data: ${formattedDate}</p>
      </div>
      
      <div class="summary">
        <h2>Resumo</h2>
        <p>Total de processos verificados: ${totalProcesses}</p>
        <p>Processos atualizados: ${updatedProcesses}</p>
        <p>Novos movimentos: ${newMovements}</p>
        <p>Mudanças de status: ${statusChanges}</p>
      </div>

      <div class="details">
        <h2>Detalhes das Atualizações</h2>
        <table>
          <thead>
            <tr>
              <th>Processo</th>
              <th>Status Anterior</th>
              <th>Novo Status</th>
              <th>Novos Movimentos</th>
            </tr>
          </thead>
          <tbody>
            ${details.map(detail => `
              <tr>
                <td>${detail.process_number}</td>
                <td>${detail.old_status || '-'}</td>
                <td class="status-change">${detail.new_status || '-'}</td>
                <td>${detail.new_movements || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;
} 