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
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}
      >
        <Icon name="Sparkles" size={16} color="var(--status-confirmed)" />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          No tienes más actividades fijas para hoy. Tiempo completamente libre.
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={() => openDetailModal(activity)}
      style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
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
            size={18}
            color={category?.color || 'var(--text-primary)'}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-muted)'
              }}
            >
              Siguiente · {relativeTimeText}
            </span>
            <CertaintyIndicator certainty={activity.certainty} size="sm" />
          </div>

          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '2px' }}>
            {activity.title}
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '2px'
            }}
          >
            {activity.startTime && (
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {activity.startTime} {activity.endTime ? `– ${activity.endTime}` : ''}
              </span>
            )}
            {activity.locationCity && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Icon name="MapPin" size={11} color="var(--text-dim)" />
                {activity.locationName ? `${activity.locationName} (${activity.locationCity})` : activity.locationCity}
              </span>
            )}
          </div>
        </div>
      </div>

      {activity.startTime && (
        <div style={{ textAlign: 'right', display: 'none' }} className="sm-block">
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {activity.startTime}
          </span>
        </div>
      )}
    </div>
  );
};
