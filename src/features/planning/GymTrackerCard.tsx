import React from 'react';
import type { FlexibleGymSession } from '../../models/planning';
import { Icon } from '../../components/ui/Icon';

interface GymTrackerCardProps {
  sessions: FlexibleGymSession[];
  onToggleSession: (id: string) => void;
}

export const GymTrackerCard: React.FC<GymTrackerCardProps> = ({
  sessions,
  onToggleSession
}) => {
  const completedCount = sessions.filter(s => s.completed).length;
  const pendingCount = sessions.length - completedCount;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: 0,
        width: '100%'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981',
              flexShrink: 0
            }}
          >
            <Icon name="Dumbbell" size={18} strokeWidth={2.2} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
              Gimnasio · Flexible
            </h3>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }} className="truncate">
              Objetivo: 4 sesiones / semana
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '2px 7px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.65625rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            flexShrink: 0
          }}
        >
          {completedCount} hecha{completedCount !== 1 ? 's' : ''} · {pendingCount} libre{pendingCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        {sessions.map(s => {
          return (
            <div
              key={s.id}
              onClick={() => onToggleSession(s.id)}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: s.completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface-subtle)',
                border: s.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                transition: 'var(--transition-fast)',
                minWidth: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    padding: '2px 5px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: s.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-subtle)',
                    color: s.completed ? '#10B981' : 'var(--text-secondary)',
                    flexShrink: 0
                  }}
                >
                  {s.completed ? 'Hecha' : 'Flexible'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">
                    {s.split}
                  </span>
                  {s.suggestedSlot && !s.completed && (
                    <span style={{ fontSize: '0.65625rem', color: 'var(--status-confirmed)' }} className="truncate">
                      {s.suggestedSlot.dayOfWeek} ({s.suggestedSlot.timeRange})
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  ~1h–2h
                </span>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: s.completed ? '#10B981' : 'transparent',
                    border: s.completed ? '1px solid #10B981' : '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  {s.completed && <Icon name="Check" size={10} strokeWidth={3} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
