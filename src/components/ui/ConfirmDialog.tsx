import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [isOpen]);

  if (!isOpen || typeof document === 'undefined') return null;

  const content = (
    <div
      role="alertdialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px))',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '380px',
          height: 'auto',
          maxHeight: 'min(88dvh, calc(100dvh - 32px))',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          margin: 'auto',
          boxSizing: 'border-box',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isDestructive
                ? 'rgba(239, 68, 68, 0.12)'
                : 'var(--bg-surface-subtle)',
              color: isDestructive ? '#EF4444' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon
              name={isDestructive ? 'AlertTriangle' : 'HelpCircle'}
              size={18}
              color={isDestructive ? '#EF4444' : undefined}
            />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              {title}
            </h3>
            <p
              style={{
                fontSize: '0.78125rem',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                marginBottom: 0,
                lineHeight: 1.4,
              }}
            >
              {message}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            marginTop: '4px',
          }}
        >
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '9px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isDestructive ? '#EF4444' : 'var(--text-primary)',
              color: '#ffffff',
              fontSize: '0.8125rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading && <Icon name="Loader2" size={13} className="animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
