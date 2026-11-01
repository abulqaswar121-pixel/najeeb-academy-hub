CREATE TYPE public.app_role AS ENUM ('admin', 'student');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL DEFAULT 'student', UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
INSERT INTO public.user_roles(user_id,role) SELECT id, 'admin'::public.app_role FROM public.profiles WHERE role='admin' ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role='admin'); $$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
COMMENT ON COLUMN public.profiles.role IS 'DEPRECATED: authorization uses protected public.user_roles, not editable profiles.';
CREATE TABLE public.pass_wallets (user_id uuid PRIMARY KEY, all_access boolean NOT NULL DEFAULT false, credits_total integer NOT NULL DEFAULT 0 CHECK(credits_total >= 0), credits_used integer NOT NULL DEFAULT 0 CHECK(credits_used >= 0 AND credits_used <= credits_total), "references" text[] NOT NULL DEFAULT '{}', updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.pass_wallets TO authenticated;
GRANT ALL ON public.pass_wallets TO service_role;
ALTER TABLE public.pass_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own wallet" ON public.pass_wallets FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
CREATE POLICY "Admins read wallets" ON public.pass_wallets FOR SELECT TO authenticated USING(public.is_admin());
CREATE FUNCTION public.unlock_course_with_pass(target_course uuid) RETURNS SETOF public.enrollments LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); wallet public.pass_wallets%ROWTYPE;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Please log in to continue.'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.courses WHERE id=target_course AND is_published AND deleted_at IS NULL) THEN RAISE EXCEPTION 'Course not found.'; END IF;
 INSERT INTO public.pass_wallets(user_id) VALUES(uid) ON CONFLICT DO NOTHING;
 SELECT * INTO wallet FROM public.pass_wallets WHERE user_id=uid FOR UPDATE;
 IF EXISTS(SELECT 1 FROM public.enrollments WHERE user_id=uid AND course_id=target_course) THEN RETURN QUERY SELECT * FROM public.enrollments WHERE user_id=uid AND course_id=target_course; RETURN; END IF;
 IF NOT wallet.all_access AND wallet.credits_used >= wallet.credits_total THEN RAISE EXCEPTION 'Get a course pass to unlock this course.'; END IF;
 IF NOT wallet.all_access THEN UPDATE public.pass_wallets SET credits_used=credits_used+1,updated_at=now() WHERE user_id=uid; END IF;
 RETURN QUERY INSERT INTO public.enrollments(user_id,course_id) VALUES(uid,target_course) RETURNING *;
END; $$;
REVOKE ALL ON FUNCTION public.unlock_course_with_pass(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_course_with_pass(uuid) TO authenticated;
REVOKE INSERT ON public.enrollments FROM authenticated;
CREATE FUNCTION public.redeem_course_pass(target_user uuid, tier_id text, payment_reference text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE credits integer; unlimited boolean := false; wallet public.pass_wallets%ROWTYPE;
BEGIN
 IF tier_id='starter' THEN credits:=3; ELSIF tier_id='skill' THEN credits:=8; ELSIF tier_id='pro' THEN credits:=18; ELSIF tier_id='all' THEN credits:=0; unlimited:=true; ELSE RAISE EXCEPTION 'Unknown pass.'; END IF;
 IF payment_reference IS NULL OR length(payment_reference)=0 THEN RAISE EXCEPTION 'Payment reference required.'; END IF;
 INSERT INTO public.pass_wallets(user_id) VALUES(target_user) ON CONFLICT DO NOTHING;
 SELECT * INTO wallet FROM public.pass_wallets WHERE user_id=target_user FOR UPDATE;
 IF payment_reference=ANY(wallet."references") THEN RETURN; END IF;
 UPDATE public.pass_wallets SET credits_total=credits_total+credits, all_access=all_access OR unlimited, "references"=array_append("references",payment_reference),updated_at=now() WHERE user_id=target_user;
END; $$;
REVOKE ALL ON FUNCTION public.redeem_course_pass(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_course_pass(uuid,text,text) TO service_role;