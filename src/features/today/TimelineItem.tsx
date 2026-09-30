import React from 'react';
import { useEnka } from '../../context';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { Icon } from '../../components/ui/Icon';
import { CertaintyIndicator } from '../../components/ui/CertaintyIndicator';
import { OverlapCallout } from '../../components/ui/OverlapCallout';

interface TimelineItemProps {
  activity: Activity;
  category?: Category;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  activity,
  category,
  isLast = false
}) => {
  const { openDetailModal } = useEnka();

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        position: 'relative',
        paddingBottom: isLast ? '0' : '14px'
      }}
    >
      {/* Time Column */}
      <div
        style={{
          width: '50px',
          flexShrink: 0,
          textAlign: 'right',
          paddingTop: '2px'
        }}
      >
        {activity.startTime ? (
          <>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.2
              }}
            >
              {activity.startTime}
            </div>
            {activity.endTime ? (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                  marginTop: '1px'
                }}
              >
                {activity.endTime}
              </div>
            ) : activity.isEndTimeUnknown ? (
              <div
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--text-dim)',
                  marginTop: '1px',
                  fontStyle: 'italic'
                }}
              >
                Fin s/fijar
              </div>
            ) : null}
          </>
        ) : (
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {activity.isAllDay ? 'Día compl.' : 'Pendiente'}
          </span>
        )}
      </div>

      {/* Vertical Spine & Node */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: category?.bgColor || 'var(--bg-surface-subtle)',
            border: `2px solid ${category?.color || 'var(--border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <Icon
            name={category?.iconName || 'CircleDot'}
            size={10}
            color={category?.color || 'var(--text-primary)'}
          />
        </div>

        {!isLast && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              bottom: '-2px',
              width: '2px',
              backgroundColor: 'var(--border-subtle)',
              zIndex: 1
            }}
          />
        )}
      </div>

      {/* Main Card */}
      <div
        onClick={() => openDetailModal(activity)}
        style={{
          flex: 1,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          boxShadow: 'var(--shadow-sm)',
          cursor: 'pointer',
          transition: 'var(--transition-fast)'
        }}
      >
        {/* Title + Category + Certainty */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textDecoration: activity.isCancelled ? 'line-through' : 'none',
                opacity: activity.isCancelled ? 0.6 : 1
              }}
            >
              {activity.title}
            </h4>
            {activity.isCancelled && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  color: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  flexShrink: 0
                }}
              >
                Cancelada
              </span>
            )}
            {category && (
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: category.color,
                  backgroundColor: category.bgColor,
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-xs)',
                  flexShrink: 0
                }}
              >
                {category.name}
              </span>
            )}
          </div>

          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {activity.certainty !== 'confirmed' && (
              <CertaintyIndicator
                certainty={activity.certainty}
                customNote={activity.certaintyNote}
                size="sm"
              />
            )}
            <Icon name="ChevronRight" size={14} color="var(--text-muted)" />
          </div>
        </div>

        {/* Location & Logistical Context (Compact) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '10px',
            marginTop: '4px',
            fontSize: '0.71875rem',
            color: 'var(--text-secondary)'
          }}
        >
          {activity.locationName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Icon name="MapPin" size={11} color="var(--text-dim)" />
              <span>
                {activity.locationName}
                {activity.locationCity && ` (${activity.locationCity})`}
              </span>
            </div>
          )}

          {activity.preparationMinutes && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                color: '#EF4444',
                fontWeight: 600
              }}
            >
              <Icon name="Timer" size={11} />
              <span>1h antes en pabellón</span>
            </div>
          )}
        </div>

        {/* Sport match cues */}
        {activity.isSportMatch && (
          <div
            style={{
              marginTop: '6px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.71875rem',
              color: '#B91C1C'
            }}
          >
            <strong>{activity.isHomeMatch ? 'Partido en Bullas' : 'Partido fuera'}</strong> vs {activity.opponent}.
          </div>
        )}

        {/* Solape Aceptado */}
        {activity.knownOverlap?.accepted && (
          <OverlapCallout
            planNote={activity.knownOverlap.planNote}
            withActivityTitle={activity.knownOverlap.withActivityTitle}
          />
        )}

        {/* Secondary Notes & Pattern if present */}
        {(activity.notes || activity.recurrencePattern) && (
          <div
            style={{
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.71875rem',
              color: 'var(--text-muted)'
            }}
          >
            {activity.notes && <p style={{ lineHeight: 1.35, margin: 0 }}>{activity.notes}</p>}
            {activity.recurrencePattern && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: activity.notes ? '4px' : 0, color: 'var(--text-dim)' }}>
                <Icon name="Repeat" size={11} />
                <span>{activity.recurrencePattern}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
