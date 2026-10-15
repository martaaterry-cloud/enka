import React, { useState } from 'react';
import type { Activity } from '../../models/activity';
import { enkaRepository } from '../../services/enka';

export const RecurringOccurrenceEditor: React.FC<{ activity: Activity; onClose: () => void }> = ({ activity, onClose }) => {
  const [start, setStart] = useState(activity.startTime ?? '');
  const [end, setEnd] = useState(activity.endTime ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // Generated occurrence IDs are cloud-recurring:<ruleUuid>:<slotUuid>:<yyyy-mm-dd>.
  const parts = activity.id.split(':');
  if (parts.length !== 4 || parts[0] !== 'cloud-recurring') return null;
  const [, ruleId, slotId, originalDate] = parts;
  const save = async (type: 'rescheduled' | 'cancelled') => {
    setError('');
    if (type === 'rescheduled' && (!start || !end || start >= end)) {
      setError('Revisa las horas de inicio y fin.');
      return;
    }
    setBusy(true);
    try {
      const result = await enkaRepository.saveOccurrenceException({
        recurrence_rule_id: ruleId, recurrence_slot_id: slotId, original_date: originalDate,
        exception_type: type, override_start_time: type === 'rescheduled' ? start : null,
        override_end_time: type === 'rescheduled' ? end : null
      });
      if (!result.success) throw result.error || new Error('No se pudo guardar.');
      window.dispatchEvent(new Event('enka:data-changed'));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar.');
    } finally {
      setBusy(false);
    }
  };
  const fieldStyle: React.CSSProperties = { width: '100%', minWidth: 0, boxSizing: 'border-box', padding: 10,
    border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-surface-subtle)' };
  return <section style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
    <strong>Modificar solo este día</strong>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
      <label>Inicio<input type="time" style={fieldStyle} value={start} onChange={e => setStart(e.target.value)}/></label>
      <label>Fin<input type="time" style={fieldStyle} value={end} onChange={e => setEnd(e.target.value)}/></label>
    </div>
    <button type="button" disabled={busy} onClick={() => void save('rescheduled')}
      style={{ ...fieldStyle, background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 700 }}>
      {busy ? 'Guardando…' : 'Guardar horario de este día'}
    </button>
    <button type="button" disabled={busy} onClick={() => void save('cancelled')} style={fieldStyle}>Cancelar solo esta sesión</button>
    {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
  </section>;
};
