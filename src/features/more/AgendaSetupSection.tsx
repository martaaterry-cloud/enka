import React, { useState } from 'react';
import { enkaRepository } from '../../services/enka';

export const categoryTemplates = [
  { name: 'Trabajo', color: '#3B82F6', icon_name: 'Briefcase' },
  { name: 'Estudios', color: '#8B5CF6', icon_name: 'BookOpen' },
  { name: 'Balonmano', color: '#F97316', icon_name: 'Trophy' },
  { name: 'Gimnasio', color: '#10B981', icon_name: 'Dumbbell' },
  { name: 'Salud', color: '#EC4899', icon_name: 'HeartPulse' },
  { name: 'Personal', color: '#A855F7', icon_name: 'Heart' },
] as const;

export const locationTemplates = [
  { name: 'Syte Automation', address: 'Calle José María de Lara Carvajal 4B', city: 'Alcantarilla' },
  { name: 'Academia Método', address: 'Calle Rocío', city: 'Bullas' },
  { name: 'Pabellón Juan Valera', address: 'Calle Miguel Induráin 1', city: 'Bullas' },
  { name: 'Universidad de Alicante', address: 'Campus de San Vicente del Raspeig', city: 'San Vicente del Raspeig' },
] as const;

export const AgendaSetupSection: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const configure = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const [cats, places] = await Promise.all([
        enkaRepository.fetchCategories(), enkaRepository.fetchLocations()
      ]);
      if (cats.error || places.error || !cats.data || !places.data)
        throw cats.error || places.error || new Error('No se pudieron comprobar los datos.');
      let createdCategories = 0, createdLocations = 0;
      const names = new Set(cats.data.map(c => c.name.toLocaleLowerCase('es')));
      for (const item of categoryTemplates) {
        if (names.has(item.name.toLocaleLowerCase('es'))) continue;
        const result = await enkaRepository.createCategory({
          name: item.name, color: item.color, icon_name: item.icon_name,
          sort_order: createdCategories + cats.data.length, is_active: true
        });
        if (result.error) throw result.error;
        names.add(item.name.toLocaleLowerCase('es')); createdCategories++;
      }
      const known = new Set(places.data.map(p => p.name.toLocaleLowerCase('es')));
      for (const item of locationTemplates) {
        if (known.has(item.name.toLocaleLowerCase('es'))) continue;
        const result = await enkaRepository.createLocation({
          ...item, region: item.city === 'San Vicente del Raspeig' ? 'Alicante' : 'Murcia',
          country: 'España', latitude: null, longitude: null,
          provider: null, provider_place_id: null, is_private: false,
          is_home_base: false, notes: null
        });
        if (result.error) throw result.error;
        known.add(item.name.toLocaleLowerCase('es')); createdLocations++;
      }
      window.dispatchEvent(new Event('enka:data-changed'));
      setMessage('Creadas ' + createdCategories + ' categorías y ' + createdLocations + ' ubicaciones. Las existentes se han conservado.');
    } catch (e) {
      setError((e instanceof Error ? e.message : 'No se pudo configurar') + '. Revisa tus categorías y lugares antes de reintentar.');
    } finally { setBusy(false); }
  };
  return <section style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-surface)' }}>
    <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Organizar mi agenda</h2>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prepara las categorías con colores y los lugares habituales. Puedes revisarlos en Categorías y Lugares. No añadiremos direcciones privadas ni borraremos los datos que ya tengas.</p>
    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
      {categoryTemplates.map(item => <span key={item.name} style={{ padding: '5px 8px', borderRadius: 8, backgroundColor: item.color + '22', color: 'var(--text-primary)', borderLeft: '4px solid ' + item.color, fontSize: '0.75rem' }}>{item.name}</span>)}
    </div>
    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lugares: Syte Automation, Academia Método, Pabellón Juan Valera y Universidad de Alicante.</p>
    {message && <p role="status">{message}</p>}
    {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
    <button type="button" disabled={busy} onClick={() => void configure()} style={{ padding: 10, background: 'var(--text-primary)', color: 'var(--text-inverse)', borderRadius: 9, fontWeight: 700 }}>{busy ? 'Preparando…' : 'Crear categorías y lugares que faltan'}</button>
  </section>;
};
