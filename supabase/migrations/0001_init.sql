-- ProcenAI schema. Run in the Supabase SQL editor or via `supabase db push`.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_name text, business_type text,
  selling_countries text[], sourcing_countries text[], product_categories text[],
  target_customers text, order_budget text, preferred_order_quantity text,
  shipping_methods text[], target_gross_margin numeric, warehouse_address text,
  tone_of_voice text, brand_description text, brand_colors text[], visual_style text, logo_url text,
  plan text not null default 'free trial',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New thread',
  kind text not null default 'workspace',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null default '',
  cards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists messages_conv_idx on public.messages(conversation_id, created_at);

create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null, title text not null, subtitle text,
  content jsonb not null default '{}'::jsonb,
  image_path text, source_url text,
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null, product_name text not null,
  stage text not null default 'sourcing', payment_status text not null default 'unpaid',
  created_at timestamptz not null default now()
);

-- Row level security: every row is private to its owner.
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.saved_items enable row level security;
alter table public.orders enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profiles','conversations','messages','saved_items','orders'] loop
    execute format('drop policy if exists "owner all" on public.%I', t);
    execute format('create policy "owner all" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;

-- Create an empty profile for every new user.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Users must not self-upgrade their plan: only the service role (payment webhook) may change it.
create or replace function public.protect_plan() returns trigger
language plpgsql as $$
begin
  if auth.role() <> 'service_role' and new.plan is distinct from old.plan then
    new.plan := old.plan;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists protect_plan_trg on public.profiles;
create trigger protect_plan_trg before update on public.profiles for each row execute function public.protect_plan();
