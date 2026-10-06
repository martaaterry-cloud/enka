import React, { useState } from 'react';
import { useAuth } from '../../context';
import { Icon } from '../../components/ui/Icon';

export const LoginPage: React.FC = () => {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Introduce tu correo electrónico y contraseña.');
      return;
    }

    const { error } = await signIn(trimmedEmail, password);
    if (error) {
      setErrorMessage(error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: 'var(--bg-canvas)',
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '380px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px 24px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Icon name="Clock" size={26} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Enka
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Tu tiempo, organizado alrededor de tu vida real.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#EF4444',
              fontSize: '0.8125rem',
              lineHeight: 1.4,
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              <Icon name="AlertCircle" size={16} color="#EF4444" />
            </div>
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="enka-email"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              Correo electrónico
            </label>
            <input
              id="enka-email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9375rem',
                transition: 'var(--transition-fast)',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label
              htmlFor="enka-password"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}
            >
              Contraseña
            </label>
            <input
              id="enka-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9375rem',
                transition: 'var(--transition-fast)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '13px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Entrar en Enka</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
          }}
        >
          Acceso privado y seguro
        </div>
      </div>
    </div>
  );
};
