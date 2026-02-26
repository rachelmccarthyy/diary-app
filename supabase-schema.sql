-- Run this in the Supabase SQL Editor to set up the database

-- Profiles (auto-created on auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  birth_date date,
  birth_time time,
  birth_location text,
  birth_lat double precision,
  birth_lng double precision,
  created_at timestamptz default now()
);

-- Diary entries
create table entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text,
  content text not null default '',
  mood text,
  tags text[] default '{}',
  images text[] default '{}',
  spotify_url text,
  spotify_title text,
  timezone text,
  is_time_capsule boolean default false,
  reveal_at timestamptz,
  is_revealed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Media items
create table media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  type text not null,
  title text not null,
  author_or_creator text,
  cover_image_url text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'active',
  notes text,
  created_at timestamptz default now()
);

-- Media logs (link entries to media)
create table media_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  media_id uuid references media on delete cascade not null,
  entry_id uuid references entries on delete cascade,
  date date not null default current_date
);

-- Time capsule letters
create table letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  body text not null,
  deliver_at timestamptz not null,
  delivered boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table entries enable row level security;
alter table media enable row level security;
alter table media_logs enable row level security;
alter table letters enable row level security;

-- Profiles: users can only read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Entries: users can only access their own entries
create policy "Users can view own entries" on entries for select using (auth.uid() = user_id);
create policy "Users can create own entries" on entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on entries for delete using (auth.uid() = user_id);

-- Media: users can only access their own media
create policy "Users can view own media" on media for select using (auth.uid() = user_id);
create policy "Users can create own media" on media for insert with check (auth.uid() = user_id);
create policy "Users can update own media" on media for update using (auth.uid() = user_id);
create policy "Users can delete own media" on media for delete using (auth.uid() = user_id);

-- Media logs: users can only access their own logs
create policy "Users can view own media logs" on media_logs for select using (auth.uid() = user_id);
create policy "Users can create own media logs" on media_logs for insert with check (auth.uid() = user_id);
create policy "Users can delete own media logs" on media_logs for delete using (auth.uid() = user_id);

-- Letters: users can only access their own letters
create policy "Users can view own letters" on letters for select using (auth.uid() = user_id);
create policy "Users can create own letters" on letters for insert with check (auth.uid() = user_id);
create policy "Users can update own letters" on letters for update using (auth.uid() = user_id);
create policy "Users can delete own letters" on letters for delete using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Create storage bucket for diary images
insert into storage.buckets (id, name, public) values ('diary-images', 'diary-images', true);

create policy "Users can upload diary images"
  on storage.objects for insert
  with check (bucket_id = 'diary-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view diary images"
  on storage.objects for select
  using (bucket_id = 'diary-images');

create policy "Users can delete own diary images"
  on storage.objects for delete
  using (bucket_id = 'diary-images' and auth.uid()::text = (storage.foldername(name))[1]);
