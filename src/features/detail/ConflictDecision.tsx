import React, { useState } from 'react';
import type { Activity } from '../../models/activity';
import { enkaRepository } from '../../services/enka';

const minutes = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
export function findAgendaConflicts(item: Activity, others: Activity[]): Activity[] {
  if (item.isCancelled || item.isAllDay || item.isTimePending || !item.startTime) return [];
  return others.filter(a => {
    if (a.id === item.id || a.date !== item.date || a.isCancelled || a.isAllDay || a.isTimePending || !a.startTime) return false;
    const itemEnd = item.endTime ? minutes(item.endTime) : minutes(item.startTime ?? '') + 1;
    const otherEnd = a.endTime ? minutes(a.endTime) : minutes(a.startTime ?? '') + 1;
    return minutes(item.startTime ?? '') < otherEnd && minutes(a.startTime ?? '') < itemEnd;
  });
}

type Decision = 'cancelled' | 'late' | 'early' | 'both';
export const ConflictDecision: React.FC<{ activity: Activity; conflicts: Activity[]; onClose: () => void }> = ({ activity, conflicts, onClose }) => {
  const [targetId, setTargetId] = useState(conflicts[0]?.id ?? activity.id);
  const [decision, setDecision] = useState<Decision>('cancelled');
  const [time, setTime] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const target = [activity, ...conflicts].find(a => a.id === targetId) ?? activity;
  const apply = async () => {
    setBusy(true); setError('');
    try {
      if (target.source !== 'cloud') throw new Error('Esta actividad aún es local. Edita su ficha para resolver el conflicto.');
      if ((decision === 'late' || decision === 'early') && (!time || (decision === 'late' && target.endTime && time >= target.endTime) || (decision === 'early' && target.startTime && time <= target.startTime))) {
        throw new Error('Selecciona una hora válida para llegar o salir.');
      }
      const parts = target.id.split(':');
      if (target.isRecurrent && parts[0] === 'cloud-recurring' && parts.length === 4) {
        const result = await enkaRepository.saveOccurrenceException({
          recurrence_rule_id: parts[1], recurrence_slot_id: parts[2], original_date: parts[3],
          exception_type: decision === 'cancelled' ? 'cancelled' : decision === 'both' ? 'overlap_accepted' : 'rescheduled',
          override_start_time: decision === 'late' ? time : target.startTime ?? null,
          override_end_time: decision === 'early' ? time : target.endTime ?? null
        });
        if (!result.success) throw result.error || new Error('No se pudo guardar.');
      } else if (!target.isRecurrent) {
        let metadata: Record<string, unknown> = {};
        if (decision === 'both') {
          const existing = await enkaRepository.fetchActivities();
          if (existing.error || !existing.data) throw existing.error || new Error('No se pudieron leer los datos actuales.');
          metadata = { ...(existing.data.find(a => a.id === target.id)?.metadata ?? {}),
            conflict_decision: 'attend_both', conflict_with: activity.id };
        }
        const result = await enkaRepository.updateActivity(target.id, decision === 'cancelled'
          ? { status: 'cancelled' }
          : decision === 'both' ? { metadata }
          : decision === 'late' ? { start_time: time } : { end_time: time });
        if (result.error) throw result.error;
      } else throw new Error('Esta rutina necesita un ajuste manual.');
      window.dispatchEvent(new Event('enka:data-changed'));
      onClose();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar'); }
    finally { setBusy(false); }
  };
  return <section style={{ display: 'flex', flexDirection: 'column', gap: 9, minWidth: 0, padding: 12,
    border: '1px solid var(--border-default)', borderRadius: 10, background: 'var(--bg-surface-subtle)' }}>
    <strong>Actividades que coinciden</strong>
    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Elige qué actividad ajustar. Nada cambia hasta que guardes tu decisión.</p>
    <label style={{ display: 'grid', gap: 4, fontSize: '0.78rem' }}>Actividad afectada
      <select value={targetId} onChange={e => setTargetId(e.target.value)} style={{ width: '100%', minWidth: 0, padding: 9 }}>
        {[activity, ...conflicts].map(a => <option key={a.id} value={a.id}>{a.title} · {a.startTime ?? 'Sin hora'}</option>)}
      </select>
    </label>
    <label style={{ display: 'grid', gap: 4, fontSize: '0.78rem' }}>¿Qué harás?
      <select value={decision} onChange={e => setDecision(e.target.value as Decision)} style={{ width: '100%', minWidth: 0, padding: 9 }}>
        <option value="cancelled">No asistiré a esta actividad</option>
        <option value="late">Llegaré más tarde</option>
        <option value="early">Saldré antes</option>
        <option value="both">Asistiré a ambas, acepto el solape</option>
      </select>
    </label>
    {(decision === 'late' || decision === 'early') && <label style={{ display: 'grid', gap: 4, fontSize: '0.78rem' }}>
      {decision === 'late' ? 'Hora prevista de llegada' : 'Hora prevista de salida'}
      <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ maxWidth: '100%', padding: 9 }}/>
    </label>}
    <button type="button" disabled={busy} onClick={() => void apply()}
      style={{ padding: 10, borderRadius: 8, background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 700 }}>
      {busy ? 'Guardando…' : 'Guardar decisión'}
    </button>
    {error && <p role="alert" style={{ color: '#dc2626', fontSize: '0.78rem' }}>{error}</p>}
  </section>;
};
