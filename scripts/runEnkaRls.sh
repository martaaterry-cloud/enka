#!/usr/bin/env bash
set -euo pipefail
: "${ENKA_TEST_CONTAINER:?Isolated PostgreSQL container is required}"
[[ "$ENKA_TEST_CONTAINER" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 2
docker exec -i "$ENKA_TEST_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 < tests/enkaRls.sql | grep -q ENKA_RLS_OK
echo 'Enka multi-user fictional RLS fixture passed'
