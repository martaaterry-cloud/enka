#!/usr/bin/env bash
set -euo pipefail
: "${ENKA_SCHEMA_TEST_CONTAINER:?Isolated PostgreSQL service container required}"
[[ "$ENKA_SCHEMA_TEST_CONTAINER" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 2
# Non-production fake Supabase Auth; real Enka DDL is piped from this checkout.
{
 cat <<'SQL'
\set ON_ERROR_STOP on
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
GRANT USAGE ON SCHEMA auth TO PUBLIC;
GRANT EXECUTE ON FUNCTION auth.uid() TO PUBLIC;
SQL
 cat supabase/migrations/20260929143000_create_enka_core.sql
 cat <<'SQL'
DO $verify$
DECLARE total integer;
BEGIN
 SELECT count(*) INTO total FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind='r' AND c.relname LIKE 'enka_%';
 IF total <> 11 THEN RAISE EXCEPTION 'EXPECTED_11_ENKA_TABLES_GOT_%',total; END IF;
 IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind='r' AND c.relname LIKE 'enka_%' AND NOT c.relrowsecurity)
 THEN RAISE EXCEPTION 'ENKA_TABLE_WITHOUT_RLS'; END IF;
 IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename LIKE 'enka_%' AND (qual NOT LIKE '%auth.uid()%' OR with_check NOT LIKE '%auth.uid()%'))
 THEN RAISE EXCEPTION 'ENKA_POLICY_OWNERSHIP_GAP'; END IF;
END $verify$;
SELECT 'ENKA_SCHEMA_REAL_DDL_OK';
SQL
} | docker exec -i "$ENKA_SCHEMA_TEST_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 | tee /tmp/enka-schema-log.txt
grep -q ENKA_SCHEMA_REAL_DDL_OK /tmp/enka-schema-log.txt
