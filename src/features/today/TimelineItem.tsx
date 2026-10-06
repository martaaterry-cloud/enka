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
        gap: '8px',
        position: 'relative',
        paddingBottom: isLast ? '0' : '10px',
        minWidth: 0,
        width: '100%'
      }}
    >
      {/* Time Column */}
      <div
        style={{
          width: '44px',
          minWidth: '44px',
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
                fontSize: '0.78125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.15
              }}
            >
              {activity.startTime}
            </div>
            {activity.endTime ? (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65625rem',
                  color: 'var(--text-dim)',
                  marginTop: '1px'
                }}
              >
                {activity.endTime}
              </div>
            ) : activity.isEndTimeUnknown ? (
              <div
                style={{
                  fontSize: '0.59375rem',
                  color: 'var(--text-dim)',
                  marginTop: '1px',
                  fontStyle: 'italic'
                }}
              >
                Flexible
              </div>
            ) : null}
          </>
        ) : (
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {activity.isAllDay ? 'Todo el día' : 'Pendiente'}
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
          position: 'relative',
          width: '18px'
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: category?.bgColor || 'var(--bg-surface-subtle)',
            border: `2px solid ${category?.color || 'var(--border-default)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            marginTop: '1px'
          }}
        >
          <Icon
            name={category?.iconName || 'CircleDot'}
            size={9}
            color={category?.color || 'var(--text-primary)'}
          />
        </div>

        {!isLast && (
          <div
            style={{
              position: 'absolute',
              top: '19px',
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
          minWidth: 0,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 10px',
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
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, flex: 1 }}>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.25,
                textDecoration: activity.isCancelled ? 'line-through' : 'none',
                opacity: activity.isCancelled ? 0.6 : 1
              }}
              className="truncate"
            >
              {activity.title}
            </h4>
            {activity.isCancelled && (
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
            {category && (
              <span
                style={{
                  fontSize: '0.59375rem',
                  fontWeight: 600,
                  color: category.color,
                  backgroundColor: category.bgColor,
                  padding: '1px 4px',
                  borderRadius: 'var(--radius-xs)',
                  flexShrink: 0
                }}
                className="truncate"
              >
                {category.name}
              </span>
            )}
          </div>

          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
            {activity.certainty !== 'confirmed' && (
              <CertaintyIndicator
                certainty={activity.certainty}
                customNote={activity.certaintyNote}
                size="sm"
              />
            )}
            <Icon name="ChevronRight" size={13} color="var(--text-muted)" />
          </div>
        </div>

        {/* Location & Logistical Context (Compact) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px',
            marginTop: '3px',
            fontSize: '0.6875rem',
            color: 'var(--text-secondary)'
          }}
        >
          {activity.locationName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', minWidth: 0 }}>
              <Icon name="MapPin" size={10} color="var(--text-dim)" />
              <span className="truncate">
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
                gap: '2px',
                color: '#EF4444',
                fontWeight: 600
              }}
            >
              <Icon name="Timer" size={10} />
              <span>1h antes</span>
            </div>
          )}
        </div>

        {/* Sport match cues */}
        {activity.isSportMatch && (
          <div
            style={{
              marginTop: '4px',
              padding: '3px 6px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '0.6875rem',
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

        {/* Secondary Notes if present */}
        {(activity.notes || activity.recurrencePattern) && (
          <div
            style={{
              marginTop: '4px',
              paddingTop: '4px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)'
            }}
          >
            {activity.notes && <p style={{ lineHeight: 1.3, margin: 0 }} className="break-words">{activity.notes}</p>}
            {activity.recurrencePattern && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: activity.notes ? '2px' : 0, color: 'var(--text-dim)' }}>
                <Icon name="Repeat" size={10} />
                <span className="truncate">{activity.recurrencePattern}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
