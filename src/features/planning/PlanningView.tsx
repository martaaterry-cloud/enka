import React from 'react';
import { useEnka } from '../../context';
import { WeeklyGoalsCard } from './WeeklyGoalsCard';
import { GymTrackerCard } from './GymTrackerCard';
import { ProjectCard } from './ProjectCard';
import { Icon } from '../../components/ui/Icon';

export const PlanningView: React.FC = () => {
  const {
    weeklySummary,
    gymSessions,
    toggleGymSession,
    projects,
    openCreateModal
  } = useEnka();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Semana 40 (28 Sep – 04 Oct)
          </span>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '2px' }}>
            Montar mi semana
          </h1>
        </div>

        <button
          onClick={() => openCreateModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Icon name="Plus" size={13} />
          <span>Encajar algo</span>
        </button>
      </div>

      {/* Overview */}
      <WeeklyGoalsCard summary={weeklySummary} />

      {/* Free Time Opportunities for Planning */}
      <div
        style={{
          padding: '14px 16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="Sparkles" size={16} color="#F59E0B" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Huecos disponibles para encajar
            </h3>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Base Bullas
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px dashed var(--gap-border)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Martes, 29 Sep</span>
              <span style={{ color: 'var(--status-confirmed)', fontWeight: 600 }}>Tarde libre</span>
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              Disponible tras regreso (~15:45) · Sin compromisos fijos por la noche
            </div>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px dashed var(--gap-border)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Miércoles, 30 Sep</span>
              <span style={{ color: 'var(--status-confirmed)', fontWeight: 600 }}>~15:45 — 20:30 (~4.5h)</span>
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              Hueco ideal antes del entrenamiento Senior Femenino
            </div>
          </div>

          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px dashed var(--gap-border)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Jueves, 01 Oct</span>
              <span style={{ color: 'var(--status-confirmed)', fontWeight: 600 }}>~15:45 — Noche (~6h)</span>
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
              Tarde completa sin actividades programadas
            </div>
          </div>
        </div>
      </div>

      {/* Gimnasio Flexible Temporal Organizer */}
      <GymTrackerCard
        sessions={gymSessions}
        onToggleSession={toggleGymSession}
      />

      {/* Proyectos a Largo Plazo (TFG) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Proyectos disponibles
        </h3>
        {projects.map(proj => (
          <ProjectCard
            key={proj.id}
            project={proj}
            onScheduleTime={() => openCreateModal()}
          />
        ))}
      </div>
    </div>
  );
};
