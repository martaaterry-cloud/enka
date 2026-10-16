import type { Activity } from '../../models/activity';
import type { DbActivity } from '../../services/enka';
import { formatLocalDateToISO, getTodayDateString } from '../../utils/dateUtils';

type Suggestion = { date: string; start: string; end: string; label: string; reason: string };
const minute = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
const hhmm = (value: number) => String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0');
const gymTitle = /^(torso|pierna) [12]$/i;

export function suggestGymSlots(
  monday: Date, activities: Activity[], saved: DbActivity[], split: string,
  goalId?: string, categoryId?: string,
): Suggestion[] {
  const today = getTodayDateString();
  const proposals: Suggestion[] = [];
  for (let offset = 0; offset < 5; offset++) {
    const date = formatLocalDateToISO(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset));
    if (date < today) continue;
    if (saved.some(a => a.start_date === date && a.status !== 'cancelled' &&
      (a.planning_goal_id === goalId && Boolean(goalId) || (a.category_id === categoryId && Boolean(categoryId) && gymTitle.test(a.title)) || gymTitle.test(a.title)))) continue;

    const dayItems = activities.filter(a => a.date === date && !a.isCancelled);
    const uncertain = dayItems.some(a => a.isAllDay || a.isTimePending || !a.startTime);
    if (uncertain) continue;
    const matchDate = dayItems.some(a => a.isSportMatch);
    const nextDay = formatLocalDateToISO(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset + 1));
    const nextMatch = activities.some(a => a.date === nextDay && a.isSportMatch && !a.isCancelled);
    if (split.startsWith('Pierna') && (matchDate || nextMatch)) continue;
    const work = dayItems.some(a => /Trabajo · Syte Automation/i.test(a.title));
    // Only evaluate known commitments. Never assume user goes home after work.
    const searchStart = work ? 16 * 60 : 10 * 60;
    for (let start = searchStart; start + 90 <= 21 * 60; start += 30) {
      const end = start + 90;
      const occupied = dayItems.some(a => {
        if (!a.startTime || !a.endTime) return true;
        return start < minute(a.endTime) + 15 && end > minute(a.startTime) - 15;
      });
      if (occupied) continue;
      proposals.push({
        date, start: hhmm(start), end: hhmm(end),
        label: new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset)
          .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }),
        reason: work ? 'Después del trabajo; confirma desde dónde saldrás' : 'Sin compromisos confirmados en ese intervalo',
      });
      break;
    }
  }
  return proposals.slice(0, 4);
}
