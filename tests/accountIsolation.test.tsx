import React, { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { App } from '../src/App';
import { useEnka } from '../src/context/useEnka';
import { setAuthIdentity } from '../src/context/authIdentity';
import { createActivityStore } from '../src/services/local/activityStorage';
import type { EnkaContextType } from '../src/context/enkaContextCore';

const auth = vi.hoisted(() => ({ callback: null as null | ((event: string, session: unknown) => void), initial: null as unknown, initialPromise: null as Promise<unknown> | null }));
vi.mock('../src/services/supabase/supabaseClient', () => ({
  SUPABASE_PROJECT_URL: 'https://simulated.invalid',
  getSupabase: () => ({ auth: {
    getSession: () => auth.initialPromise ?? Promise.resolve({ data: { session: auth.initial } }),
    onAuthStateChange: (callback: typeof auth.callback) => { auth.callback = callback; return { data: { subscription: { unsubscribe() { auth.callback = null; } } } }; },
  } }),
  signOut: async () => { auth.callback?.('SIGNED_OUT', null); },
}));
vi.mock('../src/services/enka', () => ({ enkaRepository: { fetchCategories: async () => ({ data: [], error: null }), fetchLocations: async () => ({ data: [], error: null }) } }));
vi.mock('../src/components/layout/AppLayout', () => ({ AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('../src/features/auth/LoginPage', () => ({ LoginPage: () => <div>Sesión cerrada</div> }));
vi.mock('../src/features/calendar/CalendarView', () => ({ CalendarView: () => null }));
vi.mock('../src/features/planning/PlanningView', () => ({ PlanningView: () => null }));
vi.mock('../src/features/more/MoreView', () => ({ MoreView: () => null }));
vi.mock('../src/features/create/CreateActivityModal', () => ({ CreateActivityModal: () => null }));
vi.mock('../src/features/detail/ActivityDetailModal', () => ({ ActivityDetailModal: () => null }));
let context: EnkaContextType;
const renders: string[][] = [];
vi.mock('../src/features/today/TodayView', () => ({ TodayView: () => {
  context = useEnka(); renders.push(context.activities.map(a => a.title));
  return <div>{context.activities.map(a => <span key={a.id}>{a.title}</span>)}<span>{context.selectedActivity?.title}</span></div>;
} }));
const fixture = { id: 'a', title: 'Privado A', categoryId: 'c', date: '2026-10-13', certainty: 'confirmed' as const, createdAt: '2026-10-13T10:00:00Z' };
function session(id: string) { return { user: { id } }; }
async function emit(id: string | null) { await act(async () => { auth.callback?.('CHANGE', id ? session(id) : null); }); }
async function start() {
  // Flush Auth initialization and passive mount effects before invoking context callbacks.
  await act(async () => { render(<StrictMode><App /></StrictMode>); });
  await screen.findByText('Privado A');
}
beforeEach(async () => {
  localStorage.clear(); renders.length = 0; setAuthIdentity(null); auth.initial = session('A'); auth.initialPromise = null;
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) });
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: async (_key: string, action: () => unknown) => action() } });
  const store = createActivityStore(localStorage, 'https://simulated.invalid', 'A', () => true, async (_k, fn) => fn());
  store.load(); await store.save([fixture]);
  localStorage.setItem('enka:activities', '[legado simulado]');
});
afterEach(() => { vi.restoreAllMocks(); cleanup(); localStorage.clear(); setAuthIdentity(null); });
describe('integración AuthGate / EnkaProvider', () => {
  it('ignora una respuesta inicial de sesión anterior a un evento de B', async () => {
    let resolve!: (value: unknown) => void;
    auth.initialPromise = new Promise(done => { resolve = done; });
    render(<App />); await emit('B'); renders.length = 0;
    await act(async () => { resolve({ data: { session: session('A') } }); });
    expect(context.activities).toEqual([]); expect(renders.every(titles => !titles.includes('Privado A'))).toBe(true);
  });
  it('refrescar la sesión de A conserva su estado personal', async () => {
    await start(); await act(async () => { context.openDetailModal(fixture); });
    await emit('A'); expect(context.selectedActivity).toEqual(fixture); expect(context.activities).toEqual([fixture]);
  });
  it('un callback retenido de A no escribe después de entrar B', async () => {
    await start(); const stale = context.addActivity; await emit('B');
    await act(async () => { expect(await stale({ ...fixture, title: 'Obsoleto' })).toBe(false); });
    expect(context.activities).toEqual([]); expect(localStorage.getItem('enka:https%3A%2F%2Fsimulated.invalid:activities:v1:B')).toBeNull();
  });
  it('actualiza, cancela y elimina solo después de persistir', async () => {
    await start(); await act(async () => { expect(await context.updateActivity('a', { title: 'Editado' })).toBe(true); });
    expect(context.activities[0].title).toBe('Editado');
    await act(async () => { expect(await context.cancelActivity('a')).toBe(true); }); expect(context.activities[0].isCancelled).toBe(true);
    await act(async () => { expect(await context.deleteActivity('a')).toBe(true); }); expect(context.activities).toEqual([]);
    expect(JSON.parse(localStorage.getItem('enka:https%3A%2F%2Fsimulated.invalid:activities:v1:A')!).activities).toEqual([]);
  });
  it('cambia A→B sin mostrar actividades, selección ni modales anteriores en ningún render', async () => {
    await start(); await act(async () => { context.openDetailModal(fixture); context.openCreateModal(); });
    renders.length = 0; await emit('B');
    expect(renders.every(titles => !titles.includes('Privado A'))).toBe(true);
    expect(context.activities).toEqual([]); expect(context.selectedActivity).toBeNull(); expect(context.isCreateModalOpen).toBe(false); expect(context.isDetailModalOpen).toBe(false);
    expect(localStorage.getItem('enka:activities')).toBe('[legado simulado]'); expect(localStorage.getItem('enka:reset-2026-10')).toBeNull();
  });
  it('cierra sesión y recupera solo el documento de A al volver', async () => {
    await start(); await emit(null); expect(screen.getByText('Sesión cerrada')).toBeTruthy(); expect(screen.queryByText('Privado A')).toBeNull();
    await emit('B'); expect(context.activities).toEqual([]); await emit('A'); expect(screen.getByText('Privado A')).toBeTruthy();
  });
  it('guarda antes de actualizar React y conserva la memoria y el documento si falla', async () => {
    await start(); const raw = localStorage.getItem('enka:https%3A%2F%2Fsimulated.invalid:activities:v1:A');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('simulated quota', 'QuotaExceededError'); });
    let saved: boolean | undefined; await act(async () => { saved = await context.addActivity({ ...fixture, title: 'No guardado' }); });
    expect(saved).toBe(false); expect(context.activities).toEqual([fixture]); expect(screen.getByRole('alert').textContent).toContain('No se pudo guardar');
    expect(localStorage.getItem('enka:https%3A%2F%2Fsimulated.invalid:activities:v1:A')).toBe(raw);
  });
  it('rechaza un callback pendiente de A incluso si A→B→A ocurre rápidamente', async () => {
    await start(); let release!: () => void;
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (_key: string, fn: () => unknown) => new Promise((resolve, reject) => { release = () => { try { resolve(fn()); } catch (error) { reject(error); } }; }) } });
    // Store references the current LockManager at call time.
    let pending!: Promise<boolean>; act(() => { pending = context.addActivity({ ...fixture, title: 'Pendiente' }); });
    await act(async () => { auth.callback?.('CHANGE', session('B')); auth.callback?.('CHANGE', session('A')); });
    let result: boolean | undefined; await act(async () => { release(); result = await pending; });
    expect(result).toBe(false); expect(context.activities).toEqual([fixture]); expect(screen.queryByText('Pendiente')).toBeNull();
  });
  it('detecta una modificación externa y no la sobrescribe', async () => {
    await start(); const key = 'enka:https%3A%2F%2Fsimulated.invalid:activities:v1:A';
    const doc = JSON.parse(localStorage.getItem(key)!); doc.revision += 1; doc.activities[0].title = 'Otro cambio'; const raw = JSON.stringify(doc); localStorage.setItem(key, raw);
    await act(async () => { expect(await context.deleteActivity('a')).toBe(false); });
    expect(localStorage.getItem(key)).toBe(raw); expect(screen.getByRole('alert').textContent).toContain('otra pestaña');
  });
  it('persiste una creación y la recupera tras remontar la aplicación', async () => {
    await start(); await act(async () => { const result = await context.addActivity({ ...fixture, title: 'Persistido' }); expect(result, context.storageError ?? 'sin error previo').toBe(true); });
    expect(screen.getByText('Persistido')).toBeTruthy(); cleanup(); await start(); expect(screen.getByText('Persistido')).toBeTruthy();
  });
  it('muestra error si el navegador no permite generar un identificador seguro', async () => {
    await start(); vi.spyOn(crypto, 'randomUUID').mockImplementation(() => { throw new Error('simulated unavailable'); });
    await act(async () => { expect(await context.addActivity({ ...fixture, title: 'No creado' })).toBe(false); });
    expect(context.activities).toEqual([fixture]); expect(screen.getByRole('alert').textContent).toContain('crear actividades');
  });
  it.each(['update', 'cancel', 'delete'] as const)('un %s pendiente no restaura ni cierra una selección nueva', async action => {
    const other = { ...fixture, id: 'other', title: 'Otra actividad' };
    const store = createActivityStore(localStorage, 'https://simulated.invalid', 'A', () => true, async (_key, fn) => fn());
    store.load(); await store.save([fixture, other]); await start();
    await act(async () => { context.openDetailModal(fixture); });
    let release!: () => void;
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (_key: string, fn: () => unknown) => new Promise((resolve, reject) => {
      release = () => { try { resolve(fn()); } catch (error) { reject(error); } };
    }) } });
    let pending!: Promise<boolean>;
    act(() => { pending = action === 'update' ? context.updateActivity('a', { title: 'Editado' }) : action === 'cancel' ? context.cancelActivity('a') : context.deleteActivity('a'); });
    await act(async () => { context.closeDetailModal(); context.openDetailModal(other); });
    await act(async () => { release(); expect(await pending).toBe(true); });
    expect(context.selectedActivity).toEqual(other); expect(context.isDetailModalOpen).toBe(true);
  });
  it('un guardado pendiente no vuelve a seleccionar una actividad tras cerrar su modal', async () => {
    await start(); await act(async () => { context.openDetailModal(fixture); });
    let release!: () => void;
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: (_key: string, fn: () => unknown) => new Promise((resolve, reject) => {
      release = () => { try { resolve(fn()); } catch (error) { reject(error); } };
    }) } });
    let pending!: Promise<boolean>; act(() => { pending = context.updateActivity('a', { title: 'Editado' }); });
    await act(async () => { context.closeDetailModal(); });
    await act(async () => { release(); expect(await pending).toBe(true); });
    expect(context.selectedActivity).toBeNull(); expect(context.isDetailModalOpen).toBe(false);
  });
  it('permite cerrar sesión con un documento corrupto sin modificarlo', async () => {
    const key = 'enka:https%3A%2F%2Fsimulated.invalid:activities:v1:A'; localStorage.setItem(key, '{corrupto'); render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));
    await screen.findByText('Sesión cerrada'); expect(localStorage.getItem(key)).toBe('{corrupto'); expect(localStorage.getItem('enka:activities')).toBe('[legado simulado]');
  });
  it('bloquea el contenido cuando el documento de cuenta está corrupto', async () => {
    localStorage.setItem('enka:https%3A%2F%2Fsimulated.invalid:activities:v1:A', '{corrupto'); render(<App />);
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Los datos se conservan'));
    expect(screen.queryByText('Privado A')).toBeNull(); expect(localStorage.getItem('enka:https%3A%2F%2Fsimulated.invalid:activities:v1:A')).toBe('{corrupto');
  });
});
