/**
 * ENKA Date Utilities
 * All date calculations use the user's local timezone (device clock).
 * Never forces UTC or hardcoded mock dates for current date decisions.
 */

/**
 * Formats a Date object to YYYY-MM-DD using local device calendar.
 */
export function formatLocalDateToISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's date in YYYY-MM-DD format based on the device's local clock.
 */
export function getTodayDateString(): string {
  return formatLocalDateToISO(new Date());
}

/**
 * Returns tomorrow's date in YYYY-MM-DD format based on the device's local clock.
 */
export function getTomorrowDateString(): string {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return formatLocalDateToISO(tomorrow);
}

/**
 * Parses a YYYY-MM-DD string into a Date object representing midnight in local time.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

/**
 * Formats a YYYY-MM-DD date into a full Spanish heading (e.g. "Miércoles, 30 de septiembre").
 */
export function formatSpanishDateHeader(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const formatted = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formats a YYYY-MM-DD date into a short Spanish format (e.g. "Mié, 30 Sep").
 */
export function formatShortSpanishDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const day = date.getDate();
  const capWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  const capMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capWeekday}, ${day} ${capMonth}`;
}

/**
 * Returns relative day label: 'Hoy', 'Mañana', 'Ayer', or capitalized weekday name.
 */
export function getRelativeDayLabel(targetDateStr: string, baseDateStr: string = getTodayDateString()): string {
  if (targetDateStr === baseDateStr) return 'Hoy';

  const target = parseLocalDate(targetDateStr);
  const base = parseLocalDate(baseDateStr);

  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';

  const dayName = target.toLocaleDateString('es-ES', { weekday: 'long' });
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

/**
 * Returns a polite Spanish greeting based on current local hour.
 */
export function getDayGreeting(now: Date = new Date()): string {
  const hour = now.getHours();
  if (hour < 14) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Calculates ISO 8601 week number for a given date.
 */
export function getISOWeekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Computes week range info (e.g. "Semana 40 (28 Sep – 04 Oct)") for the week containing `date`.
 */
export function getWeekRange(date: Date = new Date()): {
  weekNumber: number;
  mondayDate: Date;
  sundayDate: Date;
  mondayStr: string;
  sundayStr: string;
  formattedRange: string;
} {
  const dayOfWeek = date.getDay();
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + distanceToMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

  const weekNumber = getISOWeekNumber(monday);

  const mondayMonth = monday.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const sundayMonth = sunday.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');

  const mondayFormatted = `${monday.getDate()} ${mondayMonth.charAt(0).toUpperCase() + mondayMonth.slice(1)}`;
  const sundayFormatted = `${String(sunday.getDate()).padStart(2, '0')} ${sundayMonth.charAt(0).toUpperCase() + sundayMonth.slice(1)}`;

  return {
    weekNumber,
    mondayDate: monday,
    sundayDate: sunday,
    mondayStr: formatLocalDateToISO(monday),
    sundayStr: formatLocalDateToISO(sunday),
    formattedRange: `Semana ${weekNumber} (${mondayFormatted} – ${sundayFormatted})`
  };
}

/**
 * Finds the next upcoming activity from a list of activities scheduled for today.
 */
export function findNextUpcomingActivity<T extends { startTime?: string }>(activities: T[]): T | null {
  if (activities.length === 0) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcoming = activities.find((a) => {
    if (!a.startTime) return false;
    const [h, m] = a.startTime.split(':').map(Number);
    return (h * 60 + (m || 0)) >= currentMinutes;
  });

  return upcoming || activities[0] || null;
}

/**
 * Calculates human-readable relative time text to an upcoming activity start time.
 */
export function getRelativeTimeText(startTime?: string): string {
  if (!startTime) return 'A continuación';
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = startTime.split(':').map(Number);
  const targetMinutes = h * 60 + (m || 0);
  const diff = targetMinutes - currentMinutes;

  if (diff < 0) return 'En curso';
  if (diff === 0) return 'Ahora';
  if (diff < 60) return `En ${diff} min`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `En ${hours} h ${mins} min` : `En ${hours} h`;
}



