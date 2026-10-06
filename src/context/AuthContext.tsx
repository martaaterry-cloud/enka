import React, { useEffect, useState, useMemo } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { getSupabase, signOut as supabaseSignOut } from '../services/supabase/supabaseClient';
import { AuthContext } from './authContextCore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setAuthChecked(true);
    }).catch(() => {
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthChecked(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          return { error: 'Credenciales no válidas. Revisa tu correo y contraseña.' };
        }
        if (error.message.toLowerCase().includes('email not confirmed')) {
          return { error: 'El correo electrónico no ha sido confirmado.' };
        }
        return { error: error.message || 'Error al iniciar sesión.' };
      }

      setSession(data.session);
      setUser(data.user);
      return { error: null };
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Error de conexión con el servidor.';
      return { error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabaseSignOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      authChecked,
      signIn,
      signOut,
    }),
    [user, session, isLoading, authChecked]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
