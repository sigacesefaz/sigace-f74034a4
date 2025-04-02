import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/services/emailService';

interface ResendConfig {
  resend_api_key: string;
  resend_verified_email: string;
  resend_test_mode: boolean;
}

export function ResendConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ResendConfig>({
    resend_api_key: '',
    resend_verified_email: '',
    resend_test_mode: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_configuration')
        .select('id, resend_api_key, resend_verified_email, resend_test_mode')
        .single() as { 
          data: { 
            id: number;
            resend_api_key: string | null; 
            resend_verified_email: string | null; 
            resend_test_mode: boolean | null; 
          } | null; 
          error: any; 
        };

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 é o código para nenhum resultado encontrado

      setConfig({
        resend_api_key: data?.resend_api_key || '',
        resend_verified_email: data?.resend_verified_email || '',
        resend_test_mode: data?.resend_test_mode || false
      });
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações do Resend.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      
      // Primeiro, verifica se já existe alguma configuração
      const { data: existingConfig } = await supabase
        .from('system_configuration')
        .select('id')
        .single() as { data: { id: string } | null };

      let error;
      
      if (existingConfig?.id) {
        // Se existe, atualiza
        const { error: updateError } = await supabase
          .from('system_configuration')
          .update({
            resend_api_key: config.resend_api_key,
            resend_verified_email: config.resend_verified_email,
            resend_test_mode: config.resend_test_mode
          })
          .eq('id', existingConfig.id);
        error = updateError;
      } else {
        // Se não existe, cria
        const { error: insertError } = await supabase
          .from('system_configuration')
          .insert({
            resend_api_key: config.resend_api_key,
            resend_verified_email: config.resend_verified_email,
            resend_test_mode: config.resend_test_mode
          });
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Configurações do Resend salvas com sucesso.',
      });
      
      // Recarrega as configurações após salvar
      await loadConfig();
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações do Resend.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    try {
      setSaving(true);
      
      const success = await sendEmail({
        to: config.resend_verified_email,
        subject: 'Teste de Configuração do Resend',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2e3092; margin-bottom: 20px;">Teste de Configuração do Resend</h2>
            <p style="margin-bottom: 15px;">Este é um email de teste para verificar as configurações do Resend no SIGACE.</p>
            <p style="margin-bottom: 15px;">Se você está recebendo este email, significa que as configurações estão corretas!</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="margin: 0;"><strong>Configurações atuais:</strong></p>
              <p style="margin: 5px 0;">Modo de teste: ${config.resend_test_mode ? 'Ativado' : 'Desativado'}</p>
              <p style="margin: 5px 0;">Email verificado: ${config.resend_verified_email}</p>
            </div>
          </div>
        `
      });

      if (!success) {
        throw new Error('Falha ao enviar email de teste');
      }

    } catch (error: any) {
      console.error('Erro ao enviar email de teste:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível enviar o email de teste.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="resend_api_key">Chave da API do Resend</Label>
          <Input
            id="resend_api_key"
            type="password"
            value={config.resend_api_key}
            onChange={(e) => setConfig(prev => ({ ...prev, resend_api_key: e.target.value }))}
            placeholder="re_xxxxxxxxxxxx"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="resend_verified_email">Email Verificado</Label>
          <Input
            id="resend_verified_email"
            type="email"
            value={config.resend_verified_email}
            onChange={(e) => setConfig(prev => ({ ...prev, resend_verified_email: e.target.value }))}
            placeholder="seu@email.com"
          />
          <p className="text-sm text-muted-foreground">
            Este email deve ser verificado no painel do Resend para produção
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="resend_test_mode">Modo de Teste</Label>
            <p className="text-sm text-muted-foreground">
              Ative para usar o ambiente de teste do Resend
            </p>
          </div>
          <Switch
            id="resend_test_mode"
            checked={config.resend_test_mode}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, resend_test_mode: checked }))}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            onClick={testEmail}
            disabled={loading || saving || !config.resend_api_key || !config.resend_verified_email}
          >
            Testar Email
          </Button>
          <Button
            onClick={saveConfig}
            disabled={loading || saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 