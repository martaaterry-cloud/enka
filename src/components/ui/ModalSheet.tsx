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
  maxWidth = '520px'
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
        {/* Mobile Drag Indicator */}
        <div className="modal-drag-handle">
          <div className="modal-drag-bar" />
        </div>

        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {icon && (
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: iconColor ? `${iconColor}18` : 'var(--bg-surface-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: iconColor || 'var(--text-primary)',
                  flexShrink: 0
                }}
              >
                <Icon name={icon} size={18} color={iconColor} />
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
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Optional Sticky/Bottom Footer */}
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
          align-items: flex-end;
          justifyContent: center;
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: fadeIn 160ms ease-out forwards;
          padding: 0;
          overflow: hidden;
        }

        .modal-container {
          width: 100%;
          max-height: 90dvh;
          background-color: var(--bg-surface);
          border-top-left-radius: var(--radius-xl);
          border-top-right-radius: var(--radius-xl);
          border: 1px solid var(--border-default);
          border-bottom: none;
          box-shadow: var(--shadow-sheet);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          padding-bottom: var(--safe-bottom);
        }

        .modal-drag-handle {
          display: flex;
          justify-content: center;
          padding-top: 8px;
          padding-bottom: 2px;
          flex-shrink: 0;
        }

        .modal-drag-bar {
          width: 36px;
          height: 4px;
          background-color: var(--border-strong);
          border-radius: 999px;
          opacity: 0.5;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 10px 16px 12px 16px;
          border-bottom: 1px solid var(--border-subtle);
          flex-shrink: 0;
          gap: 10px;
        }

        .modal-title {
          font-size: 1.0625rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.25;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-close-btn {
          width: 32px;
          height: 32px;
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
          .modal-backdrop {
            align-items: center;
            padding: 24px;
          }

          .modal-container {
            border-radius: var(--radius-xl);
            border-bottom: 1px solid var(--border-default);
            max-height: 85dvh;
            animation: fadeIn 180ms ease-out forwards;
            padding-bottom: 0;
          }

          .modal-drag-handle {
            display: none;
          }

          .modal-header {
            padding: 14px 20px;
          }

          .modal-body {
            padding: 18px 20px;
          }

          .modal-footer {
            padding: 12px 20px;
          }
        }
      `}</style>
    </div>
  );
};
