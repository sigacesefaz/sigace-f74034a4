-- Criar enum para tipos de parte
create type party_type as enum ('AUTHOR', 'DEFENDANT', 'MP');
create type person_type as enum ('physical', 'legal');
create type mp_type as enum ('MPF', 'MPT', 'MPM', 'MPDFT', 'MPE');

-- Criar tabela de partes
create table if not exists parties (
  id uuid default gen_random_uuid() primary key,
  process_id uuid references processes(id) on delete cascade,
  name text not null,
  type party_type not null,
  subtype mp_type,
  person_type person_type,
  document text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) not null,
  
  -- Validações
  constraint valid_mp_subtype check (
    (type = 'MP' and subtype is not null) or
    (type != 'MP' and subtype is null)
  ),
  constraint valid_person_type check (
    (type != 'MP' and person_type is not null) or
    (type = 'MP' and person_type is null)
  )
);

-- Criar índices
create index parties_process_id_idx on parties(process_id);
create index parties_user_id_idx on parties(user_id);

-- Habilitar RLS
alter table parties enable row level security;

-- Políticas de RLS
create policy "Users can view their own parties"
  on parties for select
  using (auth.uid() = user_id);

create policy "Users can insert their own parties"
  on parties for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own parties"
  on parties for update
  using (auth.uid() = user_id);

create policy "Users can delete their own parties"
  on parties for delete
  using (auth.uid() = user_id);
