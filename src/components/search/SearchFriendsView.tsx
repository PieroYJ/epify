import React, { useState } from 'react';
import { Search, UserPlus, Clock, MessageCircle, ShieldAlert, Check } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import type { User } from '../../types';

export const SearchFriendsView: React.FC = () => {
  const {
    users,
    currentUser,
    isFriend,
    hasPendingRequest,
    isBlocked,
    sendFriendRequest,
    openChatWithUser,
    getPendingReceivedRequests,
    setActiveTab,
  } = useEpify();

  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string } | null>(null);

  if (!currentUser) return null;

  // Excluir al usuario actual de los resultados de búsqueda
  const candidateUsers = users.filter((u) => u.id !== currentUser.id);

  const searchResults = candidateUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = (targetUser: User) => {
    const res = sendFriendRequest(targetUser.id);
    setFeedbackMsg({ id: targetUser.id, text: res.message });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 2500);
  };

  const getRelationshipStatus = (user: User) => {
    if (isBlocked(currentUser.id, user.id)) {
      return { type: 'blocked', label: '🚫 Bloqueado' };
    }
    if (isFriend(currentUser.id, user.id)) {
      return { type: 'friend', label: '👥 Son amigos' };
    }

    // Verificar si el usuario actual le envió solicitud
    const hasSent = candidateUsers.some(
      (u) => u.id === user.id && hasPendingRequest(currentUser.id, user.id)
    );

    // Verificar si el usuario objetivo le envió solicitud al usuario actual
    const receivedFromThis = getPendingReceivedRequests().some((r) => r.user.id === user.id);
    if (receivedFromThis) {
      return { type: 'received', label: '💌 Te envió solicitud' };
    }

    if (hasSent) {
      return { type: 'pending', label: '⏳ Solicitud enviada' };
    }

    return { type: 'none', label: '➕ Agregar amigo' };
  };

  return (
    <div className="view-container animate-fade-in">
      <div>
        <h2>Buscar Amigos</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Encuentra a otros niños por su nombre o su identificador de Epify.
        </p>
      </div>

      {/* Caja de Búsqueda */}
      <div className="search-box-wrapper">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por usuario (ej: @ana_arte, Mateo, etc.)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Mensaje de regla de seguridad */}
      <div
        style={{
          background: 'var(--secondary-light)',
          border: '1px solid #D1E5FF',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.8rem',
          color: '#1E40AF',
        }}
      >
        <span>💡</span>
        <span>
          <strong>Recordatorio:</strong> Encontrar a otro usuario no te permite enviarle mensajes
          directos. Primero deben ser amigos aceptados.
        </span>
      </div>

      {/* Resultados de búsqueda */}
      <div style={{ marginTop: 6 }}>
        <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
          {searchQuery.trim() ? 'Resultados encontrados:' : 'Sugerencias para conectar en Epify:'}
        </h4>

        {searchResults.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔎</span>
            <h4>No encontramos a ningún usuario</h4>
            <p>Verifica que el nombre o el @usuario esté escrito correctamente.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {searchResults.map((user) => {
              const rel = getRelationshipStatus(user);
              const isFeedbackActive = feedbackMsg?.id === user.id;

              return (
                <div key={user.id} className="user-card">
                  <div className="user-card-main">
                    <div className="user-avatar-wrapper">
                      <span>{user.avatar}</span>
                      <span className={`status-dot ${user.status}`} />
                    </div>
                    <div className="user-info-text">
                      <div className="user-name-row">
                        <span className="user-name">{user.name}</span>
                        <span className="user-handle">@{user.username}</span>
                        {user.badge && <span className="user-badge-tag">{user.badge}</span>}
                      </div>
                      <div className="user-status-msg">
                        {user.statusMessage || 'Usuario activo en Epify'}
                      </div>
                      {isFeedbackActive && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--accent-green)',
                            fontWeight: 700,
                            marginTop: 4,
                          }}
                        >
                          {feedbackMsg.text}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="user-card-actions">
                    {rel.type === 'friend' ? (
                      <button
                        className="btn-secondary"
                        onClick={() => openChatWithUser(user.id)}
                        title="Ya son amigos. ¡Chatear!"
                      >
                        <MessageCircle size={15} />
                        <span>Chatear</span>
                      </button>
                    ) : rel.type === 'pending' ? (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#B7791F',
                          background: '#FEFCBF',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <Clock size={13} />
                        <span>Pendiente</span>
                      </div>
                    ) : rel.type === 'received' ? (
                      <button
                        className="btn-success"
                        onClick={() => setActiveTab('requests')}
                        title="Ver en solicitudes"
                      >
                        <Check size={14} />
                        <span>Responder</span>
                      </button>
                    ) : rel.type === 'blocked' ? (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--danger)',
                          background: 'var(--danger-light)',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <ShieldAlert size={13} />
                        <span>Bloqueado</span>
                      </div>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => handleSendRequest(user)}
                        title="Enviar solicitud de amistad"
                      >
                        <UserPlus size={15} />
                        <span>Agregar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
