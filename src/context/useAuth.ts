import { useContext } from 'react';
import { AuthContext } from './authContextCore';
import type { AuthContextType } from './authContextCore';

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
