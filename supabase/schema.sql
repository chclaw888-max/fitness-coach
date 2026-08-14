-- =========================================================
-- 私人健身教練網站 - Supabase 資料庫結構
-- 使用方式：在 Supabase 專案 > SQL Editor 貼上並執行整份檔案
-- =========================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. profiles：使用者基本資料（與 auth.users 一對一）
-- ---------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

-- 新使用者註冊後自動建立 profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- 2. goals：年 / 月 / 週目標與量化指標
-- ---------------------------------------------------------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  period_type text not null check (period_type in ('year', 'month', 'week')),
  period_label text not null, -- 例如 '2026'、'2026-08'、'2026-W33'
  title text not null,
  metric_name text, -- 量化指標名稱，例如「槓鈴臥推重量」
  target_value numeric,
  current_value numeric default 0,
  unit text, -- KG / 次 / % ...
  is_checklist boolean not null default false, -- true 表示非量化、以完成勾選為主
  is_completed boolean not null default false,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_period_idx on public.goals (user_id, period_type, period_label);

-- ---------------------------------------------------------
-- 3. exercises：訓練項目資料庫
-- ---------------------------------------------------------
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  name text not null,
  muscle_group text, -- 訓練肌肉
  category text, -- 例如：自主訓練 / 居家訓練 / 上課
  default_unit text default 'KG',
  default_sets integer,
  default_reps text, -- 允許 "8-12" 這類區間字串
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists exercises_user_idx on public.exercises (user_id);

-- ---------------------------------------------------------
-- 4. training_logs：行事曆每日訓練紀錄
-- ---------------------------------------------------------
create table if not exists public.training_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  log_date date not null,
  exercise_id uuid references public.exercises (id) on delete set null,
  exercise_name text not null, -- 保留當下名稱快照，允許不在資料庫中的臨時項目
  muscle_group text,
  sets integer,
  reps text,
  weight numeric,
  unit text default 'KG',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists training_logs_user_date_idx on public.training_logs (user_id, log_date);

-- ---------------------------------------------------------
-- 5. body_metrics：身體指標紀錄
-- ---------------------------------------------------------
create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  measured_date date not null,
  weight numeric, -- 體重 KG
  body_fat numeric, -- 體脂 %
  visceral_fat numeric, -- 內臟脂肪
  muscle_mass numeric, -- 肌肉量 KG
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, measured_date)
);

create index if not exists body_metrics_user_date_idx on public.body_metrics (user_id, measured_date);

-- ---------------------------------------------------------
-- Row Level Security：每個使用者只能存取自己的資料
-- ---------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.exercises enable row level security;
alter table public.training_logs enable row level security;
alter table public.body_metrics enable row level security;

create policy "profiles: 自己可讀寫" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "goals: 自己可讀寫" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exercises: 自己可讀寫" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "training_logs: 自己可讀寫" on public.training_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "body_metrics: 自己可讀寫" on public.body_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
