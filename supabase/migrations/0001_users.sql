-- ============================================================
-- NerVox Platform — Database Schema
-- Version: 1.0
-- Created: June 2026
-- ============================================================

-- ============================================================
-- TABLE: users
-- Stores all NerVox platform identities.
-- Covers both individual users and organisations.
-- Linked to Supabase Auth via id.
-- ============================================================

create table public.users (
  id          uuid        not null references auth.users(id) on delete cascade,
  user_type   text        not null check (user_type in ('individual', 'organisation')),
  name        text        not null,
  username    text        not null,
  email       text        not null,
  mobile      text        not null,
  created_at  timestamptz not null default now(),

  -- constraints
  constraint users_pkey         primary key (id),
  constraint users_username_key unique (username),
  constraint users_email_key    unique (email)
);

-- ============================================================
-- COMMENTS
-- ============================================================

comment on table  public.users              is 'All NerVox platform identities — individuals and organisations.';
comment on column public.users.id          is 'UUID from Supabase Auth.';
comment on column public.users.user_type   is 'individual = person, organisation = corporate entity.';
comment on column public.users.name        is 'Person name for individual, organisation name for corporate.';
comment on column public.users.username    is 'Unique handle. Platform identity: username@nervox.live.';
comment on column public.users.email       is 'Primary email. Unique per account.';
comment on column public.users.mobile      is 'Mobile number. Not unique — same number allowed across multiple accounts.';
comment on column public.users.created_at  is 'Timestamp when account was created.';