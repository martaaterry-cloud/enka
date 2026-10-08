import React from 'react';
import { useEnka } from '../../context';
import { Icon } from '../../components/ui/Icon';
import { getWeekRange } from '../../utils/dateUtils';

export const PlanningView: React.FC = () => {
  const { openCreateModal } = useEnka();
  const weekInfo = React.useMemo(() => getWeekRange(), []);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
      <div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{weekInfo.formattedRange}</span>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Montar mi semana</h1>
      </div>
      <div style={{ padding: '24px 18px', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-surface)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Planificación pendiente de configurar</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Aquí podrás organizar tus huecos y proyectos cuando conectemos las actividades reales. No mostramos disponibilidad ni objetivos de ejemplo.
        </p>
        <button type="button" onClick={() => openCreateModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--text-primary)', color: 'var(--text-inverse)', fontWeight: 600 }}>
          <Icon name="Plus" size={16} /> Crear actividad
        </button>
      </div>
    </div>
  );
};
