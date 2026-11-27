-- CRYPYKUT — esquema inicial Supabase; revisão técnica e testes ainda obrigatórios.
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', avatar_url text, city text, country text, bio text,
 visibility text not null default 'basic' check (visibility in ('public','basic','friends','trusted','private')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.friendships (
 id bigint generated always as identity primary key,
 requester_id uuid not null references auth.users(id) on delete cascade,
 addressee_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted','declined')),
 trust_level text not null default 'known' check (trust_level in ('known','friend','trusted')),
 created_at timestamptz not null default now(), unique(requester_id,addressee_id), check(requester_id<>addressee_id)
);
create table if not exists public.blocks (
 blocker_id uuid not null references auth.users(id) on delete cascade,
 blocked_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id<>blocked_id)
);
create table if not exists public.posts (
 id bigint generated always as identity primary key, author_id uuid not null references auth.users(id) on delete cascade,
 body text not null, visibility text not null default 'friends' check(visibility in ('public','friends','private')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.communities (
 id bigint generated always as identity primary key, creator_id uuid not null references auth.users(id) on delete cascade,
 name text not null, description text not null default '',
 visibility text not null default 'public' check(visibility in ('public','private')), created_at timestamptz not null default now()
);
create table if not exists public.community_members (
 community_id bigint not null references public.communities(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'member' check(role in ('creator','moderator','member')),
 status text not null default 'pending' check(status in ('pending','active','removed')),
 joined_at timestamptz not null default now(), primary key(community_id,user_id)
);
create table if not exists public.testimonials (
 id bigint generated always as identity primary key, author_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade, body text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), check(author_id<>recipient_id)
);
create table if not exists public.messages (
 id bigint generated always as identity primary key, sender_id uuid not null references auth.users(id) on delete cascade,
 recipient_id uuid not null references auth.users(id) on delete cascade, subject text not null default '',
 body text not null, read_at timestamptz, created_at timestamptz not null default now(), check(sender_id<>recipient_id)
);

create or replace function public.is_blocked_pair(a uuid,b uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.blocks x where (x.blocker_id=a and x.blocked_id=b) or (x.blocker_id=b and x.blocked_id=a)); $$;
create or replace function public.has_known_connection(a uuid,b uuid)
returns boolean language sql stable security definer set search_path=public
as $ select exists(select 1 from public.friendships f where f.status='accepted' and ((f.requester_id=a and f.addressee_id=b) or (f.requester_id=b and f.addressee_id=a))); $;
create or replace function public.are_friends(a uuid,b uuid)
returns boolean language sql stable security definer set search_path=public
as $ select exists(select 1 from public.friendships f where f.status='accepted' and f.trust_level in ('friend','trusted') and ((f.requester_id=a and f.addressee_id=b) or (f.requester_id=b and f.addressee_id=a))); $;
create or replace function public.has_trusted_friendship(a uuid,b uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.friendships f where f.status='accepted' and f.trust_level='trusted' and ((f.requester_id=a and f.addressee_id=b) or (f.requester_id=b and f.addressee_id=a))); $$;
create or replace function public.can_view_profile(owner_id uuid,level text)
returns boolean language sql stable security definer set search_path=public
as $$ select auth.uid()=owner_id or (not public.is_blocked_pair(auth.uid(),owner_id) and
 (level='public' or (level='basic' and public.has_known_connection(auth.uid(),owner_id)) or (level='friends' and public.are_friends(auth.uid(),owner_id)) or (level='trusted' and public.has_trusted_friendship(auth.uid(),owner_id)))); $$;
create or replace function public.can_view_post(owner_id uuid,level text)
returns boolean language sql stable security definer set search_path=public
as $$ select auth.uid()=owner_id or (not public.is_blocked_pair(auth.uid(),owner_id) and (level='public' or (level='friends' and public.are_friends(auth.uid(),owner_id)))); $$;
create or replace function public.is_community_member(target_id bigint)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.community_members m where m.community_id=target_id and m.user_id=auth.uid() and m.status='active'); $$;
create or replace function public.is_community_admin(target_id bigint)
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.communities c where c.id=target_id and c.creator_id=auth.uid())
 or exists(select 1 from public.community_members m where m.community_id=target_id and m.user_id=auth.uid() and m.status='active' and m.role in ('creator','moderator')); $$;
create or replace function public.can_view_community(target_id bigint,level text,owner_id uuid)
returns boolean language sql stable security definer set search_path=public
as $$ select owner_id=auth.uid() or (not public.is_blocked_pair(auth.uid(),owner_id) and (level='public' or public.is_community_member(target_id))); $$;

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.blocks enable row level security;
alter table public.posts enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.testimonials enable row level security;
alter table public.messages enable row level security;

create or replace function public.handle_new_crypy_user()
returns trigger language plpgsql security definer set search_path=public
as $
begin
  insert into public.profiles(id,display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'full_name',''),
      nullif(new.raw_user_meta_data->>'name',''),
      nullif(split_part(coalesce(new.email,''),'@',1),''),
      'Novo membro'
    )
  )
  on conflict(id) do nothing;
  return new;
end;
$;
drop trigger if exists on_crypy_user_created on auth.users;
create trigger on_crypy_user_created
after insert on auth.users
for each row execute function public.handle_new_crypy_user();

create policy "profiles_visible_by_privacy" on public.profiles for select using(public.can_view_profile(id,visibility));
create policy "profiles_insert_self" on public.profiles for insert with check(id=auth.uid());
create policy "profiles_update_self" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());
revoke update on public.profiles from anon,authenticated;
grant update(display_name,avatar_url,city,country,bio,visibility,updated_at) on public.profiles to authenticated;

create policy "friendships_participant_read" on public.friendships for select using(requester_id=auth.uid() or addressee_id=auth.uid());
create policy "friendships_request_self" on public.friendships for insert with check(requester_id=auth.uid() and status='pending' and trust_level='known');
create policy "friendships_recipient_decide" on public.friendships for update using(addressee_id=auth.uid()) with check(addressee_id=auth.uid() and status in ('accepted','declined'));
create policy "friendships_requester_cancel" on public.friendships for delete using(requester_id=auth.uid() and status='pending');
revoke update on public.friendships from anon,authenticated;
grant update(status,trust_level) on public.friendships to authenticated;

create policy "blocks_read_own" on public.blocks for select using(blocker_id=auth.uid());
create policy "blocks_add_own" on public.blocks for insert with check(blocker_id=auth.uid());
create policy "blocks_remove_own" on public.blocks for delete using(blocker_id=auth.uid());

create policy "posts_read_by_visibility" on public.posts for select using(public.can_view_post(author_id,visibility));
create policy "posts_insert_self" on public.posts for insert with check(author_id=auth.uid());
create policy "posts_update_self" on public.posts for update using(author_id=auth.uid()) with check(author_id=auth.uid());
create policy "posts_delete_self" on public.posts for delete using(author_id=auth.uid());
revoke update on public.posts from anon,authenticated;
grant update(body,visibility,updated_at) on public.posts to authenticated;

create policy "communities_read_by_visibility" on public.communities for select using(public.can_view_community(id,visibility,creator_id));
create policy "communities_insert_self" on public.communities for insert with check(creator_id=auth.uid());
create policy "communities_update_creator" on public.communities for update using(creator_id=auth.uid()) with check(creator_id=auth.uid());
revoke update on public.communities from anon,authenticated;
grant update(name,description,visibility) on public.communities to authenticated;

create policy "community_members_read_related" on public.community_members for select using(user_id=auth.uid() or public.is_community_member(community_id) or public.is_community_admin(community_id));
create policy "community_members_join_self" on public.community_members for insert with check(user_id=auth.uid() and role='member' and (status='pending' or exists(select 1 from public.communities c where c.id=community_id and c.visibility='public')));
create policy "community_members_moderate" on public.community_members for update using(public.is_community_admin(community_id)) with check(public.is_community_admin(community_id));
create policy "community_members_leave_or_remove" on public.community_members for delete using(user_id=auth.uid() or public.is_community_admin(community_id));
revoke update on public.community_members from anon,authenticated;
grant update(role,status) on public.community_members to authenticated;

create policy "testimonials_participant_read" on public.testimonials for select using(author_id=auth.uid() or recipient_id=auth.uid());
create policy "testimonials_author_submit" on public.testimonials for insert with check(author_id=auth.uid() and status='pending');
create policy "testimonials_recipient_approve" on public.testimonials for update using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
revoke update on public.testimonials from anon,authenticated;
grant update(status) on public.testimonials to authenticated;

create policy "messages_participant_read" on public.messages for select using((sender_id=auth.uid() or recipient_id=auth.uid()) and not public.is_blocked_pair(sender_id,recipient_id));
create policy "messages_sender_submit" on public.messages for insert with check(sender_id=auth.uid() and not public.is_blocked_pair(sender_id,recipient_id));
create policy "messages_recipient_mark_read" on public.messages for update using(recipient_id=auth.uid()) with check(recipient_id=auth.uid());
revoke update on public.messages from anon,authenticated;
grant update(read_at) on public.messages to authenticated;
