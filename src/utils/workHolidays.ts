/** Calendario laboral 2026 para el centro de trabajo de Alcantarilla (Murcia).
 * Fuentes: calendario laboral Región de Murcia y BORM 163/2025 para festivos locales.
 * No implica que todas las actividades personales se cancelen en festivo.
 * Las posibles excepciones por turnos o convenio se gestionan por separado.
 */
export const ALCANTARILLA_WORK_HOLIDAYS_2026: Readonly<Record<string, string>> = {
  '2026-01-01': 'Año Nuevo',
  '2026-01-06': 'Reyes',
  '2026-03-19': 'San José',
  '2026-04-02': 'Jueves Santo',
  '2026-04-03': 'Viernes Santo',
  '2026-05-01': 'Día del Trabajo',
  '2026-05-29': 'Festivo local de Alcantarilla',
  '2026-06-09': 'Día de la Región de Murcia',
  '2026-08-15': 'Asunción',
  '2026-09-15': 'Festivo local de Alcantarilla',
  '2026-10-12': 'Fiesta Nacional de España',
  '2026-11-01': 'Todos los Santos',
  '2026-12-07': 'Traslado del Día de la Constitución',
  '2026-12-08': 'Inmaculada Concepción',
  '2026-12-25': 'Navidad',
};
export function getAlcantarillaWorkHoliday(date: string): string | null {
  return ALCANTARILLA_WORK_HOLIDAYS_2026[date] ?? null;
}
