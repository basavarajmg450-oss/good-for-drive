-- ROLES
create type public.app_role as enum ('admin','subscriber');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null default 'subscriber',
  created_at timestamptz default now(),
  unique(user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

-- CHARITIES
create table public.charities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  tagline text,
  description text,
  image_url text,
  website text,
  category text,
  featured boolean default false,
  total_raised numeric default 0,
  created_at timestamptz default now()
);
alter table public.charities enable row level security;

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  charity_id uuid references public.charities(id) on delete set null,
  charity_percentage int default 10 check (charity_percentage between 10 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- SUBSCRIPTIONS
create type public.sub_status as enum ('active','cancelled','lapsed','pending');
create type public.sub_plan as enum ('monthly','yearly');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan sub_plan not null,
  status sub_status not null default 'pending',
  amount_cents int not null,
  current_period_end timestamptz,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.subscriptions enable row level security;
create index on public.subscriptions(user_id);

-- SCORES
create table public.scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  score int not null check (score between 1 and 45),
  played_on date not null,
  created_at timestamptz default now()
);
alter table public.scores enable row level security;
create index on public.scores(user_id, played_on desc);

create or replace function public.trim_scores()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.scores where id in (
    select id from public.scores where user_id = new.user_id
    order by played_on desc, created_at desc offset 5
  );
  return new;
end $$;
create trigger trim_scores_after_insert after insert on public.scores
  for each row execute function public.trim_scores();

-- DRAWS
create type public.draw_status as enum ('scheduled','simulated','published');
create type public.draw_mode as enum ('random','weighted');

create table public.draws (
  id uuid primary key default gen_random_uuid(),
  draw_month date not null unique,
  mode draw_mode not null default 'random',
  status draw_status not null default 'scheduled',
  winning_numbers int[],
  prize_pool_cents int default 0,
  jackpot_rollover_cents int default 0,
  published_at timestamptz,
  created_at timestamptz default now()
);
alter table public.draws enable row level security;

create table public.draw_entries (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  numbers int[] not null,
  created_at timestamptz default now(),
  unique(draw_id, user_id)
);
alter table public.draw_entries enable row level security;

-- WINNERS
create type public.winner_tier as enum ('match_5','match_4','match_3');
create type public.payout_status as enum ('pending','verification_required','verified','paid','rejected');

create table public.winners (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid references public.draws(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  tier winner_tier not null,
  prize_cents int not null,
  status payout_status not null default 'verification_required',
  verification_url text,
  verified_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz default now()
);
alter table public.winners enable row level security;

create table public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  charity_id uuid references public.charities(id) on delete set null,
  amount_cents int not null,
  created_at timestamptz default now()
);
alter table public.donations enable row level security;

-- POLICIES
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "admin profile read" on public.profiles for select using (public.has_role(auth.uid(),'admin'));
create policy "admin profile update" on public.profiles for update using (public.has_role(auth.uid(),'admin'));

create policy "own roles read" on public.user_roles for select using (auth.uid() = user_id);
create policy "admin roles all" on public.user_roles for all using (public.has_role(auth.uid(),'admin'));

create policy "charities public read" on public.charities for select using (true);
create policy "charities admin write" on public.charities for all using (public.has_role(auth.uid(),'admin'));

create policy "own sub read" on public.subscriptions for select using (auth.uid() = user_id);
create policy "admin sub all" on public.subscriptions for all using (public.has_role(auth.uid(),'admin'));

create policy "own scores all" on public.scores for all using (auth.uid() = user_id);
create policy "admin scores read" on public.scores for select using (public.has_role(auth.uid(),'admin'));
create policy "admin scores update" on public.scores for update using (public.has_role(auth.uid(),'admin'));

create policy "draws public read" on public.draws for select using (true);
create policy "draws admin all" on public.draws for all using (public.has_role(auth.uid(),'admin'));

create policy "own entries read" on public.draw_entries for select using (auth.uid() = user_id);
create policy "own entries insert" on public.draw_entries for insert with check (auth.uid() = user_id);
create policy "admin entries all" on public.draw_entries for all using (public.has_role(auth.uid(),'admin'));

create policy "winners public read" on public.winners for select using (true);
create policy "own winner update" on public.winners for update using (auth.uid() = user_id);
create policy "admin winners all" on public.winners for all using (public.has_role(auth.uid(),'admin'));

create policy "own donations all" on public.donations for all using (auth.uid() = user_id);
create policy "admin donations read" on public.donations for select using (public.has_role(auth.uid(),'admin'));

-- Auto-create profile + subscriber role
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'subscriber');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed charities
insert into public.charities (name, slug, tagline, description, category, featured, image_url) values
('Cancer Research UK','cancer-research-uk','Beating cancer together','Funding world-leading research to prevent, diagnose and treat cancer through pioneering science.','Health',true,'https://images.unsplash.com/photo-1582719188393-bb71ca45dbb9?w=800'),
('Mind','mind','Better mental health for all','For everyone experiencing a mental health problem, fighting for support and respect.','Mental Health',true,'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800'),
('WaterAid','wateraid','Clean water for everyone','Transforming lives by improving access to clean water, sanitation and hygiene worldwide.','International',true,'https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800'),
('Macmillan Cancer Support','macmillan','Support every step of the way','Helping people live with cancer through emotional, practical and financial support.','Health',false,'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800'),
('Shelter','shelter','Home is everything','Defending the right to a safe home for everyone facing bad housing or homelessness.','Housing',false,'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'),
('British Heart Foundation','bhf','Beating heartbreak forever','Funding research to fight heart and circulatory diseases that take lives too soon.','Health',false,'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800');