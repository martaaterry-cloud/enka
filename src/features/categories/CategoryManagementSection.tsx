import React, { useState } from 'react';
import type { DbCategory } from '../../services/enka/types';
import { useRealCategories } from './useRealCategories';
import { CategoryModal } from './CategoryModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Icon } from '../../components/ui/Icon';

export const CategoryManagementSection: React.FC = () => {
  const {
    categories,
    isLoading,
    error,
    reloadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useRealCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: DbCategory) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (
    data: Omit<DbCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (editingCategory) {
      const res = await updateCategory(editingCategory.id, data);
      if (res.error) return { error: res.error };
      showToast(`Categoría "${data.name}" actualizada.`);
      return { error: null };
    } else {
      const res = await createCategory(data);
      if (res.error) return { error: res.error };
      showToast(`Categoría "${data.name}" creada con éxito.`);
      return { error: null };
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategoryId) return;
    setIsDeleting(true);
    const res = await deleteCategory(deletingCategoryId);
    setIsDeleting(false);
    setDeletingCategoryId(null);
    if (res.error) {
      showToast(`Error al eliminar: ${res.error}`);
    } else {
      showToast('Categoría eliminada.');
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
            Categorías personales
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Configuración y etiquetas de color.
          </p>
        </div>

        {/* Show add button ONLY if there are categories (avoids duplicate CTA on empty state) */}
        {!isLoading && !error && categories.length > 0 && (
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
            onClick={() => void reloadCategories()}
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
            Cargando categorías...
          </span>
        </div>
      )}

      {/* Single Clear CTA Empty State */}
      {!isLoading && !error && categories.length === 0 && (
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
            <Icon name="Palette" size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sin categorías todavía
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
              Crea categorías para organizar visualmente tus actividades.
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
            <span>Crear primera categoría</span>
          </button>
        </div>
      )}

      {/* Compact Categories List */}
      {!isLoading && !error && categories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: `${cat.color}18`,
                    color: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={cat.icon_name || 'Tag'} size={16} color={cat.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                    className="truncate"
                  >
                    {cat.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.6875rem',
                      color: 'var(--text-muted)',
                      marginTop: '1px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: cat.color,
                        flexShrink: 0,
                      }}
                    />
                    <span className="truncate">{cat.color}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  style={{
                    padding: '5px 8px',
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
                  aria-label={`Editar categoría ${cat.name}`}
                >
                  <Icon name="Pencil" size={12} />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingCategoryId(cat.id)}
                  style={{
                    padding: '5px 7px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#EF4444',
                    fontSize: '0.6875rem',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  aria-label={`Eliminar categoría ${cat.name}`}
                >
                  <Icon name="Trash2" size={12} color="#EF4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        initialCategory={editingCategory}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCategoryId)}
        title="¿Eliminar categoría?"
        message="Esta categoría se eliminará de tu cuenta. Las actividades existentes se mantendrán pero quedarán sin categoría."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCategoryId(null)}
      />
    </div>
  );
};
