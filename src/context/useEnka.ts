import { useContext } from 'react';
import { EnkaContext } from './enkaContextCore';
import type { EnkaContextType } from './enkaContextCore';

export const useEnka = (): EnkaContextType => {
  const context = useContext(EnkaContext);
  if (!context) {
    throw new Error('useEnka must be used within an EnkaProvider');
  }
  return context;
};
