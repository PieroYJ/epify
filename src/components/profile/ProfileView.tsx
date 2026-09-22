import React, { useState } from 'react';
import { Shield, Unlock, RotateCcw, Check, LogOut, Sparkles, ShieldCheck } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import type { UserStatus } from '../../types';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    users,
    updateCurrentUserStatus,
    unblockUser,
    resetDemoData,
    logout,
    isAdmin,
    setActiveTab,
  } = useEpify();

  const [statusMessageInput, setStatusMessageInput] = useState(currentUser?.statusMessage || '');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  if (!currentUser) return null;

  const avatarChoices = ['🧒', '👧', '👦', '🧑‍🚀', '🎨', '🦖', '🎵', '⚽', '🦄', '🐼', '🚀', '🌟'];

  const handleStatusChange = (status: UserStatus) => {
    updateCurrentUserStatus(status);
  };

  const handleSaveStatusMessage = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserStatus(currentUser.status, statusMessageInput);
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  const handleAvatarChange = (avatar: string) => {
    updateCurrentUserStatus(currentUser.status, currentUser.statusMessage, avatar);
  };

  const blockedUsers = users.filter((u) => currentUser.blockedUserIds?.includes(u.id));

  return (
    <div className="view-container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Mi Perfil</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Configura tu cuenta y estado en Epify.
          </p>
        </div>
        <button
          className="btn-danger-outline"
          onClick={logout}
          style={{ fontSize: '0.78rem', padding: '6px 12px', gap: 6 }}
        >
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </div>

      {/* Tarjeta de Perfil Principal */}
      <div className="user-card" style={{ padding: 20, flexDirection: 'column', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="hero-avatar-large">
            <span>{currentUser.avatar}</span>
            <span className={`status-dot ${currentUser.status}`} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.25rem' }}>{currentUser.name}</h3>
              {currentUser.badge && <span className="user-badge-tag">{currentUser.badge}</span>}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              @{currentUser.username}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: 'var(--accent-green-light)',
                color: 'var(--accent-green)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.74rem',
                fontWeight: 600,
                marginTop: 6,
              }}
            >
              <Shield size={12} />
              <span>Cuenta Protegida Epify</span>
            </div>

            {isAdmin && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setActiveTab('admin')}
                  style={{
                    fontSize: '0.78rem',
                    padding: '6px 14px',
                    gap: 6,
                    background: '#7C3AED',
                    borderColor: '#6D28D9',
                  }}
                >
                  <ShieldCheck size={14} /> Abrir Panel de Administración
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cambiar Avatar */}
        <div style={{ marginTop: 18, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Elige tu avatar favorito:
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {avatarChoices.map((av) => (
              <button
                key={av}
                onClick={() => handleAvatarChange(av)}
                style={{
                  fontSize: '1.5rem',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: currentUser.avatar === av ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  border: `2px solid ${currentUser.avatar === av ? 'var(--primary)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Estado actual */}
        <div style={{ marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            ¿Cómo estás hoy?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <button
              className="action-btn-large green"
              style={{
                padding: '8px 12px',
                border: currentUser.status === 'online' ? '2px solid var(--accent-green)' : '1px solid transparent',
              }}
              onClick={() => handleStatusChange('online')}
            >
              <span className="status-dot online" />
              <div className="action-text">
                <strong style={{ fontSize: '0.82rem' }}>Disponible</strong>
              </div>
            </button>

            <button
              className="action-btn-large secondary"
              style={{
                padding: '8px 12px',
                border: currentUser.status === 'playing' ? '2px solid var(--secondary)' : '1px solid transparent',
              }}
              onClick={() => handleStatusChange('playing')}
            >
              <span className="status-dot playing" />
              <div className="action-text">
                <strong style={{ fontSize: '0.82rem' }}>Jugando 🎮</strong>
              </div>
            </button>

            <button
              className="action-btn-large purple"
              style={{
                padding: '8px 12px',
                border: currentUser.status === 'studying' ? '2px solid var(--accent-purple)' : '1px solid transparent',
              }}
              onClick={() => handleStatusChange('studying')}
            >
              <span className="status-dot studying" />
              <div className="action-text">
                <strong style={{ fontSize: '0.82rem' }}>Estudiando 📚</strong>
              </div>
            </button>

            <button
              className="action-btn-large"
              style={{
                padding: '8px 12px',
                background: 'var(--bg-subtle)',
                border: currentUser.status === 'offline' ? '2px solid var(--text-muted)' : '1px solid transparent',
              }}
              onClick={() => handleStatusChange('offline')}
            >
              <span className="status-dot offline" />
              <div className="action-text">
                <strong style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Desconectado</strong>
              </div>
            </button>
          </div>
        </div>

        {/* Mensaje de estado personalizado */}
        <form onSubmit={handleSaveStatusMessage} style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Mensaje de estado para tus amigos:
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              className="chat-input-field"
              placeholder="Ej: ¡Construyendo un castillo! 🏰"
              value={statusMessageInput}
              onChange={(e) => setStatusMessageInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>
              Guardar
            </button>
          </div>
          {showSavedMsg && (
            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--accent-green)',
                fontWeight: 600,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Check size={14} /> ¡Mensaje de estado actualizado!
            </div>
          )}
        </form>
      </div>

      {/* Guía para probar con múltiples niños */}
      <div className="quick-actions-card">
        <div className="card-title">
          <span>Probar chat entre niños en tiempo real</span>
          <Sparkles size={18} color="var(--primary)" />
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
          Para ver cómo conversan dos niños reales en vivo:
        </p>
        <ol style={{ paddingLeft: 20, fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>Mantén esta pestaña abierta con tu cuenta actual (<strong>{currentUser.name}</strong>).</li>
          <li>Abre una <strong>nueva pestaña</strong> en tu navegador en <code>http://localhost:5173/</code>.</li>
          <li>Inicia sesión en la otra pestaña con otro niño (por ejemplo <strong>Mateo</strong> o <strong>Lucas</strong>).</li>
          <li>¡Escribe mensajes o envía solicitudes! Verás cómo aparecen en vivo instantáneamente sin recargar y <strong>sin respuestas automáticas falsas</strong>.</li>
        </ol>
      </div>

      {/* Usuarios Bloqueados */}
      <div className="quick-actions-card">
        <div className="card-title">
          <span>Usuarios Bloqueados</span>
          <Shield size={18} color="var(--danger)" />
        </div>

        {blockedUsers.length === 0 ? (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            No has bloqueado a ningún usuario. Tu entorno de amigos está tranquilo. ✨
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {blockedUsers.map((b) => (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1.2rem' }}>{b.avatar}</span>
                  <div>
                    <strong style={{ fontSize: '0.85rem' }}>{b.name}</strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      @{b.username}
                    </div>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '4px 10px', gap: 4 }}
                  onClick={() => unblockUser(b.id)}
                >
                  <Unlock size={12} /> Desbloquear
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reiniciar demo */}
      <div style={{ textAlign: 'center', padding: '12px 0 20px 0' }}>
        <button
          className="btn-muted"
          style={{ fontSize: '0.78rem', gap: 6 }}
          onClick={() => {
            if (confirm('¿Restablecer la base de datos a los datos iniciales?')) {
              resetDemoData();
            }
          }}
        >
          <RotateCcw size={14} /> Restablecer base de datos inicial
        </button>
      </div>
    </div>
  );
};
