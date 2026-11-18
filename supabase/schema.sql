-- HUSTLEVERSE profiles schema (run in Supabase SQL Editor)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamptz,
  username text unique,
  full_name text,
  avatar_url text,
  website text
);

alter table public.profiles enable row level security;

-- Profiles are public by design; only store information users are comfortable sharing.
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert own profile." on public.profiles;
create policy "Users can insert own profile."
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile."
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
