import React from 'react';
import type { IconName } from './Icon';
import { Icon } from './Icon';

interface BadgeProps {
  label: string;
  iconName?: IconName;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  iconName,
  color = 'var(--text-secondary)',
  bgColor = 'var(--bg-surface-subtle)',
  borderColor = 'var(--border-subtle)',
  size = 'md',
  className = ''
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-md transition-colors ${className}`}
      style={{
        color,
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        padding: size === 'sm' ? '2px 6px' : '3px 8px',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        lineHeight: 1.3,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        borderRadius: 'var(--radius-xs)',
        letterSpacing: '0.01em'
      }}
    >
      {iconName && <Icon name={iconName} size={size === 'sm' ? 11 : 13} color={color} />}
      <span>{label}</span>
    </span>
  );
};
