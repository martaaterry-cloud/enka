import type { Activity } from '../../models/activity';
import type { DbActivity } from './types';

/** Only fields understood by the existing database schema are written as columns.
 * Extra Enka UI properties live in a namespaced metadata object.
 */
const UI_FIELDS = [
  'locationName', 'locationCity', 'travelBeforeMinutes', 'travelAfterMinutes',
  'returnTravelTransition', 'knownOverlap', 'isSportMatch', 'teamCode',
  'isHomeMatch', 'opponent', 'isTrip', 'tripImpacts', 'recurrencePattern',
  'isOccurrenceException', 'originalDate', 'isCancelled', 'cancellationReason',
  'preparationMinutes', 'endDate'
] as const;

type WritableActivity = Omit<DbActivity, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type ActivityInsert = Partial<WritableActivity> & Pick<WritableActivity, 'title'>;

export function toDbActivity(activity: Activity): ActivityInsert {
  const extras: Record<string, unknown> = {};
  const source = activity as unknown as Record<string, unknown>;
  for (const key of UI_FIELDS) {
    if (source[key] !== undefined) extras[key] = source[key];
  }
  return {
    title: activity.title,
    category_id: activity.categoryId || null,
    location_id: activity.locationId || null,
    recurrence_rule_id: activity.recurrenceSeriesId || null,
    start_date: activity.date,
    end_date: activity.endDate || null,
    start_time: activity.startTime || null,
    end_time: activity.endTime || null,
    is_all_day: Boolean(activity.isAllDay),
    is_end_time_unknown: Boolean(activity.isEndTimeUnknown),
    is_time_pending: Boolean(activity.isTimePending),
    time_note: activity.timeNote || null,
    certainty: activity.certainty,
    certainty_note: activity.certaintyNote || null,
    prep_before_minutes: activity.preparationMinutes ?? 0,
    notes: activity.notes || null,
    metadata: { enka_ui: extras },
  };
}

export function fromDbActivity(row: DbActivity): Activity {
  const raw = row.metadata?.enka_ui;
  const extras = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? raw as Partial<Activity>
    : {};
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id || '',
    date: row.start_date || '',
    startTime: row.start_time?.slice(0, 5) || undefined,
    endTime: row.end_time?.slice(0, 5) || undefined,
    isAllDay: row.is_all_day,
    isTimePending: row.is_time_pending,
    isEndTimeUnknown: row.is_end_time_unknown,
    timeNote: row.time_note || undefined,
    locationId: row.location_id || undefined,
    certainty: (row.certainty || 'confirmed') as Activity['certainty'],
    certaintyNote: row.certainty_note || undefined,
    recurrenceSeriesId: row.recurrence_rule_id || undefined,
    isRecurrent: Boolean(row.recurrence_rule_id),
    preparationMinutes: row.prep_before_minutes,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    ...extras,
  };
}
