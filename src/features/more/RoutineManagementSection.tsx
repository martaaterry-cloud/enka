import React, { useEffect, useState } from 'react';
import { enkaRepository } from '../../services/enka';
import type { DbPlanningGoal, DbRecurrenceRule } from '../../services/enka';
import { WeeklyRoutineImport } from './WeeklyRoutineImport';

type Kind = 'fixed' | 'flexible';
const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const RoutineManagementSection: React.FC = () => {
  const [kind, setKind] = useState<Kind>('fixed');
  const [title, setTitle] = useState('');
  const [days, setDays] = useState<number[]>([1]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:00');
  const [count, setCount] = useState(3);
  const [duration, setDuration] = useState(60);
  const [fixed, setFixed] = useState<DbRecurrenceRule[]>([]);
  const [flexible, setFlexible] = useState<DbPlanningGoal[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    const [rules, goals] = await Promise.all([
      enkaRepository.fetchRecurrenceRules(),
      enkaRepository.fetchPlanningGoals()
    ]);
    if (rules.error || goals.error) {
      setError(rules.error?.message || goals.error?.message || 'Error al cargar rutinas');
      return;
    }
    setFixed(rules.data ?? []);
    setFlexible(goals.data ?? []);
  };

  useEffect(() => { void load(); }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!title.trim()) return;
    if (kind === 'fixed' && (days.length === 0 || endTime <= startTime)) {
      setError('Selecciona al menos un día y una hora de fin posterior al inicio.');
      return;
    }
    setBusy(true);
    try {
      if (kind === 'flexible') {
        const result = await enkaRepository.createPlanningGoal({
          title: title.trim(), period: 'weekly', target_count: count,
          preferred_duration_minutes: duration, is_active: true
        });
        if (result.error) throw result.error;
      } else {
        const date = new Date();
        const startDate = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
        const result = await enkaRepository.createRecurrenceRule({
          title: title.trim(), frequency: 'weekly', interval_count: 1,
          start_date: startDate, by_weekdays: [...days].sort(), is_active: true
        });
        if (result.error || !result.data) throw result.error || new Error('No se pudo guardar la rutina');
        // Create one slot per selected day. If any request fails, do not hide the partial save.
        for (const day of days) {
          const slot = await enkaRepository.createRecurrenceSlot({
            recurrence_rule_id: result.data.id, weekday: day,
            start_time: startTime, end_time: endTime
          });
          if (slot.error) throw new Error('La rutina se creó, pero algún horario no se guardó. Revisa la lista antes de repetir: ' + slot.error.message);
        }
      }
      setTitle('');
      setNotice('Rutina guardada en Supabase. Las apariciones automáticas en el calendario se activarán en la siguiente fase.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se ha podido guardar');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-default)', background: 'var(--bg-surface-subtle)'
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 800 }}>Mis rutinas</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Fijas con horario o flexibles por sesiones semanales. Se guardan en tu cuenta.
        </p>
      </div>
      <WeeklyRoutineImport />
      <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
        <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>Tipo de rutina</label>
        <select style={fieldStyle} value={kind} onChange={e => setKind(e.target.value as Kind)}>
          <option value="fixed">Horario fijo</option>
          <option value="flexible">Flexible cada semana</option>
        </select>
        <label style={{ fontWeight: 700, fontSize: '0.8rem' }}>Nombre</label>
        <input style={fieldStyle} required maxLength={120} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Entrenamiento o estudiar" />
        {kind === 'fixed' ? (
          <>
            <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>Días de la semana</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 4 }}>
              {weekdays.map((day, index) => {
                const value = index + 1;
                const selected = days.includes(value);
                return <button type="button" key={value} aria-pressed={selected} onClick={() => setDays(previous => selected ? previous.filter(v => v !== value) : [...previous, value])}
                  style={{ padding: '10px 0', borderRadius: 8, background: selected ? 'var(--text-primary)' : 'var(--bg-surface-subtle)', color: selected ? 'var(--text-inverse)' : 'var(--text-primary)', border: '1px solid var(--border-default)' }}>{day}</button>;
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <label>Inicio<input type="time" required style={fieldStyle} value={startTime} onChange={e => setStartTime(e.target.value)} /></label>
              <label>Fin<input type="time" required style={fieldStyle} value={endTime} onChange={e => setEndTime(e.target.value)} /></label>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label>Veces por semana<input type="number" min={1} max={14} required style={fieldStyle} value={count} onChange={e => setCount(Number(e.target.value))} /></label>
            <label>Minutos por sesión<input type="number" min={5} max={480} required style={fieldStyle} value={duration} onChange={e => setDuration(Number(e.target.value))} /></label>
          </div>
        )}
        {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</p>}
        {notice && <p role="status" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{notice}</p>}
        <button type="submit" disabled={busy} style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', padding: 11, borderRadius: 9, fontWeight: 700 }}>
          {busy ? 'Guardando…' : 'Guardar rutina'}
        </button>
      </form>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: '0.875rem' }}>Guardadas en la nube</h3>
        {fixed.map(rule => <div key={rule.id} style={{ padding: 12, borderRadius: 9, background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <strong>{rule.title}</strong><p style={{ fontSize: '0.75rem' }}>Fija · {rule.frequency === 'weekly' ? 'Semanal' : rule.frequency}</p>
        </div>)}
        {flexible.map(goal => <div key={goal.id} style={{ padding: 12, borderRadius: 9, background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <strong>{goal.title}</strong><p style={{ fontSize: '0.75rem' }}>Flexible · {goal.target_count} sesiones / {goal.period}</p>
        </div>)}
        {!fixed.length && !flexible.length && <p style={{ fontSize: '0.75rem' }}>Aún no hay rutinas guardadas.</p>}
      </div>
    </section>
  );
};
