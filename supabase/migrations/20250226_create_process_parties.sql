create table if not exists process_parties (
  id uuid default gen_random_uuid() primary key,
  process_id uuid references processes(id) on delete cascade,
  name text not null,
  type text not null,
  subtype text,
  person_type text,
  document text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Adiciona política RLS para process_parties
alter table process_parties enable row level security;

create policy "Users can view process parties they have access to"
  on process_parties for select
  using (
    exists (
      select 1 from processes
      where processes.id = process_parties.process_id
      and processes.user_id = auth.uid()
    )
  );

create policy "Users can insert process parties for their processes"
  on process_parties for insert
  with check (
    exists (
      select 1 from processes
      where processes.id = process_parties.process_id
      and processes.user_id = auth.uid()
    )
  );

create policy "Users can update process parties they have access to"
  on process_parties for update
  using (
    exists (
      select 1 from processes
      where processes.id = process_parties.process_id
      and processes.user_id = auth.uid()
    )
  );

create policy "Users can delete process parties they have access to"
  on process_parties for delete
  using (
    exists (
      select 1 from processes
      where processes.id = process_parties.process_id
      and processes.user_id = auth.uid()
    )
  );
