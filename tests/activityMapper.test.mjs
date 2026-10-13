import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/services/enka/activityMapper.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const { toDbActivity, fromDbActivity } = await import('data:text/javascript,' + encodeURIComponent(compiled));

test('maps activity into supported database fields and namespaced metadata', () => {
  const input = {
    id: 'temporary', title: 'Cita', categoryId: '', date: '2026-10-13',
    startTime: '09:30', certainty: 'confirmed', createdAt: '2026-10-13T00:00:00Z',
    preparationMinutes: 10, isCancelled: true, cancellationReason: 'No disponible'
  };
  const row = toDbActivity(input);
  assert.equal(row.start_date, '2026-10-13');
  assert.equal(row.category_id, null);
  assert.equal(row.prep_before_minutes, 10);
  assert.equal(row.metadata.enka_ui.isCancelled, true);
  assert.equal(row.metadata.enka_ui.cancellationReason, 'No disponible');
  assert.equal('user_id' in row, false);
  assert.equal('id' in row, false);
});

test('reads PostgreSQL time strings and preserves UI metadata', () => {
  const row = {
    id: 'uuid', title: 'Cita', category_id: null, location_id: null,
    recurrence_rule_id: null, start_date: '2026-10-13',
    start_time: '09:30:00', end_time: '10:00:00',
    is_all_day: false, is_end_time_unknown: false, is_time_pending: false,
    time_note: null, certainty: 'confirmed', certainty_note: null,
    prep_before_minutes: 10, notes: null,
    metadata: { enka_ui: { isCancelled: true, cancellationReason: 'Cancelada' } },
    created_at: '2026-10-13T00:00:00Z'
  };
  const act = fromDbActivity(row);
  assert.equal(act.startTime, '09:30');
  assert.equal(act.endTime, '10:00');
  assert.equal(act.isCancelled, true);
  assert.equal(act.categoryId, '');
  assert.equal(act.preparationMinutes, 10);
});

test('round-trip retains local-only logistics without adding unsupported columns', () => {
  const act = {
    id: 'x', title: 'Viaje', categoryId: 'cat', date: '2026-10-13',
    certainty: 'pending_time', createdAt: '2026-10-13T00:00:00Z',
    travelBeforeMinutes: 35, locationName: 'Estación'
  };
  const db = toDbActivity(act);
  assert.equal(db.metadata.enka_ui.travelBeforeMinutes, 35);
  assert.equal(db.metadata.enka_ui.locationName, 'Estación');
  assert.equal(db.travelBeforeMinutes, undefined);
});
