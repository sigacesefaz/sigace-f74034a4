
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailParams): Promise<boolean> {
  try {
    // Check if we've hit the monthly limit first
    const { data: emailStats, error: statsError } = await supabase.functions.invoke("email-tracker", {
      method: "GET",
    });
    
    if (statsError) {
      console.error("Error checking email stats:", statsError);
      toast.error("Erro ao verificar limite de emails");
      return false;
    }
    
    if (emailStats.limitReached) {
      toast.error("Limite mensal de emails atingido. O serviço será restaurado no primeiro dia do próximo mês.");
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke("email-tracker", {
      method: "POST",
      body: { to, subject, html, from },
    });
    
    if (error) {
      console.error("Error sending email:", error);
      
      // Check if it's a limit reached error
      if (error.message?.includes("limit reached")) {
        toast.error("Limite mensal de emails atingido. O serviço será restaurado no primeiro dia do próximo mês.");
      } else {
        toast.error(`Erro ao enviar email: ${error.message}`);
      }
      
      return false;
    }
    
    toast.success("Email enviado com sucesso");
    return true;
  } catch (error) {
    console.error("Error in sendEmail:", error);
    toast.error("Erro ao enviar email");
    return false;
  }
}

export async function getEmailStats() {
  try {
    const { data, error } = await supabase.functions.invoke("email-tracker", {
      method: "GET",
    });
    
    if (error) {
      console.error("Error getting email stats:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error in getEmailStats:", error);
    throw error;
  }
}
