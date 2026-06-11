-- Seed file: run AFTER creating auth users manually or via Supabase dashboard
-- This uses fixed UUIDs for predictable seeding

-- Sample profiles (insert to auth.users first via Supabase Auth admin)
-- For local dev, insert directly into profiles bypassing auth:

insert into profiles (id, username, full_name, bio, school_or_company, is_public) values
  ('a1000000-0000-0000-0000-000000000001', 'alex_chen', 'Alex Chen', 'Grinding toward IB @ Goldman. No days off.', 'Vanderbilt University', true),
  ('a1000000-0000-0000-0000-000000000002', 'maya_patel', 'Maya Patel', 'Pre-med + fitness obsessed. 5am club.', 'Duke University', true),
  ('a1000000-0000-0000-0000-000000000003', 'jordan_kim', 'Jordan Kim', 'CS + Finance double. Building in public.', 'NYU Stern', true),
  ('a1000000-0000-0000-0000-000000000004', 'sam_okonkwo', 'Sam Okonkwo', 'Summer analyst at Evercore. Investing $500/mo no matter what.', 'Georgetown', true),
  ('a1000000-0000-0000-0000-000000000005', 'priya_sharma', 'Priya Sharma', 'CFA Level 1 in December. Also lifting 3x/week.', 'UChicago Booth', true),
  ('a1000000-0000-0000-0000-000000000006', 'tyler_brooks', 'Tyler Brooks', 'Software engineer @ Jane Street. Running a marathon this fall.', 'MIT', true),
  ('a1000000-0000-0000-0000-000000000007', 'zoe_martin', 'Zoe Martin', 'Startup founder + daily journaler. Accountability is everything.', 'Stanford', true),
  ('a1000000-0000-0000-0000-000000000008', 'marcus_lee', 'Marcus Lee', 'NYC finance bro who actually hits the gym.', 'Wharton', true),
  ('a1000000-0000-0000-0000-000000000009', 'nina_walsh', 'Nina Walsh', 'Consulting at McKinsey. Weekend warrior.', 'Harvard', true),
  ('a1000000-0000-0000-0000-000000000010', 'dev_gupta', 'Dev Gupta', 'Quant intern. 100 LeetCode problems in 30 days.', 'Princeton', true)
on conflict (id) do nothing;

-- Groups
insert into groups (id, name, description, created_by, invite_code, is_private) values
  ('b1000000-0000-0000-0000-000000000001', 'Vandy IB Grind', 'Vanderbilt students breaking into investment banking. Accountability + resources.', 'a1000000-0000-0000-0000-000000000001', 'VANDYIB1', false),
  ('b1000000-0000-0000-0000-000000000002', 'Summer Cut 2025', 'Get shredded before Labor Day. Daily check-ins required.', 'a1000000-0000-0000-0000-000000000002', 'SUMCUT25', false),
  ('b1000000-0000-0000-0000-000000000003', 'NYC Interns', 'NYC summer interns holding each other accountable. Work hard, network harder.', 'a1000000-0000-0000-0000-000000000004', 'NYCINT25', false)
on conflict (id) do nothing;

-- Group memberships
insert into group_members (group_id, user_id, role) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'admin'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'member'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000009', 'member'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'admin'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006', 'member'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', 'member'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005', 'member'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004', 'admin'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 'member'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'member'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000010', 'member')
on conflict do nothing;

-- Goals (20+)
insert into goals (id, user_id, title, description, category, metric_type, target_value, target_unit, deadline, visibility, group_id) values
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Send 3 cold emails daily', 'Networking into IB. No excuses.', 'Career', 'number', 90, 'emails', '2025-08-31', 'public', 'b1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Read 1 WSJ article daily', 'Stay sharp on markets.', 'Career', 'boolean', 30, 'days', '2025-07-31', 'public', null),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Gym 5x/week', 'Summer cut protocol. 5am sessions.', 'Fitness', 'number', 80, 'sessions', '2025-09-01', 'public', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 'Track macros daily', 'Hit 150g protein every day.', 'Fitness', 'boolean', 90, 'days', '2025-09-01', 'public', null),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Ship 1 side project feature/week', 'Building in public. Ship or skip.', 'Career', 'number', 12, 'features', '2025-09-30', 'public', null),
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 'LeetCode 2 problems/day', 'Grinding for full-time offers.', 'Academics', 'number', 60, 'problems', '2025-08-01', 'public', null),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 'Invest $500/month', 'DCA into index funds no matter what.', 'Investing', 'money', 3000, 'USD', '2025-12-31', 'public', 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000004', 'Read one finance book/month', 'Intelligent Investor → Security Analysis → More.', 'Career', 'number', 6, 'books', '2025-12-31', 'public', null),
  ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 'Study CFA 2hr/day', '300 hours minimum. December exam.', 'Academics', 'time', 300, 'hours', '2025-12-01', 'public', null),
  ('c1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000005', 'Lift 3x/week', 'Power clean PR by end of summer.', 'Fitness', 'number', 48, 'sessions', '2025-09-01', 'public', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 'Run 5 days/week', 'NYC Marathon training begins.', 'Fitness', 'number', 100, 'runs', '2025-11-01', 'public', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000006', 'Write 1 blog post/week', 'Build personal brand. Engineering + finance.', 'Career', 'number', 20, 'posts', '2025-12-31', 'public', null),
  ('c1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000007', 'Daily journaling', 'Morning pages. Ship it to my audience.', 'Personal', 'boolean', 90, 'days', '2025-09-01', 'public', null),
  ('c1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000007', 'Get 10 paying customers', 'MVP launch goal.', 'Career', 'number', 10, 'customers', '2025-08-31', 'public', null),
  ('c1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000008', 'Cut to 175lbs', 'Summer cut. Started at 195.', 'Fitness', 'weight', 175, 'lbs', '2025-09-01', 'public', 'b1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000008', 'Network 5 new people/week', 'NYC finance network is everything.', 'Career', 'number', 60, 'people', '2025-08-31', 'public', 'b1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000009', 'Meditate 10 min/day', 'Consulting is brutal. Stay centered.', 'Personal', 'boolean', 90, 'days', '2025-09-30', 'public', null),
  ('c1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000009', 'Prep 2 case studies/week', 'Keeping skills sharp for promotion.', 'Career', 'number', 24, 'cases', '2025-09-30', 'public', null),
  ('c1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000010', 'Solve 100 LeetCode problems', 'Hard only. Return offer depends on this.', 'Academics', 'number', 100, 'problems', '2025-08-01', 'public', null),
  ('c1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000010', 'Read Quant Finance papers 3x/week', 'Stochastic calc deep dive.', 'Academics', 'number', 36, 'papers', '2025-09-30', 'public', null)
on conflict (id) do nothing;

-- Follows (social graph)
insert into follows (follower_id, following_id) values
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006'),
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007'),
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008'),
  ('a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002'),
  ('a1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000003'),
  ('a1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000001'),
  ('a1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005'),
  ('a1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000006')
on conflict do nothing;

-- Check-ins (spread over last 30 days - use generate_series approach)
do $$
declare
  check_in_data record;
begin
  for check_in_data in (
    select * from (values
      ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 3, 'Emailed 3 MDs today. One replied!', 0),
      ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 3, 'Cold outreach grind continues.', 1),
      ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 3, 'Got a coffee chat lined up.', 2),
      ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 3, 'Focusing on boutiques today.', 3),
      ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 3, 'Alumni network paying off.', 5),
      ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1, '5am. Chest + triceps. Pumped.', 0),
      ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1, 'Back day. New PR on deadlift.', 1),
      ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1, 'Legs. Always legs.', 2),
      ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1, 'Shoulders. Feeling the progress.', 3),
      ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1, 'Arms. Pump is real.', 4),
      ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 1, 'Full body. Sweat session.', 5),
      ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 2, 'Solved 2 mediums. Binary search.', 0),
      ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 2, 'DP problems. Getting the hang of it.', 1),
      ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 2, 'Graph traversal day.', 2),
      ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003', 2, 'Backtracking. Ugh.', 3),
      ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 500, 'Auto-invested $500. VTSAX.', 0),
      ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000004', 500, 'Added to position. Market dip = buy.', 5),
      ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 2.5, '2.5 hours deep on fixed income.', 0),
      ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 2, 'Equity section. Feels better now.', 1),
      ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 2, 'Practice problems. 72% pass rate.', 2),
      ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 2.5, 'Derivatives chapter.', 3),
      ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000005', 2, 'Mock exam. 68%. Need to improve.', 4),
      ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 1, '6 miles. Sub-8 pace. Felt great.', 0),
      ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 1, '8 miles. Long run Sunday.', 1),
      ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 1, '5 miles. Recovery pace.', 2),
      ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 1, '7 miles. Tempo intervals.', 3),
      ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000006', 1, '10 miles. Longest run yet.', 5),
      ('c1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000007', 1, 'Morning pages done. Deep thoughts today.', 0),
      ('c1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000007', 1, 'Wrote about my startup vision.', 1),
      ('c1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000007', 1, 'Clarity on product direction.', 2),
      ('c1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000008', 188, 'Down to 188. 13 more to go.', 0),
      ('c1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000008', 186, '186. Progress is real.', 3),
      ('c1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000008', 184, '184. Halfway there.', 7),
      ('c1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000010', 4, 'Solved 4 hards today. Beast mode.', 0),
      ('c1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000010', 3, 'Segment trees. Brain melting.', 1),
      ('c1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000010', 3, 'Bit manipulation mastered.', 2),
      ('c1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000010', 4, 'Flow algorithms. Getting it.', 3),
      ('c1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000009', 1, 'Headspace session. 10 min.', 0),
      ('c1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000009', 1, 'Morning meditation before calls.', 1),
      ('c1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000009', 1, 'Focused breathing. Needed this.', 2)
    ) as t(goal_id, user_id, value, note, days_ago)
  ) loop
    insert into check_ins (goal_id, user_id, value, note, checked_in_at)
    values (
      check_in_data.goal_id::uuid,
      check_in_data.user_id::uuid,
      check_in_data.value,
      check_in_data.note,
      now() - (check_in_data.days_ago || ' days')::interval
    );
  end loop;
end $$;
