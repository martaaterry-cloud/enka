import React, { useState } from 'react';
import type { ThemeMode } from '../../context';
import { useEnka } from '../../context';
import type { IconName } from '../../components/ui/Icon';
import { Icon } from '../../components/ui/Icon';

type SectionId = 'menu' | 'lugares' | 'rutinas' | 'proyectos' | 'categorias' | 'ajustes';

interface SectionItem {
  id: Exclude<SectionId, 'menu'>;
  title: string;
  subtitle: string;
  icon: IconName;
  badge?: string | number;
}

export const MoreView: React.FC = () => {
  const { theme, setTheme, locations, categories, projects } = useEnka();
  const [currentSection, setCurrentSection] = useState<SectionId>('menu');

  const sections: SectionItem[] = [
    {
      id: 'lugares',
      title: 'Lugares y Logística',
      subtitle: 'Base en Bullas y ubicaciones habituales',
      icon: 'MapPin',
      badge: `${locations.length} lugares`
    },
    {
      id: 'rutinas',
      title: 'Rutinas y Recurrencias',
      subtitle: 'Trabajo, entrenamientos, clases',
      icon: 'Repeat',
      badge: '3 activas'
    },
    {
      id: 'proyectos',
      title: 'Proyectos',
      subtitle: 'Objetivos y proyectos a largo plazo',
      icon: 'FolderKanban',
      badge: `${projects.length}`
    },
    {
      id: 'categorias',
      title: 'Categorías y Colores',
      subtitle: 'Organización visual de actividades',
      icon: 'Palette',
      badge: `${categories.length}`
    },
    {
      id: 'ajustes',
      title: 'Ajustes',
      subtitle: 'Tema visual y preferencias personales',
      icon: 'Settings'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      {currentSection === 'menu' ? (
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Más
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Preferencias, lugares frecuentes y configuración de contexto.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setCurrentSection('menu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            aria-label="Volver a Más"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {sections.find(s => s.id === currentSection)?.title || 'Más'}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {sections.find(s => s.id === currentSection)?.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Main Menu List (Mobile-first Thumb Friendly Rows) */}
      {currentSection === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sections.map(sec => (
            <div
              key={sec.id}
              onClick={() => setCurrentSection(sec.id)}
              style={{
                padding: '14px 16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-primary)',
                    flexShrink: 0
                  }}
                >
                  <Icon name={sec.icon} size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sec.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sec.subtitle}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {sec.badge && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'var(--text-dim)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {sec.badge}
                  </span>
                )}
                <Icon name="ChevronRight" size={16} color="var(--text-dim)" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-SECTIONS */}

      {/* 1. LUGARES */}
      {currentSection === 'lugares' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong>Base principal: Bullas (Murcia).</strong> Lugares de referencia para calcular márgenes y desplazamientos.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {locations.map(loc => (
              <div
                key={loc.id}
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon name="MapPin" size={16} color="var(--text-primary)" />
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {loc.name}
                    </h3>
                  </div>
                  {loc.isHomeBase && (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                      Base
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {loc.city} {loc.defaultTravelFromHomeMinutes > 0 && `· ~${loc.defaultTravelFromHomeMinutes} min de trayecto habitual`}
                </div>

                {loc.notes && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {loc.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. RUTINAS */}
      {currentSection === 'rutinas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '12px 14px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <strong>Recurrencias habituales:</strong> Compromisos fijos semanales que marcan la estructura de tus días.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Trabajo en SYTE Automation SL</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lunes a Viernes · 07:00 – 15:00 · Alcantarilla (~30 min de viaje + margen)
                  </div>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Trabajo
                </span>
              </div>
            </div>

            <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Entrenamientos (Senior Femenino)</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lunes (20:30–22:00), Miércoles (20:30–21:50), Viernes (19:15–21:00) · Pabellón Juan Valera, Bullas
                  </div>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Balonmano
                </span>
              </div>
            </div>

            <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>Academia Método (Inglés B2)</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Lunes y Miércoles · 19:30 – 21:00 (Inicio: 14 Octubre) · Bullas
                  </div>
                </div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  Inglés
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. PROYECTOS */}
      {currentSection === 'proyectos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map(proj => (
              <div
                key={proj.id}
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon name="FolderKanban" size={18} color="var(--text-primary)" />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{proj.title}</h3>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {proj.statusDescription}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Fecha objetivo: {proj.targetDate}</span>
                  <span>Sin horario fijo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CATEGORÍAS */}
      {currentSection === 'categorias' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {categories.map(cat => (
            <div
              key={cat.id}
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: cat.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name={cat.iconName} size={16} color={cat.color} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {cat.name}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. AJUSTES */}
      {currentSection === 'ajustes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '6px' }}>Tema de la Aplicación</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Selecciona la apariencia preferida para ENKA.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['light', 'system', 'dark'] as ThemeMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setTheme(m)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: theme === m ? 'var(--text-primary)' : 'var(--bg-surface-subtle)',
                    color: theme === m ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: theme === m ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icon name={m === 'light' ? 'Sun' : m === 'dark' ? 'Moon' : 'Laptop'} size={14} />
                  <span style={{ textTransform: 'capitalize' }}>{m === 'system' ? 'Sistema' : m === 'light' ? 'Claro' : 'Oscuro'}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '6px' }}>Información de ENKA</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              ENKA está diseñado para ayudarte a organizar tu tiempo con honestidad temporal, reconociendo traslados y disponibilidad real.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Versión 0.2.0 · Modo local
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
