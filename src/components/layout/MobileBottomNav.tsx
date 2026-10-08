import React from 'react';
import type { AppTab } from '../../context';
import { useEnka } from '../../context';
import type { IconName } from '../ui/Icon';
import { Icon } from '../ui/Icon';

interface NavItem {
  id: AppTab;
  label: string;
  iconName: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'today', label: 'Hoy', iconName: 'Clock' },
  { id: 'calendar', label: 'Calendario', iconName: 'Calendar' },
  { id: 'planning', label: 'Planificar', iconName: 'Compass' },
  { id: 'more', label: 'Más', iconName: 'MoreHorizontal' }
];

export const MobileBottomNav: React.FC = () => {
  const { currentTab, setCurrentTab, openCreateModal } = useEnka();

  return (
    <nav
      aria-label="Navegación principal móvil"
      style={{
        position: 'relative',
        flexShrink: 0,
        height: 'calc(var(--bottom-nav-height) + var(--safe-bottom))',
        paddingBottom: 'var(--safe-bottom)',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 50,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}
    >
      {/* First two tabs */}
      {NAV_ITEMS.slice(0, 2).map(item => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
              transition: 'var(--transition-fast)',
              position: 'relative'
            }}
          >
            <Icon
              name={item.iconName}
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 700 : 500,
                marginTop: '3px'
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '16px',
                  height: '2px',
                  backgroundColor: 'var(--text-primary)',
                  borderRadius: '999px'
                }}
              />
            )}
          </button>
        );
      })}

      {/* Central dignified Create button */}
      <div style={{ padding: '0 4px' }}>
        <button
          onClick={() => openCreateModal()}
          aria-label="Crear actividad"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform var(--transition-fast)'
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Icon name="Plus" size={22} strokeWidth={2.4} />
        </button>
      </div>

      {/* Last two tabs */}
      {NAV_ITEMS.slice(2).map(item => {
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: isActive ? 'var(--text-primary)' : 'var(--text-dim)',
              transition: 'var(--transition-fast)',
              position: 'relative'
            }}
          >
            <Icon
              name={item.iconName}
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
            />
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: isActive ? 700 : 500,
                marginTop: '3px'
              }}
            >
              {item.label}
            </span>
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  width: '16px',
                  height: '2px',
                  backgroundColor: 'var(--text-primary)',
                  borderRadius: '999px'
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
