-- ======== Indexes ========
-- Without these every query is a full table scan

create index if not exists idx_check_ins_goal_id on check_ins (goal_id);
create index if not exists idx_check_ins_user_id on check_ins (user_id);
create index if not exists idx_check_ins_checked_at on check_ins (checked_in_at desc);
create index if not exists idx_goals_user_id on goals (user_id);
create index if not exists idx_goals_group_id on goals (group_id);
create index if not exists idx_follows_following_id on follows (following_id);
create index if not exists idx_notifications_user_id on notifications (user_id, is_read);
create index if not exists idx_notifications_created_at on notifications (created_at desc);
create index if not exists idx_comments_check_in_id on comments (check_in_id);
create index if not exists idx_likes_check_in_id on likes (check_in_id);
create index if not exists idx_group_members_user_id on group_members (user_id);

-- ======== Fix RLS: friends + group visibility ========
-- The original policy only allowed public goals and the owner's own goals.
-- Friends-visibility goals were invisible to followers.
-- Group-visibility goals were invisible to group members.

drop policy if exists "Public goals readable" on goals;

create policy "Goals readable" on goals for select
  using (
    visibility = 'public'
    or user_id = auth.uid()
    or (
      visibility = 'friends' and exists (
        select 1 from follows f
        where f.follower_id = auth.uid() and f.following_id = goals.user_id
      )
    )
    or (
      visibility = 'group' and group_id is not null and exists (
        select 1 from group_members gm
        where gm.group_id = goals.group_id and gm.user_id = auth.uid()
      )
    )
  );

-- Fix check-ins RLS to match the updated goals policy
drop policy if exists "Check-ins readable with public goal" on check_ins;

create policy "Check-ins readable" on check_ins for select
  using (
    exists (
      select 1 from goals g
      where g.id = check_ins.goal_id
      and (
        g.visibility = 'public'
        or g.user_id = auth.uid()
        or (
          g.visibility = 'friends' and exists (
            select 1 from follows f
            where f.follower_id = auth.uid() and f.following_id = g.user_id
          )
        )
        or (
          g.visibility = 'group' and g.group_id is not null and exists (
            select 1 from group_members gm
            where gm.group_id = g.group_id and gm.user_id = auth.uid()
          )
        )
      )
    )
  );

-- ======== Add missing columns ========
alter table goals add column if not exists completed_at timestamptz;
alter table check_ins add column if not exists is_flagged boolean default false;
