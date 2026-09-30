import React from 'react';
import { Icon } from './Icon';

interface OverlapCalloutProps {
  planNote: string;
  withActivityTitle?: string;
}

export const OverlapCallout: React.FC<OverlapCalloutProps> = ({ planNote }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '8px 10px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        color: 'var(--text-secondary)',
        fontSize: '0.8125rem',
        marginTop: '6px',
        lineHeight: 1.4
      }}
    >
      <Icon name="Shuffle" size={15} color="#6366F1" style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <span style={{ fontWeight: 600, color: '#6366F1', marginRight: '4px' }}>Solape Aceptado:</span>
        <span>{planNote}</span>
      </div>
    </div>
  );
};
