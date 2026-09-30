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
        padding: '14px 16px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="Compass" size={16} color="var(--text-primary)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Disponibilidad semanal aproximada
          </span>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--status-confirmed)',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}
        >
          ~{summary.totalAvailableFreeHours}h en huecos
        </span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        Semana con margen para {pendingGym > 0 ? `${pendingGym} sesiones de gimnasio pendientes` : 'todas tus sesiones completadas'} y tiempo libre flexible en Bullas.
      </p>
    </div>
  );
};
