import React from 'react';
import { useEnka } from '../../context';
import { enkaRepository } from '../../services/enka';
import type { DbActivity, DbPlanningGoal } from '../../services/enka';
import { formatLocalDateToISO, getTodayDateString, getWeekRange } from '../../utils/dateUtils';
import { suggestGymSlots } from './gymSuggestions';

const splits = ['Torso 1', 'Pierna 1', 'Torso 2', 'Pierna 2'] as const;
type Split = typeof splits[number];
const isGym = (a: DbActivity, goalId: string | undefined, gymCategory: string | undefined) =>
  (Boolean(goalId) && a.planning_goal_id === goalId) ||
  (Boolean(gymCategory) && a.category_id === gymCategory && splits.some(s => s.toLowerCase() === a.title.trim().toLowerCase())) ||
  splits.some(s => s.toLowerCase() === a.title.trim().toLowerCase());
const inputStyle: React.CSSProperties = { width: '100%', minWidth: 0, boxSizing: 'border-box', padding: 9,
  border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-surface-subtle)', color: 'var(--text-primary)' };

export const PlanningView: React.FC = () => {
  const { activities, categories, locations } = useEnka();
  const [week, setWeek] = React.useState(() => getWeekRange().mondayDate);
  const [goal, setGoal] = React.useState<DbPlanningGoal | null>(null);
  const [rows, setRows] = React.useState<DbActivity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [split, setSplit] = React.useState<Split>('Torso 1');
  const [date, setDate] = React.useState(getTodayDateString());
  const [start, setStart] = React.useState('17:30');
  const [end, setEnd] = React.useState('19:00');
  const [locationId, setLocationId] = React.useState('');
  const [showDetails, setShowDetails] = React.useState(false);
  const monday = formatLocalDateToISO(week);
  const sunday = formatLocalDateToISO(new Date(week.getFullYear(), week.getMonth(), week.getDate() + 6));
  const gymCategory = categories.find(c => c.name.toLocaleLowerCase('es') === 'gimnasio')?.id;
  const load = React.useCallback(async () => {
    const [goalsResult, activitiesResult] = await Promise.all([enkaRepository.fetchPlanningGoals(), enkaRepository.fetchActivities()]);
    if (goalsResult.error || activitiesResult.error) throw goalsResult.error || activitiesResult.error;
    const activeGoal = goalsResult.data?.find(g => g.is_active && g.period === 'weekly' && /gimnasio/i.test(g.title)) ?? null;
    setGoal(activeGoal);
    setRows(activitiesResult.data ?? []);
  }, []);
  React.useEffect(() => {
    let active = true;
    void load().catch(e => { if (active) setError(e instanceof Error ? e.message : 'No se pudo leer la nube'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [load]);
  const gymRows = rows.filter(a => isGym(a, goal?.id, gymCategory) && a.start_date && a.start_date >= monday && a.start_date <= sunday && a.status !== 'cancelled');
  const completed = gymRows.filter(a => a.status === 'completed');
  const planned = gymRows.filter(a => a.status !== 'completed');
  const target = goal?.target_count ?? 4;
  const times = (a: DbActivity) => a.start_time?.slice(0, 5) ?? 'Sin hora';
  const toMinutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  const conflicts = activities.filter(a => {
    if (a.date !== date || a.isCancelled) return false;
    if (a.isAllDay || a.isTimePending || !a.startTime || !a.endTime) return true;
    return toMinutes(start) < toMinutes(a.endTime) && toMinutes(a.startTime) < toMinutes(end);
  });
  const nextSplit = splits.find(s => !gymRows.some(a => a.title.trim().toLowerCase() === s.toLowerCase() || a.metadata?.gym_split === s)) ?? splits[0];
  const suggestions = suggestGymSlots(week, activities, rows, nextSplit, goal?.id, gymCategory);
  const refresh = async () => {
    await load();
    window.dispatchEvent(new Event('enka:data-changed'));
  };
  const quickSave = async (targetSplit: Split, when: string, from?: string, to?: string, done = false) => {
    setError('');
    if (!goal) { setError('Todavía no se ha cargado el objetivo del gimnasio.'); return; }
    const duplicate = rows.find(a => a.start_date === when && a.status !== 'cancelled' &&
      (a.metadata?.gym_split === targetSplit || a.title.trim().toLowerCase() === targetSplit.toLowerCase()));
    setSaving(true);
    try {
      if (duplicate) {
        if (!done || duplicate.status === 'completed') { setError('Esta sesión ya está guardada para ese día.'); return; }
        const updated = await enkaRepository.updateActivity(duplicate.id, {
          status: 'completed', planning_goal_id: goal.id
        });
        if (updated.error) throw updated.error;
      } else {
        const created = await enkaRepository.createActivity({
          title: targetSplit, planning_goal_id: goal.id, category_id: gymCategory ?? null,
          start_date: when, start_time: from ?? null, end_time: to ?? null,
          is_time_pending: !from, certainty: from ? 'confirmed' : 'pending',
          status: done ? 'completed' : 'scheduled', metadata: { gym_split: targetSplit, gym_source: 'quick_action' }
        });
        if (created.error) throw created.error;
      }
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar'); }
    finally { setSaving(false); }
  };
  const schedule = async (markCompleted: boolean) => {
    setError('');
    if (!goal) { setError('No se encontró el objetivo semanal del gimnasio. Revisa Más → Rutinas.'); return; }
    if (!date || !start || !end || end <= start) { setError('Selecciona una fecha y horas válidas.'); return; }
    if (rows.some(a => a.title.trim().toLowerCase() === split.toLowerCase() && a.start_date === date && a.status !== 'cancelled')) {
      setError('Ya tienes ese entrenamiento registrado ese día. Puedes editarlo desde Calendario.'); return;
    }
    setSaving(true);
    try {
      const result = await enkaRepository.createActivity({
        title: split, planning_goal_id: goal.id, category_id: gymCategory ?? null, location_id: locationId || null,
        start_date: date, start_time: start, end_time: end,
        certainty: 'confirmed', status: markCompleted ? 'completed' : 'scheduled',
        metadata: { gym_split: split, gym_source: 'planner' }
      });
      if (result.error) throw result.error;
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar'); }
    finally { setSaving(false); }
  };
  const complete = async (item: DbActivity, done: boolean) => {
    setSaving(true); setError('');
    try {
      const result = await enkaRepository.updateActivity(item.id, {
        status: done ? 'completed' : 'scheduled',
        planning_goal_id: goal?.id ?? item.planning_goal_id,
        category_id: gymCategory ?? item.category_id
      });
      if (result.error) throw result.error;
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo actualizar'); }
    finally { setSaving(false); }
  };
  return <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
    <div>
      <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mi gimnasio</h1>
      <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginTop: 8 }}>
        <button type="button" onClick={() => setWeek(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()-7))}>‹</button>
        <strong style={{ fontSize: '0.8rem' }}>{monday} – {sunday}</strong>
        <button type="button" onClick={() => setWeek(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()+7))}>›</button>
        <button type="button" onClick={() => setWeek(getWeekRange().mondayDate)} style={{ fontSize: '0.72rem' }}>Esta semana</button>
      </div>
    </div>
    <section style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, display: 'grid', gap: 12 }}>
      <strong>{completed.length}/{target} sesiones realizadas · {planned.length} programadas</strong>
      <div style={{ display: 'flex', height: 7, background: 'var(--bg-surface-subtle)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: Math.min(100, completed.length / Math.max(1, target) * 100) + '%', background: '#10B981' }} />
      </div>
      {loading && <p>Cargando tus sesiones…</p>}
      {splits.map(s => {
        const matches = gymRows.filter(a => a.title.trim().toLowerCase() === s.toLowerCase() || a.metadata?.gym_split === s);
        return <div key={s} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center',
          padding: 9, border: '1px solid var(--border-subtle)', borderRadius: 9 }}>
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: '0.85rem' }}>{s}</strong>
            <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
              {matches.length ? matches.map(a => a.start_date + ' · ' + times(a) + (a.status === 'completed' ? ' · Realizado' : ' · Programado')).join(' / ') : 'Por planificar'}
            </div>
          </div>
          {matches.length === 1 && <button type="button" disabled={saving}
            onClick={() => void complete(matches[0], matches[0].status !== 'completed')}
            style={{ flexShrink: 0, padding: 8, border: '1px solid var(--border-default)', borderRadius: 8, fontSize: '0.75rem' }}>
            {matches[0].status === 'completed' ? 'Deshacer' : 'Realizado'}
          </button>}
        </div>;
      })}
    </section>
    <section style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, display: 'grid', gap: 10 }}>
      <strong>Registrar entrenamiento en un toque</strong>
      <label style={{ fontSize: '0.8rem' }}>¿Qué has entrenado?
        <select style={inputStyle} value={split} onChange={e => setSplit(e.target.value as Split)}>
          {splits.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <button type="button" disabled={saving || loading || !goal} onClick={() => void quickSave(split, getTodayDateString(), undefined, undefined, true)}
        style={{ padding: 12, borderRadius: 9, background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 700 }}>
        He entrenado hoy
      </button>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>No hace falta introducir horas. Si ya estaba programado hoy, lo marcamos como realizado.</span>
    </section>
    <section style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, display: 'grid', gap: 10 }}>
      <strong>Propuestas para {nextSplit}</strong>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Propuestas según tus compromisos conocidos. Comprueba el desplazamiento, la comida y tu descanso antes de confirmar.
      </p>
      {suggestions.length === 0 && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
        No hay huecos claros esta semana. Puedes elegir manualmente otra fecha u hora.
      </p>}
      {suggestions.map(item => <button type="button" disabled={saving || loading || !goal} key={item.date + item.start} onClick={() => void quickSave(nextSplit, item.date, item.start, item.end)} style={{ textAlign: 'left', padding: 10, border: '1px solid var(--border-default)',
        borderRadius: 9, background: date === item.date && start === item.start ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)' }}>
        <strong style={{ fontSize: '0.82rem' }}>{item.label} · {item.start}–{item.end}</strong>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{item.reason}</div>
      </button>)}
    </section>
    <section style={{ padding: 14, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 12, display: 'grid', gap: 10 }}>
      <button type="button" aria-expanded={showDetails} onClick={() => setShowDetails(v => !v)} style={{ fontWeight: 700, textAlign: 'left', padding: 8 }}>⚙ {showDetails ? 'Ocultar opciones avanzadas' : 'Cambiar fecha, hora o lugar'}</button>
      {showDetails && <>
      <strong>Opciones avanzadas</strong>
      <label style={{ fontSize: '0.8rem' }}>Sesión<select style={inputStyle} value={split} onChange={e => setSplit(e.target.value as Split)}>
        {splits.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
      <label style={{ fontSize: '0.8rem' }}>Día (puede ser anterior)<input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)}/></label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
        <label style={{ fontSize: '0.8rem' }}>Inicio<input type="time" style={inputStyle} value={start} onChange={e => setStart(e.target.value)}/></label>
        <label style={{ fontSize: '0.8rem' }}>Fin<input type="time" style={inputStyle} value={end} onChange={e => setEnd(e.target.value)}/></label>
      </div>
      <label style={{ fontSize: '0.8rem' }}>Lugar<select style={inputStyle} value={locationId} onChange={e => setLocationId(e.target.value)}>
        <option value="">Por decidir</option>{locations.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      {conflicts.length > 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revisa tu agenda: {conflicts.length} actividad(es) pueden coincidir. Puedes guardar igualmente si lo decides.</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" disabled={saving || loading} onClick={() => void schedule(false)}
          style={{ padding: 10, borderRadius: 8, background: 'var(--text-primary)', color: 'var(--text-inverse)', flex: 1 }}>
          Programar
        </button>
        <button type="button" disabled={saving || loading} onClick={() => void schedule(true)}
          style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border-default)', flex: 1 }}>
          Ya lo hice
        </button>
      </div>
      </>}
    </section>
    {error && <p role="alert" style={{ fontSize: '0.8rem', color: '#dc2626' }}>{error}</p>}
  </div>;
};
