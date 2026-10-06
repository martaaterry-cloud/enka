import React, { useState } from 'react';
import type { DbLocation } from '../../services/enka/types';
import { useRealLocations } from './useRealLocations';
import { LocationModal } from './LocationModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { defaultLocationProvider } from '../../services/location';
import { Icon } from '../../components/ui/Icon';

export const LocationManagementSection: React.FC = () => {
  const {
    locations,
    isLoading,
    error,
    reloadLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  } = useRealLocations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<DbLocation | null>(null);
  const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: DbLocation) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleSaveLocation = async (
    data: Omit<DbLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingLocation) {
      const res = await updateLocation(editingLocation.id, data);
      if (res.error) return { error: res.error };
      showToast(`Ubicación "${data.name}" actualizada.`);
      return { error: null };
    } else {
      const res = await createLocation(data);
      if (res.error) return { error: res.error };
      showToast(`Ubicación "${data.name}" creada con éxito.`);
      return { error: null };
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLocationId) return;
    setIsDeleting(true);
    const res = await deleteLocation(deletingLocationId);
    setIsDeleting(false);
    setDeletingLocationId(null);
    if (res.error) {
      showToast(`Error al eliminar: ${res.error}`);
    } else {
      showToast('Ubicación eliminada.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            padding: '9px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <Icon name="CheckCircle" size={15} />
          <span style={{ minWidth: 0 }} className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Lugares y Logística
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tus ubicaciones de referencia guardadas.
          </p>
        </div>

        {/* Show add button ONLY if there are locations (avoids duplicate CTA on empty state) */}
        {!isLoading && !error && locations.length > 0 && (
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon name="Plus" size={14} />
            <span>Nueva</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#EF4444',
            fontSize: '0.78125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Icon name="AlertCircle" size={15} color="#EF4444" />
            <span className="truncate">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void reloadLocations()}
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
              fontSize: '0.6875rem',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div
          style={{
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Icon name="Loader2" size={20} className="animate-spin" color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Cargando ubicaciones...
          </span>
        </div>
      )}

      {/* Single Clear CTA Empty State */}
      {!isLoading && !error && locations.length === 0 && (
        <div
          style={{
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="MapPin" size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sin ubicaciones guardadas
            </h3>
            <p
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '2px',
                maxWidth: '260px',
                lineHeight: 1.35,
              }}
            >
              Guarda tus lugares clave para organizar traslados y actividades.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              marginTop: '4px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              fontSize: '0.78125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
          >
            <Icon name="Plus" size={14} />
            <span>Añadir primera ubicación</span>
          </button>
        </div>
      )}

      {/* Compact Locations List */}
      {!isLoading && !error && locations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {locations.map((loc) => {
            const mapsUrl = defaultLocationProvider.getMapsUrl(loc);
            const locationSummary = [loc.city, loc.region].filter(Boolean).join(', ');

            return (
              <div
                key={loc.id}
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {/* Top Row: Name + Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Icon name="MapPin" size={15} color="var(--text-primary)" />
                    <h3
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                      }}
                      className="truncate"
                    >
                      {loc.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {loc.is_home_base && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          color: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                        }}
                      >
                        Base
                      </span>
                    )}
                    {loc.is_private && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: 'var(--text-dim)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          padding: '2px 5px',
                          borderRadius: 'var(--radius-xs)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <Icon name="Lock" size={10} />
                        <span>Privada</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Address summary */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {loc.is_private ? (
                    <span style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>Dirección privada guardada</span>
                  ) : loc.address ? (
                    <span className="truncate" style={{ display: 'block' }}>{loc.address}{locationSummary ? ` · ${locationSummary}` : ''}</span>
                  ) : locationSummary ? (
                    <span>{locationSummary}</span>
                  ) : null}
                </div>

                {/* Bottom Row: Map Link + Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '2px',
                  }}
                >
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    <Icon name="ExternalLink" size={12} />
                    <span>Ver en mapas</span>
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(loc)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        cursor: 'pointer',
                      }}
                      aria-label={`Editar ubicación ${loc.name}`}
                    >
                      <Icon name="Pencil" size={11} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingLocationId(loc.id)}
                      style={{
                        padding: '4px 6px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        fontSize: '0.6875rem',
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      aria-label={`Eliminar ubicación ${loc.name}`}
                    >
                      <Icon name="Trash2" size={11} color="#EF4444" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <LocationModal
        isOpen={isModalOpen}
        initialLocation={editingLocation}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocation}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingLocationId)}
        title="¿Eliminar ubicación?"
        message="Esta ubicación se eliminará de tu cuenta. Las actividades existentes se mantendrán sin perder datos."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLocationId(null)}
      />
    </div>
  );
};
