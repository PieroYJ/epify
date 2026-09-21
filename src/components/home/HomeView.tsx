import React from 'react';
import { Users, UserCheck, Sparkles, MessageCircle } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';

export const HomeView: React.FC = () => {
  const { currentUser, setActiveTab, getFriends, unreadRequestsCount, openChatWithUser } =
    useEpify();

  if (!currentUser) return null;

  const friends = getFriends();
  const onlineFriends = friends.filter((f) => f.status !== 'offline');

  return (
    <div className="home-container animate-fade-in">
      {/* Tarjeta de bienvenida destacada */}
      <div className="hero-welcome-card">
        <div className="hero-avatar-large">
          <span>{currentUser.avatar}</span>
          <span className={`status-dot ${currentUser.status}`} />
        </div>
        <div className="hero-content">
          <h2>¡Hola, {currentUser.name}! 👋</h2>
          <p>{currentUser.statusMessage || '¡Listo para un gran día con tus amigos en Epify!'}</p>
          <div className="hero-status-pill">
            <span className={`status-dot ${currentUser.status}`} />
            <span>
              {currentUser.status === 'online'
                ? 'Disponible para chatear'
                : currentUser.status === 'playing'
                  ? 'Jugando videojuegos 🎮'
                  : currentUser.status === 'studying'
                    ? 'Estudiando o haciendo tareas 📚'
                    : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de estado rápido */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setActiveTab('friends')}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{friends.length}</div>
            <div className="stat-label">
              {onlineFriends.length} disponibles ahora
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => setActiveTab('requests')}>
          <div
            className="stat-icon-wrapper"
            style={{
              background: unreadRequestsCount > 0 ? 'var(--primary-light)' : 'var(--bg-subtle)',
              color: unreadRequestsCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            <UserCheck size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-number">{unreadRequestsCount}</div>
            <div className="stat-label">
              {unreadRequestsCount === 1 ? 'Solicitud pendiente' : 'Solicitudes pendientes'}
            </div>
          </div>
        </div>
      </div>

      {/* Accesos directos principales del Readme */}
      <div className="quick-actions-card">
        <div className="card-title">
          <span>¿Qué quieres hacer hoy?</span>
          <Sparkles size={18} color="var(--primary)" />
        </div>

        <div className="quick-actions-grid">
          <div className="action-btn-large primary" onClick={() => setActiveTab('friends')}>
            <span className="action-icon">👥</span>
            <div className="action-text">
              <strong>Mis Amigos</strong>
              <span>Chatear con tus amigos aceptados</span>
            </div>
          </div>

          <div className="action-btn-large secondary" onClick={() => setActiveTab('search')}>
            <span className="action-icon">🔎</span>
            <div className="action-text">
              <strong>Buscar Amigos</strong>
              <span>Encuentra a otros niños por su @usuario</span>
            </div>
          </div>

          <div className="action-btn-large green" onClick={() => setActiveTab('requests')}>
            <span className="action-icon">🤝</span>
            <div className="action-text">
              <strong>Solicitudes</strong>
              <span>
                {unreadRequestsCount > 0
                  ? `¡Tienes ${unreadRequestsCount} por responder!`
                  : 'Revisa invitaciones enviadas y recibidas'}
              </span>
            </div>
          </div>

          <div
            className="action-btn-large purple"
            onClick={() => openChatWithUser('assistant_epibot')}
          >
            <span className="action-icon">🤖</span>
            <div className="action-text">
              <strong>Epibot IA</strong>
              <span>Chistes, adivinanzas y diversión</span>
            </div>
          </div>

          <div
            className="action-btn-large"
            style={{
              background: 'var(--accent-yellow-light)',
              borderColor: '#FFE58F',
              gridColumn: 'span 2',
            }}
            onClick={() => setActiveTab('games')}
          >
            <span className="action-icon">🧱</span>
            <div className="action-text">
              <strong style={{ color: '#8A6800' }}>Juegos Kids — Tetris</strong>
              <span>¡Juega al clásico Tetris con controles táctiles seguros!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amigos disponibles rápidos */}
      {friends.length > 0 && (
        <div className="quick-actions-card" style={{ padding: '14px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Amigos recientes
            </span>
            <button
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => setActiveTab('friends')}
            >
              Ver todos
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {friends.slice(0, 4).map((f) => (
              <div
                key={f.id}
                onClick={() => openChatWithUser(f.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  minWidth: 80,
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                    }}
                  >
                    {f.avatar}
                  </div>
                  <span
                    className={`status-dot ${f.status}`}
                    style={{ position: 'absolute', bottom: 0, right: 0 }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    maxWidth: 70,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.name}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <MessageCircle size={10} /> Chat
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regla de Oro / Consejo de Seguridad Infantil */}
      <div className="safety-tip-card">
        <div className="safety-icon-badge">🛡️</div>
        <div className="safety-text">
          <h4>Regla Principal de Epify</h4>
          <p>
            En Epify, dos usuarios solamente pueden conversar cuando ambos han aceptado la relación
            de amistad. ¡Nadie desconocido puede enviarte mensajes directos!
          </p>
        </div>
      </div>
    </div>
  );
};
