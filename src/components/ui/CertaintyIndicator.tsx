import React from 'react';
import type { CertaintyLevel } from '../../models/activity';
import { Badge } from './Badge';

interface CertaintyIndicatorProps {
  certainty: CertaintyLevel;
  customNote?: string;
  size?: 'sm' | 'md';
}

export const CertaintyIndicator: React.FC<CertaintyIndicatorProps> = ({
  certainty,
  customNote,
  size = 'md'
}) => {
  if (certainty === 'confirmed') {
    return (
      <Badge
        label={customNote || 'Confirmado'}
        iconName="CheckCircle2"
        color="var(--status-confirmed)"
        bgColor="rgba(16, 185, 129, 0.1)"
        borderColor="rgba(16, 185, 129, 0.22)"
        size={size}
      />
    );
  }

  if (certainty === 'pending_time') {
    return (
      <Badge
        label={customNote || 'Horario provisional'}
        iconName="Clock"
        color="var(--status-pending)"
        bgColor="rgba(245, 158, 11, 0.1)"
        borderColor="rgba(245, 158, 11, 0.22)"
        size={size}
      />
    );
  }

  if (certainty === 'probable') {
    return (
      <Badge
        label={customNote || 'Probable'}
        iconName="HelpCircle"
        color="var(--status-probable)"
        bgColor="rgba(99, 102, 241, 0.1)"
        borderColor="rgba(99, 102, 241, 0.22)"
        size={size}
      />
    );
  }

  return (
    <Badge
      label={customNote || 'Condicional'}
      iconName="GitBranch"
      color="var(--status-conditional)"
      bgColor="rgba(139, 92, 246, 0.1)"
      borderColor="rgba(139, 92, 246, 0.22)"
      size={size}
    />
  );
};
