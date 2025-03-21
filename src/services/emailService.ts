
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface SystemConfig {
  resend_api_key: string;
  resend_verified_email: string;
  resend_test_mode: boolean;
}

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
      verifiedEmail: typedData.resend_verified_email || 'sigacesefaz@hotmail.com',
      testMode: typedData.resend_test_mode || false
    };
  }

  return config;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<boolean> {
  try {
    const config = await getResendConfig();
    
    if (!config) {
      throw new Error('Resend não está configurado');
    }

    // Em modo de teste:
    // 1. O email de destino deve ser o mesmo que o email verificado
    // 2. O email de origem deve ser onboarding@resend.dev
    let toEmail = to;
    let fromEmail = config.testMode 
      ? 'Sigace <onboarding@resend.dev>'
      : from 
        ? `Sigace <${from}>` 
        : `Sigace <${config.verifiedEmail}>`;

    if (config.testMode) {
      // Em modo de teste, forçar o email de destino para ser o email verificado
      toEmail = config.verifiedEmail;
      
      // Avisar o usuário que estamos em modo de teste
      toast.info(`Modo de teste: O email será enviado para ${toEmail}`);
    }

    // Adicionar footer com opção de descadastramento
    const htmlWithFooter = `
      ${html}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>Este é um email automático do sistema Sigace. Por favor, não responda.</p>
        <p>Se você não solicitou este email, pode ignorá-lo com segurança.</p>
      </div>
    `;

    // Preparar os dados para envio
    const emailData = {
      from: fromEmail,
      to: [toEmail],
      subject: `[Sigace] ${subject}`, // Adicionar prefixo para identificação
      html: htmlWithFooter,
      headers: {
        "List-Unsubscribe": `<mailto:${config.verifiedEmail}?subject=unsubscribe>`,
        "Precedence": "bulk"
      }
    };

    console.log("Enviando email:", emailData);

    // Usar o proxy local com a chave da API no cabeçalho
    const response = await fetch('/api/resend/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Resend-API-Key': config.apiKey
      },
      body: JSON.stringify(emailData)
    });

    // Obter a resposta como texto primeiro para poder debugar se não for JSON
    const responseText = await response.text();
    
    console.log("Resposta bruta do servidor:", responseText);
    
    // Tentar converter para JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (error) {
      console.error("Erro ao analisar resposta como JSON:", error);
      console.error("Resposta recebida:", responseText);
      toast.error("Erro no formato da resposta do servidor");
      return false;
    }

    if (!response.ok) {
      console.error("Erro no envio do email:", responseData);
      
      // Mensagem de erro mais específica para modo de teste
      if (config.testMode && responseData.statusCode === 403) {
        toast.error(`Em modo de teste, só é possível enviar emails para ${config.verifiedEmail}`);
      } else {
        toast.error(`Erro ao enviar email: ${responseData.message || responseData.error || 'Erro desconhecido'}`);
      }
      return false;
    }

    console.log("Email enviado com sucesso:", responseData);
    toast.success("Email enviado com sucesso");
    return true;
  } catch (error) {
    console.error("Erro em sendEmail:", error);
    toast.error("Erro ao enviar email");
    return false;
  }
}

export async function getEmailStats() {
  try {
    const config = await getResendConfig();
    if (!config) {
      throw new Error('Resend não está configurado');
    }
    return {
      testMode: config.testMode,
      verifiedEmail: config.verifiedEmail
    };
  } catch (error) {
    console.error("Erro em getEmailStats:", error);
    throw error;
  }
}
