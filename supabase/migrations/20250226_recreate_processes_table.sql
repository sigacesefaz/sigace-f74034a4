-- Primeiro, vamos dropar a tabela existente (isso também vai dropar as constraints de foreign key)
drop table if exists processes cascade;

-- Criar os tipos necessários
create type process_status as enum (
  'Em andamento',
  'Arquivado',
  'Suspenso',
  'Baixado'
);

create type process_class as enum (
  'Ação Civil Pública',
  'Ação Trabalhista',
  'Mandado de Segurança',
  'Recurso Ordinário',
  'Agravo de Petição',
  'Outros'
);

create type process_priority as enum (
  'Normal',
  'Urgente',
  'Alta',
  'Baixa'
);

-- Recriar a tabela processes com todos os campos necessários
create table processes (
  -- Campos de identificação
  id uuid default gen_random_uuid() primary key,
  number text not null,
  cnj_number text,
  court_id text,
  court_name text,
  jurisdiction text,
  instance text,
  
  -- Campos de classificação
  class process_class,
  subject text,
  subject_code text,
  distribution_date timestamp with time zone,
  judge text,
  priority process_priority default 'Normal',
  electronic_process boolean default true,
  secret_justice boolean default false,
  free_justice boolean default false,
  
  -- Campos de status e controle
  status process_status default 'Em andamento',
  last_movement_date timestamp with time zone,
  value decimal(15,2),
  
  -- Campos de auditoria
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  
  -- Campos de integração
  external_system text,
  external_id text,
  
  -- Campo para dados adicionais da API
  metadata jsonb,
  
  -- Campos de localização
  location text,
  current_phase text,
  current_organ text,
  
  -- Campos de prazos
  deadline_date timestamp with time zone,
  prescription_date timestamp with time zone,
  
  -- Campos de estatística
  total_movements integer default 0,
  days_since_distribution integer,
  estimated_duration integer,
  
  -- Campos de documentos
  has_attachments boolean default false,
  total_attachments integer default 0,
  total_pages integer default 0,
  
  -- Campos de segurança
  access_level text,
  restricted_to text[],
  
  -- Índices
  constraint processes_number_key unique(number)
);

-- Criar índices para melhor performance
create index processes_number_idx on processes(number);
create index processes_cnj_number_idx on processes(cnj_number);
create index processes_court_id_idx on processes(court_id);
create index processes_status_idx on processes(status);
create index processes_user_id_idx on processes(user_id);
create index processes_metadata_gin_idx on processes using gin(metadata);

-- Habilitar RLS
alter table processes enable row level security;

-- Criar políticas de RLS
create policy "Users can view their own processes"
  on processes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own processes"
  on processes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own processes"
  on processes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own processes"
  on processes for delete
  using (auth.uid() = user_id);

-- Criar função para atualizar o updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Criar trigger para atualizar o updated_at
create trigger update_processes_updated_at
  before update on processes
  for each row
  execute function update_updated_at_column();
