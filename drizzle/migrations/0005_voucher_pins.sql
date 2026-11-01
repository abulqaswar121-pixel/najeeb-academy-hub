CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  tier text NOT NULL,
  retail_ngn integer NOT NULL,
  wholesale_ngn integer NOT NULL,
  buyer_id uuid NOT NULL,
  payment_reference text NOT NULL,
  status text NOT NULL DEFAULT 'unused',
  redeemed_by uuid,
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX vouchers_buyer_idx ON public.vouchers(buyer_id);
CREATE INDEX vouchers_ref_idx ON public.vouchers(payment_reference);
GRANT SELECT ON public.vouchers TO authenticated;
GRANT ALL ON public.vouchers TO service_role;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents read their own vouchers" ON public.vouchers FOR SELECT TO authenticated USING (buyer_id = (SELECT auth.uid()));
CREATE POLICY "Admins read all vouchers" ON public.vouchers FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.voucher_attempts (
  user_id uuid NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX voucher_attempts_idx ON public.voucher_attempts(user_id, attempted_at);
GRANT ALL ON public.voucher_attempts TO service_role;
ALTER TABLE public.voucher_attempts ENABLE ROW LEVEL SECURITY;

-- Creates PINs after a verified wholesale payment. Server only; one batch per payment.
CREATE FUNCTION public.issue_vouchers(target_user uuid, tier_id text, qty integer, payment_reference text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public, extensions AS $$
DECLARE retail integer; wholesale integer; alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; c text; i integer; made integer := 0; b bytea;
BEGIN
  IF tier_id='starter' THEN retail:=3000; wholesale:=1500;
  ELSIF tier_id='skill' THEN retail:=6500; wholesale:=3500;
  ELSIF tier_id='pro' THEN retail:=12000; wholesale:=6500;
  ELSIF tier_id='all' THEN retail:=25000; wholesale:=15000;
  ELSE RAISE EXCEPTION 'Unknown pass.'; END IF;
  IF qty < 1 OR qty > 50 THEN RAISE EXCEPTION 'Quantity must be 1 to 50.'; END IF;
  IF payment_reference IS NULL OR length(payment_reference)=0 THEN RAISE EXCEPTION 'Payment reference required.'; END IF;
  PERFORM pg_advisory_xact_lock(hashtext(payment_reference));
  IF EXISTS (SELECT 1 FROM public.vouchers v WHERE v.payment_reference = issue_vouchers.payment_reference) THEN RETURN 0; END IF;
  WHILE made < qty LOOP
    b := gen_random_bytes(12);
    c := 'NDH-';
    FOR i IN 0..11 LOOP
      c := c || substr(alphabet, (get_byte(b, i) % 32) + 1, 1);
      IF i IN (3, 7) THEN c := c || '-'; END IF;
    END LOOP;
    BEGIN
      INSERT INTO public.vouchers(code, tier, retail_ngn, wholesale_ngn, buyer_id, payment_reference)
      VALUES (c, tier_id, retail, wholesale, target_user, issue_vouchers.payment_reference);
      made := made + 1;
    EXCEPTION WHEN unique_violation THEN NULL;
    END;
  END LOOP;
  RETURN made;
END; $$;
REVOKE ALL ON FUNCTION public.issue_vouchers(uuid,text,integer,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_vouchers(uuid,text,integer,text) TO service_role;

-- A signed-in student redeems a PIN once. Max 10 tries per 10 minutes.
CREATE FUNCTION public.redeem_voucher(pin text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); v public.vouchers%ROWTYPE; clean text; credits integer; unlimited boolean := false;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Please log in to continue.'; END IF;
  IF (SELECT count(*) FROM public.voucher_attempts WHERE user_id=uid AND attempted_at > now() - interval '10 minutes') >= 10 THEN
    RAISE EXCEPTION 'Too many tries. Please wait 10 minutes.';
  END IF;
  INSERT INTO public.voucher_attempts(user_id) VALUES (uid);
  clean := upper(regexp_replace(coalesce(pin,''), '[^A-Za-z0-9]', '', 'g'));
  IF left(clean,3) <> 'NDH' OR length(clean) <> 15 THEN RAISE EXCEPTION 'This PIN is not valid.'; END IF;
  clean := 'NDH-' || substr(clean,4,4) || '-' || substr(clean,8,4) || '-' || substr(clean,12,4);
  SELECT * INTO v FROM public.vouchers WHERE code = clean FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This PIN is not valid.'; END IF;
  IF v.status <> 'unused' THEN RAISE EXCEPTION 'This PIN has already been used.'; END IF;
  IF v.tier='starter' THEN credits:=3; ELSIF v.tier='skill' THEN credits:=8; ELSIF v.tier='pro' THEN credits:=18; ELSE credits:=0; unlimited:=true; END IF;
  INSERT INTO public.pass_wallets(user_id) VALUES(uid) ON CONFLICT DO NOTHING;
  UPDATE public.pass_wallets SET credits_total=credits_total+credits, all_access=all_access OR unlimited,
    "references"=array_append("references", 'pin:'||v.code), updated_at=now() WHERE user_id=uid;
  UPDATE public.vouchers SET status='used', redeemed_by=uid, redeemed_at=now() WHERE id=v.id;
  RETURN v.tier;
END; $$;
REVOKE ALL ON FUNCTION public.redeem_voucher(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_voucher(text) TO authenticated;