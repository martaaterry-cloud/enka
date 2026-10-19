\set ON_ERROR_STOP on
-- PostgreSQL-only fictional fixture; no Supabase connections.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $f$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $f$;
GRANT USAGE ON SCHEMA auth TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth.uid() TO PUBLIC;
CREATE TABLE public.enka_activities(id uuid PRIMARY KEY,user_id uuid NOT NULL,title text);
ALTER TABLE public.enka_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY own ON public.enka_activities FOR ALL USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);
GRANT SELECT ON public.enka_activities TO anon;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.enka_activities TO authenticated;
INSERT INTO enka_activities VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','fictional A'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','fictional B');
SET ROLE anon;
DO $test$ BEGIN IF (SELECT count(*) FROM enka_activities) <> 0 THEN RAISE EXCEPTION 'ANON_LEAK'; END IF; END $test$;
RESET ROLE;
SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',false);
DO $test$ BEGIN IF (SELECT count(*) FROM enka_activities) <> 1 THEN RAISE EXCEPTION 'USER_A_ISOLATION'; END IF; END $test$;
DELETE FROM enka_activities WHERE title='fictional B';
DO $test$ BEGIN IF (SELECT count(*) FROM enka_activities) <> 1 THEN RAISE EXCEPTION 'USER_A_DELETE'; END IF; END $test$;
RESET ROLE;
DO $test$ BEGIN IF (SELECT count(*) FROM enka_activities)<>2 THEN RAISE EXCEPTION 'ROW_LOST'; END IF; END $test$;
SELECT 'ENKA_RLS_OK' AS result;
