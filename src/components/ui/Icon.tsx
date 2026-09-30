import React from 'react';
import * as LucideIcons from 'lucide-react';

export type IconName = keyof typeof LucideIcons | string;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  className = '',
  color,
  strokeWidth = 2,
  ...props
}) => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<LucideIcons.LucideProps>>;
  const Component = icons[name];

  if (!Component) {
    return <LucideIcons.CircleDot size={size} className={className} color={color} strokeWidth={strokeWidth} {...props} />;
  }

  return <Component size={size} className={className} color={color} strokeWidth={strokeWidth} {...props} />;
};
