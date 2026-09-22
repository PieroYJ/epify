import React, { useState } from 'react';
import { UserPlus, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import { RegisterModal } from './RegisterModal';

export const LoginView: React.FC = () => {
  const { users, login } = useEpify();
  const [showRegister, setShowRegister] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [customPin, setCustomPin] = useState('1234');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  const handleQuickLogin = async (username: string) => {
    setLoadingUser(username);
    setError(null);
    const res = await login(username, '1234');
    setLoadingUser(null);
    if (!res.success) {
      setError(res.error || 'Error al iniciar sesión');
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername.trim()) return;
    setLoadingUser(customUsername);
    setError(null);
    const res = await login(customUsername, customPin);
    setLoadingUser(null);
    if (!res.success) {
      setError(res.error || 'Usuario o PIN incorrecto');
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #F8FAFD 0%, #EFF5FC 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        className="animate-pop-in"
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 24px',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid var(--border-color)',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '3rem', marginBottom: 6 }} className="animate-fade-in">
            🧸
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.9rem',
              color: 'var(--primary)',
              letterSpacing: '-0.5px',
            }}
          >
            Epify Kids
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Chat seguro y en tiempo real para niños
          </p>
        </div>

        {/* Zona segura */}
        <div
          style={{
            background: 'var(--accent-green-light)',
            border: '1px solid #C4F1D0',
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: '0.78rem',
            color: 'var(--accent-green)',
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          <ShieldCheck size={16} />
          <span>Solo amigos aceptados pueden conversar • Sin desconocidos</span>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.84rem',
              fontWeight: 600,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Cuentas Rápidas */}
        <div>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 10,
            }}
          >
            ¿Quién eres hoy? (Toca tu cuenta para entrar):
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 10,
              marginBottom: 16,
            }}
          >
            {users.slice(0, 8).map((u) => {
              const isLoading = loadingUser === u.username;
              const isUserAdmin = u.role === 'admin';
              return (
                <button
                  key={u.id}
                  onClick={() => handleQuickLogin(u.username)}
                  disabled={!!loadingUser}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: isUserAdmin ? '#FBF9FF' : 'var(--bg-subtle)',
                    border: isUserAdmin ? '1.5px solid #DDD6FE' : '1.5px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isUserAdmin ? '#8B5CF6' : 'var(--secondary)';
                    e.currentTarget.style.background = isUserAdmin ? '#EDE9FE' : 'var(--secondary-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isUserAdmin ? '#DDD6FE' : 'var(--border-color)';
                    e.currentTarget.style.background = isUserAdmin ? '#FBF9FF' : 'var(--bg-subtle)';
                  }}
                >
                  <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{u.avatar}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <span>{u.name}</span>
                      {isUserAdmin && (
                        <span
                          style={{
                            fontSize: '0.6rem',
                            background: '#EDE9FE',
                            color: '#6D28D9',
                            padding: '1px 5px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 800,
                          }}
                        >
                          Admin
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      @{u.username}
                    </div>
                  </div>
                  {isLoading ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--secondary)' }}>...</span>
                  ) : (
                    <ArrowRight size={14} color="var(--text-muted)" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Acceso con formulario personalizado */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 10 }}>
          {!showCustomForm ? (
            <button
              className="btn-muted"
              style={{ width: '100%', fontSize: '0.82rem', gap: 6 }}
              onClick={() => setShowCustomForm(true)}
            >
              <KeyRound size={14} /> Entrar con otro @usuario o PIN
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="text"
                placeholder="Nombre de usuario (ej: @alex123)"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                style={{ fontSize: '0.85rem' }}
                required
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="PIN (1234)"
                  value={customPin}
                  onChange={(e) => setCustomPin(e.target.value)}
                  style={{ width: 110, fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn-primary" style={{ flex: 1, fontSize: '0.85rem' }}>
                  Entrar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Botón para crear nueva cuenta */}
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <button
            className="btn-secondary"
            style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
            onClick={() => setShowRegister(true)}
          >
            <UserPlus size={16} />
            <span>Crear nueva cuenta de niño</span>
          </button>
        </div>

        {/* Aviso de Multi-Pestaña para prueba */}
        <div
          style={{
            marginTop: 18,
            padding: '10px 12px',
            background: 'var(--accent-yellow-light)',
            border: '1px solid #FFE699',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.78rem',
            color: '#8A6800',
            lineHeight: 1.4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 2 }}>
            <Sparkles size={13} />
            <span>¡Pruébalo en tiempo real con 2 pestañas!</span>
          </div>
          Abre una pestaña en tu navegador como <strong>Alex</strong> y otra pestaña paralela como{' '}
          <strong>Mateo</strong> o <strong>Lucas</strong>. ¡Verás cómo chatean en vivo al instante!
        </div>
      </div>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
    </div>
  );
};
