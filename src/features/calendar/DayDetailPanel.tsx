import React from 'react';
import { useEnka } from '../../context';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { Icon } from '../../components/ui/Icon';
import { CertaintyIndicator } from '../../components/ui/CertaintyIndicator';
import { OverlapCallout } from '../../components/ui/OverlapCallout';
import { formatSpanishDateHeader } from '../../utils/dateUtils';

interface DayDetailPanelProps {
  date: string;
  activities: Activity[];
  categories: Category[];
  onOpenCreate: () => void;
}

export const DayDetailPanel: React.FC<DayDetailPanelProps> = ({
  date,
  activities,
  categories,
  onOpenCreate
}) => {
  const { openDetailModal } = useEnka();
  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  const formattedDate = React.useMemo(() => {
    return formatSpanishDateHeader(date);
  }, [date]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: 0,
        width: '100%'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Día seleccionado
          </span>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)', marginTop: '1px' }} className="truncate">
            {formattedDate}
          </h3>
        </div>

        <button
          type="button"
          onClick={onOpenCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.71875rem',
            fontWeight: 600,
            flexShrink: 0
          }}
        >
          <Icon name="Plus" size={12} />
          <span>Añadir</span>
        </button>
      </div>

      {/* Activities list */}
      {activities.length === 0 ? (
        <div
          style={{
            padding: '20px 14px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
            minWidth: 0
          }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Sin actividades programadas. Día libre.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          {activities.map(act => {
            const cat = categoryMap.get(act.categoryId);
            return (
              <div
                key={act.id}
                onClick={() => openDetailModal(act)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)',
                  minWidth: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, flex: 1 }}>
                    <h4
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        textDecoration: act.isCancelled ? 'line-through' : 'none',
                        opacity: act.isCancelled ? 0.6 : 1
                      }}
                      className="truncate"
                    >
                      {act.title}
                    </h4>
                    {act.isCancelled && (
                      <span
                        style={{
                          fontSize: '0.59375rem',
                          fontWeight: 700,
                          color: '#EF4444',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          padding: '1px 4px',
                          borderRadius: 'var(--radius-xs)',
                          flexShrink: 0
                        }}
                      >
                        Cancelada
                      </span>
                    )}
                    {cat && (
                      <span style={{ fontSize: '0.625rem', fontWeight: 600, color: cat.color }} className="truncate">
                        {cat.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                    <CertaintyIndicator certainty={act.certainty} customNote={act.certaintyNote} size="sm" />
                    <Icon name="ChevronRight" size={13} color="var(--text-muted)" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                  {act.startTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontFamily: 'var(--font-mono)' }}>
                      <Icon name="Clock" size={11} color="var(--text-dim)" />
                      <span>{act.startTime}{act.endTime ? ` – ${act.endTime}` : ''}</span>
                    </div>
                  )}

                  {act.timeNote && (
                    <div style={{ color: 'var(--status-pending)', fontStyle: 'italic' }}>
                      {act.timeNote}
                    </div>
                  )}

                  {act.locationName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: 0 }}>
                      <Icon name="MapPin" size={11} color="var(--text-dim)" />
                      <span className="truncate">{act.locationName}{act.locationCity ? ` (${act.locationCity})` : ''}</span>
                    </div>
                  )}
                </div>

                {act.isSportMatch && (
                  <div style={{ fontSize: '0.6875rem', color: '#B91C1C', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '3px 6px', borderRadius: 'var(--radius-xs)', marginTop: '2px' }}>
                    <strong>{act.isHomeMatch ? 'Partido en Bullas' : 'Partido fuera'}</strong> vs {act.opponent}.
                  </div>
                )}

                {act.knownOverlap?.accepted && (
                  <OverlapCallout planNote={act.knownOverlap.planNote} />
                )}

                {act.notes && (
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', margin: 0 }} className="break-words">
                    {act.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
