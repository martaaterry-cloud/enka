import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { IconName } from './Icon';
import { Icon } from './Icon';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  variant?: 'compact' | 'form';
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconColor,
  children,
  footer,
  maxWidth,
  variant = 'compact',
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

  const isFormVariant = variant === 'form';
  const defaultMaxWidth = isFormVariant ? '560px' : '420px';
  const resolvedMaxWidth = maxWidth || defaultMaxWidth;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className={`modal-backdrop ${isFormVariant ? 'variant-form' : 'variant-compact'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`modal-container ${isFormVariant ? 'container-form' : 'container-compact'}`}
        style={{ maxWidth: resolvedMaxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="modal-header">
          <div className="modal-header-info">
            {icon && (
              <div
                className="modal-icon-badge"
                style={{
                  backgroundColor: iconColor ? `${iconColor}18` : 'var(--bg-surface-subtle)',
                  color: iconColor || 'var(--text-primary)',
                }}
              >
                <Icon name={icon} size={16} color={iconColor} />
              </div>
            )}
            <div className="modal-title-wrap">
              <h2 className="modal-title">{title}</h2>
              {subtitle && <p className="modal-subtitle">{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="modal-close-btn"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Optional Action Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        /* Portal overlay covering entire screen including bottom navigation */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: modalFadeIn 150ms ease-out forwards;
          box-sizing: border-box;
          overflow: hidden;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalPopIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalSlideUpMobile {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ------------------------------------------------------------- */
        /* COMPACT VARIANT (Centered dialog for category, confirm, etc.) */
        /* ------------------------------------------------------------- */
        .modal-backdrop.variant-compact {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px));
        }

        .container-compact {
          width: 100%;
          height: auto;
          max-height: min(90dvh, calc(100dvh - 32px));
          background-color: var(--bg-surface);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-default);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          margin: auto;
          animation: modalPopIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .container-compact .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
          gap: 10px;
        }

        .container-compact .modal-body {
          padding: 14px 16px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          flex: 1 1 auto;
          min-width: 0;
        }

        .container-compact .modal-footer {
          padding: 10px 16px;
          border-top: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          flex-shrink: 0;
        }

        /* ------------------------------------------------------------- */
        /* FORM VARIANT (Full screen on mobile, large centered on desktop) */
        /* ------------------------------------------------------------- */
        .modal-backdrop.variant-form {
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .container-form {
          width: 100%;
          height: 100%;
          max-height: 100dvh;
          max-width: 100% !important;
          background-color: var(--bg-surface);
          border-radius: 0;
          border: none;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalSlideUpMobile 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .container-form .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: max(12px, env(safe-area-inset-top, 12px)) 16px 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          flex-shrink: 0;
          gap: 10px;
          z-index: 10;
        }

        .container-form .modal-body {
          padding: 16px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
          flex: 1;
          min-width: 0;
        }

        .container-form .modal-footer {
          padding: 12px 16px max(12px, env(safe-area-inset-bottom, 12px)) 16px;
          border-top: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          flex-shrink: 0;
          z-index: 10;
        }

        /* Common header elements */
        .modal-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          flex: 1;
        }

        .modal-icon-badge {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-title-wrap {
          min-width: 0;
          flex: 1;
        }

        .modal-title {
          font-size: 0.9375rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 2px 0 0 0;
          line-height: 1.3;
        }

        .modal-close-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          background-color: var(--bg-surface-subtle);
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: var(--transition-fast);
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
          background-color: var(--bg-surface-hover);
        }

        /* ------------------------------------------------------------- */
        /* RESPONSIVE DESKTOP ADJUSTMENTS (>= 640px)                      */
        /* ------------------------------------------------------------- */
        @media (min-width: 640px) {
          .modal-backdrop.variant-form {
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          .container-form {
            height: auto;
            max-height: min(88dvh, 780px);
            border-radius: var(--radius-xl);
            border: 1px solid var(--border-default);
            box-shadow: var(--shadow-lg);
            margin: auto;
            animation: modalPopIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          .container-form .modal-header {
            padding: 14px 20px;
          }

          .container-form .modal-body {
            padding: 18px 20px;
          }

          .container-form .modal-footer {
            padding: 12px 20px;
          }

          .modal-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
