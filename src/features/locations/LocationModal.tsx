import React, { useState } from 'react';
import type { DbLocation } from '../../services/enka/types';
import { defaultLocationProvider } from '../../services/location';
import { ModalSheet } from '../../components/ui/ModalSheet';
import { Icon } from '../../components/ui/Icon';

interface LocationModalProps {
  isOpen: boolean;
  initialLocation?: DbLocation | null;
  onClose: () => void;
  onSave: (locationData: Omit<DbLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
}

interface LocationFormProps {
  initialLocation?: DbLocation | null;
  onClose: () => void;
  onSave: (locationData: Omit<DbLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
}

const LocationForm: React.FC<LocationFormProps> = ({
  initialLocation,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialLocation?.name || '');
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [city, setCity] = useState(initialLocation?.city || '');
  const [region, setRegion] = useState(initialLocation?.region || '');
  const [country] = useState(initialLocation?.country || 'España');
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
  const [showCoordinates, setShowCoordinates] = useState(
    Boolean(initialLocation?.latitude != null || initialLocation?.longitude != null)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGetGps = async () => {
    setIsGettingGps(true);
    setGpsStatus(null);
    try {
      const coords = await defaultLocationProvider.getCurrentCoordinates();
      if (coords) {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setShowCoordinates(true);
        setGpsStatus(`GPS capturado (~${Math.round(coords.accuracy || 10)}m de precisión)`);
      } else {
        setGpsStatus('No se pudo obtener la posición. Revisa los permisos de ubicación.');
      }
    } catch {
      setGpsStatus('Error al consultar el GPS.');
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
      setErrorMessage('Latitud inválida (debe estar entre -90 y 90).');
      return;
    }

    if (parsedLng != null && (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
      setErrorMessage('Longitud inválida (debe estar entre -180 y 180).');
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            padding: '9px 12px',
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

      {/* Name */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Nombre del lugar *
        </label>
        <input
          type="text"
          required
          placeholder="Ej: Casa, Trabajo, Pabellón Juan Valera, Academia..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          style={{
            width: '100%',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Dirección (calle, número)
        </label>
        <input
          type="text"
          placeholder="Ej: Calle Mayor 14, Polígono Industrial..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isSaving}
          style={{
            width: '100%',
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

      {/* City & Province inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
              width: '100%',
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
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
              width: '100%',
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

      {/* Home base & Privacy Checkboxes */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Base toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '9px',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={isHomeBase}
            onChange={(e) => setIsHomeBase(e.target.checked)}
            disabled={isSaving}
            style={{ marginTop: '2px', accentColor: 'var(--text-primary)' }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Base principal / Residencia
            </div>
            <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
              Punto habitual de origen y retorno en Bullas.
            </div>
          </div>
        </label>

        {/* Privacy toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '9px',
            cursor: 'pointer',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '8px',
          }}
        >
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            disabled={isSaving}
            style={{ marginTop: '2px', accentColor: 'var(--text-primary)' }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ubicación privada
            </div>
            <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>
              Muestra solo el nombre y oculta la dirección exacta en vistas cotidianas.
            </div>
          </div>
        </label>
      </div>

      {/* GPS Quick Action */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            GPS del dispositivo (Opcional)
          </span>
          <button
            type="button"
            onClick={handleGetGps}
            disabled={isGettingGps || isSaving}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: isGettingGps ? 'wait' : 'pointer',
              flexShrink: 0,
            }}
          >
            <Icon
              name={isGettingGps ? 'Loader2' : 'Navigation'}
              size={13}
              className={isGettingGps ? 'animate-spin' : ''}
            />
            <span>{isGettingGps ? 'Obteniendo...' : 'Usar mi GPS'}</span>
          </button>
        </div>

        {gpsStatus && (
          <div style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {gpsStatus}
          </div>
        )}

        {/* Optional Coordinates Toggle */}
        {!showCoordinates ? (
          <button
            type="button"
            onClick={() => setShowCoordinates(true)}
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              textAlign: 'left',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            Editar coordenadas manualmente
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            <input
              type="number"
              step="any"
              placeholder="Latitud (ej: 38.0475)"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '0.78125rem',
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
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                fontSize: '0.78125rem',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Notas
        </label>
        <textarea
          rows={2}
          placeholder="Aparcamiento, accesos o indicaciones..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSaving}
          style={{
            width: '100%',
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

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          marginTop: '6px',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <button
          type="button"
          disabled={isSaving}
          onClick={onClose}
          style={{
            flex: 1,
            padding: '9px 14px',
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
            flex: 1,
            padding: '9px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.875rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving && <Icon name="Loader2" size={15} className="animate-spin" />}
          <span>{initialLocation ? 'Guardar' : 'Crear'}</span>
        </button>
      </div>
    </form>
  );
};

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  initialLocation,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      variant="form"
      title={initialLocation ? 'Editar ubicación' : 'Nueva ubicación'}
      icon="MapPin"
      maxWidth="560px"
    >
      <LocationForm
        key={initialLocation?.id || 'new-location'}
        initialLocation={initialLocation}
        onClose={onClose}
        onSave={onSave}
      />
    </ModalSheet>
  );
};
