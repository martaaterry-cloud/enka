import React from 'react';
import { Icon } from './Icon';

interface TimeGapIndicatorProps {
  approximateStart?: string;
  approximateEnd?: string;
  durationDescription: string;
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
        margin: '4px 0 4px 52px',
        padding: '5px 10px',
        borderRadius: 'var(--radius-sm)',
        border: '1px dashed var(--gap-border)',
        backgroundColor: 'var(--gap-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.71875rem',
        color: 'var(--gap-text)',
        transition: 'var(--transition-fast)',
        minWidth: 0,
        gap: '6px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1, flexWrap: 'wrap' }}>
        <Icon name="Hourglass" size={11} color="var(--text-dim)" />
        {approximateStart && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
            {approximateStart}{approximateEnd ? ` — ${approximateEnd}` : ''}
          </span>
        )}
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }} className="truncate">
          {durationDescription}
        </span>
        {locationCity && (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.625rem' }}>
            ({locationCity})
          </span>
        )}
      </div>

      {onPlanInGap && (
        <button
          type="button"
          onClick={onPlanInGap}
          aria-label="Encajar plan en este hueco"
          style={{
            fontSize: '0.625rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            flexShrink: 0
          }}
        >
          <Icon name="Plus" size={10} />
          <span>Encajar</span>
        </button>
      )}
    </div>
  );
};
