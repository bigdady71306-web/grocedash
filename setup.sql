-- GroceDash Database Setup
-- Run this in Supabase Dashboard → SQL Editor

-- =====================================================
-- 1. FAMILIES
-- =====================================================
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text default 'My Family',
  member_count int default 5,
  dietary_notes text,
  weekly_budget numeric default 250,
  store text default 'HEB — N. Frazier, Conroe TX',
  created_at timestamptz default now()
);

alter table families enable row level security;

create policy "Users manage own family" on families
  for all using (auth.uid() = user_id);

-- =====================================================
-- 2. RECIPES
-- =====================================================
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  emoji text default '🍽️',
  cook_time text,
  servings int default 4,
  ingredients jsonb default '[]',
  steps jsonb default '[]',
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table recipes enable row level security;

create policy "Users manage own recipes" on recipes
  for all using (auth.uid() = user_id);

-- =====================================================
-- 3. MEAL PLANS
-- =====================================================
create table if not exists meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  week_start date not null,
  sunday_recipe_id text,
  monday_recipe_id text,
  tuesday_recipe_id text,
  wednesday_recipe_id text,
  thursday_recipe_id text,
  friday_recipe_id text,
  saturday_recipe_id text,
  created_at timestamptz default now(),
  unique(user_id, week_start)
);

alter table meal_plans enable row level security;

create policy "Users manage own meal plans" on meal_plans
  for all using (auth.uid() = user_id);

-- =====================================================
-- 4. GROCERY LISTS
-- =====================================================
create table if not exists grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  week_start date not null,
  budget numeric default 250,
  items jsonb default '[]',
  created_at timestamptz default now(),
  unique(user_id, week_start)
);

alter table grocery_lists enable row level security;

create policy "Users manage own grocery lists" on grocery_lists
  for all using (auth.uid() = user_id);

-- =====================================================
-- 5. TRIP HISTORY
-- =====================================================
create table if not exists trip_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  trip_date date not null,
  store_name text,
  budget numeric,
  amount_spent numeric,
  item_count int default 0,
  saved numeric,
  created_at timestamptz default now()
);

alter table trip_history enable row level security;

create policy "Users manage own trip history" on trip_history
  for all using (auth.uid() = user_id);

-- Done! All tables created with RLS enabled.
-- Each family's data is completely private to their account.
