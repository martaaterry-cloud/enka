import React from 'react';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { TimelineItem } from './TimelineItem';
import { TimeGapIndicator } from '../../components/ui/TimeGapIndicator';
import { Icon } from '../../components/ui/Icon';

interface TimelineListProps {
  activities: Activity[];
  categories: Category[];
  onOpenCreate: (slotTime?: string) => void;
}

export const TimelineList: React.FC<TimelineListProps> = ({
  activities,
  categories,
  onOpenCreate
}) => {
  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  const sortedActivities = React.useMemo(() => {
    return [...activities].sort((a, b) => {
      if (a.isAllDay) return -1;
      if (b.isAllDay) return 1;
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [activities]);

  if (sortedActivities.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px 16px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-default)'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}
        >
          <Icon name="CalendarCheck" size={18} color="var(--text-muted)" />
        </div>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Sin actividades programadas
        </h4>
        <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '2px', margin: '2px auto 12px auto' }}>
          Día completamente libre.
        </p>
        <button
          onClick={() => onOpenCreate()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.78125rem',
            fontWeight: 600
          }}
        >
          <Icon name="Plus" size={13} />
          <span>Añadir actividad</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', marginTop: '10px' }}>
      {sortedActivities.map((act, idx) => {
        const cat = categoryMap.get(act.categoryId);
        const nextAct = sortedActivities[idx + 1];

        // Specific contextual gaps for Marta's Tuesday 29 Sept
        const isAfterSyte = act.id === 'act-today-1' && nextAct?.id === 'act-today-2';
        const isAfterPeluqueria = act.id === 'act-today-2' && idx === sortedActivities.length - 1;

        return (
          <React.Fragment key={act.id}>
            <TimelineItem
              activity={act}
              category={cat}
              isLast={idx === sortedActivities.length - 1 && !isAfterPeluqueria}
            />

            {/* Commute return with realistic estimated departure & arrival margins (NO false precision) */}
            {act.returnTravelTransition && (
              <div
                style={{
                  margin: '0 0 6px 60px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.71875rem',
                  color: 'var(--travel-text)',
                  backgroundColor: 'var(--travel-bg)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-xs)',
                  width: 'fit-content'
                }}
              >
                <Icon name="Car" size={11} color="var(--text-muted)" />
                <span>
                  Regreso a {act.returnTravelTransition.toLocation || 'Bullas'} · Salida {act.returnTravelTransition.departureEstimate} · Llegada {act.returnTravelTransition.arrivalEstimate}
                </span>
              </div>
            )}

            {/* Gap with approximate start/end */}
            {isAfterSyte && (
              <TimeGapIndicator
                approximateStart="Aprox. desde 15:45"
                approximateEnd="17:00"
                durationDescription="~1 h 15 min disponible"
                locationCity="Bullas"
                onPlanInGap={() => onOpenCreate('15:45')}
              />
            )}

            {/* Free evening after Peluquería (uncertain start, depending on salon exit) */}
            {isAfterPeluqueria && (
              <TimeGapIndicator
                durationDescription="Tarde/noche libre (según salida de peluquería)"
                locationCity="Bullas"
                onPlanInGap={() => onOpenCreate()}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
