import { supabase } from './supabase';

// Função para verificar se uma tabela existe
async function tableExists(tableName: string): Promise<boolean> {
  // Verificar o schema usando o PostgreSQL system catalogs
  const { data, error } = await supabase
    .rpc('check_table_exists', { table_name: tableName })
    .select('exists');
  
  if (error) {
    console.error(`Erro ao verificar se a tabela ${tableName} existe:`, error);
    return false;
  }
  
  return data && data.length > 0 && data[0].exists;
}

// Função para criar tabelas necessárias caso não existam
export async function setupRequiredTables() {
  try {
    console.log('Verificando estrutura de tabelas...');
    
    // Corrigindo o uso de .catch() que não é suportado na API Supabase
    // Verificar primeiro se a função já existe
    const { error: checkFunctionError } = await supabase.rpc('check_table_exists', { table_name: 'process_details' });
    
    // Se o erro indicar que a função não existe, vamos criá-la
    if (checkFunctionError && checkFunctionError.message.includes('does not exist')) {
      console.log('Função check_table_exists não existe, criando...');
      
      const { error: createFunctionError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
          RETURNS TABLE(exists boolean) AS $$
          BEGIN
            RETURN QUERY SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = $1
            );
          END;
          $$ LANGUAGE plpgsql;
        `
      });
      
      if (createFunctionError) {
        console.error('Erro ao criar função check_table_exists:', createFunctionError);
        throw createFunctionError;
      }
    }
    
    // Verificar e criar a tabela process_details se necessário
    const processDetailsExists = await tableExists('process_details');
    if (!processDetailsExists) {
      console.log('Criando tabela process_details...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS process_details (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
            tribunal VARCHAR,
            data_ajuizamento TIMESTAMP,
            grau VARCHAR,
            nivel_sigilo INTEGER DEFAULT 0,
            orgao_julgador VARCHAR,
            formato JSONB DEFAULT '{"nome": "Eletrônico", "codigo": 1}'::JSONB,
            sistema JSONB DEFAULT '{"nome": "PJe", "codigo": 1}'::JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_process_details_process_id ON process_details(process_id);
        `
      });
      
      if (createError) {
        console.error('Erro ao criar a tabela process_details:', createError);
      } else {
        console.log('Tabela process_details criada com sucesso!');
      }
    }
    
    // Verificar e criar a tabela process_movements se necessário
    const processMovementsExists = await tableExists('process_movements');
    if (!processMovementsExists) {
      console.log('Criando tabela process_movements...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS process_movements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
            codigo VARCHAR,
            nome VARCHAR,
            data_hora TIMESTAMP WITH TIME ZONE,
            complementos_tabelados JSONB DEFAULT '[]'::JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_process_movements_process_id ON process_movements(process_id);
        `
      });
      
      if (createError) {
        console.error('Erro ao criar a tabela process_movements:', createError);
      } else {
        console.log('Tabela process_movements criada com sucesso!');
      }
    }
    
    // Verificar e criar a tabela process_subjects se necessário
    const processSubjectsExists = await tableExists('process_subjects');
    if (!processSubjectsExists) {
      console.log('Criando tabela process_subjects...');
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS process_subjects (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
            codigo VARCHAR,
            nome VARCHAR,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_process_subjects_process_id ON process_subjects(process_id);
        `
      });
      
      if (createError) {
        console.error('Erro ao criar a tabela process_subjects:', createError);
      } else {
        console.log('Tabela process_subjects criada com sucesso!');
      }
    }
    
    console.log('Verificação de estrutura de tabelas concluída!');
    return true;
  } catch (error) {
    console.error('Erro ao configurar tabelas:', error);
    return false;
  }
}
