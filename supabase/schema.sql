-- =====================================================================
-- Cirql backend schema. Safe to re-run: everything is idempotent.
-- Applied by ml/seed_supabase.py (or paste into the Supabase SQL editor).
-- =====================================================================

create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Device catalogue + image fingerprints (from the training dataset)
-- ---------------------------------------------------------------------
create table if not exists public.device_models (
  id          int primary key,
  category    text not null check (category in ('phone', 'laptop')),
  brand_id    text not null,          -- matches a brand id in src/data/pricing.js
  brand       text not null,
  model       text not null,
  folder      text not null unique,   -- dataset folder it was trained from
  base_price  int                     -- optional ₹ override for this exact model
);

create table if not exists public.device_embeddings (
  id          bigserial primary key,
  model_id    int not null references public.device_models (id) on delete cascade,
  image_path  text not null,
  embedding   extensions.vector(256) not null
);
create index if not exists device_embeddings_model_idx on public.device_embeddings (model_id);

-- every identification is logged (no images, no personal data)
create table if not exists public.device_scans (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  model_id    int references public.device_models (id),
  confidence  real,
  similarity  real
);

alter table public.device_models enable row level security;
alter table public.device_embeddings enable row level security;
alter table public.device_scans enable row level security;

drop policy if exists "catalogue is public" on public.device_models;
create policy "catalogue is public" on public.device_models for select using (true);
-- device_embeddings / device_scans: no policies, so the website cannot read them directly.

-- Identify a device from a 256-d image embedding computed in the browser.
-- Finds the k most similar dataset photos and runs a similarity-weighted vote.
create or replace function public.identify_device(query extensions.vector(256), k int default 7)
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  result json;
  top_id int;
  top_conf real;
  top_sim real;
begin
  with nn as (
    select e.model_id, 1 - (e.embedding <=> query) as sim
    from device_embeddings e
    order by e.embedding <=> query
    limit greatest(1, least(k, 25))
  ),
  votes as (
    select model_id, sum(power(greatest(sim, 0), 4)) as score, max(sim) as best
    from nn
    group by model_id
  ),
  ranked as (
    select model_id, best, score / nullif(sum(score) over (), 0) as share
    from votes
    order by score desc
  )
  select
    json_build_object(
      'match', (
        select json_build_object(
          'id', m.id, 'category', m.category, 'brand_id', m.brand_id, 'brand', m.brand,
          'model', m.model, 'base_price', m.base_price,
          'confidence', round(coalesce(r.share, 0)::numeric, 3),
          'similarity', round(r.best::numeric, 3))
        from ranked r join device_models m on m.id = r.model_id
        limit 1),
      'alternatives', (
        select coalesce(json_agg(json_build_object('model', m.model, 'confidence', round(coalesce(r.share, 0)::numeric, 3))), '[]'::json)
        from (select * from ranked offset 1 limit 2) r join device_models m on m.id = r.model_id
        where m.category = (select dm.category from ranked r0 join device_models dm on dm.id = r0.model_id limit 1))
    ),
    (select model_id from ranked limit 1),
    (select share from ranked limit 1),
    (select best from ranked limit 1)
  into result, top_id, top_conf, top_sim;

  insert into device_scans (model_id, confidence, similarity) values (top_id, top_conf, top_sim);
  return result;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Recyclers: PRIVATE. The website can only ever see names.
-- ---------------------------------------------------------------------
create table if not exists public.recyclers (
  id                        text primary key,
  name                      text not null,
  facility_type             text,
  state                     text,
  city                      text,
  regional_office           text,
  pincode                   text,
  address                   text,
  phone                     text,
  email                     text,
  capacity_mt_per_year      numeric,
  accepted_items            text,
  latitude                  double precision,
  longitude                 double precision,
  location_is_approximate   boolean not null default true,
  authorization_status      text,
  authorization_number      text,
  authorization_date        date,
  authorization_valid_until date,
  consent_number            text,
  consent_date              date,
  source                    text,
  source_url                text,
  last_verification         date,
  remarks                   text
);

alter table public.recyclers enable row level security;
-- No policies + revoked grants: anon/authenticated clients cannot select any column.
revoke all on public.recyclers from anon, authenticated;

-- Only recyclers whose authorisation hasn't expired take part in matching.
create or replace view public.eligible_recyclers with (security_invoker = true) as
  select * from public.recyclers
  where coalesce(authorization_status, '') <> 'Expired'
    and (authorization_valid_until is null or authorization_valid_until >= current_date);
revoke all on public.eligible_recyclers from anon, authenticated;

-- Names for the shuffle animation, in random order. Names only.
create or replace function public.recycler_names(n int default 40)
returns setof text
language sql
volatile
security definer
set search_path = public
as $$
  select name from (select distinct name from eligible_recyclers) s
  order by random()
  limit greatest(1, least(n, 100));
$$;

-- The nearest eligible recycler to a point. Returns ONLY its name.
-- `skip` walks down the list for "shuffle again".
create or replace function public.nearest_recycler(lat double precision, lon double precision, skip int default 0)
returns text
language sql
stable
security definer
set search_path = public
as $$
  with d as (
    select name,
           min(2 * 6371 * asin(sqrt(
             power(sin(radians(latitude - lat) / 2), 2) +
             cos(radians(lat)) * cos(radians(latitude)) * power(sin(radians(longitude - lon) / 2), 2)))) as km
    from eligible_recyclers
    where latitude is not null and longitude is not null
      and lat between -90 and 90 and lon between -180 and 180
    group by name
  )
  select name from d
  order by km
  limit 1
  offset (greatest(skip, 0) % greatest((select count(*) from d), 1));
$$;

revoke all on function public.identify_device(extensions.vector, int) from public;
revoke all on function public.recycler_names(int) from public;
revoke all on function public.nearest_recycler(double precision, double precision, int) from public;
grant execute on function public.identify_device(extensions.vector, int) to anon, authenticated;
grant execute on function public.recycler_names(int) to anon, authenticated;
grant execute on function public.nearest_recycler(double precision, double precision, int) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3. Partner enquiries from /partner. The website can only INSERT.
-- ---------------------------------------------------------------------
create table if not exists public.partner_enquiries (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  company         text not null check (char_length(company) between 2 and 160),
  contact_name    text not null check (char_length(contact_name) between 2 and 120),
  phone           text not null check (phone ~ '^[0-9 +()-]{7,20}$'),
  email           text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  city            text not null check (char_length(city) between 2 and 80),
  state           text check (char_length(state) <= 80),
  facility_type   text not null check (facility_type in ('Recycler', 'Refurbisher', 'Dismantler', 'Collection centre', 'Other')),
  authorization_number text check (char_length(authorization_number) <= 120),
  capacity_mt_per_month numeric check (capacity_mt_per_month >= 0 and capacity_mt_per_month < 100000),
  message         text check (char_length(message) <= 2000),
  status          text not null default 'new'
);

alter table public.partner_enquiries enable row level security;
revoke all on public.partner_enquiries from anon, authenticated;
grant insert (company, contact_name, phone, email, city, state, facility_type, authorization_number, capacity_mt_per_month, message)
  on public.partner_enquiries to anon, authenticated;
grant usage on sequence public.partner_enquiries_id_seq to anon, authenticated;
drop policy if exists "anyone can send an enquiry" on public.partner_enquiries;
create policy "anyone can send an enquiry" on public.partner_enquiries for insert to anon, authenticated with check (status = 'new');

-- =====================================================================
-- 4. Activity capture + admin portal (/admin)
--    Visitors can only INSERT. Admins (confirmed emails in public.admins)
--    can read everything and update statuses.
-- =====================================================================

create table if not exists public.admins (
  email      text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- True only for a logged-in user whose CONFIRMED email is on the admin list.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1 from auth.users u
    join public.admins a on a.email = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Completed valuations (the price screen was reached)
create table if not exists public.valuations (
  id            bigserial primary key,
  created_at    timestamptz not null default now(),
  user_id       uuid default auth.uid(),
  category      text check (category in ('phone', 'laptop')),
  brand         text check (char_length(brand) <= 60),
  model         text check (char_length(model) <= 120),
  age           text check (char_length(age) <= 40),
  condition     text check (char_length(condition) <= 40),
  price         int check (price between 0 and 10000000),
  scanned       boolean not null default false,
  referral_code text check (char_length(referral_code) <= 20)
);

-- Pickup requests: the real leads
create table if not exists public.pickup_requests (
  id            bigserial primary key,
  created_at    timestamptz not null default now(),
  user_id       uuid default auth.uid(),
  name          text not null check (char_length(name) between 2 and 120),
  phone         text not null check (phone ~ '^[0-9 +()-]{7,20}$'),
  address       text not null check (char_length(address) between 5 and 500),
  pincode       text check (pincode ~ '^[1-9][0-9]{5}$'),
  device        text check (char_length(device) <= 200),
  price         int check (price between 0 and 10000000),
  recycler      text check (char_length(recycler) <= 200),
  latitude      double precision check (latitude between -90 and 90),
  longitude     double precision check (longitude between -180 and 180),
  referral_code text check (char_length(referral_code) <= 20),
  status        text not null default 'new' check (status in ('new', 'scheduled', 'collected', 'cancelled'))
);

-- Referral codes handed out, and what happened with them
create table if not exists public.referral_codes (
  code       text primary key check (code ~ '^CIRQL-[A-Z0-9]{4,8}$'),
  created_at timestamptz not null default now(),
  user_id    uuid default auth.uid()
);
create table if not exists public.referral_events (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  code       text not null check (code ~ '^CIRQL-[A-Z0-9]{4,8}$'),
  event      text not null check (event in ('visit', 'signup', 'valuation', 'pickup')),
  user_id    uuid default auth.uid()
);

-- EcoPoints claims and redemptions
create table if not exists public.reward_events (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  user_id    uuid default auth.uid(),
  kind       text not null check (kind in ('claim', 'redeem')),
  reward     text not null check (char_length(reward) <= 80),
  points     int not null check (points between -100000 and 100000)
);

alter table public.valuations enable row level security;
alter table public.pickup_requests enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_events enable row level security;
alter table public.reward_events enable row level security;

revoke all on public.valuations, public.pickup_requests, public.referral_codes, public.referral_events, public.reward_events from anon, authenticated;

-- Visitors: insert only, and never choose user_id / status themselves
grant insert (category, brand, model, age, condition, price, scanned, referral_code) on public.valuations to anon, authenticated;
grant insert (name, phone, address, pincode, device, price, recycler, latitude, longitude, referral_code) on public.pickup_requests to anon, authenticated;
grant insert (code) on public.referral_codes to anon, authenticated;
grant insert (code, event) on public.referral_events to anon, authenticated;
grant insert (kind, reward, points) on public.reward_events to anon, authenticated;
grant usage on sequence public.valuations_id_seq, public.pickup_requests_id_seq, public.referral_events_id_seq, public.reward_events_id_seq to anon, authenticated;

drop policy if exists "visitors insert" on public.valuations;
create policy "visitors insert" on public.valuations for insert to anon, authenticated with check (true);
drop policy if exists "visitors insert" on public.pickup_requests;
create policy "visitors insert" on public.pickup_requests for insert to anon, authenticated with check (status = 'new');
drop policy if exists "visitors insert" on public.referral_codes;
create policy "visitors insert" on public.referral_codes for insert to anon, authenticated with check (true);
drop policy if exists "visitors insert" on public.referral_events;
create policy "visitors insert" on public.referral_events for insert to anon, authenticated with check (true);
drop policy if exists "visitors insert" on public.reward_events;
create policy "visitors insert" on public.reward_events for insert to anon, authenticated with check (true);

-- Admins: read everything, update statuses. (Grants are for the role; RLS limits rows to admins.)
grant select on public.partner_enquiries, public.valuations, public.pickup_requests, public.referral_codes,
  public.referral_events, public.reward_events, public.device_scans, public.recyclers to authenticated;
grant update (status) on public.partner_enquiries, public.pickup_requests to authenticated;

do $$
declare t text;
begin
  foreach t in array array['partner_enquiries', 'valuations', 'pickup_requests', 'referral_codes', 'referral_events', 'reward_events', 'device_scans', 'recyclers'] loop
    execute format('drop policy if exists "admins read" on public.%I', t);
    execute format('create policy "admins read" on public.%I for select to authenticated using (public.is_admin())', t);
  end loop;
  foreach t in array array['partner_enquiries', 'pickup_requests'] loop
    execute format('drop policy if exists "admins update status" on public.%I', t);
    execute format('create policy "admins update status" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Registered users (from Supabase Auth), for admins only
create or replace function public.admin_users()
returns table (id uuid, email text, full_name text, referred_by text, created_at timestamptz, last_sign_in_at timestamptz, confirmed boolean)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'not authorised' using errcode = '42501'; end if;
  return query
    select u.id, u.email::text, (u.raw_user_meta_data ->> 'full_name')::text, (u.raw_user_meta_data ->> 'referred_by')::text,
           u.created_at, u.last_sign_in_at, u.email_confirmed_at is not null
    from auth.users u
    order by u.created_at desc;
end;
$$;
revoke all on function public.admin_users() from public;
grant execute on function public.admin_users() to authenticated;

-- Referral leaderboard: one row per code with its funnel
create or replace function public.admin_referrals()
returns table (code text, created_at timestamptz, owner_email text, visits bigint, signups bigint, valuations bigint, pickups bigint)
language plpgsql
stable
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'not authorised' using errcode = '42501'; end if;
  return query
    with codes as (
      select c.code, c.created_at, c.user_id from referral_codes c
      union all
      select e.code, min(e.created_at), null::uuid from referral_events e
      where not exists (select 1 from referral_codes c2 where c2.code = e.code)
      group by e.code
    )
    select c.code, min(c.created_at), max(u.email)::text,
      count(e.*) filter (where e.event = 'visit'),
      count(e.*) filter (where e.event = 'signup'),
      count(e.*) filter (where e.event = 'valuation'),
      count(e.*) filter (where e.event = 'pickup')
    from codes c
    left join referral_events e on e.code = c.code
    left join auth.users u on u.id = c.user_id
    group by c.code
    order by count(e.*) filter (where e.event = 'pickup') desc, count(e.*) desc, min(c.created_at) desc;
end;
$$;
revoke all on function public.admin_referrals() from public;
grant execute on function public.admin_referrals() to authenticated;

-- Dashboard numbers + a 14-day daily series per activity
create or replace function public.admin_overview()
returns json
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare result json;
begin
  if not public.is_admin() then raise exception 'not authorised' using errcode = '42501'; end if;
  with days as (select generate_series(current_date - 13, current_date, interval '1 day')::date as d),
  series as (
    select d,
      (select count(*) from partner_enquiries where created_at::date = d) as enquiries,
      (select count(*) from pickup_requests where created_at::date = d) as pickups,
      (select count(*) from valuations where created_at::date = d) as valuations,
      (select count(*) from device_scans where created_at::date = d) as scans,
      (select count(*) from auth.users where created_at::date = d) as signups
    from days
  )
  select json_build_object(
    'totals', json_build_object(
      'enquiries', (select count(*) from partner_enquiries),
      'enquiries_new', (select count(*) from partner_enquiries where status = 'new'),
      'pickups', (select count(*) from pickup_requests),
      'pickups_new', (select count(*) from pickup_requests where status = 'new'),
      'pickup_value', (select coalesce(sum(price), 0) from pickup_requests where status <> 'cancelled'),
      'valuations', (select count(*) from valuations),
      'scans', (select count(*) from device_scans),
      'users', (select count(*) from auth.users),
      'users_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
      'referral_codes', (select count(*) from referral_codes),
      'referral_visits', (select count(*) from referral_events where event = 'visit'),
      'rewards_claimed', (select count(*) from reward_events where kind = 'claim'),
      'rewards_redeemed', (select count(*) from reward_events where kind = 'redeem'),
      'recyclers', (select count(*) from recyclers),
      'recyclers_eligible', (select count(*) from eligible_recyclers)
    ),
    'series', (select json_agg(json_build_object('day', d, 'enquiries', enquiries, 'pickups', pickups, 'valuations', valuations, 'scans', scans, 'signups', signups) order by d) from series),
    'top_devices', (select coalesce(json_agg(t), '[]'::json) from (
      select m.model, count(*) as scans from device_scans s join device_models m on m.id = s.model_id
      group by m.model order by count(*) desc limit 5) t)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_overview() from public;
grant execute on function public.admin_overview() to authenticated;

insert into public.admins (email) values ('ayushvaidya979@gmail.com') on conflict do nothing;
