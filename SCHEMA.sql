-- RakshaOne schema v1. Run on the Raksha Supabase project.
-- Curriculum IDs are immutable text IDs defined in the static client bundle.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  daily_goal integer not null default 1 check (daily_goal between 1 and 5),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 3 and 120),
  status text not null default 'viewed' check (status in ('viewed','learned','practiced','passed','mastered')),
  best_score integer check (best_score between 0 and 100),
  attempts integer not null default 0 check (attempts >= 0),
  xp_awarded integer not null default 0 check (xp_awarded between 0 and 100),
  first_viewed_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index if not exists lesson_progress_recent_idx on public.lesson_progress(user_id, updated_at desc);

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null check (char_length(lesson_id) between 3 and 120),
  exercise_id text not null check (char_length(exercise_id) between 3 and 120),
  kind text not null check (kind in ('quiz','scenario','camera','guided')),
  score integer check (score between 0 and 100),
  passed boolean not null default false,
  criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists exercise_attempts_user_recent_idx on public.exercise_attempts(user_id, created_at desc);
create index if not exists exercise_attempts_lesson_idx on public.exercise_attempts(user_id, lesson_id);

create table if not exists public.device_calibrations (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null check (char_length(device_id) between 8 and 100),
  device_class text not null check (device_class in ('mobile','desktop')),
  metrics jsonb not null,
  quality integer not null check (quality between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, device_id)
);

create table if not exists public.activity_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  practice_count integer not null default 0 check (practice_count >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  primary key (user_id, activity_date)
);
create index if not exists activity_days_recent_idx on public.activity_days(user_id, activity_date desc);

alter table public.profiles enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.device_calibrations enable row level security;
alter table public.activity_days enable row level security;

create policy profiles_select on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profiles_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profiles_update on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy lesson_progress_select on public.lesson_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy lesson_progress_insert on public.lesson_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy lesson_progress_update on public.lesson_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy exercise_attempts_select on public.exercise_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy exercise_attempts_insert on public.exercise_attempts for insert to authenticated with check ((select auth.uid()) = user_id);

create policy device_calibrations_select on public.device_calibrations for select to authenticated using ((select auth.uid()) = user_id);
create policy device_calibrations_insert on public.device_calibrations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy device_calibrations_update on public.device_calibrations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy device_calibrations_delete on public.device_calibrations for delete to authenticated using ((select auth.uid()) = user_id);

create policy activity_days_select on public.activity_days for select to authenticated using ((select auth.uid()) = user_id);
create policy activity_days_insert on public.activity_days for insert to authenticated with check ((select auth.uid()) = user_id);
create policy activity_days_update on public.activity_days for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.profiles, public.lesson_progress, public.exercise_attempts, public.device_calibrations, public.activity_days from anon;
grant select, insert, update on public.profiles, public.lesson_progress, public.device_calibrations, public.activity_days to authenticated;
grant select, insert on public.exercise_attempts to authenticated;
grant delete on public.device_calibrations to authenticated;
