import React from 'react';
import type { AppTab, ThemeMode } from '../../context';
import { useEnka } from '../../context';
import type { IconName } from '../ui/Icon';
import { Icon } from '../ui/Icon';

interface SidebarItem {
  id: AppTab;
  label: string;
  iconName: IconName;
  description: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: 'today', label: 'Hoy', iconName: 'Clock', description: 'Cronología y disponibilidad' },
  { id: 'calendar', label: 'Calendario', iconName: 'Calendar', description: 'Mes, semanas y eventos' },
  { id: 'planning', label: 'Planificar', iconName: 'Compass', description: 'Gimnasio, TFG y bloques' },
  { id: 'more', label: 'Más', iconName: 'MoreHorizontal', description: 'Lugares, rutinas y ajustes' }
];

export const DesktopSidebar: React.FC = () => {
  const { currentTab, setCurrentTab, theme, setTheme, openCreateModal, weeklySummary } = useEnka();

  return (
    <aside
      aria-label="Barra lateral de navegación"
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100dvh',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '0 8px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.03em'
            }}
          >
            E
          </div>
          <div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                display: 'block',
                lineHeight: 1
              }}
            >
              ENKA
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                letterSpacing: '0.02em',
                marginTop: '2px',
                display: 'block'
              }}
            >
              Tu tiempo, a tu manera
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={() => openCreateModal()}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--text-primary)',
          color: 'var(--text-inverse)',
          fontWeight: 600,
          fontSize: '0.875rem',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'transform var(--transition-fast)'
        }}
      >
        <Icon name="Plus" size={16} strokeWidth={2.4} />
        <span>Nueva Actividad</span>
      </button>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {SIDEBAR_ITEMS.map(item => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--bg-surface-subtle)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                textAlign: 'left',
                border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon
                name={item.iconName}
                size={18}
                color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.4 : 1.8}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>{item.label}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Weekly Widget Summary */}
      <div
        style={{
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Semana 40
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-confirmed)' }}>
            {weeklySummary.totalAvailableFreeHours}h libres
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="Dumbbell" size={12} color="#10B981" /> Gym
          </span>
          <span style={{ fontWeight: 600 }}>{weeklySummary.gymSessionsCompleted}/{weeklySummary.gymSessionsTarget}</span>
        </div>
      </div>

      {/* Theme Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)'
        }}
      >
        <span style={{ fontWeight: 500 }}>Tema</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['light', 'system', 'dark'] as ThemeMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setTheme(m)}
              aria-label={`Cambiar tema a ${m}`}
              style={{
                padding: '4px 6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: theme === m ? 'var(--bg-surface-elevated)' : 'transparent',
                color: theme === m ? 'var(--text-primary)' : 'var(--text-dim)',
                border: theme === m ? '1px solid var(--border-subtle)' : 'none',
                fontWeight: theme === m ? 600 : 400
              }}
            >
              {m === 'light' ? <Icon name="Sun" size={13} /> : m === 'dark' ? <Icon name="Moon" size={13} /> : <Icon name="Laptop" size={13} />}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
