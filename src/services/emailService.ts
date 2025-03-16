
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface EmailLimitResponse {
  canSendEmails: boolean;
  currentCount: number;
  limit: number;
  remaining: number;
}

export async function checkEmailLimit(): Promise<EmailLimitResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke('email-tracker', {
      body: {
        action: 'check'
      }
    });
    
    if (error) {
      console.error("Error checking email limit:", error);
      return null;
    }
    
    return data as EmailLimitResponse;
  } catch (error) {
    console.error("Error in checkEmailLimit:", error);
    return null;
  }
}

export async function trackEmailSent(): Promise<boolean> {
  try {
    // First check if we can send emails
    const limitCheck = await checkEmailLimit();
    
    if (!limitCheck) {
      console.error("Failed to check email limit");
      return false;
    }
    
    if (!limitCheck.canSendEmails) {
      toast({
        title: "Limite de e-mails atingido",
        description: `O limite mensal de ${limitCheck.limit} e-mails foi atingido. O serviço será reativado no próximo mês.`,
        variant: "destructive",
      });
      return false;
    }
    
    // Track this email
    const { data, error } = await supabase.functions.invoke('email-tracker', {
      body: {
        action: 'track'
      }
    });
    
    if (error) {
      console.error("Error tracking email:", error);
      return false;
    }
    
    // If we're getting close to the limit, warn the user
    if (limitCheck.remaining <= 50) {
      toast({
        title: "Alerta de limite de e-mails",
        description: `Restam apenas ${limitCheck.remaining} e-mails do limite mensal de ${limitCheck.limit}.`,
        variant: "warning",
      });
    }
    
    return data.success;
  } catch (error) {
    console.error("Error in trackEmailSent:", error);
    return false;
  }
}

export async function sendEmail(
  to: string[], 
  subject: string, 
  htmlContent: string
): Promise<boolean> {
  try {
    // Check email limits first
    const canSend = await trackEmailSent();
    
    if (!canSend) {
      return false;
    }
    
    // TODO: Implement actual email sending via Resend or other service
    // For now, we'll just simulate sending
    console.log(`Sending email to ${to.join(', ')} with subject: ${subject}`);
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
