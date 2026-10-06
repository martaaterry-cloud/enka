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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Toast */}
      {toastMessage && (
        <div
          className="animate-fade-in"
          style={{
            padding: '10px 14px',
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
          <Icon name="CheckCircle" size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Lugares y Logística
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Tus ubicaciones reales guardadas en Supabase.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Icon name="Plus" size={16} />
          <span>Nueva ubicación</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#EF4444',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="AlertCircle" size={16} color="#EF4444" />
            <span>Error al cargar ubicaciones: {error}</span>
          </div>
          <button
            type="button"
            onClick={() => void reloadLocations()}
            style={{
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#EF4444',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
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
            padding: '32px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Icon name="Loader2" size={24} className="animate-spin" color="var(--text-muted)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Cargando tus ubicaciones desde Supabase...
          </span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && locations.length === 0 && (
        <div
          style={{
            padding: '36px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-default)',
            borderRadius: 'var(--radius-xl)',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="MapPin" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No tienes ubicaciones guardadas
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                maxWidth: '290px',
                lineHeight: 1.4,
              }}
            >
              Guarda tus lugares de referencia para organizar tus actividades y calcular desplazamientos reales.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              marginTop: '4px',
              padding: '9px 18px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Icon name="Plus" size={16} />
            <span>Añadir primera ubicación</span>
          </button>
        </div>
      )}

      {/* Locations List */}
      {!isLoading && !error && locations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {locations.map((loc) => {
            const mapsUrl = defaultLocationProvider.getMapsUrl(loc);

            return (
              <div
                key={loc.id}
                style={{
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {/* Top Row: Name & Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <Icon name="MapPin" size={16} color="var(--text-primary)" />
                    <h3
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {loc.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {loc.is_home_base && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-xs)',
                        }}
                      >
                        Base
                      </span>
                    )}
                    {loc.is_private && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          color: 'var(--text-dim)',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <Icon name="Lock" size={11} />
                        <span>Privada</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.8125rem' }}>
                  {loc.address && !loc.is_private && (
                    <div style={{ color: 'var(--text-secondary)' }}>{loc.address}</div>
                  )}
                  {loc.is_private && (
                    <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                      Dirección privada guardada
                    </div>
                  )}
                  {(loc.city || loc.region) && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {[loc.city, loc.region, loc.country !== 'España' ? loc.country : null]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                  {loc.latitude != null && loc.longitude != null && (
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                      GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                    </div>
                  )}
                  {loc.notes && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                      {loc.notes}
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    <Icon name="ExternalLink" size={13} />
                    <span>Abrir en mapas</span>
                  </a>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(loc)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                      }}
                      aria-label={`Editar ubicación ${loc.name}`}
                    >
                      <Icon name="Pencil" size={13} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingLocationId(loc.id)}
                      style={{
                        padding: '5px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#EF4444',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      aria-label={`Eliminar ubicación ${loc.name}`}
                    >
                      <Icon name="Trash2" size={13} color="#EF4444" />
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
        message="Esta ubicación se eliminará de tu cuenta. Las actividades o recurrencias que la utilizaban no se borrarán, pero quedarán sin ubicación asignada."
        confirmLabel="Eliminar ubicación"
        cancelLabel="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingLocationId(null)}
      />
    </div>
  );
};
