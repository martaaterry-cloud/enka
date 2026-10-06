import React, { useState } from 'react';
import type { DbCategory } from '../../services/enka/types';
import { ModalSheet } from '../../components/ui/ModalSheet';
import type { IconName } from '../../components/ui/Icon';
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

const CURATED_ICONS: IconName[] = [
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

interface CategoryFormProps {
  initialCategory?: DbCategory | null;
  onClose: () => void;
  onSave: (categoryData: Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: string | null }>;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialCategory,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialCategory?.name || '');
  const [color, setColor] = useState(initialCategory?.color || CURATED_COLORS[0]);
  const [iconName, setIconName] = useState<IconName>((initialCategory?.icon_name as IconName) || 'Tag');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      sort_order: initialCategory?.sort_order ?? 0,
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            padding: '8px 10px',
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
          <Icon name="AlertCircle" size={15} color="#EF4444" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Name input */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Nombre *
        </label>
        <input
          type="text"
          required
          placeholder="Ej: Trabajo, Deporte, Inglés, Salud..."
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Color selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Color
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '6px',
          }}
        >
          {CURATED_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: c,
                border: color === c ? '2.5px solid var(--text-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-fast)',
              }}
              aria-label={`Seleccionar color ${c}`}
            >
              {color === c && <Icon name="Check" size={14} color="#ffffff" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </div>

      {/* Icon selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.78125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Icono
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))',
            gap: '5px',
            maxHeight: '110px',
            overflowY: 'auto',
            padding: '6px',
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
                height: '34px',
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
              aria-label={`Seleccionar icono ${ic}`}
            >
              <Icon name={ic} size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          marginTop: '4px',
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
            padding: '9px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-secondary)',
            fontSize: '0.8125rem',
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
            padding: '9px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving && <Icon name="Loader2" size={14} className="animate-spin" />}
          <span>{initialCategory ? 'Guardar' : 'Crear'}</span>
        </button>
      </div>
    </form>
  );
};

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  initialCategory,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      variant="compact"
      title={initialCategory ? 'Editar categoría' : 'Nueva categoría'}
      icon={(initialCategory?.icon_name as IconName) || 'Tag'}
      iconColor={initialCategory?.color || CURATED_COLORS[0]}
      maxWidth="400px"
    >
      <CategoryForm
        key={initialCategory?.id || 'new-category'}
        initialCategory={initialCategory}
        onClose={onClose}
        onSave={onSave}
      />
    </ModalSheet>
  );
};
