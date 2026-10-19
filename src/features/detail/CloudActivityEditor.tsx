import React, { useState } from 'react';
import type { Activity } from '../../models/activity';
import { useEnka } from '../../context';
import { enkaRepository } from '../../services/enka';

export const CloudActivityEditor: React.FC<{activity: Activity; onClose: () => void}> = ({ activity, onClose }) => {
  const { categories, locations } = useEnka();
  const [categoryId, setCategoryId] = useState(activity.categoryId);
  const [locationId, setLocationId] = useState(activity.locationId ?? '');
  const [title, setTitle] = useState(activity.title);
  const [date, setDate] = useState(activity.date);
  const [start, setStart] = useState(activity.startTime ?? '');
  const [end, setEnd] = useState(activity.endTime ?? '');
  const [notes, setNotes] = useState(activity.notes ?? '');
  const [pending, setPending] = useState(Boolean(activity.isTimePending));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const save = async () => {
    setBusy(true); setError('');
    try {
      if (!title.trim() || !date || (!pending && start && end && start >= end)) throw new Error('Comprueba los datos y las horas.');
      const confirmedFixture = activity.isSportMatch && !pending && Boolean(start && end);
      const updates: Parameters<typeof enkaRepository.updateActivity>[1] = {
        title: title.trim(), start_date: date, category_id: categoryId || null,
        location_id: locationId || null,
        start_time: pending || !start ? null : start,
        end_time: pending || !end ? null : end, is_time_pending: pending, notes
      };
      if (confirmedFixture) {
        // An initially uncertain weekend fixture becomes one single-day event.
        // Clear the old range and certainty; preserve any other event metadata.
        const current = await enkaRepository.fetchActivities();
        if (current.error || !current.data) throw current.error ?? new Error('No se pudo comprobar el partido.');
        const source = current.data.find(a => a.id === activity.id);
        if (!source) throw new Error('No se encontró el partido en Supabase.');
        const { weekend_start: _weekendStart, weekend_end: _weekendEnd, ...metadata } = source.metadata ?? {};
        updates.end_date = date;
        updates.start_window_start_date = null;
        updates.start_window_end_date = null;
        updates.is_date_pending = false;
        updates.is_all_day = false;
        updates.certainty = 'confirmed';
        updates.metadata = metadata;
      }
      const result = await enkaRepository.updateActivity(activity.id, updates);
      if (result.error) throw result.error;
      window.dispatchEvent(new Event('enka:data-changed'));
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar'); }
    finally { setBusy(false); }
  };
  const remove = async () => {
    setBusy(true); setError('');
    try {
      const result = await enkaRepository.deleteActivity(activity.id);
      if (!result.success) throw result.error ?? new Error('No se pudo eliminar la actividad.');
      window.dispatchEvent(new Event('enka:data-changed'));
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo eliminar'); }
    finally { setBusy(false); }
  };
  const fieldStyle: React.CSSProperties = { width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', padding: 10, border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-surface-subtle)', color: 'var(--text-primary)' };
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0, maxWidth: '100%' }}>
    <strong>Editar actividad</strong>
    <label>Nombre<input style={fieldStyle} value={title} onChange={e => setTitle(e.target.value)}/></label>
    <label>Categoría<select style={fieldStyle} value={categoryId} onChange={e => setCategoryId(e.target.value)}><option value="">Sin categoría</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label>Ubicación<select style={fieldStyle} value={locationId} onChange={e => setLocationId(e.target.value)}><option value="">Sin ubicación</option>{locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}</select></label>
    <label>Fecha<input style={fieldStyle} type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
    <label><input type="checkbox" checked={pending} onChange={e => setPending(e.target.checked)}/> Día u hora pendiente de confirmar</label>
    {!pending && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, minWidth: 0 }}><label>Inicio<input style={fieldStyle} type="time" value={start} onChange={e => setStart(e.target.value)}/></label><label>Fin<input style={fieldStyle} type="time" value={end} onChange={e => setEnd(e.target.value)}/></label></div>}
    <label>Notas<textarea style={fieldStyle} value={notes} onChange={e => setNotes(e.target.value)}/></label>
    <button type="button" disabled={busy} onClick={() => void save()} style={{ padding: 12, background: "var(--text-primary)", color: "var(--text-inverse)", borderRadius: 8, position: "sticky", bottom: 0, zIndex: 1 }}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
    {!confirmDelete ? (
      <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)}
        style={{ padding: 10, border: '1px solid rgba(239,68,68,.35)', color: '#dc2626', borderRadius: 8 }}>
        Eliminar actividad
      </button>
    ) : (
      <div role="group" aria-label="Confirmar eliminación" style={{ padding: 12, border: '1px solid rgba(239,68,68,.35)', borderRadius: 8, display: 'grid', gap: 8 }}>
        <strong>¿Eliminar «{activity.title}»?</strong>
        <span style={{ fontSize: '0.8rem' }}>Se eliminará de Supabase y de los demás dispositivos. No se puede deshacer.</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)}>Volver</button>
          <button type="button" disabled={busy} onClick={() => void remove()}
            style={{ padding: 9, background: '#b91c1c', color: '#fff', borderRadius: 8 }}>
            {busy ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    )}
    {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
  </div>;
};
