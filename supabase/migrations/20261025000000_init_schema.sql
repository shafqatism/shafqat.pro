-- shafqat.pro core schema: settings, SEO, leads, bookings, integrations, automation, media.
-- Admin access is granted through app_metadata.role = 'admin' (never user_metadata).

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Admin bootstrap: any auth user whose email is on this allowlist becomes admin.
-- ---------------------------------------------------------------------------
create table public.admin_emails (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);
alter table public.admin_emails enable row level security;
-- no policies: only service_role / SQL editor can manage the allowlist

create or replace function private.promote_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.admin_emails a where a.email = lower(new.email)) then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin');
  end if;
  return new;
end;
$$;
revoke all on function private.promote_admin() from public, anon, authenticated;

create trigger on_auth_user_promote_admin
  before insert or update of email on auth.users
  for each row execute function private.promote_admin();

-- ---------------------------------------------------------------------------
-- Generic updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Site settings (single row, public-readable: contains no secrets)
-- ---------------------------------------------------------------------------
create table public.site_settings (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function private.touch_updated_at();

create policy "site_settings public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings admin insert" on public.site_settings
  for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "site_settings admin update" on public.site_settings
  for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Per-page SEO overrides (public-readable)
-- ---------------------------------------------------------------------------
create table public.page_seo (
  path text primary key check (path like '/%'),
  title text,
  description text,
  keywords text[] not null default '{}',
  og_image text,
  noindex boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.page_seo enable row level security;
create trigger page_seo_touch before update on public.page_seo
  for each row execute function private.touch_updated_at();

create policy "page_seo public read" on public.page_seo
  for select to anon, authenticated using (true);
create policy "page_seo admin insert" on public.page_seo
  for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "page_seo admin update" on public.page_seo
  for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "page_seo admin delete" on public.page_seo
  for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Integration secrets (admin + edge functions only)
-- ---------------------------------------------------------------------------
create table public.integration_secrets (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.integration_secrets enable row level security;
create trigger integration_secrets_touch before update on public.integration_secrets
  for each row execute function private.touch_updated_at();

create policy "secrets admin select" on public.integration_secrets
  for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "secrets admin insert" on public.integration_secrets
  for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "secrets admin update" on public.integration_secrets
  for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "secrets admin delete" on public.integration_secrets
  for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Contact leads (written by the contact-submit edge function)
-- ---------------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (char_length(phone) <= 40),
  company text check (char_length(company) <= 160),
  service text check (char_length(service) <= 120),
  budget text check (char_length(budget) <= 60),
  message text not null check (char_length(message) between 1 and 5000),
  source text,
  utm jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'won', 'lost', 'spam')),
  notes text,
  created_at timestamptz not null default now()
);
create index contacts_created_at_idx on public.contacts (created_at desc);
alter table public.contacts enable row level security;

create policy "contacts admin select" on public.contacts
  for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "contacts admin update" on public.contacts
  for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "contacts admin delete" on public.contacts
  for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Meeting bookings (written by the book-meeting edge function)
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text check (char_length(phone) <= 40),
  company text check (char_length(company) <= 160),
  meeting_type text not null default 'consultation' check (char_length(meeting_type) <= 80),
  notes text check (char_length(notes) <= 5000),
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null default 'Asia/Karachi',
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  google_event_id text,
  meeting_link text,
  utm jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);
create index bookings_start_at_idx on public.bookings (start_at);
-- prevents double booking of the same slot among active bookings
create unique index bookings_active_slot_uidx on public.bookings (start_at)
  where status in ('pending', 'confirmed');
alter table public.bookings enable row level security;

create policy "bookings admin select" on public.bookings
  for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "bookings admin update" on public.bookings
  for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "bookings admin delete" on public.bookings
  for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Automation API tokens (hashed; used by the automation edge function / Claude)
-- ---------------------------------------------------------------------------
create table public.automation_tokens (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  token_hash text not null unique,
  scopes text[] not null default array['read', 'write'],
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.automation_tokens enable row level security;

create policy "tokens admin select" on public.automation_tokens
  for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "tokens admin insert" on public.automation_tokens
  for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "tokens admin delete" on public.automation_tokens
  for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Automation / integration event log
-- ---------------------------------------------------------------------------
create table public.activity_log (
  id bigint generated always as identity primary key,
  kind text not null,
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index activity_log_created_at_idx on public.activity_log (created_at desc);
alter table public.activity_log enable row level security;

create policy "activity admin select" on public.activity_log
  for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Data API grants (RLS above decides which rows)
-- ---------------------------------------------------------------------------
grant select on public.site_settings, public.page_seo to anon;
grant select, insert, update on public.site_settings to authenticated;
grant select, insert, update, delete on public.page_seo, public.integration_secrets to authenticated;
grant select, update, delete on public.contacts, public.bookings to authenticated;
grant select, insert, delete on public.automation_tokens to authenticated;
grant select on public.activity_log to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: public "media" bucket, admin-only writes
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
        array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml', 'video/mp4', 'application/pdf'])
on conflict (id) do nothing;

create policy "media admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'media' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
insert into public.admin_emails (email) values ('info@shafqat.pro') on conflict do nothing;

insert into public.site_settings (id, data) values (1, jsonb_build_object(
  'siteName', 'Shafqat Rasool',
  'siteUrl', 'https://shafqat.pro',
  'defaultTitle', 'Shafqat Rasool | Software Architect & Full-Stack Developer',
  'titleTemplate', '%s | Shafqat Rasool',
  'defaultDescription', 'Portfolio of Shafqat Rasool, a software architect and technology leader with 10+ years of experience in custom software, Shopify, SaaS, mobile app development, and cloud engineering.',
  'keywords', jsonb_build_array('Shafqat Rasool', 'Software Architect', 'Full-Stack Developer', 'Shopify Developer', 'Mobile App Development', 'iOS Developer', 'Android Developer', 'SaaS Development', 'FastAPI', 'Python', 'Node.js', 'AWS', 'Azure', 'React Native', 'Flutter'),
  'ogImage', '/opengraph-image',
  'twitterHandle', '@shafqatrasool',
  'contactEmail', 'info@shafqat.pro',
  'whatsapp', '923045101870',
  'phone', '+92 304 5101870',
  'tracking', jsonb_build_object(
    'gtmId', '', 'ga4Id', '', 'googleAdsId', '', 'googleAdsLeadLabel', '', 'googleAdsBookingLabel', '',
    'metaPixelId', '', 'googleSiteVerification', '', 'bingSiteVerification', '', 'facebookDomainVerification', ''
  ),
  'booking', jsonb_build_object(
    'timezone', 'Asia/Karachi',
    'slotMinutes', 30,
    'bufferMinutes', 15,
    'minNoticeHours', 12,
    'maxDaysAhead', 30,
    'workingDays', jsonb_build_array(1, 2, 3, 4, 5, 6),
    'startHour', 10,
    'endHour', 19,
    'meetingTypes', jsonb_build_array('Discovery Call', 'Software Architecture', 'Shopify & E-Commerce', 'Mobile App', 'SaaS / MVP', 'Cloud & DevOps')
  ),
  'whatsappWidget', true
)) on conflict (id) do nothing;
