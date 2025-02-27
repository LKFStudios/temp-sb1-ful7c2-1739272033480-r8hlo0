-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create analyses table
create table if not exists public.analyses (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    scores jsonb not null,
    detailed_scores jsonb not null,
    image_url text,
    is_public boolean default false
);

-- Enable RLS
alter table public.analyses enable row level security;

-- Create policies
create policy "Analyses are viewable by owner"
    on analyses for select
    using (auth.uid() = user_id);

create policy "Users can create their own analyses"
    on analyses for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own analyses"
    on analyses for update
    using (auth.uid() = user_id);

-- Create storage bucket
insert into storage.buckets (id, name, public)
values ('analyses', 'analyses', true)
on conflict (id) do nothing;

-- Create storage policies
create policy "Images are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'analyses');

create policy "Authenticated users can upload images"
    on storage.objects for insert
    with check (
        bucket_id = 'analyses' 
        and auth.role() = 'authenticated'
    );