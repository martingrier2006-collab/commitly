-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  school_or_company text,
  is_public boolean default true,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Groups (defined before goals so goals can ref it)
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references profiles(id),
  invite_code text unique default substring(gen_random_uuid()::text, 1, 8),
  is_private boolean default false,
  created_at timestamptz default now()
);

-- Goals
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  category text check (category in ('Fitness','Career','Investing','Academics','Personal','Other')),
  metric_type text check (metric_type in ('number','boolean','streak','money','time','weight','custom')),
  target_value numeric,
  target_unit text,
  deadline date,
  visibility text check (visibility in ('public','friends','private','group')) default 'public',
  group_id uuid references groups(id),
  wager_description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Check-ins
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  value numeric,
  note text,
  proof_url text,
  checked_in_at timestamptz default now()
);

-- Follows
create table follows (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- Group members
create table group_members (
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text check (role in ('admin','member')) default 'member',
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- Comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  goal_id uuid references goals(id) on delete cascade,
  check_in_id uuid references check_ins(id),
  body text not null,
  created_at timestamptz default now()
);

-- Likes
create table likes (
  user_id uuid references profiles(id) on delete cascade,
  check_in_id uuid references check_ins(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, check_in_id)
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  actor_id uuid references profiles(id),
  goal_id uuid references goals(id),
  check_in_id uuid references check_ins(id),
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ======== RLS ========

alter table profiles enable row level security;
alter table goals enable row level security;
alter table check_ins enable row level security;
alter table follows enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table notifications enable row level security;

-- Profiles
create policy "Public profiles readable" on profiles for select using (is_public = true or auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

-- Goals
create policy "Public goals readable" on goals for select
  using (visibility = 'public' or user_id = auth.uid());
create policy "Users insert own goals" on goals for insert with check (auth.uid() = user_id);
create policy "Users update own goals" on goals for update using (auth.uid() = user_id);
create policy "Users delete own goals" on goals for delete using (auth.uid() = user_id);

-- Check-ins
create policy "Check-ins readable with public goal" on check_ins for select
  using (exists (select 1 from goals g where g.id = goal_id and (g.visibility = 'public' or g.user_id = auth.uid())));
create policy "Users insert own check-ins" on check_ins for insert with check (auth.uid() = user_id);
create policy "Users delete own check-ins" on check_ins for delete using (auth.uid() = user_id);

-- Follows
create policy "Follows readable by all" on follows for select using (true);
create policy "Users insert own follows" on follows for insert with check (auth.uid() = follower_id);
create policy "Users delete own follows" on follows for delete using (auth.uid() = follower_id);

-- Groups
create policy "Public groups readable" on groups for select using (is_private = false or exists (
  select 1 from group_members gm where gm.group_id = id and gm.user_id = auth.uid()
));
create policy "Users create groups" on groups for insert with check (auth.uid() = created_by);
create policy "Admins update groups" on groups for update using (auth.uid() = created_by);

-- Group members
create policy "Members readable" on group_members for select using (true);
create policy "Users join groups" on group_members for insert with check (auth.uid() = user_id);
create policy "Users leave groups" on group_members for delete using (auth.uid() = user_id);

-- Comments
create policy "Comments readable" on comments for select using (true);
create policy "Users insert own comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users delete own comments" on comments for delete using (auth.uid() = user_id);

-- Likes
create policy "Likes readable" on likes for select using (true);
create policy "Users insert own likes" on likes for insert with check (auth.uid() = user_id);
create policy "Users delete own likes" on likes for delete using (auth.uid() = user_id);

-- Notifications
create policy "Users read own notifications" on notifications for select using (auth.uid() = user_id);
create policy "System insert notifications" on notifications for insert with check (true);
create policy "Users update own notifications" on notifications for update using (auth.uid() = user_id);

-- ======== Trigger: auto-create profile on signup ========
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
