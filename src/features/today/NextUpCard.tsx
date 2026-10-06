import React from 'react';
import { useEnka } from '../../context';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { Icon } from '../../components/ui/Icon';
import { CertaintyIndicator } from '../../components/ui/CertaintyIndicator';

interface NextUpCardProps {
  activity: Activity | null;
  category?: Category;
  relativeTimeText?: string;
}

export const NextUpCard: React.FC<NextUpCardProps> = ({
  activity,
  category,
  relativeTimeText = 'A continuación'
}) => {
  const { openDetailModal } = useEnka();

  if (!activity) {
    return (
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: 0,
        }}
      >
        <Icon name="Sparkles" size={15} color="var(--status-confirmed)" />
        <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }} className="truncate">
          Sin actividades pendientes hoy. Tiempo libre.
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => openDetailModal(activity)}
      style={{
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        minWidth: 0,
        gap: '10px'
      }}
    >
      {/* Category accent line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          backgroundColor: category?.color || 'var(--text-primary)'
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: category?.bgColor || 'var(--bg-surface-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon
            name={category?.iconName || 'Calendar'}
            size={16}
            color={category?.color || 'var(--text-primary)'}
          />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-muted)'
              }}
              className="truncate"
            >
              Siguiente · {relativeTimeText}
            </span>
            <CertaintyIndicator certainty={activity.certainty} size="sm" />
          </div>

          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              marginTop: '1px',
              color: 'var(--text-primary)'
            }}
            className="truncate"
          >
            {activity.title}
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
              marginTop: '1px'
            }}
          >
            {activity.startTime && (
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, flexShrink: 0 }}>
                {activity.startTime}{activity.endTime ? ` – ${activity.endTime}` : ''}
              </span>
            )}
            {activity.locationCity && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', minWidth: 0 }} className="truncate">
                <Icon name="MapPin" size={10} color="var(--text-dim)" />
                <span className="truncate">{activity.locationName ? `${activity.locationName} (${activity.locationCity})` : activity.locationCity}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <Icon name="ChevronRight" size={14} color="var(--text-dim)" />
    </div>
  );
};
