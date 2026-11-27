-- CRYPYKUT — esquema inicial. Executar apenas no projeto Supabase correto.
-- RLS habilitado. Revisar políticas antes de abrir cadastro público.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  city text,
  country text,
  bio text,
  visibility text not null default 'basic' check (visibility in ('public','basic','friends','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.friendships (
  id bigint generated always as identity primary key,
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','blocked')),
  trust_level text not null default 'known' check (trust_level in ('known','friend','trusted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.posts (
  id bigint generated always as identity primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  visibility text not null default 'friends' check (visibility in ('public','friends','private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.communities (
  id bigint generated always as identity primary key,
  creator_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  visibility text not null default 'public' check (visibility in ('public','private')),
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  community_id bigint not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('creator','moderator','member')),
  status text not null default 'active' check (status in ('pending','active','removed')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists public.testimonials (
  id bigint generated always as identity primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  check (author_id <> recipient_id)
);

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default '',
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.blocks enable row level security;
alter table public.posts enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.testimonials enable row level security;
alter table public.messages enable row level security;

-- Perfil: o próprio usuário pode editar; leitura pública limitada ao cadastro visível.
create policy "profiles_select_visible" on public.profiles for select
using (visibility = 'public' or id = auth.uid());
create policy "profiles_insert_self" on public.profiles for insert
with check (id = auth.uid());
create policy "profiles_update_self" on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid());

-- Relações: somente participantes podem ler/alterar sua relação.
create policy "friendships_participants_select" on public.friendships for select
using (requester_id = auth.uid() or addressee_id = auth.uid());
create policy "friendships_request_self" on public.friendships for insert
with check (requester_id = auth.uid());
create policy "friendships_participants_update" on public.friendships for update
using (requester_id = auth.uid() or addressee_id = auth.uid())
with check (requester_id = auth.uid() or addressee_id = auth.uid());

create policy "blocks_owner_all" on public.blocks for all
using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

create policy "posts_select_public_or_owner" on public.posts for select
using (visibility = 'public' or author_id = auth.uid());
create policy "posts_owner_insert" on public.posts for insert
with check (author_id = auth.uid());
create policy "posts_owner_update" on public.posts for update
using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "posts_owner_delete" on public.posts for delete
using (author_id = auth.uid());

create policy "communities_public_or_creator_select" on public.communities for select
using (visibility = 'public' or creator_id = auth.uid());
create policy "communities_creator_insert" on public.communities for insert
with check (creator_id = auth.uid());
create policy "communities_creator_update" on public.communities for update
using (creator_id = auth.uid()) with check (creator_id = auth.uid());

create policy "community_members_self_or_same_group_select" on public.community_members for select
using (user_id = auth.uid() or exists (
  select 1 from public.community_members mine
  where mine.community_id = community_members.community_id and mine.user_id = auth.uid()
));
create policy "community_members_self_insert" on public.community_members for insert
with check (user_id = auth.uid());
create policy "community_members_self_or_creator_update" on public.community_members for update
using (user_id = auth.uid() or exists (
  select 1 from public.communities c
  where c.id = community_members.community_id and c.creator_id = auth.uid()
));

create policy "testimonials_participants_select" on public.testimonials for select
using (author_id = auth.uid() or recipient_id = auth.uid());
create policy "testimonials_author_insert" on public.testimonials for insert
with check (author_id = auth.uid());
create policy "testimonials_recipient_moderate" on public.testimonials for update
using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create policy "messages_participants_select" on public.messages for select
using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "messages_sender_insert" on public.messages for insert
with check (sender_id = auth.uid());
create policy "messages_recipient_update" on public.messages for update
using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
