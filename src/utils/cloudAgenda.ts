import type { Activity } from '../models/activity';
import type { DbActivity, DbRecurrenceRule, DbRecurrenceSlot, DbOccurrenceException } from '../services/enka/types';
import { formatLocalDateToISO, parseLocalDate } from './dateUtils';
import { getAlcantarillaWorkHoliday } from './workHolidays';

const hhmm = (value: string | null | undefined) => value?.slice(0, 5) || undefined;

export function convertCloudActivity(record: DbActivity): Activity | null {
  if (!record.start_date) return null;
  const details = record.metadata ?? {};
  const isFixture = Boolean(details.match_venue) || /bullense/i.test(record.title);
  const fixtureHasFixedSlot = isFixture && !record.is_date_pending && !record.is_time_pending && Boolean(record.start_time && record.end_time);
  return {
    id: record.id,
    title: record.title,
    categoryId: record.category_id ?? '',
    date: record.start_date,
    endDate: fixtureHasFixedSlot ? undefined : record.end_date ?? undefined,
    startTime: hhmm(record.start_time),
    endTime: hhmm(record.end_time),
    isAllDay: record.is_all_day && !record.metadata?.weekend_start,
    isTimePending: record.is_time_pending,
    isEndTimeUnknown: record.is_end_time_unknown,
    certainty: fixtureHasFixedSlot ? 'confirmed' : record.certainty === 'pending' ? 'pending_time' : record.certainty as Activity['certainty'],
    notes: isFixture ? (record.start_time ? 'Llegar al pabellón 1 hora antes.' : 'Día y hora por confirmar') :
      details.source?.startsWith('enka-') ? undefined : record.notes ?? undefined,
    timeNote: record.time_note ?? undefined,
    preparationMinutes: record.prep_before_minutes,
    isCancelled: record.status === 'cancelled',
    knownOverlap: details.conflict_decision === 'attend_both' ? { withActivityTitle: 'Otra actividad', accepted: true, planNote: 'Solapamiento aceptado' } : undefined,
    isTrip: !fixtureHasFixedSlot && Boolean(record.end_date && record.end_date !== record.start_date),
    isSportMatch: isFixture,
    isHomeMatch: details.match_venue === 'home' || (!details.match_venue && (/\\(casa\\)/i.test(record.title) || record.notes?.includes('Partido en Bullas'))),
    opponent: typeof details.opponent === 'string' ? details.opponent : undefined,
    locationId: record.location_id ?? undefined,
    locationName: typeof details.location_name === 'string' ? details.location_name : undefined,
    createdAt: record.created_at,
    source: 'cloud'
  };
}

function isoWeekday(date: Date): number {
  return date.getDay() || 7;
}

/** Bounded, read-only expansion. Nothing is inserted into Supabase or localStorage. */
export function expandWeeklyRecurrences(
  rules: DbRecurrenceRule[],
  slots: DbRecurrenceSlot[],
  exceptions: DbOccurrenceException[],
  startDate: string,
  endDate: string,
): Activity[] {
  const items: Activity[] = [];
  for (const rule of rules) {
    if (!rule.is_active || rule.frequency !== 'weekly') continue;
    const matchingSlots = slots.filter(s => s.recurrence_rule_id === rule.id);
    const from = parseLocalDate(rule.start_date > startDate ? rule.start_date : startDate);
    const to = parseLocalDate(rule.end_date && rule.end_date < endDate ? rule.end_date : endDate);
    const anchor = parseLocalDate(rule.start_date);
    const monday = (d: Date) => {
      const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      day.setDate(day.getDate() - (isoWeekday(day) - 1));
      return day;
    };
    const startMonday = monday(anchor).getTime();
    for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {
      const date = formatLocalDateToISO(day);
      const weekDifference = Math.round((monday(day).getTime() - startMonday) / 604800000);
      if (weekDifference % Math.max(1, rule.interval_count || 1) !== 0) continue;
      if (rule.title.startsWith('Trabajo · Syte Automation') && getAlcantarillaWorkHoliday(date)) continue;
      for (const slot of matchingSlots) {
        if (slot.weekday !== isoWeekday(day)) continue;
        const exception = exceptions.find(e => e.recurrence_rule_id === rule.id &&
          e.original_date === date && (!e.recurrence_slot_id || e.recurrence_slot_id === slot.id));
        if (exception && /cancel|skip|omit/i.test(exception.exception_type)) continue;
        // These two personal graduations supersede Friday handball attendance.
        // Keep the missed session visible as an absence, not as another confirmed commitment.
        // A saved exception takes priority if the user later changes her decision.
        const graduationAbsence = !exception &&
          rule.title.startsWith('Balonmano') &&
          (date === '2026-11-13' || date === '2026-11-27');

        if (graduationAbsence) continue;

        items.push({
          id: 'cloud-recurring:' + rule.id + ':' + slot.id + ':' + date,
          title: rule.title,
          categoryId: '',
          date: exception?.override_start_date ?? date,
          startTime: hhmm(exception?.override_start_time ?? slot.start_time),
          endTime: hhmm(exception?.override_end_time ?? slot.end_time),
          certainty: 'confirmed',
          isRecurrent: true,
          recurrenceSeriesId: rule.id,
          isOccurrenceException: Boolean(exception),
          // The routine English/handball overlap is already accepted by the
          // conflict detector. Do not repeat a decorative badge every week.
          // Preserve other explicitly accepted overlaps.
          knownOverlap: exception?.exception_type === 'overlap_accepted' &&
            !((isoWeekday(day) === 1 || isoWeekday(day) === 3) &&
              (/^Inglés\\s*·\\s*Academia Método/i.test(rule.title) ||
               /^Balonmano\\s*·\\s*(lunes|miércoles|miercoles)/i.test(rule.title)))
            ? { withActivityTitle: 'Otra actividad', accepted: true, planNote: 'Solapamiento aceptado' }
            : undefined,
          notes: undefined, // logistics belong in the planner, not the visible event description
          locationId: exception?.override_location_id ?? slot.location_id ?? undefined,
          preparationMinutes: slot.prep_before_minutes,
          createdAt: rule.created_at,
          source: 'cloud'
        });
      }

    }
  }
  return items;
}
