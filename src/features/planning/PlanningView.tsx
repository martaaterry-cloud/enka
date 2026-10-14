import React from 'react';
import { useEnka } from '../../context';
import { Icon } from '../../components/ui/Icon';
import { getWeekRange, formatLocalDateToISO, getTodayDateString } from '../../utils/dateUtils';

// Candidate slots only. Never infer that a blank local calendar means a free slot:
// recurring work, English and handball are not yet expanded into activities here.
const candidateDays = [
  { offset: 1, label: 'Martes', time: '17:30', split: 'Torso 1' },
  { offset: 3, label: 'Jueves', time: '17:30', split: 'Pierna 1' },
  { offset: 0, label: 'Lunes', time: '17:15', split: 'Torso 2' },
  { offset: 4, label: 'Viernes', time: '16:45', split: 'Pierna 2' },
];

export const PlanningView: React.FC = () => {
  const { openCreateModal, activities } = useEnka();
  const weekInfo = React.useMemo(() => getWeekRange(), []);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [chosenDate, setChosenDate] = React.useState(getTodayDateString());
  const today = getTodayDateString();

  const suggestions = candidateDays.map(item => {
    const day = new Date(weekInfo.mondayDate.getFullYear(), weekInfo.mondayDate.getMonth(), weekInfo.mondayDate.getDate() + item.offset);
    const date = formatLocalDateToISO(day);
    const start = Number(item.time.slice(0, 2)) * 60 + Number(item.time.slice(3));
    const end = start + 90;
    const overlapping = activities.some(a => {
      if (a.date !== date || a.isCancelled) return false;
      if (a.isAllDay || a.isTimePending || !a.startTime || !a.endTime) return true;
      const from = Number(a.startTime.slice(0, 2)) * 60 + Number(a.startTime.slice(3));
      const to = Number(a.endTime.slice(0, 2)) * 60 + Number(a.endTime.slice(3));
      return start < to && end > from;
    });
    return { ...item, date, overlapping, past: date < today };
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{weekInfo.formattedRange}</span>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Montar mi semana</h1>
      </div>
      <section style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Gimnasio · 4 sesiones flexibles</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Primero entre semana, priorizando martes y jueves. Duración orientativa de 90 minutos.
          Son propuestas para revisar, no reservas automáticas.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Atención: todavía faltan actividades recurrentes y eventos de Supabase en este calendario.
          Estas sugerencias NO garantizan disponibilidad real ni recuperación suficiente.
        </p>
        {suggestions.map(item => {
          const checked = selected.includes(item.date);
          return <div key={item.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: 10, border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
            <div>
              <strong style={{ fontSize: '0.8125rem' }}>{item.split} · {item.label}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.date} · {item.time} (orientativo)</div>
              {(item.overlapping || item.past) && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.past ? 'Día pasado: puedes registrarlo igualmente' : 'Posible conflicto con tu agenda local'}</div>}
            </div>
            <button type="button" disabled={item.overlapping} aria-pressed={checked}
              onClick={() => setSelected(prev => checked ? prev.filter(d => d !== item.date) : [...prev, item.date])}
              style={{ padding: '8px 10px', borderRadius: 8, background: checked ? 'var(--text-primary)' : 'var(--bg-surface-subtle)', color: checked ? 'var(--text-inverse)' : 'var(--text-primary)', border: '1px solid var(--border-default)', opacity: item.overlapping ? 0.45 : 1 }}>
              {checked ? 'Elegido' : 'Elegir'}
            </button>
          </div>;
        })}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label htmlFor="gym-any-date" style={{ fontSize: '0.8rem', fontWeight: 700 }}>¿Entrenaste otro día? Regístralo igualmente</label>
          <input id="gym-any-date" type="date" value={chosenDate} onChange={e => setChosenDate(e.target.value)}
            style={{ border: '1px solid var(--border-default)', background: 'var(--bg-surface-subtle)', borderRadius: 8, padding: 10 }}/>
          <button type="button" disabled={!chosenDate} onClick={() => openCreateModal(chosenDate)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border-default)' }}>Registrar entrenamiento de la fecha elegida</button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Seleccionadas: {selected.length}/4. Para confirmar un entrenamiento, elige el día y crea
          la actividad verificando antes los demás compromisos y la hora exacta.
        </p>
        <button type="button" disabled={selected.length === 0} onClick={() => openCreateModal([...selected].sort()[0])}
          style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 700 }}>
          <Icon name="Plus" size={15} /> Revisar primera sesión elegida
        </button>
      </section>
    </div>
  );
};
