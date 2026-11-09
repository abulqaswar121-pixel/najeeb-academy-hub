CREATE TABLE public.assessment_passes (
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  score integer NOT NULL DEFAULT 0,
  passed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);
GRANT SELECT, INSERT ON public.assessment_passes TO authenticated;
GRANT ALL ON public.assessment_passes TO service_role;
ALTER TABLE public.assessment_passes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own passes" ON public.assessment_passes FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Students record own passes" ON public.assessment_passes FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Admins read passes" ON public.assessment_passes FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Students receive their own certificates" ON public.certificates;

CREATE OR REPLACE FUNCTION public.admin_review_project(submission uuid, new_status text, note text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE s public.project_submissions%ROWTYPE; c text; alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea; i int;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Admin access required.'; END IF;
  IF new_status NOT IN ('approved','changes_requested','pending') THEN RAISE EXCEPTION 'Unknown status.'; END IF;
  SELECT * INTO s FROM public.project_submissions WHERE id = submission FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Submission not found.'; END IF;
  UPDATE public.project_submissions SET status = new_status, feedback = nullif(trim(coalesce(note,'')),''), reviewed_at = now() WHERE id = submission;
  IF new_status = 'approved' THEN
    SELECT code INTO c FROM public.certificates WHERE user_id = s.user_id AND course_id = s.course_id;
    IF c IS NULL THEN
      b := gen_random_bytes(8); c := 'NDH-';
      FOR i IN 0..7 LOOP c := c || substr(alphabet, (get_byte(b,i) % 32) + 1, 1); IF i = 3 THEN c := c || '-'; END IF; END LOOP;
      INSERT INTO public.certificates(user_id, course_id, code) VALUES (s.user_id, s.course_id, c);
    END IF;
    RETURN c;
  END IF;
  RETURN NULL;
END; $$;
REVOKE ALL ON FUNCTION public.admin_review_project(uuid, text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_project(uuid, text, text) TO authenticated;