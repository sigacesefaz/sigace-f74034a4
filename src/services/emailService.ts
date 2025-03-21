
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
    try {
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
      
      console.log("Config loaded from DB:", {
        ...config,
        apiKey: "***" // Don't log the API key
      });
    } catch (error) {
      console.error("Error loading Resend config:", error);
      throw error;
    }
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
    console.log("Modo de teste ativado:", config.testMode);

    // INVERTENDO A ORDEM - Primeiro tentar usar o proxy local, se falhar, usar a Edge Function
    try {
      // Usar o proxy local com a chave da API no cabeçalho
      console.log("Tentando enviar email via proxy local...");
      
      const response = await fetch('/api/resend/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Resend-API-Key': config.apiKey
        },
        body: JSON.stringify({
          ...emailData,
          // Enviar a flag de modo de teste baseada na configuração do sistema
          testMode: config.testMode
        })
      });

      // Verificar se a resposta é 200 OK
      if (!response.ok) {
        // Obter a resposta como texto primeiro
        const text = await response.text();
        console.error("Erro na resposta do proxy:", text);
        
        try {
          // Tentar converter para JSON
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || errorData.message || `Erro ${response.status}`);
        } catch (e) {
          // Se não for JSON, retornar o texto
          throw new Error(`Erro na resposta: ${text.substring(0, 100)}...`);
        }
      }

      // Obter a resposta como texto primeiro para poder debugar se não for JSON
      const responseText = await response.text();
      
      console.log("Resposta bruta do servidor:", responseText.substring(0, 500));
      
      // Verificar se a resposta parece ser HTML
      if (responseText.trim().startsWith('<!DOCTYPE html>') || responseText.trim().startsWith('<html>')) {
        console.error("Resposta recebida é HTML, não JSON");
        throw new Error("Erro: servidor retornou HTML em vez de JSON");
      }
      
      // Tentar converter para JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        console.error("Erro ao analisar resposta como JSON:", error);
        console.error("Resposta recebida:", responseText.substring(0, 500));
        throw new Error("Erro no formato da resposta do servidor");
      }

      console.log("Email enviado com sucesso via proxy:", responseData);
      
      // Se tiver um código de verificação, mostre no console e exiba em toast
      if (responseData.devCode && config.testMode) {
        console.log("Código de verificação (proxy):", responseData.devCode);
        toast.info(`Código de verificação (modo teste): ${responseData.devCode}`);
      }
      
      toast.success("Email enviado com sucesso");
      return true;
    } catch (proxyError) {
      console.warn("Erro ao usar o proxy local, tentando Edge Function como fallback:", proxyError);
      
      // FALLBACK: Usar a Edge Function para enviar o email
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          ...emailData,
          apiKey: config.apiKey,
          // Enviar a flag de modo de teste baseada na configuração do sistema
          testMode: config.testMode
        }
      });
      
      if (error) {
        console.error("Erro ao chamar a Edge Function:", error);
        toast.error(`Erro ao enviar email: ${error.message}`);
        return false;
      }
      
      console.log("Email enviado com sucesso via Edge Function (fallback):", data);
      
      // Se tiver um código de verificação, mostre no console e exiba em toast
      if (data.devCode && config.testMode) {
        console.log("Código de verificação (Edge Function):", data.devCode);
        toast.info(`Código de verificação (modo teste): ${data.devCode}`);
      }
      
      toast.success("Email enviado com sucesso");
      return true;
    }
  } catch (error) {
    console.error("Erro em sendEmail:", error);
    toast.error(`Erro ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return false;
  }
}

export async function getEmailStats() {
  try {
    const config = await getResendConfig();
    if (!config) {
      throw new Error('Resend não está configurado');
    }
    
    console.log("Retornando status do email:", {
      testMode: config.testMode,
      verifiedEmail: config.verifiedEmail
    });
    
    return {
      testMode: config.testMode,
      verifiedEmail: config.verifiedEmail
    };
  } catch (error) {
    console.error("Erro em getEmailStats:", error);
    throw error;
  }
}
