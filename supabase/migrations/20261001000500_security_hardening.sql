-- Security hardening: protect paid lesson content and certificate integrity.

-- Public curriculum metadata is exposed through a deliberately narrow view.
-- Full lesson rows (notes and video details) are only readable after enrollment.
create or replace view public.lesson_catalog
as
select l.id, l.course_id, l.title, l.slug, l.position
from public.lessons l
join public.courses c on c.id = l.course_id
where c.is_published = true and c.deleted_at is null;

grant select on public.lesson_catalog to anon, authenticated;

-- Remove the original policy that exposed content and video URLs for every
-- published course. Enrolled learners and admins may read full lesson rows.
drop policy if exists "Lessons of published courses are readable by everyone" on public.lessons;
create policy "Enrolled students and admins read lessons"
  on public.lessons for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.enrollments e
      where e.course_id = lessons.course_id
        and e.user_id = (select auth.uid())
    )
  );

revoke all on public.lessons from anon;
revoke all on public.lessons from authenticated;
grant select on public.lessons to authenticated;

-- Certificates are credentials, not user-authored records. Application users
-- must never be able to insert one directly through PostgREST.
drop policy if exists "Students receive their own certificates" on public.certificates;
revoke insert on public.certificates from authenticated;

-- The backend calls this after independently grading the assessment. It is
-- intentionally not granted to anon/authenticated; invoke it only from a
-- trusted server role when production certificate issuance is enabled.
create or replace function public.issue_certificate_trusted(
  target_user uuid,
  target_course uuid,
  certificate_code text
)
returns public.certificates
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.certificates;
begin
  insert into public.certificates (user_id, course_id, code)
  values (target_user, target_course, certificate_code)
  on conflict (user_id, course_id) do update
    set user_id = excluded.user_id
  returning * into result;

  return result;
end;
$$;

revoke all on function public.issue_certificate_trusted(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.issue_certificate_trusted(uuid, uuid, text) to service_role;

-- Learners may only submit a project after every lesson in that course is done.
drop policy if exists "Students submit their own projects" on public.project_submissions;
create policy "Students submit eligible projects"
  on public.project_submissions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.enrollments e
      where e.user_id = (select auth.uid()) and e.course_id = course_id
    )
    and not exists (
      select 1 from public.lessons l
      where l.course_id = course_id
        and not exists (
          select 1 from public.lesson_progress lp
          where lp.user_id = (select auth.uid()) and lp.lesson_id = l.id
        )
    )
  );
