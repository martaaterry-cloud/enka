import React, { useState } from 'react';
import { enkaRepository } from '../../services/enka';
import type { DbActivity } from '../../services/enka';

// Reviewed together with the user. No database changes occur until they press Import.
const suggestions: Array<{
  key: string;
  name: string;
  payload: Pick<DbActivity, 'title' | 'start_date'> &
    Partial<Omit<DbActivity, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
}> = [
  { key: 'laser-20261014', name: '14 oct · Láser · 18:00–19:00 aprox.', payload: {
    title: 'Sesión de láser', start_date: '2026-10-14', start_time: '18:00', end_time: '19:00',
    certainty: 'confirmed', status: 'scheduled', notes: 'Duración aproximada: 1 hora.'
  }},
  { key: 'dentist-20261015', name: '15 oct · Dentista · 17:00–18:00 aprox.', payload: {
    title: 'Dentista', start_date: '2026-10-15', start_time: '17:00', end_time: '18:00',
    certainty: 'confirmed', status: 'scheduled', notes: 'Duración aproximada: 1 hora.'
  }},
  { key: 'ucam-bullense-20261017', name: '17 oct · Partido Bullense–UCAM · 17:50', payload: {
    title: 'Balonmano senior femenino: Bullense - UCAM',
    start_date: '2026-10-17', start_time: '17:50', is_end_time_unknown: true,
    certainty: 'confirmed', status: 'scheduled', prep_before_minutes: 60,
    notes: 'Partido en Bullas. Estar en el pabellón a las 16:50. Desde casa en Bullas, unos 3 minutos andando. Hora de finalización pendiente.'
  }},
  { key: 'partner-graduation-20261113', name: '13 nov · Graduación de tu pareja · 20:00', payload: {
    title: 'Graduación de mi pareja (UA)', start_date: '2026-11-13',
    start_time: '20:00', is_end_time_unknown: true, certainty: 'confirmed',
    status: 'scheduled', notes: 'Universidad de Alicante, San Vicente del Raspeig. Prever trayecto. No asistir al balonmano ese viernes.'
  }},
  { key: 'muro-medio-ano-20261114', name: '14–15 nov · Medio Año en Muro de Alcoy · provisional', payload: {
    title: 'Medio Año en Muro de Alcoy', start_date: '2026-11-14',
    end_date: '2026-11-15', is_all_day: true, certainty: 'probable',
    status: 'scheduled', notes: 'Probable fin de semana con mi pareja. Plan y desplazamientos por confirmar.'
  }},
  { key: 'graduation-20261127', name: '27 nov · Tu graduación · 19:30', payload: {
    title: 'Mi graduación de Ingeniería Robótica (UA)', start_date: '2026-11-27',
    start_time: '19:30', is_end_time_unknown: true, certainty: 'confirmed',
    status: 'scheduled', notes: 'Universidad de Alicante. Prever trayecto. No asistir al balonmano ese viernes.'
  }},
  { key: 'birthday-20261201', name: '1 dic · Mi cumpleaños', payload: {
    title: 'Mi cumpleaños', start_date: '2026-12-01', is_all_day: true,
    certainty: 'confirmed', status: 'scheduled', notes: '1 de diciembre. Repetición anual pendiente de activar.'
  }}
];

export const SuggestedAgendaImport: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(suggestions.map(s => s.key));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const importSelected = async () => {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const existing = await enkaRepository.fetchActivities();
      if (existing.error || !existing.data) throw existing.error || new Error('No se pudieron comprobar los registros existentes.');
      const known = [...existing.data];
      let added = 0;
      let skipped = 0;
      for (const suggestion of suggestions.filter(s => selected.includes(s.key))) {
        const alreadySaved = known.some(a =>
          a.metadata?.suggestion_key === suggestion.key ||
          (a.title === suggestion.payload.title && a.start_date === suggestion.payload.start_date)
        );
        if (alreadySaved) { skipped++; continue; }
        const result = await enkaRepository.createActivity({
          ...suggestion.payload,
          metadata: { suggestion_key: suggestion.key, source: 'enka-reviewed-agenda-20261014' }
        });
        if (result.error || !result.data) throw result.error || new Error('No se pudo guardar.');
        known.push(result.data);
        added++;
      }
      setMessage(`Guardadas: ${added}. Ya existentes (no duplicadas): ${skipped}. Se han guardado en Supabase; la vista Hoy/Calendario aún requiere sincronización.`);
    } catch (e) {
      setError((e instanceof Error ? e.message : 'Error de conexión') +
        ' Comprueba tus actividades antes de reintentar; las ya guardadas no se borran.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
      <strong>Importar mis compromisos confirmados</strong>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        Revisa qué quieres guardar. Nada se importa sin pulsar el botón. Los horarios aproximados y los planes probables están identificados.
      </p>
      {suggestions.map(item => <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: '0.8rem' }}>
        <input type="checkbox" checked={selected.includes(item.key)}
          onChange={e => setSelected(previous => e.target.checked ? [...previous, item.key] : previous.filter(key => key !== item.key))} />
        <span>{item.name}</span>
      </label>)}
      {message && <p role="status" style={{ fontSize: '0.75rem' }}>{message}</p>}
      {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</p>}
      <button type="button" disabled={busy || selected.length === 0} onClick={() => void importSelected()}
        style={{ background: 'var(--text-primary)', color: 'var(--text-inverse)', borderRadius: 8, padding: 10, fontWeight: 700 }}>
        {busy ? 'Guardando en Supabase…' : `Importar ${selected.length} compromisos`}
      </button>
    </section>
  );
};
