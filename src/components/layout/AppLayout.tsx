import React from 'react';
import { useEnka } from '../../context';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Icon } from '../ui/Icon';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { theme, setTheme } = useEnka();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      <div style={{ display: 'flex', flex: 1, width: '100%' }}>
        {/* Desktop Sidebar */}
        <div className="desktop-sidebar-container">
          <DesktopSidebar />
        </div>

        {/* Main Content Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            paddingBottom: 'calc(var(--bottom-nav-height) + var(--safe-bottom) + 16px)'
          }}
          className="main-viewport-container"
        >
          {/* Mobile Top Header */}
          <header
            className="mobile-top-header"
            style={{
              height: 'calc(var(--header-height) + var(--safe-top))',
              paddingTop: 'var(--safe-top)',
              paddingLeft: '16px',
              paddingRight: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)',
              position: 'sticky',
              top: 0,
              zIndex: 40
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-inverse)',
                  fontWeight: 800,
                  fontSize: '0.8125rem'
                }}
              >
                E
              </div>
              <span style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                ENKA
              </span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema de color"
              style={{
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-secondary)'
              }}
            >
              {theme === 'dark' ? (
                <Icon name="Moon" size={16} />
              ) : theme === 'light' ? (
                <Icon name="Sun" size={16} />
              ) : (
                <Icon name="Laptop" size={16} />
              )}
            </button>
          </header>

          {/* Body Content */}
          <main
            style={{
              flex: 1,
              width: '100%',
              maxWidth: 'var(--max-content-width)',
              margin: '0 auto',
              padding: '16px 16px 32px 16px'
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav-container">
        <MobileBottomNav />
      </div>

      <style>{`
        @media (max-width: 839px) {
          .desktop-sidebar-container {
            display: none !important;
          }
          .mobile-top-header {
            display: flex !important;
          }
          .mobile-nav-container {
            display: block !important;
          }
        }
        @media (min-width: 840px) {
          .desktop-sidebar-container {
            display: block !important;
          }
          .mobile-top-header {
            display: none !important;
          }
          .mobile-nav-container {
            display: none !important;
          }
          .main-viewport-container {
            padding-bottom: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};
