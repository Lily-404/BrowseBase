-- BrowseBase 数据库结构（Supabase/PostgreSQL）

-- 资源表
create table public.resources (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  url text not null,
  description text null,
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  rating numeric null default 0,
  reviews integer null default 0,
  tags text[] null default '{}'::text[],
  category text not null,
  constraint resources_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_resources_category on public.resources using btree (category) TABLESPACE pg_default;
create index IF not exists idx_resources_tags on public.resources using gin (tags) TABLESPACE pg_default;



-- 用户表（管理员/普通用户）
create table public.profiles (
  id uuid not null,
  role text null default 'user'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  email text null,
  password text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id),
  constraint profiles_role_check check ((role = any (array['user'::text, 'admin'::text])))
) TABLESPACE pg_default; 

-- =====================
-- 行级安全策略（RLS Policies）
-- =====================

-- 启用 RLS
alter table public.resources enable row level security;
alter table public.profiles enable row level security;

-- resources 表策略
-- 1. 允许所有用户（含未登录）读取资源
create policy "Public read access to resources"
  on public.resources
  for select
  using (true);

-- 2. 仅管理员可写（增删改）资源
create policy "Admin write access to resources"
  on public.resources
  for all
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- profiles 表策略
-- 1. 用户只能读取自己的 profile
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 2. 用户只能更新自己的 profile
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- 3. 管理员可读取所有 profiles（可选）
create policy "Admin can view all profiles"
  on public.profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  ); 