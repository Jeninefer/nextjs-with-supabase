-- Messaging schema and policies
set search_path to public;

create extension if not exists "pgcrypto";

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create index if not exists idx_user_profiles_auth_user_id on user_profiles(auth_user_id);

create table if not exists threads (
  id uuid primary key default gen_random_uuid(),
  title text,
  is_group boolean default true,
  owner uuid references user_profiles(id) on delete set null,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_threads_owner on threads(owner);

create table if not exists thread_members (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  user_id uuid references user_profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(thread_id, user_id)
);

create index if not exists idx_thread_members_thread_user on thread_members(thread_id, user_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id) on delete cascade,
  sender_id uuid references user_profiles(id) on delete set null,
  body text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  edited_at timestamptz
);

create index if not exists idx_messages_thread_created_at on messages(thread_id, created_at desc);

create or replace function touch_thread_updated_at()
returns trigger
language plpgsql as $$
begin
  update threads set updated_at = now() where id = new.thread_id;
  return new;
end;
$$;

drop trigger if exists messages_touch_thread_updated_at on messages;
create trigger messages_touch_thread_updated_at
  after insert or update on messages
  for each row execute function touch_thread_updated_at();

alter table user_profiles enable row level security;
alter table threads enable row level security;
alter table thread_members enable row level security;
alter table messages enable row level security;

create policy profiles_owner_select on user_profiles
for select to authenticated
using (auth.uid()::uuid = auth_user_id);

create policy profiles_owner_modify on user_profiles
for insert to authenticated
with check (auth.uid()::uuid = auth_user_id);

create policy profiles_owner_update on user_profiles
for update to authenticated
using (auth.uid()::uuid = auth_user_id)
with check (auth.uid()::uuid = auth_user_id);

create policy threads_select_for_members on threads
for select to authenticated
using (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = threads.id
      and tm.user_id = (
        select id from user_profiles where auth_user_id = auth.uid() limit 1
      )
  )
);

create policy threads_insert_authenticated on threads
for insert to authenticated
with check (
  owner = (
    select id from user_profiles where auth_user_id = auth.uid() limit 1
  )
);

create policy threads_update_for_members on threads
for update to authenticated
using (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = threads.id
      and tm.user_id = (
        select id from user_profiles where auth_user_id = auth.uid() limit 1
      )
  )
)
with check (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = threads.id
      and tm.user_id = (
        select id from user_profiles where auth_user_id = auth.uid() limit 1
      )
  )
);

create policy thread_members_select on thread_members
for select to authenticated
using (
  user_id = (
    select id from user_profiles where auth_user_id = auth.uid() limit 1
  )
  or exists (
    select 1 from thread_members tm2
    where tm2.thread_id = thread_members.thread_id
      and tm2.user_id = (
        select id from user_profiles where auth_user_id = auth.uid() limit 1
      )
  )
);

create policy thread_members_insert_self on thread_members
for insert to authenticated
with check (
  user_id = (
    select id from user_profiles where auth_user_id = auth.uid() limit 1
  )
);

create policy thread_members_delete_self on thread_members
for delete to authenticated
using (
  user_id = (
    select id from user_profiles where auth_user_id = auth.uid() limit 1
  )
);

create policy messages_select_for_members on messages
for select to authenticated
using (
  exists (
    select 1 from thread_members tm
    where tm.thread_id = messages.thread_id
      and tm.user_id = (
        select id from user_profiles where auth_user_id = auth.uid() limit 1
      )
  )
);

create policy messages_insert_for_members on messages
for insert to authenticated
with check (
  sender_id = (
    select id from user_profiles where auth_user_id = auth.uid() limit 1
  )
  and exists (
    select 1 from thread_members tm
    where tm.thread_id = messages.thread_id
      and tm.user_id = (
        select id from user_profiles where auth_user_id = auth.uid() limit 1
      )
  )
);

create policy messages_update_for_sender on messages
for update to authenticated
using (
  sender_id = (
    select id from user_profiles where auth_user_id = auth.uid() limit 1
  )
)
with check (
  sender_id = (
    select id from user_profiles where auth_user_id = auth.uid() limit 1
  )
);
