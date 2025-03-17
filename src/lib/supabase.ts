import { createClient } from '@supabase/supabase-js';

// Fornecer valores padrão para desenvolvimento
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rhwtvaqsakxpumamnzgo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJod3R2YXFzYWt4cHVtYW1uemdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMzI3MjcsImV4cCI6MjA1NTgwODcyN30.5sW7XFeZaTItEF_76UVyW4xpJASOB-DX5Ivr_g1tfgE';

// Criar uma única instância do cliente Supabase
let supabaseInstance: ReturnType<typeof createClient>;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'app-storage-key',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

// ATENÇÃO: Devido a problemas de compatibilidade na API, estamos criando um cliente personalizado
// para realizar consultas com headers específicos
export const customSupabaseQuery = async (table: string, options: any = {}) => {
  const { select, filter, filters, single, order, limit, method = 'GET', body } = options;
  
  // URL base para a API REST do Supabase
  let url = `${supabaseUrl}/rest/v1/${table}`;
  
  // Adicionar parâmetros de query
  const queryParams = new URLSearchParams();
  
  if (select) {
    queryParams.append('select', select);
  }
  
  // Adicionar filtro único se fornecido
  if (filter && filter.column && filter.value !== undefined) {
    const operator = filter.operator || 'eq';
    // CORREÇÃO: Para resolver erro 406, garantir que o valor não tenha caracteres especiais
    const safeValue = typeof filter.value === 'string' 
      ? encodeURIComponent(filter.value.replace(/[^a-zA-Z0-9-_]/g, ''))
      : filter.value;
    queryParams.append(`${filter.column}`, `${operator}.${safeValue}`);
  }
  
  // Adicionar múltiplos filtros se fornecidos
  if (filters && Array.isArray(filters)) {
    filters.forEach(filter => {
      if (filter.column && filter.value !== undefined) {
        const operator = filter.operator || 'eq';
        // CORREÇÃO: Para resolver erro 406, garantir que o valor não tenha caracteres especiais
        const safeValue = typeof filter.value === 'string' 
          ? encodeURIComponent(filter.value.replace(/[^a-zA-Z0-9-_]/g, '')) 
          : filter.value;
        queryParams.append(`${filter.column}`, `${operator}.${safeValue}`);
      }
    });
  }
  
  // Adicionar parâmetros de ordenação
  if (order && order.column) {
    queryParams.append('order', `${order.column}.${order.ascending ? 'asc' : 'desc'}`);
  }
  
  // Adicionar o parâmetro limit
  if (limit) {
    queryParams.append('limit', limit.toString());
  } else if (single) {
    // Se single for true e não houver limit, limitar a 1
    queryParams.append('limit', '1');
  }
  
  // Adicionar os parâmetros à URL
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    
    // Adicionar corpo da requisição para POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    console.log(`Realizando requisição ${method} para ${url}`);
    
    const response = await fetch(url, fetchOptions);
    
    // Detectar e tratar diferentes tipos de erros
    if (!response.ok) {
      let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
      
      // Tentar extrair mais detalhes do erro
      try {
        const errorData = await response.json();
        errorMessage += ` - ${JSON.stringify(errorData)}`;
      } catch (e) {
        // Se não conseguir extrair o JSON do erro, apenas continue
      }
      
      console.error(errorMessage);
      
      // Para o erro 406, podemos tentar uma abordagem alternativa
      if (response.status === 406) {
        console.log("Tentando abordagem alternativa para erro 406...");
        
        // Remover o parâmetro 'select' e tentar novamente com todos os campos
        const backupUrl = new URL(url);
        const backupParams = new URLSearchParams(backupUrl.search);
        backupParams.delete('select');
        backupUrl.search = backupParams.toString();
        
        console.log(`Tentando requisição alternativa para ${backupUrl.toString()}`);
        
        try {
          const backupResponse = await fetch(backupUrl.toString(), {
            ...fetchOptions,
            headers: {
              ...fetchOptions.headers,
              'Accept': '*/*'  // Aceitar qualquer tipo de conteúdo
            }
          });
          
          if (backupResponse.ok) {
            const backupData = await backupResponse.json();
            return { 
              data: single && Array.isArray(backupData) ? backupData[0] : backupData, 
              error: null,
              status: backupResponse.status
            };
          }
        } catch (backupError) {
          console.error("Falha na abordagem alternativa:", backupError);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Verificar se o endpoint retorna um array vazio ou um objeto vazio
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Retornar texto para outros tipos de conteúdo
      data = await response.text();
    }
    
    return { 
      data: single && Array.isArray(data) ? data[0] : data, 
      error: null,
      status: response.status
    };
  } catch (error) {
    console.error('Erro na requisição customizada:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Erro desconhecido'),
      status: 500
    };
  }
};

import { Process as ProcessType, ProcessHit } from '@/types/process';

export interface ProcessDetails {
  id: string;
  process_id: string;
  tribunal: string;
  data_ajuizamento: string;
  grau: string;
  nivele_sigilo: number;
  formato: {
    nome: string;
    codigo: number;
  };
  sistema: {
    nome: string;
    codigo: number;
  };
  classe: {
    nome: string;
    codigo: number;
  };
  assuntos: Array<{
    nome: string;
    codigo: number;
  }>;
  orgao_julgador: {
    nome: string;
    codigo: number;
    codigoMunicipioIBGE: number;
  };
  movimentos: Array<{
    nome: string;
    codigo: number;
    dataHora: string;
    complementosTabelados?: Array<{
      nome: string;
      valor: string | number;
      codigo: number;
      descricao: string;
    }>;
  }>;
  partes?: Array<{
    papel: string;
    nome: string;
    tipoPessoa: string;
    documento?: string;
    advogados?: Array<{
      nome: string;
      inscricao: string;
    }>;
  }>;
  created_at: string;
  updated_at: string;
  json_completo?: any;
  data_hora_ultima_atualizacao?: string;
}

interface ProcessWithDetails extends ProcessType {
  details?: ProcessDetails;
  hits?: ProcessHit[];
}

export interface Process {
  id: string;
  number: string;
  title: string;
  description: string;
  status: "active" | "pending" | "closed";
  type: string;
  instance: string;
  value: number;
  court: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  plaintiff: string;
  plaintiff_document: string;
  details?: ProcessDetails;
  hits?: any[];
}

export async function getProcesses() {
  try {
    // Primeiro, busca os processos básicos
    const { data: processes, error: processError } = await customSupabaseQuery('processes', {
      select: '*',
      order: { column: 'created_at', ascending: false }
    });

    if (processError) throw processError;

    if (!processes) {
      return { data: [], error: null };
    }

    // Depois, busca os detalhes de cada processo
    const processesWithDetails = await Promise.all(
      processes.map(async (process) => {
        const { data: details } = await customSupabaseQuery('process_details', {
          select: '*',
          filter: { column: 'process_id', value: process.id },
          single: true
        });

        return {
          ...process,
          details: details || null
        };
      })
    );

    return { data: processesWithDetails, error: null };
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    return { data: null, error };
  }
}

export async function getProcess(id: string) {
  try {
    const { data: process, error: processError } = await customSupabaseQuery('processes', {
      select: '*',
      filter: { column: 'id', value: id },
      single: true
    });

    if (processError) throw processError;

    if (!process) {
      return { data: null, error: new Error('Processo não encontrado') };
    }

    const { data: details } = await customSupabaseQuery('process_details', {
      select: '*',
      filter: { column: 'process_id', value: id },
      single: true
    });

    // Buscar os hits do processo
    const { data: hits } = await getProcessHits(id);

    return {
      data: {
        ...process,
        details: details || null,
        hits: hits || []
      },
      error: null
    };
  } catch (error) {
    console.error('Erro ao buscar processo:', error);
    return { data: null, error };
  }
}

/**
 * Busca os hits de um processo específico
 * @param processId ID do processo
 * @returns Array de hits do processo
 */
export async function getProcessHits(processId: string): Promise<{ data: ProcessHit[], error: any }> {
  try {
    const { data, error } = await customSupabaseQuery('process_hits', {
      select: '*',
      filter: { column: 'process_id', value: processId },
      orderBy: { column: 'data_hora_ultima_atualizacao', ascending: false }
    });

    if (error) throw error;

    return { data: data as ProcessHit[], error: null };
  } catch (error) {
    console.error('Erro ao buscar hits do processo:', error);
    return { data: [], error };
  }
}

export async function createProcess(processData: Omit<Process, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data: process, error: processError } = await supabase
      .from('processes')
      .insert(processData)
      .select()
      .single();

    if (processError) throw processError;
    return { data: process, error: null };
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    return { data: null, error };
  }
}

export async function updateProcess(id: string, updates: Partial<Process>) {
  try {
    const { data: process, error: processError } = await supabase
      .from('processes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (processError) throw processError;
    return { data: process, error: null };
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    return { data: null, error };
  }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signInWithEmail(email: string, password: string) {
  try {
    // Garantir que estamos usando a instância correta do cliente
    const supabase = getSupabaseClient();
    
    // Validar entrada
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Limpar o email e remover espaços extras
    const cleanEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      console.error('Erro de autenticação:', error.message);
      // Traduzir mensagens de erro comuns
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Email ou senha inválidos');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Email não confirmado. Por favor, verifique sua caixa de entrada');
      }
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Erro durante o login:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Erro desconhecido durante o login')
    };
  }
}

export async function sendVerificationCode(email: string, processNumber: string) {
  try {
    const response = await supabase.functions.invoke('send-verification-code', {
      body: { email, processNumber }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error sending verification code:", error);
    throw error;
  }
}

export async function verifyCode(token: string, code: string) {
  try {
    const response = await supabase.functions.invoke('verify-code', {
      body: { token, code }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function checkProcessStatus(processId: string | null | undefined): Promise<'Baixado' | 'Em andamento'> {
  try {
    // Validar se o processId é válido
    if (!processId || typeof processId !== 'string' || !processId.trim()) {
      return 'Em andamento';
    }

    // Limpar o ID do processo de caracteres especiais
    const cleanProcessId = processId.trim();

    const { data: movements, error } = await supabase
      .from('process_movements')
      .select('codigo')
      .eq('process_id', cleanProcessId);

    if (error) {
      console.error('Erro ao verificar status do processo:', error);
      return 'Em andamento';
    }

    if (!movements || !Array.isArray(movements)) {
      return 'Em andamento';
    }

    // Verifica se existem os códigos 22 e 848 para o mesmo processo
    const hasCodigo22 = movements.some(mov => mov.codigo === 22);
    const hasCodigo848 = movements.some(mov => mov.codigo === 848);

    return (hasCodigo22 && hasCodigo848) ? 'Baixado' : 'Em andamento';
  } catch (error) {
    console.error('Erro ao verificar status do processo:', error);
    return 'Em andamento';
  }
}
