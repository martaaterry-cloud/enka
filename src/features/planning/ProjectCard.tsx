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
        padding: '12px 14px',
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
          <Icon name="FolderKanban" size={15} color="var(--text-muted)" />
          <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
            {project.title}
          </h4>
        </div>
        <span style={{ fontSize: '0.65625rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          Objetivo: {project.targetDate}
        </span>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
        {project.statusDescription}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)', gap: '6px' }}>
        <span style={{ fontSize: '0.65625rem', color: 'var(--text-dim)' }}>
          Sin cuota semanal fija
        </span>
        <button
          type="button"
          onClick={onScheduleTime}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '4px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          <Icon name="Plus" size={11} />
          <span>Dedicarle tiempo</span>
        </button>
      </div>
    </div>
  );
};
