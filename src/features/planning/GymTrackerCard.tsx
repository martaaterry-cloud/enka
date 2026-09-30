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
        padding: '16px 18px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}
          >
            <Icon name="Dumbbell" size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Gimnasio · Planificación flexible
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Objetivo: 4 sesiones esta semana (Torso / Pierna / Torso / Pierna)
            </span>
          </div>
        </div>

        <div
          style={{
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}
        >
          {completedCount} realizada{completedCount !== 1 ? 's' : ''} · {pendingCount} por encajar
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>
        Duración adaptable (~1h–2h según el hueco del día). Se encajan en huecos libres sin días fijos obligatorios.
      </p>

      {/* Sessions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sessions.map(s => {
          return (
            <div
              key={s.id}
              onClick={() => onToggleSession(s.id)}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: s.completed ? 'rgba(16, 185, 129, 0.04)' : 'var(--bg-surface-subtle)',
                border: s.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: s.completed ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-subtle)',
                    color: s.completed ? '#10B981' : 'var(--text-secondary)'
                  }}
                >
                  {s.completed ? 'Hecha' : 'Flexible'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {s.split}
                  </span>
                  {s.suggestedSlot && !s.completed && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--status-confirmed)' }}>
                      Encaja en: {s.suggestedSlot.dayOfWeek} ({s.suggestedSlot.timeRange})
                    </span>
                  )}
                  {!s.suggestedSlot && !s.completed && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                      Pendiente de asignar a un hueco
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  ~1h–2h
                </span>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: s.completed ? '#10B981' : 'transparent',
                    border: s.completed ? '1px solid #10B981' : '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}
                >
                  {s.completed && <Icon name="Check" size={12} strokeWidth={3} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
