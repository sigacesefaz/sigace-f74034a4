
create table if not exists process_archive_info (
  id uuid default uuid_generate_v4() primary key,
  process_id uuid references processes(id) on delete cascade,
  action text not null check (action in ('archive', 'unarchive')),
  reason text not null,
  date timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_process_archive_info_process_id on process_archive_info(process_id);
