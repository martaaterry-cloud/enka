import React from 'react';
import { Icon } from '../../components/ui/Icon';

interface WeeklyGoalsCardProps {
  summary: {
    totalAvailableFreeHours: number;
    gymSessionsCompleted: number;
    gymSessionsTarget: number;
  };
}

export const WeeklyGoalsCard: React.FC<WeeklyGoalsCardProps> = ({ summary }) => {
  const pendingGym = Math.max(0, summary.gymSessionsTarget - summary.gymSessionsCompleted);

  return (
    <div
      style={{
        padding: '12px 14px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: 0,
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <Icon name="Compass" size={15} color="var(--text-primary)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
            Disponibilidad semanal
          </span>
        </div>
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: 'var(--status-confirmed)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            flexShrink: 0
          }}
        >
          ~{summary.totalAvailableFreeHours}h libres
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
        Margen para {pendingGym > 0 ? `${pendingGym} sesiones de gimnasio pendientes` : 'todas tus sesiones completadas'} y tiempo flexible.
      </p>
    </div>
  );
};
