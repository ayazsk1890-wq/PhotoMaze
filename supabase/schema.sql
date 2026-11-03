-- ==============================================================================
-- PHOTOMAZE - SUPABASE DATABASE SCHEMA & RLS POLICIES (100% FREE ARCHITECTURE)
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor to set up:
-- 1. User Profiles table with automatic signup trigger
-- 2. Projects table with full JSON state preservation
-- 3. Strict Row Level Security (RLS) enforcing complete account isolation
-- 4. Storage Bucket configuration with private per-user access control
-- ==============================================================================

-- 1. Create User Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  plan_tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies: Users can view and update only their own profile
create policy "Users can view their own profile."
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile."
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to automatically create a profile record when a new user registers via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to allow idempotent re-runs
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Create Projects Table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  country text not null,
  document_type text not null,
  width_mm numeric(6, 2) not null,
  height_mm numeric(6, 2) not null,
  background_color text default '#FFFFFF' not null,
  original_image_url text not null,
  cutout_image_url text,
  thumbnail_url text,
  adjustments jsonb default '{}'::jsonb not null,
  enhancement_settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Projects
alter table public.projects enable row level security;

-- Projects Policies: Strict Account Isolation
create policy "Users can view only their own projects."
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects."
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update only their own projects."
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete only their own projects."
  on public.projects for delete
  using (auth.uid() = user_id);

-- Create Index for fast user project lookups
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_projects_updated_at on public.projects(updated_at desc);

-- 3. Storage Bucket Configuration for Project Images
-- Creates private storage bucket 'passport-projects' if it doesn't already exist
insert into storage.buckets (id, name, public)
values ('passport-projects', 'passport-projects', false)
on conflict (id) do update set public = false;

-- Storage RLS Policies: Restrict folder access to the owning user ID
-- File path convention: {user_id}/{project_id}/{asset_name}.jpg
create policy "Users can upload assets to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'passport-projects' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view their own project assets"
  on storage.objects for select
  using (
    bucket_id = 'passport-projects' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their own project assets"
  on storage.objects for update
  using (
    bucket_id = 'passport-projects' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own project assets"
  on storage.objects for delete
  using (
    bucket_id = 'passport-projects' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

