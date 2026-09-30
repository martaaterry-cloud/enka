import React from 'react';
import type { PlanningProject } from '../../models/planning';
import { Icon } from '../../components/ui/Icon';

interface ProjectCardProps {
  project: PlanningProject;
  onScheduleTime?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onScheduleTime }) => {
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
        gap: '10px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="FolderKanban" size={16} color="var(--text-muted)" />
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {project.title}
          </h4>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Objetivo: {project.targetDate}
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
        {project.statusDescription}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
          Sin cuota semanal fija
        </span>
        <button
          onClick={onScheduleTime}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <Icon name="Plus" size={12} />
          <span>Dedicarle tiempo</span>
        </button>
      </div>
    </div>
  );
};
