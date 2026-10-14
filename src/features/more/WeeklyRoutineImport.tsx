import React, { useState } from 'react';
import { enkaRepository } from '../../services/enka';
import type { DbRecurrenceRule, DbPlanningGoal } from '../../services/enka';

const presets = [
  { key: 'work', title: 'Trabajo · Syte Automation', frequency: 'weekly', days: [1,2,3,4,5], start: '07:00', end: '15:00', note: 'Alcantarilla. Excluir festivos laborales aplicables (pendiente de implementar excepciones). Salida habitual de Bullas 06:15 o Zigzag 06:30, según dónde duerma.' },
  { key: 'english', title: 'Inglés · Academia Método', frequency: 'weekly', days: [1,3], start: '19:30', end: '21:00', note: 'Calle Rocío, Bullas. Salida prevista a las 20:45 hacia balonmano, con solapamiento conocido.' },
  { key: 'handball-lm', title: 'Balonmano · lunes', frequency: 'weekly', days: [1], start: '20:30', end: '22:00', note: 'Pabellón Juan Valera, Bullas. Llegada tarde desde inglés, en coche o moto, con la mochila preparada.' },
  { key: 'handball-x', title: 'Balonmano · miércoles', frequency: 'weekly', days: [3], start: '20:30', end: '21:50', note: 'Pabellón Juan Valera, Bullas. Solapamiento aceptado con inglés.' },
  { key: 'handball-v', title: 'Balonmano · viernes', frequency: 'weekly', days: [5], start: '19:15', end: '21:00', note: 'Pabellón Juan Valera, Bullas. Excepciones previstas el 13 y 27 de noviembre de 2026 (graduaciones); aún sin aplicar automáticamente.' },
] as const;

export const WeeklyRoutineImport: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(presets.map(x => x.key));
  const [gym, setGym] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const run = async () => {
    setBusy(true); setMessage(''); setError('');
    try {
      const [rules, goals] = await Promise.all([enkaRepository.fetchRecurrenceRules(), enkaRepository.fetchPlanningGoals()]);
      if (rules.error || goals.error || !rules.data || !goals.data)
        throw rules.error || goals.error || new Error('No se pudo comprobar si ya existen rutinas');
      const known: DbRecurrenceRule[] = [...rules.data];
      let added = 0, skipped = 0;
      for (const item of presets.filter(p => selected.includes(p.key))) {
        const existing = known.find(r => r.title === item.title && r.frequency === item.frequency && r.start_date === '2026-10-14');
        if (existing) {
          const slots = await enkaRepository.fetchRecurrenceSlots(existing.id);
          if (slots.error) throw slots.error;
          // Never duplicate or silently repair a partial series.
          if ((slots.data?.length ?? 0) !== item.days.length) throw new Error('Revisa los horarios de "' + item.title + '" antes de reintentar; la serie existe pero sus días no coinciden.');
          skipped++; continue;
        }
        const result = await enkaRepository.createRecurrenceRule({
          title: item.title, frequency: item.frequency, start_date: '2026-10-14',
          by_weekdays: [...item.days], interval_count: 1, is_active: true, notes: item.note
        });
        if (result.error || !result.data) throw result.error || new Error('No se pudo crear la rutina.');
        known.push(result.data);
        for (const day of item.days) {
          const slot = await enkaRepository.createRecurrenceSlot({
            recurrence_rule_id: result.data.id, weekday: day, start_time: item.start, end_time: item.end,
            notes: item.note
          });
          if (slot.error) throw new Error('La rutina "' + item.title + '" se creó parcialmente. No pulses importar otra vez sin revisar: ' + slot.error.message);
        }
        added++;
      }
      if (gym) {
        const existingGym: DbPlanningGoal | undefined = goals.data.find(g => g.title === 'Gimnasio · Torso/Pierna' && g.period === 'weekly');
        if (existingGym) skipped++;
        else {
          const result = await enkaRepository.createPlanningGoal({
            title: 'Gimnasio · Torso/Pierna', period: 'weekly', target_count: 4,
            min_duration_minutes: 75, preferred_duration_minutes: 90, max_duration_minutes: 120,
            routine_structure: [
              { name: 'Torso 1' }, { name: 'Pierna 1' }, { name: 'Torso 2' }, { name: 'Pierna 2' },
              { preferred_weekdays: [1,2,3,4,5], suggestion_mode: 'confirm_before_scheduling' }
            ],
            is_active: true
          });
          if (result.error) throw result.error;
          added++;
        }
      }
      setMessage('Nuevas: ' + added + '. Ya existentes: ' + skipped + '. Guardadas en Supabase. Pendiente visualizar recurrencias automáticamente en Hoy y Calendario.');
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Error al importar') + ' Comprueba los registros existentes antes de reintentar.');
    } finally { setBusy(false); }
  };

  return <section style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: 12, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-surface)' }}>
    <strong>Importar mis horarios habituales</strong>
    <p style={{ fontSize: '0.75rem' }}>Selecciona qué rutinas quieres guardar en tu cuenta. Aún no se aplican automáticamente los festivos ni las excepciones por graduación.</p>
    {presets.map(item => <label key={item.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.8rem' }}>
      <input type="checkbox" checked={selected.includes(item.key)} onChange={e => setSelected(prev => e.target.checked ? [...prev, item.key] : prev.filter(x => x !== item.key))}/>
      <span>{item.title} · {item.start}–{item.end}</span>
    </label>)}
    <label style={{ display: 'flex', gap: 8, fontSize: '0.8rem' }}><input type="checkbox" checked={gym} onChange={e=>setGym(e.target.checked)}/> Gimnasio flexible: 4 sesiones (2 torso, 2 pierna), de lunes a viernes, con confirmación</label>
    {message && <p role="status" style={{ fontSize: '0.75rem' }}>{message}</p>}
    {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</p>}
    <button type="button" disabled={busy || (!selected.length && !gym)} onClick={()=>void run()} style={{ padding: 10, background: 'var(--text-primary)', color: 'var(--text-inverse)', borderRadius: 8 }}>
      {busy ? 'Importando…' : 'Guardar rutinas seleccionadas'}
    </button>
  </section>;
};
