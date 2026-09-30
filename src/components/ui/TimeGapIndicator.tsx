import React from 'react';
import { Icon } from './Icon';

interface TimeGapIndicatorProps {
  approximateStart?: string; // e.g. "aprox. 15:45"
  approximateEnd?: string;   // e.g. "17:00"
  durationDescription: string; // e.g. "~1 h 15 min disponible"
  locationCity?: string;
  onPlanInGap?: () => void;
}

export const TimeGapIndicator: React.FC<TimeGapIndicatorProps> = ({
  approximateStart,
  approximateEnd,
  durationDescription,
  locationCity = 'Bullas',
  onPlanInGap
}) => {
  return (
    <div
      style={{
        margin: '6px 0 6px 44px',
        padding: '6px 12px',
        borderRadius: 'var(--radius-sm)',
        border: '1px dashed var(--gap-border)',
        backgroundColor: 'var(--gap-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78125rem',
        color: 'var(--gap-text)',
        transition: 'var(--transition-fast)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <Icon name="Hourglass" size={13} color="var(--text-dim)" />
        {approximateStart && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {approximateStart} {approximateEnd ? `— ${approximateEnd}` : ''}
          </span>
        )}
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          {durationDescription}
        </span>
        {locationCity && (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.6875rem' }}>
            ({locationCity})
          </span>
        )}
      </div>

      {onPlanInGap && (
        <button
          onClick={onPlanInGap}
          aria-label="Encajar plan en este hueco"
          style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            flexShrink: 0
          }}
        >
          <Icon name="Plus" size={11} />
          <span>Encajar</span>
        </button>
      )}
    </div>
  );
};
