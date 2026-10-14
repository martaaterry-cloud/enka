import React, { useState } from 'react';
import type { Activity } from '../../models/activity';
import { enkaRepository } from '../../services/enka';

export const CloudActivityEditor: React.FC<{activity: Activity; onClose: () => void}> = ({ activity, onClose }) => {
  const [title, setTitle] = useState(activity.title);
  const [date, setDate] = useState(activity.date);
  const [start, setStart] = useState(activity.startTime ?? '');
  const [end, setEnd] = useState(activity.endTime ?? '');
  const [notes, setNotes] = useState(activity.notes ?? '');
  const [pending, setPending] = useState(Boolean(activity.isTimePending));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setBusy(true); setError('');
    try {
      if (!title.trim() || !date || (!pending && start && end && start >= end)) throw new Error('Comprueba los datos y las horas.');
      const result = await enkaRepository.updateActivity(activity.id, {
        title: title.trim(), start_date: date, start_time: pending || !start ? null : start,
        end_time: pending || !end ? null : end, is_time_pending: pending, notes
      });
      if (result.error) throw result.error;
      window.dispatchEvent(new Event('enka:data-changed'));
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar'); }
    finally { setBusy(false); }
  };
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    <strong>Editar en Supabase</strong>
    <label>Nombre<input value={title} onChange={e => setTitle(e.target.value)}/></label>
    <label>Fecha<input type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
    <label><input type="checkbox" checked={pending} onChange={e => setPending(e.target.checked)}/> Día u hora pendiente de confirmar</label>
    {!pending && <div><label>Inicio<input type="time" value={start} onChange={e => setStart(e.target.value)}/></label><label>Fin<input type="time" value={end} onChange={e => setEnd(e.target.value)}/></label></div>}
    <label>Notas<textarea value={notes} onChange={e => setNotes(e.target.value)}/></label>
    <button type="button" disabled={busy} onClick={() => void save()}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
    {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
  </div>;
};
