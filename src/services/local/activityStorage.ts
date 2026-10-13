import type { Activity } from '../../models/activity.ts';

export interface ActivityDocument {
  schemaVersion: 1;
  project: string;
  ownerUserId: string;
  revision: number;
  activities: Activity[];
}
export type StoragePort = Pick<Storage, 'getItem' | 'setItem'>;
export type ExclusiveLock = <T>(name: string, action: () => T) => Promise<T>;

const stringFields = ['endDate', 'startTime', 'endTime', 'timeNote', 'locationId', 'locationName', 'locationCity', 'certaintyNote', 'teamCode', 'opponent', 'recurrenceSeriesId', 'recurrencePattern', 'originalDate', 'cancellationReason', 'notes'];
const boolFields = ['isAllDay', 'isTimePending', 'isEndTimeUnknown', 'isSportMatch', 'isHomeMatch', 'isTrip', 'isRecurrent', 'isOccurrenceException', 'isCancelled'];
const numberFields = ['travelBeforeMinutes', 'travelAfterMinutes', 'preparationMinutes'];
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function date(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function validateActivities(value: unknown): asserts value is Activity[] {
  if (!Array.isArray(value)) throw new Error('Formato de actividades no válido. Los datos se conservan.');
  const ids = new Set<string>();
  for (const a of value) {
    if (!record(a) || ['id', 'title', 'categoryId', 'createdAt'].some(k => typeof a[k] !== 'string' || !(a[k] as string).trim()) || !date(a.date) || !Number.isFinite(Date.parse(a.createdAt as string)) || !['confirmed', 'pending_time', 'probable', 'conditional'].includes(a.certainty as string)) throw new Error('Actividad no válida. Los datos se conservan.');
    if (ids.has(a.id as string)) throw new Error('Identificadores duplicados. Los datos se conservan.');
    ids.add(a.id as string);
    if (stringFields.some(k => a[k] !== undefined && typeof a[k] !== 'string') || boolFields.some(k => a[k] !== undefined && typeof a[k] !== 'boolean') || numberFields.some(k => a[k] !== undefined && (typeof a[k] !== 'number' || !Number.isFinite(a[k]) || a[k] < 0))) throw new Error('Campos de actividad no válidos.');
    for (const k of ['endDate', 'originalDate']) if (a[k] !== undefined && !date(a[k])) throw new Error('Fecha no válida.');
    for (const k of ['startTime', 'endTime']) if (a[k] !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(a[k] as string)) throw new Error('Hora no válida.');
    if (a.tripImpacts !== undefined && (!Array.isArray(a.tripImpacts) || a.tripImpacts.some(x => typeof x !== 'string'))) throw new Error('Impactos no válidos.');
    if (a.knownOverlap !== undefined && (!record(a.knownOverlap) || typeof a.knownOverlap.withActivityTitle !== 'string' || typeof a.knownOverlap.accepted !== 'boolean' || typeof a.knownOverlap.planNote !== 'string')) throw new Error('Solapamiento no válido.');
    if (a.returnTravelTransition !== undefined) {
      const t = a.returnTravelTransition;
      if (!record(t) || ['fromLocation', 'toLocation', 'departureEstimate', 'arrivalEstimate', 'notes'].some(k => t[k] !== undefined && typeof t[k] !== 'string') || (t.mode !== undefined && !['car', 'walk'].includes(t.mode as string)) || (t.durationEstimateMinutes !== undefined && (typeof t.durationEstimateMinutes !== 'number' || !Number.isFinite(t.durationEstimateMinutes) || t.durationEstimateMinutes < 0))) throw new Error('Transición no válida.');
    }
  }
}

export function createActivityStore(storage: StoragePort, project: string, userId: string, isCurrent: () => boolean, lock?: ExclusiveLock) {
  if (!project || !userId) throw new Error('Se necesita una identidad autenticada.');
  const key = `enka:${encodeURIComponent(project)}:activities:v1:${encodeURIComponent(userId)}`;
  let baseline: string | null = null;
  let loaded = false;
  let revision = 0;
  function load(): Activity[] {
    loaded = false;
    if (!isCurrent()) throw new Error('La sesión ha cambiado.');
    const raw = storage.getItem(key);
    let activities: Activity[] = [];
    let nextRevision = 0;
    if (raw !== null) {
      const d: unknown = JSON.parse(raw);
      if (!record(d) || d.schemaVersion !== 1 || d.project !== project || d.ownerUserId !== userId || !Number.isSafeInteger(d.revision) || (d.revision as number) < 0) throw new Error('Documento incompatible o de otra cuenta. Los datos se conservan.');
      validateActivities(d.activities);
      activities = d.activities;
      nextRevision = d.revision as number;
    }
    baseline = raw;
    revision = nextRevision;
    loaded = true;
    return activities;
  }
  async function save(activities: Activity[]): Promise<void> {
    if (!lock) throw new Error('Este navegador no permite guardar con protección entre pestañas.');
    validateActivities(activities);
    if (!Number.isSafeInteger(revision + 1)) throw new Error('La revisión del documento no permite más guardados.');
    // Serialize before waiting: callers cannot mutate the pending snapshot.
    const expectedBaseline = baseline;
    const raw = JSON.stringify({ schemaVersion: 1, project, ownerUserId: userId, revision: revision + 1, activities } satisfies ActivityDocument);
    await lock(key, () => {
      if (!isCurrent()) throw new Error('La sesión ha cambiado. No se ha guardado.');
      if (!loaded) throw new Error('El almacenamiento no está disponible.');
      if (baseline !== expectedBaseline || storage.getItem(key) !== baseline) throw new Error('Los datos cambiaron en otra pestaña. Recarga antes de guardar.');
      try { storage.setItem(key, raw); }
      catch { throw new Error('No se pudo guardar en este navegador. Los datos anteriores se conservan.'); }
      try {
        if (storage.getItem(key) !== raw) throw new Error('Verificación fallida');
      } catch {
        loaded = false;
        throw new Error('No se pudo verificar el guardado. Recarga para comprobar los datos.');
      }
      baseline = raw;
      revision += 1;
    });
  }
  return { key, load, save };
}
