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
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'trabajo');
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Title Input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Título de la actividad *
        </label>
        <input
          type="text"
          required
          placeholder="Ej: Entrenamiento, Tutoría TFG, Dentista..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 12px',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Categoría
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '6px' }}>
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
                  gap: '5px',
                  padding: '7px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? cat.bgColor : 'var(--bg-surface-subtle)',
                  border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.71875rem',
                  textAlign: 'left',
                  minWidth: 0,
                }}
              >
                <Icon name={cat.iconName} size={13} color={cat.color} />
                <span className="truncate">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date and Time Switches */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        {/* Flexible Toggles */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '2px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78125rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={isAllDay}
              onChange={(e) => {
                setIsAllDay(e.target.checked);
                if (e.target.checked) setIsTimePending(false);
              }}
              style={{ accentColor: 'var(--text-primary)' }}
            />
            <span>Todo el día</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78125rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
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
              style={{ accentColor: 'var(--text-primary)' }}
            />
            <span>Hora por concretar</span>
          </label>
        </div>

        {/* Time pickers */}
        {!isAllDay && !isTimePending && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Inicio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Location Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
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
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem'
          }}
        >
          <option value="">-- Seleccionar lugar habitual --</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.name} ({loc.city})
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
              padding: '8px 10px',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Certeza
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '6px' }}>
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
                  gap: '5px',
                  padding: '7px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)',
                  border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.71875rem',
                  minWidth: 0,
                }}
              >
                <Icon name={opt.icon} size={12} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Notas
        </label>
        <textarea
          rows={2}
          placeholder="Preparación previa, margen o detalles..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
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
      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: '9px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-default)',
            backgroundColor: 'var(--bg-surface-subtle)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.8125rem'
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            flex: 2,
            padding: '9px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontWeight: 700,
            fontSize: '0.8125rem',
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
      variant="form"
      title="Nueva actividad"
      icon="Plus"
      maxWidth="560px"
    >
      <ActivityForm initialDate={selectedDate} onClose={closeCreateModal} />
    </ModalSheet>
  );
};
