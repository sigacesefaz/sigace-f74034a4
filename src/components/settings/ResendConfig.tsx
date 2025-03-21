
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ResendConfigData {
  resend_api_key: string;
  resend_verified_email: string;
  resend_test_mode: boolean;
}

export function ResendConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [testMode, setTestMode] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_configuration')
        .select('resend_api_key, resend_verified_email, resend_test_mode')
        .single();
      
      if (error) {
        console.error('Error loading Resend config:', error);
        toast({
          title: 'Erro ao carregar configurações',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      if (data) {
        setApiKey(data.resend_api_key || '');
        setVerifiedEmail(data.resend_verified_email || '');
        setTestMode(data.resend_test_mode || false);
      }
    } catch (error) {
      console.error('Error in loadConfig:', error);
      toast({
        title: 'Erro ao carregar configurações',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setSaving(true);
      
      const configData: ResendConfigData = {
        resend_api_key: apiKey,
        resend_verified_email: verifiedEmail,
        resend_test_mode: testMode
      };
      
      const { error } = await supabase
        .from('system_configuration')
        .update(configData)
        .eq('id', 1);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Configurações salvas',
        description: 'As configurações do Resend foram atualizadas com sucesso.',
      });
      
      // Reload config to ensure we have the latest data
      await loadConfig();
    } catch (error) {
      console.error('Error saving Resend config:', error);
      toast({
        title: 'Erro ao salvar configurações',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b">
        <h3 className="text-lg font-semibold">Configuração do Resend</h3>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="resend_api_key">Chave de API do Resend</Label>
          <div className="flex gap-2">
            <Input
              id="resend_api_key"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="re_123..."
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? "Ocultar" : "Mostrar"}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Obtenha sua chave API em <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">resend.com/api-keys</a>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="resend_verified_email">Email Verificado do Resend</Label>
          <Input
            id="resend_verified_email"
            type="email"
            value={verifiedEmail}
            onChange={e => setVerifiedEmail(e.target.value)}
            placeholder="seu@dominio.com"
          />
          <p className="text-xs text-gray-500">
            Email verificado no Resend para envio de mensagens
          </p>
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div>
            <Label htmlFor="resend_test_mode">Modo de Teste</Label>
            <p className="text-sm text-gray-500">Ative para usar o ambiente de teste do Resend</p>
          </div>
          <Switch 
            id="resend_test_mode" 
            checked={testMode}
            onCheckedChange={setTestMode}
          />
        </div>
        
        <div className="flex justify-end pt-2">
          <Button 
            onClick={saveConfig} 
            disabled={saving}
            className="bg-primary text-white"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </div>
  );
}
