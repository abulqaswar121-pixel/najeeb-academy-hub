-- ─────────────────────────────────────────────────────────────────────────
-- Najeeb Academy — schema, RLS and grants
-- ─────────────────────────────────────────────────────────────────────────

-- Profiles (public name used on certificates), auto-created on signup
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Courses: the catalog. Adding a course later is a plain INSERT — no code changes.
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null,
  description text not null,
  category text not null,
  price_ngn integer not null check (price_ngn >= 0),
  duration text not null,
  image text not null,
  is_published boolean not null default true,
  level text not null default 'Beginner',
  is_featured boolean not null default false,
  tools text[] not null default '{}',
  project text not null default '',
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Published courses are readable by everyone"
  on public.courses for select
  to anon, authenticated
  using (is_published = true);

-- Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  slug text not null,
  content text not null,
  video_url text,
  position integer not null,
  unique (course_id, slug),
  unique (course_id, position)
);

create index lessons_course_id_idx on public.lessons (course_id);

alter table public.lessons enable row level security;

create policy "Lessons of published courses are readable by everyone"
  on public.lessons for select
  to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and c.is_published = true));

-- Enrollments
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index enrollments_user_id_idx on public.enrollments (user_id);

alter table public.enrollments enable row level security;

create policy "Students read their own enrollments"
  on public.enrollments for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students enroll themselves"
  on public.enrollments for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Students update their own enrollment progress"
  on public.enrollments for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Lesson progress
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index lesson_progress_user_id_idx on public.lesson_progress (user_id);

alter table public.lesson_progress enable row level security;

create policy "Students read their own lesson progress"
  on public.lesson_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students record their own lesson progress"
  on public.lesson_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Certificates
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  code text not null unique,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index certificates_user_id_idx on public.certificates (user_id);

alter table public.certificates enable row level security;

create policy "Students read their own certificates"
  on public.certificates for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students receive their own certificates"
  on public.certificates for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Public certificate verification (by exact code only) without exposing the
-- certificates table: SECURITY DEFINER lookup.
create or replace function public.verify_certificate(lookup_code text)
returns table (
  code text,
  student_name text,
  course_title text,
  course_category text,
  issued_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select c.code, p.full_name, co.title, co.category, c.issued_at
  from public.certificates c
  join public.profiles p on p.id = c.user_id
  join public.courses co on co.id = c.course_id
  where upper(c.code) = upper(trim(lookup_code));
$$;

-- Testimonials
create table public.testimonials (
  id bigint generated always as identity primary key,
  name text not null,
  role text not null,
  quote text not null,
  course_id uuid references public.courses (id) on delete set null
);

alter table public.testimonials enable row level security;

create policy "Testimonials are readable by everyone"
  on public.testimonials for select
  to anon, authenticated
  using (true);

-- Contact submissions (write-only from the public site)
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

create policy "Anyone can submit a contact message"
  on public.contact_submissions for insert
  to anon, authenticated
  with check (true);

-- ─────────────────────────── Grants ───────────────────────────
grant usage on schema public to anon, authenticated;

grant select on public.courses, public.lessons, public.testimonials to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.enrollments to authenticated;
grant select, insert on public.lesson_progress to authenticated;
grant select, insert on public.certificates to authenticated;
grant insert on public.contact_submissions to anon, authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
