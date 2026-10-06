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
            Categorías personales
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Gestionadas en tu cuenta privada de Supabase.
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
          <span>Nueva categoría</span>
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
            <span>Error al cargar categorías: {error}</span>
          </div>
          <button
            type="button"
            onClick={() => void reloadCategories()}
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
            Cargando tus categorías desde Supabase...
          </span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && categories.length === 0 && (
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
            <Icon name="Palette" size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              No tienes categorías todavía
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                maxWidth: '280px',
                lineHeight: 1.4,
              }}
            >
              Crea tus propias categorías para organizar visualmente tus actividades según tu vida real.
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
            <span>Crear primera categoría</span>
          </button>
        </div>
      )}

      {/* Category List */}
      {!isLoading && !error && categories.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name={cat.icon_name || 'Tag'} size={20} color={cat.color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.name}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '2px',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: cat.color,
                      }}
                    />
                    <span>{cat.color}</span>
                    {cat.sort_order > 0 && <span>· Orden: {cat.sort_order}</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  style={{
                    padding: '7px 10px',
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
                  aria-label={`Editar categoría ${cat.name}`}
                >
                  <Icon name="Pencil" size={14} />
                  <span>Editar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingCategoryId(cat.id)}
                  style={{
                    padding: '7px 9px',
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
                  aria-label={`Eliminar categoría ${cat.name}`}
                >
                  <Icon name="Trash2" size={14} color="#EF4444" />
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
        message="Esta categoría se eliminará de tu cuenta. Las actividades que la utilizaban no se borrarán, pero quedarán sin categoría asignada."
        confirmLabel="Eliminar categoría"
        cancelLabel="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCategoryId(null)}
      />
    </div>
  );
};
