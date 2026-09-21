-- =====================================================================
-- EcoBin backend schema. Safe to re-run: everything is idempotent.
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
