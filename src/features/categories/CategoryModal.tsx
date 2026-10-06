import React, { useState } from 'react';
import type { DbCategory } from '../../services/enka/types';
import { Icon } from '../../components/ui/Icon';

interface CategoryModalProps {
  isOpen: boolean;
  initialCategory?: DbCategory | null;
  onClose: () => void;
  onSave: (categoryData: Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
}

const CURATED_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#64748B', // Slate
];

const CURATED_ICONS = [
  'Tag',
  'Briefcase',
  'Dumbbell',
  'BookOpen',
  'Heart',
  'Home',
  'Music',
  'Utensils',
  'Plane',
  'ShoppingBag',
  'Coffee',
  'Sparkles',
  'Smile',
  'Folder',
  'Calendar',
  'Zap',
  'Car',
  'GraduationCap',
  'Clock',
  'Laptop',
  'Flame',
  'Activity',
  'Compass',
  'Film',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  initialCategory,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialCategory?.name || '');
  const [color, setColor] = useState(initialCategory?.color || CURATED_COLORS[0]);
  const [iconName, setIconName] = useState(initialCategory?.icon_name || 'Tag');
  const [sortOrder, setSortOrder] = useState<number>(initialCategory?.sort_order ?? 0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Por favor, indica un nombre para la categoría.');
      return;
    }

    setIsSaving(true);
    const { error } = await onSave({
      name: trimmedName,
      color,
      icon_name: iconName,
      sort_order: sortOrder,
      is_active: initialCategory?.is_active ?? true,
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
          maxWidth: '440px',
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
                backgroundColor: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
              }}
            >
              <Icon name={iconName} size={20} color={color} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {initialCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Organiza y distingue visualmente tus actividades.
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

        {/* Error */}
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Nombre de la categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Trabajo, Deporte, Idiomas..."
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

          {/* Color Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Color identificador
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {CURATED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: c,
                    border: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'var(--transition-fast)',
                    boxShadow: color === c ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {color === c && <Icon name="Check" size={16} color="#ffffff" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Icono (Lucide)
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '8px',
                maxHeight: '160px',
                overflowY: 'auto',
                padding: '4px',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {CURATED_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIconName(ic)}
                  style={{
                    height: '40px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: iconName === ic ? 'var(--bg-surface)' : 'transparent',
                    border:
                      iconName === ic
                        ? `2px solid ${color}`
                        : '1px solid var(--border-subtle)',
                    color: iconName === ic ? color : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <Icon name={ic} size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Sort Order (Optional) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Orden de visualización
            </label>
            <input
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              disabled={isSaving}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.875rem',
                width: '100px',
              }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '12px',
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
              <span>{initialCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
