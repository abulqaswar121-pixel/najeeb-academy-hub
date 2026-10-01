-- ─────────────────────────────────────────────────────────────────────────
-- Najeeb Academy — student & admin portals
--   · roles (student/admin) + is_admin() helper
--   · watch-gated video progress
--   · capstone project submissions with mentor review
--   · course reviews/ratings + testimonial moderation workflow
--   · admin: manage courses (hide/unhide/edit/soft-delete), students, inbox
-- ─────────────────────────────────────────────────────────────────────────

-- 1 · Profiles: role + email (email mirrored for the admin student list)
alter table public.profiles
  add column if not exists role text not null default 'student'
    check (role in ('student', 'admin')),
  add column if not exists email text not null default '';

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email = '';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

create policy "Admins view all profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- Promote an account to admin with:
--   update public.profiles set role = 'admin' where email = 'you@example.com';

-- Admin-only hard delete of a student account (cascades everywhere).
create or replace function public.admin_delete_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required.';
  end if;
  if exists (select 1 from public.profiles where id = target_user and role = 'admin') then
    raise exception 'Admin accounts cannot be deleted here.';
  end if;
  delete from auth.users where id = target_user;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;

-- 2 · Courses: soft delete + admin management
alter table public.courses
  add column if not exists deleted_at timestamptz;

drop policy "Published courses are readable by everyone" on public.courses;
create policy "Published courses are readable by everyone"
  on public.courses for select
  to anon, authenticated
  using (is_published = true and deleted_at is null);

create policy "Admins read all courses"
  on public.courses for select
  to authenticated
  using (public.is_admin());

create policy "Admins update courses"
  on public.courses for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 3 · Lessons: raw video id + watch window (seconds) for the gated player
alter table public.lessons
  add column if not exists video_id text,
  add column if not exists video_start integer not null default 0,
  add column if not exists video_end integer,
  add column if not exists video_duration integer;

update public.lessons
set
  video_id = coalesce(video_id, substring(video_url from 'embed/([A-Za-z0-9_-]{6,})')),
  video_start = coalesce(nullif(video_start, 0), coalesce(substring(video_url from '[?&]start=(\d+)')::integer, 0))
where video_url is not null;

-- 4 · Watch progress (anti-skip enforcement lives in the app; this stores
--     the furthest watched point + completion per lesson window)
create table public.video_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  watched_seconds numeric not null default 0 check (watched_seconds >= 0),
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.video_progress enable row level security;

create policy "Students read their own video progress"
  on public.video_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students record their own video progress"
  on public.video_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Students update their own video progress"
  on public.video_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 5 · Capstone project submissions
create table public.project_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  link text not null,
  notes text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'changes_requested')),
  feedback text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (user_id, course_id)
);

create index project_submissions_user_id_idx on public.project_submissions (user_id);

alter table public.project_submissions enable row level security;

create policy "Students read their own submissions"
  on public.project_submissions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students submit their own projects"
  on public.project_submissions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Students update their own submissions"
  on public.project_submissions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Admins read all submissions"
  on public.project_submissions for select
  to authenticated
  using (public.is_admin());

create policy "Admins review submissions"
  on public.project_submissions for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6 · Course reviews / ratings (public read powers the course-page rating)
create table public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  reviewer_name text not null default 'Student',
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index course_reviews_course_id_idx on public.course_reviews (course_id);

alter table public.course_reviews enable row level security;

create policy "Reviews are readable by everyone"
  on public.course_reviews for select
  to anon, authenticated
  using (true);

create policy "Students write their own reviews"
  on public.course_reviews for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Students update their own reviews"
  on public.course_reviews for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Admins delete reviews"
  on public.course_reviews for delete
  to authenticated
  using (public.is_admin());

-- 7 · Testimonials: moderation workflow (pending → published/hidden)
alter table public.testimonials
  add column if not exists status text not null default 'published'
    check (status in ('pending', 'published', 'hidden')),
  add column if not exists user_id uuid references auth.users (id) on delete set null,
  add column if not exists created_at timestamptz not null default now();

drop policy "Testimonials are readable by everyone" on public.testimonials;
create policy "Published testimonials are readable by everyone"
  on public.testimonials for select
  to anon, authenticated
  using (status = 'published');

create policy "Students submit their own pending testimonials"
  on public.testimonials for insert
  to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');

create policy "Admins read all testimonials"
  on public.testimonials for select
  to authenticated
  using (public.is_admin());

create policy "Admins moderate testimonials"
  on public.testimonials for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete testimonials"
  on public.testimonials for delete
  to authenticated
  using (public.is_admin());

-- 8 · Admin visibility over student activity + the contact inbox
create policy "Admins read all enrollments"
  on public.enrollments for select
  to authenticated
  using (public.is_admin());

create policy "Admins read all certificates"
  on public.certificates for select
  to authenticated
  using (public.is_admin());

create policy "Admins read all lesson progress"
  on public.lesson_progress for select
  to authenticated
  using (public.is_admin());

create policy "Admins read contact submissions"
  on public.contact_submissions for select
  to authenticated
  using (public.is_admin());

create policy "Admins delete contact submissions"
  on public.contact_submissions for delete
  to authenticated
  using (public.is_admin());

-- ─────────────────────────── Grants ───────────────────────────
grant select, insert, update on public.video_progress to authenticated;
grant select, insert, update on public.project_submissions to authenticated;
grant select on public.course_reviews to anon;
grant select, insert, update, delete on public.course_reviews to authenticated;
grant insert, update, delete on public.testimonials to authenticated;
grant update on public.courses to authenticated;
grant select, delete on public.contact_submissions to authenticated;
