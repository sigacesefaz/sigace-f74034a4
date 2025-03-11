-- Create documents table
create table if not exists public.documents (
    id uuid default gen_random_uuid() primary key,
    process_id text not null,
    title text not null,
    description text,
    file_name text not null,
    file_url text not null,
    file_type text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.documents enable row level security;

create policy "Enable read access for authenticated users" on public.documents
    for select
    to authenticated
    using (true);

create policy "Enable insert access for authenticated users" on public.documents
    for insert
    to authenticated
    with check (true);

create policy "Enable update access for authenticated users" on public.documents
    for update
    to authenticated
    using (true);

create policy "Enable delete access for authenticated users" on public.documents
    for delete
    to authenticated
    using (true);

-- Create storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true);

-- Add storage policies
create policy "Enable read access for authenticated users"
    on storage.objects for select
    to authenticated
    using (bucket_id = 'documents');

create policy "Enable insert access for authenticated users"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'documents');

create policy "Enable update access for authenticated users"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'documents');

create policy "Enable delete access for authenticated users"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'documents');
