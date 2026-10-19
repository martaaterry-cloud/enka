# P0 shared Supabase security review — documentation only

This Enka repository uses the same Supabase project as PocketFlow: `xcarqzopfaozxugfhslo`.

## Confirmed
- Enka tables have RLS policies checking `auth.uid() = user_id`.
- No `enka_*` table is present in `supabase_realtime`; the current frontend relies on explicit refresh/focus events.
- The Enka schema exists live, but `20260929143000_create_enka_core.sql` is missing from the live migration ledger.
- `anon`/`authenticated` have broad table-level TRUNCATE and TRIGGER grants on Enka tables; RLS does **not** protect TRUNCATE.
- Composite foreign keys protect user-scoped associations.

## Cross-repository coordination
Canonical shared-database P0 proposal and SELECT-only verification are prepared in the PocketFlow draft PR, under `docs/p0-security-rollout-20261019.md` and `docs/sql/`. Do **not** apply migration SQL from both repositories. Agree on one migration history owner first.

## Enka-specific acceptance tests in staging
1. User A create/edit/delete activity; verify affected row count and refresh in same session.
2. User B must not observe or mutate any A activity, recurrence, slot, or exception.
3. Deleting a rule with dependent slots/exceptions must give a truthful failure or a controlled dependency resolution.
4. After a reconnect, full server reconciliation must restore accurate calendar state.
5. No code or schema changes to production under this review PR.

## Needed next
After P0 permissions and drift are validated independently, prepare a **separate** Realtime Enka PR and staging-only publication change with a reconnect fallback.
