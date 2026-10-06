import React, { useState } from 'react';
import { useEnka } from '../../context';
import { ModalSheet } from '../../components/ui/ModalSheet';
import type { Activity, CertaintyLevel } from '../../models/activity';
import type { Category } from '../../models/category';
import { Icon } from '../../components/ui/Icon';
import { CertaintyIndicator } from '../../components/ui/CertaintyIndicator';
import { OverlapCallout } from '../../components/ui/OverlapCallout';
import { formatSpanishDateHeader, getRelativeDayLabel } from '../../utils/dateUtils';

type ModalMode = 'view' | 'edit';
type PendingAction = 'edit' | 'cancel' | 'delete' | null;
type RecurrenceScope = 'this_occurrence' | 'following_occurrences' | 'all_occurrences';

interface ActivityDetailContentProps {
  activity: Activity;
  onClose: () => void;
}

const ActivityDetailContent: React.FC<ActivityDetailContentProps> = ({ activity, onClose }) => {
  const {
    categories,
    locations,
    updateActivity,
    cancelActivity,
    deleteActivity
  } = useEnka();

  const [mode, setMode] = useState<ModalMode>('view');

  // Form State initialized directly from props
  const [title, setTitle] = useState(activity.title);
  const [categoryId, setCategoryId] = useState(activity.categoryId);
  const [date, setDate] = useState(activity.date);
  const [isAllDay, setIsAllDay] = useState(Boolean(activity.isAllDay));
  const [isTimePending, setIsTimePending] = useState(Boolean(activity.isTimePending));
  const [startTime, setStartTime] = useState(activity.startTime || '08:00');
  const [endTime, setEndTime] = useState(activity.endTime || '15:00');
  const [isEndTimeUnknown, setIsEndTimeUnknown] = useState(Boolean(activity.isEndTimeUnknown));
  const [selectedLocationId, setSelectedLocationId] = useState(activity.locationId || '');
  const [customLocationName, setCustomLocationName] = useState(activity.locationName || '');
  const [customLocationCity, setCustomLocationCity] = useState(activity.locationCity || '');
  const [certainty, setCertainty] = useState<CertaintyLevel>(activity.certainty);
  const [notes, setNotes] = useState(activity.notes || '');

  // Scope & Confirmation Modals
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const currentCategory = categories.find((c: Category) => c.id === activity.categoryId);
  const isRecurrent = Boolean(activity.isRecurrent);
  const formattedDate = formatSpanishDateHeader(activity.date);
  const relativeLabel = getRelativeDayLabel(activity.date);

  const getFormPayload = (): Partial<Activity> => {
    const loc = locations.find(l => l.id === selectedLocationId);
    return {
      title: title.trim(),
      categoryId,
      date,
      isAllDay,
      isTimePending,
      startTime: isAllDay || isTimePending ? undefined : startTime,
      endTime: isAllDay || isTimePending || isEndTimeUnknown ? undefined : endTime,
      isEndTimeUnknown,
      locationId: selectedLocationId || undefined,
      locationName: loc?.name || (customLocationName.trim() || undefined),
      locationCity: loc?.city || (customLocationCity.trim() || undefined),
      certainty,
      notes: notes.trim() || undefined
    };
  };

  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isRecurrent) {
      setPendingAction('edit');
      setIsScopeModalOpen(true);
    } else {
      updateActivity(activity.id, getFormPayload(), 'this_occurrence');
      setMode('view');
    }
  };

  const handleCancelClick = () => {
    if (isRecurrent) {
      setPendingAction('cancel');
      setIsScopeModalOpen(true);
    } else {
      setIsCancelConfirmOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (isRecurrent) {
      setPendingAction('delete');
      setIsScopeModalOpen(true);
    } else {
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleScopeSelect = (scope: RecurrenceScope) => {
    if (pendingAction === 'edit') {
      updateActivity(activity.id, getFormPayload(), scope);
      setMode('view');
    } else if (pendingAction === 'cancel') {
      cancelActivity(activity.id, scope);
    } else if (pendingAction === 'delete') {
      deleteActivity(activity.id, scope);
      onClose();
    }

    setIsScopeModalOpen(false);
    setPendingAction(null);
  };

  const certaintyOptions: { value: CertaintyLevel; label: string; icon: string }[] = [
    { value: 'confirmed', label: 'Confirmado', icon: 'CheckCircle2' },
    { value: 'pending_time', label: 'Horario pendiente', icon: 'Clock' },
    { value: 'probable', label: 'Probable', icon: 'Sparkles' },
    { value: 'conditional', label: 'Condicional', icon: 'ShieldAlert' }
  ];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* ========================================================= */}
        {/* VIEW MODE */}
        {/* ========================================================= */}
        {mode === 'view' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cancelled Alert Banner */}
            {activity.isCancelled && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444'
                }}
              >
                <Icon name="XCircle" size={18} color="#EF4444" />
                <div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                    Actividad cancelada
                  </span>
                  {activity.cancellationReason && (
                    <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.9 }}>
                      {activity.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Title & Category Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {currentCategory && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: currentCategory.color,
                        backgroundColor: currentCategory.bgColor,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Icon name={currentCategory.iconName} size={11} color={currentCategory.color} />
                      {currentCategory.name}
                    </span>
                  )}

                  {isRecurrent && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: '#6366F1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <Icon name="Repeat" size={11} color="#6366F1" />
                      {activity.isOccurrenceException ? 'Excepción puntual' : 'Serie recurrente'}
                    </span>
                  )}

                  <CertaintyIndicator certainty={activity.certainty} customNote={activity.certaintyNote} size="sm" />
                </div>

                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    textDecoration: activity.isCancelled ? 'line-through' : 'none',
                    opacity: activity.isCancelled ? 0.7 : 1
                  }}
                >
                  {activity.title}
                </h2>
              </div>
            </div>

            {/* Overlap Callout if exists */}
            {activity.knownOverlap?.accepted && (
              <OverlapCallout
                withActivityTitle={activity.knownOverlap.withActivityTitle}
                planNote={activity.knownOverlap.planNote}
              />
            )}

            {/* Key Details Card */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px'
              }}
            >
              {/* Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem' }}>
                <Icon name="Calendar" size={16} color="var(--text-muted)" />
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formattedDate}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({relativeLabel})</span>
                </div>
              </div>

              {/* Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem' }}>
                <Icon name="Clock" size={16} color="var(--text-muted)" />
                <div>
                  {activity.isAllDay ? (
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Todo el día</span>
                  ) : activity.isTimePending ? (
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Horario pendiente por confirmar
                    </span>
                  ) : (
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {activity.startTime}
                      {activity.endTime ? ` — ${activity.endTime}` : activity.isEndTimeUnknown ? ' (Fin por determinar)' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Location */}
              {(activity.locationName || activity.locationCity) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8125rem' }}>
                  <Icon name="MapPin" size={16} color="var(--text-muted)" />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {activity.locationName || ''}
                    {activity.locationCity ? ` (${activity.locationCity})` : ''}
                  </span>
                </div>
              )}

              {/* Travel & Returns */}
              {activity.returnTravelTransition && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--travel-text)',
                    backgroundColor: 'var(--travel-bg)',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    marginTop: '2px'
                  }}
                >
                  <Icon name="Car" size={13} color="var(--travel-text)" />
                  <span>
                    Regreso a {activity.returnTravelTransition.toLocation || 'Bullas'} · Salida {activity.returnTravelTransition.departureEstimate} · Llegada {activity.returnTravelTransition.arrivalEstimate}
                  </span>
                </div>
              )}

              {/* Recurrence Pattern Info */}
              {isRecurrent && activity.recurrencePattern && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Icon name="Repeat" size={14} color="var(--text-muted)" />
                  <span>Pauta: {activity.recurrencePattern}</span>
                </div>
              )}
            </div>

            {/* Notes if present */}
            {activity.notes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Notas
                </span>
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1.4
                  }}
                >
                  {activity.notes}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '6px',
                marginTop: '6px'
              }}
            >
              <button
                type="button"
                onClick={() => setMode('edit')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--text-inverse)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: 0,
                }}
              >
                <Icon name="Edit3" size={13} />
                <span className="truncate">Editar</span>
              </button>

              <button
                type="button"
                onClick={handleCancelClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activity.isCancelled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                  color: activity.isCancelled ? '#10B981' : '#EF4444',
                  border: activity.isCancelled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: 0,
                }}
              >
                <Icon name={activity.isCancelled ? 'CheckCircle2' : 'XCircle'} size={13} />
                <span className="truncate">{activity.isCancelled ? 'Reanudar' : 'Cancelar'}</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 6px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: '#EF4444',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: 0,
                }}
              >
                <Icon name="Trash2" size={13} color="#EF4444" />
                <span className="truncate">Eliminar</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* EDIT FORM MODE */}
        {/* ========================================================= */}
        {mode === 'edit' && (
          <form onSubmit={handleSaveClick} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Title input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Título de la actividad *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Entrenamiento, Trabajo, Peluquería..."
                required
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Category picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Categoría
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '6px' }}>
                {categories.map((cat: Category) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? `2px solid ${cat.color}` : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? cat.bgColor : 'var(--bg-surface-subtle)',
                        color: isSelected ? cat.color : 'var(--text-secondary)',
                        fontSize: '0.71875rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
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

            {/* Date & Time Switches */}
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              {/* Date Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem'
                  }}
                />
              </div>

              {/* All day toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  style={{ accentColor: 'var(--text-primary)' }}
                />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Día completo</span>
              </label>

              {!isAllDay && (
                <>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8125rem' }}>
                    <input
                      type="checkbox"
                      checked={isTimePending}
                      onChange={(e) => setIsTimePending(e.target.checked)}
                      style={{ accentColor: 'var(--text-primary)' }}
                    />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Hora por determinar</span>
                  </label>

                  {!isTimePending && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isEndTimeUnknown ? '1fr' : '1fr 1fr', gap: '8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            Hora de inicio
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-default)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-primary)',
                              fontSize: '0.8125rem',
                              fontFamily: 'var(--font-mono)'
                            }}
                          />
                        </div>

                        {!isEndTimeUnknown && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                              Hora de fin
                            </label>
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              style={{
                                padding: '8px 10px',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-default)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '0.8125rem',
                                fontFamily: 'var(--font-mono)'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <input
                          type="checkbox"
                          checked={isEndTimeUnknown}
                          onChange={(e) => setIsEndTimeUnknown(e.target.checked)}
                          style={{ accentColor: 'var(--text-primary)' }}
                        />
                        <span>Hora de fin flexible / sin fijar</span>
                      </label>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Location Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Ubicación
              </label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {locations.map(loc => {
                  const isSelected = selectedLocationId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedLocationId('');
                        } else {
                          setSelectedLocationId(loc.id);
                          setCustomLocationName('');
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--text-primary)' : 'var(--bg-surface-subtle)',
                        color: isSelected ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        cursor: 'pointer'
                      }}
                    >
                      {loc.name} ({loc.city})
                    </button>
                  );
                })}
              </div>

              {!selectedLocationId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="text"
                    placeholder="Lugar (ej: Pabellón, Peluquería...)"
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
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={customLocationCity}
                    onChange={(e) => setCustomLocationCity(e.target.value)}
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
                </div>
              )}
            </div>

            {/* Certainty State Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Estado de certeza
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {certaintyOptions.map(opt => {
                  const isSelected = certainty === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCertainty(opt.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--bg-surface-elevated)' : 'var(--bg-surface-subtle)',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer'
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Notas
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalles, equipamiento, instrucciones..."
                style={{
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

            {/* Edit Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setMode('view')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
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
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Guardar cambios
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================= */}
      {/* RECURRENCE SCOPE SELECTION MODAL */}
      {/* ========================================================= */}
      {isScopeModalOpen && (
        <ModalSheet
          isOpen={isScopeModalOpen}
          onClose={() => {
            setIsScopeModalOpen(false);
            setPendingAction(null);
          }}
          variant="compact"
          title={
            pendingAction === 'edit'
              ? '¿Qué quieres modificar?'
              : pendingAction === 'cancel'
              ? '¿Qué quieres cancelar?'
              : '¿Qué quieres eliminar?'
          }
          subtitle={`Actividad recurrente · ${activity.title}`}
          maxWidth="420px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>
              Esta actividad se repite periódicamente. Elige el alcance de tu acción:
            </p>

            <button
              onClick={() => handleScopeSelect('this_occurrence')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '3px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="CalendarCheck" size={16} color="var(--text-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Solo esta vez
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Modifica únicamente la ocurrencia del {formattedDate}. El resto de sesiones conservará su horario habitual.
              </span>
            </button>

            <button
              onClick={() => handleScopeSelect('following_occurrences')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '3px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="FastForward" size={16} color="var(--text-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Esta y las siguientes
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Aplica a partir del {formattedDate} y en todas las fechas futuras de la serie.
              </span>
            </button>

            <button
              onClick={() => handleScopeSelect('all_occurrences')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '3px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="Repeat" size={16} color="var(--text-primary)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Toda la serie
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Aplica a todas las ocurrencias pasadas y futuras de esta serie recurrente.
              </span>
            </button>

            <button
              onClick={() => {
                setIsScopeModalOpen(false);
                setPendingAction(null);
              }}
              style={{
                marginTop: '6px',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Volver
            </button>
          </div>
        </ModalSheet>
      )}

      {/* ========================================================= */}
      {/* DELETE CONFIRMATION DIALOG (NON-RECURRENT) */}
      {/* ========================================================= */}
      {isDeleteConfirmOpen && (
        <ModalSheet
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          variant="compact"
          title="¿Eliminar actividad?"
          maxWidth="380px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              ¿Estás seguro de que quieres eliminar &quot;<strong>{activity.title}</strong>&quot;? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Volver
              </button>
              <button
                onClick={() => {
                  deleteActivity(activity.id, 'this_occurrence');
                  setIsDeleteConfirmOpen(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: '#EF4444',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* ========================================================= */}
      {/* CANCEL CONFIRMATION DIALOG (NON-RECURRENT) */}
      {/* ========================================================= */}
      {isCancelConfirmOpen && (
        <ModalSheet
          isOpen={isCancelConfirmOpen}
          onClose={() => setIsCancelConfirmOpen(false)}
          variant="compact"
          title={activity.isCancelled ? '¿Reanudar actividad?' : '¿Cancelar actividad?'}
          maxWidth="380px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
              {activity.isCancelled
                ? `¿Deseas reactivar la actividad "${activity.title}"?`
                : `¿Deseas marcar la actividad "${activity.title}" como cancelada? No se borrará de la agenda pero figurará como cancelada.`}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Volver
              </button>
              <button
                onClick={() => {
                  if (activity.isCancelled) {
                    updateActivity(activity.id, { isCancelled: false, cancellationReason: undefined }, 'this_occurrence');
                  } else {
                    cancelActivity(activity.id, 'this_occurrence', 'Cancelada por el usuario');
                  }
                  setIsCancelConfirmOpen(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: activity.isCancelled ? '#10B981' : '#EF4444',
                  color: '#ffffff',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {activity.isCancelled ? 'Reanudar' : 'Confirmar cancelación'}
              </button>
            </div>
          </div>
        </ModalSheet>
      )}
    </>
  );
};

export const ActivityDetailModal: React.FC = () => {
  const { selectedActivity, isDetailModalOpen, closeDetailModal } = useEnka();

  if (!selectedActivity || !isDetailModalOpen) return null;

  return (
    <ModalSheet
      isOpen={isDetailModalOpen}
      onClose={closeDetailModal}
      variant="form"
      title="Detalle de actividad"
      subtitle={`${getRelativeDayLabel(selectedActivity.date)} · ${formatSpanishDateHeader(selectedActivity.date)}`}
      maxWidth="560px"
    >
      <ActivityDetailContent
        key={`${selectedActivity.id}-${selectedActivity.date}-${selectedActivity.startTime}-${selectedActivity.isCancelled ? 'c' : 'a'}`}
        activity={selectedActivity}
        onClose={closeDetailModal}
      />
    </ModalSheet>
  );
};
