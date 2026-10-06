import React, { useState } from 'react';
import type { DbLocation } from '../../services/enka/types';
import { defaultLocationProvider } from '../../services/location';
import { Icon } from '../../components/ui/Icon';

interface LocationModalProps {
  isOpen: boolean;
  initialLocation?: DbLocation | null;
  onClose: () => void;
  onSave: (locationData: Omit<DbLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  initialLocation,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialLocation?.name || '');
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [city, setCity] = useState(initialLocation?.city || '');
  const [region, setRegion] = useState(initialLocation?.region || '');
  const [country, setCountry] = useState(initialLocation?.country || 'España');
  const [isHomeBase, setIsHomeBase] = useState<boolean>(initialLocation?.is_home_base ?? false);
  const [isPrivate, setIsPrivate] = useState<boolean>(initialLocation?.is_private ?? false);
  const [latitude, setLatitude] = useState<string>(
    initialLocation?.latitude != null ? String(initialLocation.latitude) : ''
  );
  const [longitude, setLongitude] = useState<string>(
    initialLocation?.longitude != null ? String(initialLocation.longitude) : ''
  );
  const [notes, setNotes] = useState(initialLocation?.notes || '');

  const [isGettingGps, setIsGettingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGetGps = async () => {
    setIsGettingGps(true);
    setGpsStatus(null);
    try {
      const coords = await defaultLocationProvider.getCurrentCoordinates();
      if (coords) {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setGpsStatus(`Coordenadas obtenidas (precisión ~${Math.round(coords.accuracy || 10)}m)`);
      } else {
        setGpsStatus('No se pudo obtener la ubicación. Comprueba los permisos de tu navegador.');
      }
    } catch {
      setGpsStatus('Error al consultar el GPS del dispositivo.');
    } finally {
      setIsGettingGps(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Por favor, indica un nombre para el lugar.');
      return;
    }

    const parsedLat = latitude ? parseFloat(latitude) : null;
    const parsedLng = longitude ? parseFloat(longitude) : null;

    if (parsedLat != null && (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
      setErrorMessage('La latitud debe ser un número válido entre -90 y 90.');
      return;
    }

    if (parsedLng != null && (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
      setErrorMessage('La longitud debe ser un número válido entre -180 y 180.');
      return;
    }

    setIsSaving(true);
    const { error } = await onSave({
      name: trimmedName,
      address: address.trim() || null,
      city: city.trim() || null,
      region: region.trim() || null,
      country: country.trim() || 'España',
      latitude: parsedLat,
      longitude: parsedLng,
      provider: initialLocation?.provider || (parsedLat != null ? 'gps' : 'manual'),
      provider_place_id: initialLocation?.provider_place_id || null,
      is_home_base: isHomeBase,
      is_private: isPrivate,
      notes: notes.trim() || null,
    });

    setIsSaving(false);
    if (error) {
      setErrorMessage(error);
    } else {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
              }}
            >
              <Icon name="MapPin" size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {initialLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Lugar reutilizable para actividades y desplazamientos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name="AlertCircle" size={16} color="#EF4444" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Nombre del lugar *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Casa, Trabajo, Pabellón, Academia..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9375rem',
              }}
            />
          </div>

          {/* Address */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Dirección física (calle, número)
            </label>
            <input
              type="text"
              placeholder="Ej: Calle Mayor 14, Polígono Industrial..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSaving}
              style={{
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9375rem',
              }}
            />
          </div>

          {/* City & Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Ciudad / Municipio
              </label>
              <input
                type="text"
                placeholder="Ej: Bullas, Murcia"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={isSaving}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Provincia / Región
              </label>
              <input
                type="text"
                placeholder="Ej: Murcia"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={isSaving}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          {/* Country */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              País
            </label>
            <input
              type="text"
              placeholder="España"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isSaving}
              style={{
                padding: '9px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Home base & Privacy toggles */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Home Base toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isHomeBase}
                onChange={(e) => setIsHomeBase(e.target.checked)}
                disabled={isSaving}
                style={{ marginTop: '3px' }}
              />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Base principal / Residencia
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Marca este lugar como punto habitual de origen y retorno para tus desplazamientos.
                </div>
              </div>
            </label>

            {/* Privacy toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '10px',
              }}
            >
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                disabled={isSaving}
                style={{ marginTop: '3px' }}
              />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Ubicación privada (sensible)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Muestra únicamente el nombre visible (ej: "Casa") y oculta la dirección en vistas cotidianas.
                </div>
              </div>
            </label>
          </div>

          {/* Coordinates section (Optional GPS) */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Coordenadas geográficas (Opcional)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Para cálculo exacto de tiempos de desplazamiento.
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetGps}
                disabled={isGettingGps || isSaving}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isGettingGps ? 'wait' : 'pointer',
                }}
              >
                <Icon
                  name={isGettingGps ? 'Loader2' : 'Navigation'}
                  size={14}
                  className={isGettingGps ? 'animate-spin' : ''}
                />
                <span>{isGettingGps ? 'Obteniendo GPS...' : 'Usar mi GPS actual'}</span>
              </button>
            </div>

            {gpsStatus && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {gpsStatus}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input
                type="number"
                step="any"
                placeholder="Latitud (ej: 38.0475)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={isSaving}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitud (ej: -1.6706)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={isSaving}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>

          {/* Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Notas o referencias de acceso
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Aparcar en la zona trasera, puerta lateral..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSaving}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
                resize: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '8px',
              paddingTop: '12px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '9px 20px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--text-inverse)',
                fontSize: '0.875rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving && <Icon name="Loader2" size={16} className="animate-spin" />}
              <span>{initialLocation ? 'Guardar Cambios' : 'Crear Ubicación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
