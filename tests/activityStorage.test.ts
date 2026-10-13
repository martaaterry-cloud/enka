import { describe, it, expect, vi } from 'vitest';
import { createActivityStore, type ExclusiveLock } from '../src/services/local/activityStorage';
import { captureAuthIdentity, setAuthIdentity } from '../src/context/authIdentity';
import type { Activity } from '../src/models/activity';
const activity: Activity = { id: 'a', title: 'Prueba simulada', categoryId: 'c', date: '2026-10-13', certainty: 'confirmed', createdAt: '2026-10-13T10:00:00Z' };
function memory() {
  const data = new Map<string, string>();
  return { data, getItem: vi.fn((k: string) => data.get(k) ?? null), setItem: vi.fn((k: string, v: string) => { data.set(k, v); }) };
}
const lock: ExclusiveLock = async (_name, action) => action();
describe('almacenamiento local protegido', () => {
  it('conserva el legado y el marcador sin leerlos ni atribuirlos', async () => {
    const s = memory(); s.data.set('enka:activities', '[datos antiguos sin propietario]'); s.data.set('enka:reset-2026-10', 'otro');
    const store = createActivityStore(s, 'project', 'A', () => true, lock);
    expect(store.load()).toEqual([]); await store.save([activity]);
    expect(s.data.get('enka:activities')).toBe('[datos antiguos sin propietario]'); expect(s.data.get('enka:reset-2026-10')).toBe('otro');
    expect(s.getItem.mock.calls.every(([k]) => k === store.key)).toBe(true);
    expect(s.setItem.mock.calls.every(([k]) => k === store.key)).toBe(true);
  });
  it.each([null, 'complete', 'inesperado'])('conserva un legado válido con marcador %s', async marker => {
    const s = memory(); const raw = JSON.stringify([activity]); s.data.set('enka:activities', raw);
    if (marker !== null) s.data.set('enka:reset-2026-10', marker);
    const a = createActivityStore(s, 'project', 'A', () => true, lock); expect(a.load()).toEqual([]); await a.save([]);
    expect(s.data.get('enka:activities')).toBe(raw); expect(s.data.get('enka:reset-2026-10') ?? null).toBe(marker);
  });
  it('separa cuentas y proyectos, y conserva cambios tras recargar', async () => {
    const s = memory(); const a = createActivityStore(s, 'project', 'A', () => true, lock); a.load(); await a.save([activity]);
    expect(createActivityStore(s, 'project', 'B', () => true, lock).load()).toEqual([]);
    expect(createActivityStore(s, 'otro', 'A', () => true, lock).load()).toEqual([]);
    expect(createActivityStore(s, 'project', 'A', () => true, lock).load()).toEqual([activity]);
    expect(JSON.parse(s.data.get(a.key)!)).toMatchObject({ schemaVersion: 1, project: 'project', ownerUserId: 'A', revision: 1 });
  });
  it.each(['{mal', '[]', '{"schemaVersion":2}', '{"schemaVersion":1,"project":"project","ownerUserId":"B","revision":0,"activities":[]}'])('no sobrescribe documento inválido: %s', async raw => {
    const s = memory(); const a = createActivityStore(s, 'project', 'A', () => true, lock); s.data.set(a.key, raw);
    expect(() => a.load()).toThrow(); await expect(a.save([activity])).rejects.toThrow(); expect(s.data.get(a.key)).toBe(raw);
  });
  it.each([{ date: '2026-02-30' }, { title: 2 }, { startTime: '25:00' }, { isCancelled: 'sí' }, { travelBeforeMinutes: -1 }, { returnTravelTransition: [] }, { knownOverlap: {} }])('rechaza datos inválidos antes de escribir: %o', async bad => {
    const s = memory(); const a = createActivityStore(s, 'p', 'A', () => true, lock); a.load();
    await expect(a.save([{ ...activity, ...bad } as Activity])).rejects.toThrow(); expect(s.setItem).not.toHaveBeenCalled();
  });
  it('rechaza IDs duplicados', async () => {
    const s = memory(); const a = createActivityStore(s, 'p', 'A', () => true, lock); a.load(); await expect(a.save([activity, activity])).rejects.toThrow();
  });
  it('conserva datos ante cuota agotada y permite reintentar', async () => {
    const s = memory(); const a = createActivityStore(s, 'p', 'A', () => true, lock); a.load(); await a.save([activity]); const raw = s.data.get(a.key);
    s.setItem.mockImplementationOnce(() => { throw new DOMException('quota', 'QuotaExceededError'); });
    await expect(a.save([])).rejects.toThrow('No se pudo guardar'); expect(s.data.get(a.key)).toBe(raw);
    await a.save([]); expect(a.load()).toEqual([]);
  });
  it('bloquea edición ante fallo de lectura o falta de bloqueo seguro', async () => {
    const s = memory(); s.getItem.mockImplementation(() => { throw new DOMException('denied', 'SecurityError'); });
    const a = createActivityStore(s, 'p', 'A', () => true, lock); expect(() => a.load()).toThrow(); expect(s.setItem).not.toHaveBeenCalled();
    const b = createActivityStore(memory(), 'p', 'A', () => true); b.load(); await expect(b.save([activity])).rejects.toThrow('protección entre pestañas');
  });
  it('detecta cambios de otra pestaña sin reemplazarlos', async () => {
    const s = memory(); const a = createActivityStore(s, 'p', 'A', () => true, lock); const b = createActivityStore(s, 'p', 'A', () => true, lock); a.load(); b.load();
    await a.save([activity]); const raw = s.data.get(a.key); await expect(b.save([])).rejects.toThrow('otra pestaña'); expect(s.data.get(a.key)).toBe(raw);
  });
  it('invalida un guardado pendiente al cambiar cuenta, cerrar sesión o volver a A', async () => {
    for (const next of ['B', null, 'A']) {
      setAuthIdentity('A'); const current = captureAuthIdentity('A'); const s = memory(); let release!: () => void;
      const delayed: ExclusiveLock = (_name, action) => new Promise((resolve, reject) => { release = () => { try { resolve(action()); } catch (e) { reject(e); } }; });
      const a = createActivityStore(s, 'p', 'A', current, delayed); a.load(); const pending = a.save([activity]);
      setAuthIdentity(null); setAuthIdentity(next); release(); await expect(pending).rejects.toThrow('sesión'); expect(s.setItem).not.toHaveBeenCalled();
    }
  });
  it('detecta escritura no verificable y bloquea más guardados hasta recargar', async () => {
    const s = memory(); const a = createActivityStore(s, 'p', 'A', () => true, lock); a.load(); s.setItem.mockImplementation(() => {});
    await expect(a.save([activity])).rejects.toThrow('verificar'); await expect(a.save([])).rejects.toThrow('no está disponible');
  });
});

describe('escrituras pendientes', () => {
  it('rechaza dos snapshots concurrentes de la misma instancia', async () => {
    const s = memory(); const actions: Array<() => void> = [];
    const queued: ExclusiveLock = (_name, action) => new Promise((resolve, reject) => { actions.push(() => { try { resolve(action()); } catch (error) { reject(error); } }); });
    const a = createActivityStore(s, 'p', 'A', () => true, queued); a.load();
    const first = a.save([activity]); const second = a.save([]);
    actions.shift()!(); await first; actions.shift()!(); await expect(second).rejects.toThrow('otra pestaña');
    expect(a.load()).toEqual([activity]);
  });
  it('una lectura fallida después del setItem no autoriza escrituras adicionales', async () => {
    const s = memory(); const a = createActivityStore(s, 'p', 'A', () => true, lock); a.load();
    s.setItem.mockImplementation((key, raw) => { s.data.set(key, raw); s.getItem.mockImplementation(() => { throw new Error('simulated unavailable'); }); });
    await expect(a.save([activity])).rejects.toThrow('verificar');
    s.getItem.mockImplementation(key => s.data.get(key) ?? null);
    await expect(a.save([])).rejects.toThrow('no está disponible'); expect(a.load()).toEqual([activity]);
  });
});

// Reproduction of the previously published initializer, only on a synthetic Map.
// This documents a release blocker, not a behavior implemented by the new store.
it('una versión antigua aún puede borrar el legado sin marcador, aunque exista un documento nuevo', async () => {
  const s = memory(); s.data.set('enka:activities', JSON.stringify([activity]));
  const a = createActivityStore(s, 'project', 'A', () => true, lock); a.load(); await a.save([activity]); const protectedRaw = s.data.get(a.key);
  if (s.data.get('enka:reset-2026-10') !== 'complete') {
    s.data.delete('enka:activities'); s.data.set('enka:reset-2026-10', 'complete');
  }
  expect(s.data.has('enka:activities')).toBe(false); expect(s.data.get(a.key)).toBe(protectedRaw);
});
