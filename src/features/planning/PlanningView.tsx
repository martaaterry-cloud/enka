import React from 'react';
import { useEnka } from '../../context';
import { WeeklyGoalsCard } from './WeeklyGoalsCard';
import { GymTrackerCard } from './GymTrackerCard';
import { ProjectCard } from './ProjectCard';
import { Icon } from '../../components/ui/Icon';
import { getWeekRange, formatShortSpanishDate, formatLocalDateToISO } from '../../utils/dateUtils';

export const PlanningView: React.FC = () => {
  const {
    weeklySummary,
    gymSessions,
    toggleGymSession,
    projects,
    openCreateModal
  } = useEnka();

  const weekInfo = React.useMemo(() => getWeekRange(), []);

  const tuesdayLabel = React.useMemo(() => {
    const d = new Date(weekInfo.mondayDate);
    d.setDate(d.getDate() + 1);
    return formatShortSpanishDate(formatLocalDateToISO(d));
  }, [weekInfo]);

  const wednesdayLabel = React.useMemo(() => {
    const d = new Date(weekInfo.mondayDate);
    d.setDate(d.getDate() + 2);
    return formatShortSpanishDate(formatLocalDateToISO(d));
  }, [weekInfo]);

  const thursdayLabel = React.useMemo(() => {
    const d = new Date(weekInfo.mondayDate);
    d.setDate(d.getDate() + 3);
    return formatShortSpanishDate(formatLocalDateToISO(d));
  }, [weekInfo]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0, width: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {weekInfo.formattedRange}
          </span>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: '1px' }} className="truncate">
            Montar mi semana
          </h1>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.71875rem',
            fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Icon name="Plus" size={12} />
          <span>Encajar algo</span>
        </button>
      </div>

      {/* Overview */}
      <WeeklyGoalsCard summary={weeklySummary} />

      {/* Free Time Opportunities for Planning */}
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
          minWidth: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Icon name="Sparkles" size={14} color="#F59E0B" />
            <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
              Huecos disponibles para encajar
            </h3>
          </div>
          <span style={{ fontSize: '0.65625rem', color: 'var(--text-muted)', flexShrink: 0 }}>
            Base Bullas
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px dashed var(--gap-border)', fontSize: '0.71875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{tuesdayLabel}</span>
              <span style={{ color: 'var(--status-confirmed)', fontWeight: 600 }}>Tarde libre</span>
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '0.6875rem' }}>
              Disponible tras regreso (~15:45) · Sin compromisos por la noche
            </div>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px dashed var(--gap-border)', fontSize: '0.71875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{wednesdayLabel}</span>
              <span style={{ color: 'var(--status-confirmed)', fontWeight: 600 }}>~15:45 — 20:30</span>
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '0.6875rem' }}>
              Hueco antes del entrenamiento Senior Femenino
            </div>
          </div>

          <div style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-subtle)', border: '1px dashed var(--gap-border)', fontSize: '0.71875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{thursdayLabel}</span>
              <span style={{ color: 'var(--status-confirmed)', fontWeight: 600 }}>~15:45 — Noche</span>
            </div>
            <div style={{ color: 'var(--text-muted)', marginTop: '2px', fontSize: '0.6875rem' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', paddingLeft: '2px' }}>
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
