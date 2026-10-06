import React, { useState } from 'react';
import type { ThemeMode } from '../../context';
import { useEnka, useAuth } from '../../context';
import type { IconName } from '../../components/ui/Icon';
import { Icon } from '../../components/ui/Icon';
import { enkaRepository } from '../../services/enka';
import { CategoryManagementSection } from '../categories/CategoryManagementSection';
import { LocationManagementSection } from '../locations/LocationManagementSection';

type SectionId = 'menu' | 'lugares' | 'rutinas' | 'proyectos' | 'categorias';

interface SectionItem {
  id: Exclude<SectionId, 'menu'>;
  title: string;
  subtitle: string;
  icon: IconName;
  badge?: string | number;
}

export const MoreView: React.FC = () => {
  const { theme, setTheme, projects } = useEnka();
  const { user, signOut } = useAuth();
  const [currentSection, setCurrentSection] = useState<SectionId>('menu');
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [diagnosticRunning, setDiagnosticRunning] = useState<boolean>(false);
  const [diagnosticResults, setDiagnosticResults] = useState<Record<string, { count: number; error: string | null }> | null>(null);

  const runDiagnostic = async () => {
    setDiagnosticRunning(true);
    try {
      const results = await enkaRepository.verifyAllTablesAccess();
      setDiagnosticResults(results);
    } finally {
      setDiagnosticRunning(false);
    }
  };

  const sections: SectionItem[] = [
    {
      id: 'categorias',
      title: 'Categorías',
      subtitle: 'Etiquetas de color personales',
      icon: 'Palette',
    },
    {
      id: 'lugares',
      title: 'Lugares y Logística',
      subtitle: 'Direcciones y base habitual',
      icon: 'MapPin',
    },
    {
      id: 'rutinas',
      title: 'Rutinas',
      subtitle: 'Trabajo, entrenamientos y clases fijas',
      icon: 'Repeat',
      badge: '3 activas'
    },
    {
      id: 'proyectos',
      title: 'Proyectos',
      subtitle: 'Objetivos y bloques de largo plazo',
      icon: 'FolderKanban',
      badge: `${projects.length}`
    },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      {currentSection === 'menu' ? (
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Más
          </h1>
          <p style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Organización, preferencias y cuenta.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setCurrentSection('menu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              flexShrink: 0
            }}
            aria-label="Volver al menú Más"
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }} className="truncate">
              {sections.find(s => s.id === currentSection)?.title || 'Más'}
            </h1>
            <p style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }} className="truncate">
              {sections.find(s => s.id === currentSection)?.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Main Menu Mode */}
      {currentSection === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Group 1: Organización */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', paddingLeft: '4px' }}>
              Organización
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sections.map(sec => (
                <div
                  key={sec.id}
                  onClick={() => setCurrentSection(sec.id)}
                  style={{
                    padding: '11px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-primary)',
                        flexShrink: 0
                      }}
                    >
                      <Icon name={sec.icon} size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                        {sec.title}
                      </div>
                      <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }} className="truncate">
                        {sec.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {sec.badge && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: 'var(--text-dim)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-full)'
                        }}
                      >
                        {sec.badge}
                      </span>
                    )}
                    <Icon name="ChevronRight" size={14} color="var(--text-dim)" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Group 2: Preferencias y Cuenta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', paddingLeft: '4px' }}>
              Preferencias y Cuenta
            </span>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Theme selector row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tema visual</div>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Apariencia clara u oscura</div>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {(['light', 'system', 'dark'] as ThemeMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setTheme(m)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: theme === m ? 'var(--text-primary)' : 'var(--bg-surface-subtle)',
                        color: theme === m ? 'var(--text-inverse)' : 'var(--text-secondary)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Icon name={m === 'light' ? 'Sun' : m === 'dark' ? 'Moon' : 'Laptop'} size={12} />
                      <span style={{ textTransform: 'capitalize' }}>{m === 'system' ? 'Auto' : m === 'light' ? 'Claro' : 'Oscuro'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account details */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78125rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cuenta:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{user?.email || '—'}</span>
                </div>
              </div>

              {/* Sign out action */}
              <button
                type="button"
                onClick={() => signOut()}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                <Icon name="LogOut" size={13} color="#EF4444" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>

          {/* Collapsible Advanced Diagnostics */}
          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setIsDiagnosticOpen(prev => !prev)}
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                cursor: 'pointer'
              }}
            >
              <Icon name={isDiagnosticOpen ? 'ChevronDown' : 'ChevronRight'} size={12} />
              <span>Diagnóstico avanzado del sistema</span>
            </button>

            {isDiagnosticOpen && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <button
                  type="button"
                  onClick={runDiagnostic}
                  disabled={diagnosticRunning}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: diagnosticRunning ? 'wait' : 'pointer'
                  }}
                >
                  <Icon name={diagnosticRunning ? 'Loader2' : 'Database'} size={13} className={diagnosticRunning ? 'animate-spin' : ''} />
                  <span>{diagnosticRunning ? 'Comprobando 11 tablas...' : 'Verificar RLS de 11 tablas Supabase'}</span>
                </button>

                {diagnosticResults && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.6875rem' }}>
                    {Object.entries(diagnosticResults).map(([table, res]) => (
                      <div key={table} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{table}</span>
                        {res.error ? (
                          <span style={{ color: '#EF4444' }}>Error: {res.error}</span>
                        ) : (
                          <span style={{ color: '#10B981' }}>OK ({res.count} filas)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-SECTIONS */}

      {/* Categorías */}
      {currentSection === 'categorias' && <CategoryManagementSection />}

      {/* Lugares */}
      {currentSection === 'lugares' && <LocationManagementSection />}

      {/* Rutinas */}
      {currentSection === 'rutinas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.71875rem', color: 'var(--text-secondary)' }}>
            <strong>Recurrencias semanales fijas:</strong> Compromisos que estructuran tus días de forma predeterminada.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }} className="truncate">Trabajo en SYTE Automation SL</h3>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lunes a Viernes · 07:00 – 15:00 · Alcantarilla
                  </div>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                  Trabajo
                </span>
              </div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }} className="truncate">Entrenamientos (Senior Femenino)</h3>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lunes, Miércoles, Viernes · Pabellón Juan Valera, Bullas
                  </div>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                  Balonmano
                </span>
              </div>
            </div>

            <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }} className="truncate">Academia Método (Inglés B2)</h3>
                  <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lunes y Miércoles · 19:30 – 21:00 · Bullas
                  </div>
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                  Inglés
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proyectos */}
      {currentSection === 'proyectos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.map(proj => (
            <div
              key={proj.id}
              style={{
                padding: '14px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Icon name="FolderKanban" size={16} color="var(--text-primary)" />
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }} className="truncate">{proj.title}</h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                {proj.statusDescription}
              </p>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Objetivo: {proj.targetDate}</span>
                <span>Bloques flexibles</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
