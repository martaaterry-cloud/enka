import React, { useEffect } from 'react';
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
  maxWidth = '480px'
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-container"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {icon && (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: iconColor ? `${iconColor}18` : 'var(--bg-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor || 'var(--text-primary)',
                  flexShrink: 0
                }}
              >
                <Icon name={icon} size={16} color={iconColor} />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 className="modal-title">
                {title}
              </h2>
              {subtitle && (
                <p className="modal-subtitle">
                  {subtitle}
                </p>
              )}
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
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justifyContent: center;
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: fadeIn 150ms ease-out forwards;
          padding: max(16px, env(safe-area-inset-top, 16px)) max(16px, env(safe-area-inset-right, 16px)) max(16px, env(safe-area-inset-bottom, 16px)) max(16px, env(safe-area-inset-left, 16px));
          overflow: hidden;
          box-sizing: border-box;
        }

        .modal-container {
          width: 100%;
          max-height: min(88dvh, calc(100dvh - 32px));
          background-color: var(--bg-surface);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-default);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalPopIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          margin: auto;
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

        .modal-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
          gap: 10px;
        }

        .modal-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-subtitle {
          font-size: 0.71875rem;
          color: var(--text-muted);
          margin-top: 1px;
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-close-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justifyContent: center;
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

        .modal-body {
          padding: 14px 16px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          flex: 1;
          min-width: 0;
          overscroll-behavior: contain;
        }

        .modal-footer {
          padding: 10px 16px;
          border-top: 1px solid var(--border-subtle);
          background-color: var(--bg-surface);
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .modal-header {
            padding: 14px 20px;
          }

          .modal-body {
            padding: 16px 20px;
          }

          .modal-footer {
            padding: 12px 20px;
          }
        }
      `}</style>
    </div>
  );
};
