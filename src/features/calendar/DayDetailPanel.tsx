import React from 'react';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { Icon } from '../../components/ui/Icon';
import { CertaintyIndicator } from '../../components/ui/CertaintyIndicator';
import { OverlapCallout } from '../../components/ui/OverlapCallout';

interface DayDetailPanelProps {
  date: string; // YYYY-MM-DD
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
  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  const formattedDate = React.useMemo(() => {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  }, [date]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Detalle del día seleccionado
          </span>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, textTransform: 'capitalize', color: 'var(--text-primary)', marginTop: '2px' }}>
            {formattedDate}
          </h3>
        </div>

        <button
          onClick={onOpenCreate}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          <Icon name="Plus" size={13} />
          <span>Añadir</span>
        </button>
      </div>

      {/* Activities list for selected day */}
      {activities.length === 0 ? (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)'
          }}
        >
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            No hay actividades programadas. Día completamente libre.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.map(act => {
            const cat = categoryMap.get(act.categoryId);
            return (
              <div
                key={act.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {act.title}
                    </h4>
                    {cat && (
                      <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: cat.color }}>
                        {cat.name}
                      </span>
                    )}
                  </div>
                  <CertaintyIndicator certainty={act.certainty} customNote={act.certaintyNote} size="sm" />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {act.startTime && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)' }}>
                      <Icon name="Clock" size={12} color="var(--text-dim)" />
                      <span>{act.startTime} {act.endTime ? `– ${act.endTime}` : ''}</span>
                    </div>
                  )}

                  {act.timeNote && (
                    <div style={{ color: 'var(--status-pending)', fontStyle: 'italic' }}>
                      {act.timeNote}
                    </div>
                  )}

                  {act.locationName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon name="MapPin" size={12} color="var(--text-dim)" />
                      <span>{act.locationName} ({act.locationCity})</span>
                    </div>
                  )}
                </div>

                {act.isSportMatch && (
                  <div style={{ fontSize: '0.75rem', color: '#B91C1C', backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '4px 8px', borderRadius: 'var(--radius-xs)', marginTop: '4px' }}>
                    <strong>{act.isHomeMatch ? 'Partido LOCAL en Pabellón Juan Valera (Bullas)' : 'Partido VISITANTE'}</strong> vs {act.opponent}. Convocatoria 1h antes.
                  </div>
                )}

                {act.knownOverlap?.accepted && (
                  <OverlapCallout planNote={act.knownOverlap.planNote} />
                )}

                {act.notes && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
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
