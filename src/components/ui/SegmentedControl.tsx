import type { IconName } from './Icon';
import { Icon } from './Icon';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  iconName?: IconName;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md'
}: SegmentedControlProps<T>) {
  return (
    <div
      style={{
        display: 'inline-flex',
        padding: '3px',
        backgroundColor: 'var(--bg-surface-subtle)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        gap: '2px'
      }}
    >
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: size === 'sm' ? '4px 10px' : '6px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: size === 'sm' ? '0.8125rem' : '0.875rem',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
              boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
              border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
              transition: 'var(--transition-fast)'
            }}
          >
            {opt.iconName && (
              <Icon
                name={opt.iconName}
                size={size === 'sm' ? 13 : 15}
                color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'}
              />
            )}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
