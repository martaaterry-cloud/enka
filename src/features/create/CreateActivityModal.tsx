import React, { useState } from 'react';
import { useEnka } from '../../context';
import { ModalSheet } from '../../components/ui/ModalSheet';
import type { CertaintyLevel } from '../../models/activity';
import { Icon } from '../../components/ui/Icon';
import { getTodayDateString } from '../../utils/dateUtils';

interface ActivityFormProps {
  initialDate: string;
  onClose: () => void;
}

const ActivityForm: React.FC<ActivityFormProps> = ({ initialDate, onClose }) => {
  const { addActivity, categories, locations } = useEnka();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('trabajo');
  const [date, setDate] = useState(initialDate || getTodayDateString());
  const [isAllDay, setIsAllDay] = useState(false);
  const [isTimePending, setIsTimePending] = useState(false);
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:30');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [customLocationName, setCustomLocationName] = useState('');
  const [certainty, setCertainty] = useState<CertaintyLevel>('confirmed');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const loc = locations.find(l => l.id === selectedLocationId);

    addActivity({
      title: title.trim(),
      categoryId,
      date,
      startTime: isAllDay || isTimePending ? undefined : startTime,
      endTime: isAllDay || isTimePending ? undefined : endTime,
      isAllDay,
      isTimePending,
      locationId: loc?.id,
      locationName: loc?.name || customLocationName || undefined,
      locationCity: loc?.city || 'Bullas',
      travelBeforeMinutes: loc?.defaultTravelFromHomeMinutes || 0,
      certainty,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  const certaintyOptions: { value: CertaintyLevel; label: string; icon: string }[] = [
    { value: 'confirmed', label: 'Confirmado', icon: 'CheckCircle2' },
    { value: 'pending_time', label: 'Hora pendiente', icon: 'Clock' },
    { value: 'probable', label: 'Probable', icon: 'HelpCircle' },
    { value: 'conditional', label: 'Condicional', icon: 'GitBranch' }
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title Input */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Título de la actividad *
        </label>
        <input
          type="text"
          required
          placeholder="Ej. Entrenamiento, Tutoría TFG, Dentista..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.9375rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Category Selector */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Categoría
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }}>
          {categories.map(cat => {
            const isSelected = categoryId === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? cat.bgColor : 'var(--bg-surface-subtle)',
                  border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.75rem',
                  textAlign: 'left'
                }}
              >
                <Icon name={cat.iconName} size={14} color={cat.color} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date and Time Switches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)'
            }}
          />
        </div>

        {/* Flexible Toggles */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => {
                setIsAllDay(e.target.checked);
                if (e.target.checked) setIsTimePending(false);
              }}
            />
            <span>Todo el día</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={isTimePending}
              onChange={(e) => {
                setIsTimePending(e.target.checked);
                if (e.target.checked) {
                  setIsAllDay(false);
                  setCertainty('pending_time');
                }
              }}
            />
            <span>Hora por concretar</span>
          </label>
        </div>

        {/* Time pickers if not all-day/pending */}
        {!isAllDay && !isTimePending && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Hora inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Hora fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Location Selector */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Ubicación
        </label>
        <select
          value={selectedLocationId}
          onChange={(e) => {
            setSelectedLocationId(e.target.value);
            if (e.target.value) setCustomLocationName('');
          }}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)',
            marginBottom: '6px'
          }}
        >
          <option value="">-- Seleccionar lugar habitual --</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.city}) — ~{loc.defaultTravelFromHomeMinutes} min desde Bullas
            </option>
          ))}
        </select>

        {!selectedLocationId && (
          <input
            type="text"
            placeholder="O escribe otra ubicación..."
            value={customLocationName}
            onChange={(e) => setCustomLocationName(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem'
            }}
          />
        )}
      </div>

      {/* Certainty Level */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Estado de Certeza
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {certaintyOptions.map(opt => {
            const isSelected = certainty === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setCertainty(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)',
                  border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.75rem'
                }}
              >
                <Icon name={opt.icon} size={13} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Notas / Logística
        </label>
        <textarea
          rows={2}
          placeholder="Preparación previa, margen, avisos o detalles..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            resize: 'none'
          }}
        />
      </div>

      {/* Submit Actions */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            flex: 2,
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          Guardar Actividad
        </button>
      </div>
    </form>
  );
};

export const CreateActivityModal: React.FC = () => {
  const { isCreateModalOpen, closeCreateModal, selectedDate } = useEnka();

  if (!isCreateModalOpen) return null;

  return (
    <ModalSheet
      isOpen={isCreateModalOpen}
      onClose={closeCreateModal}
      title="Nueva Actividad"
      subtitle="Organiza tu tiempo con flexibilidad y contexto real."
    >
      <ActivityForm initialDate={selectedDate} onClose={closeCreateModal} />
    </ModalSheet>
  );
};
