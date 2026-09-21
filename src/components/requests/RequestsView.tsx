import React, { useState } from 'react';
import { Check, X, Clock, UserPlus } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';

export const RequestsView: React.FC = () => {
  const {
    getPendingReceivedRequests,
    getPendingSentRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    setActiveTab,
  } = useEpify();

  const [activeSubTab, setActiveSubTab] = useState<'received' | 'sent'>('received');

  const receivedRequests = getPendingReceivedRequests();
  const sentRequests = getPendingSentRequests();

  const handleAccept = (requestId: string) => {
    acceptFriendRequest(requestId);
  };

  return (
    <div className="view-container animate-fade-in">
      <div>
        <h2>Solicitudes de Amistad</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Gestiona quién puede ser tu amigo en Epify.
        </p>
      </div>

      {/* Selector de pestañas: Recibidas / Enviadas */}
      <div className="tabs-switcher">
        <button
          className={`tab-btn ${activeSubTab === 'received' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('received')}
        >
          <span>Recibidas</span>
          {receivedRequests.length > 0 && (
            <span
              className="badge-count"
              style={{
                background: activeSubTab === 'received' ? '#FFFFFF' : 'var(--primary)',
                color: activeSubTab === 'received' ? 'var(--primary)' : '#FFFFFF',
              }}
            >
              {receivedRequests.length}
            </span>
          )}
        </button>

        <button
          className={`tab-btn ${activeSubTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('sent')}
        >
          <span>Enviadas</span>
          {sentRequests.length > 0 && (
            <span
              className="badge-count"
              style={{
                background: activeSubTab === 'sent' ? '#FFFFFF' : 'var(--text-secondary)',
                color: activeSubTab === 'sent' ? 'var(--text-secondary)' : '#FFFFFF',
              }}
            >
              {sentRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Pestaña: Recibidas */}
      {activeSubTab === 'received' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {receivedRequests.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">💌</span>
              <h4>No tienes solicitudes pendientes</h4>
              <p>
                Cuando otros niños quieran ser tus amigos en Epify, sus solicitudes aparecerán aquí.
              </p>
              <button className="btn-secondary" onClick={() => setActiveTab('search')}>
                <UserPlus size={16} /> Buscar nuevos amigos
              </button>
            </div>
          ) : (
            receivedRequests.map(({ request, user }) => (
              <div key={request.id} className="user-card animate-pop-in">
                <div className="user-card-main">
                  <div className="user-avatar-wrapper">
                    <span>{user.avatar}</span>
                    <span className={`status-dot ${user.status}`} />
                  </div>
                  <div className="user-info-text">
                    <div className="user-name-row">
                      <span className="user-name">{user.name}</span>
                      <span className="user-handle">@{user.username}</span>
                    </div>
                    <div className="user-status-msg">
                      {user.statusMessage || '¡Quiere ser tu amigo en Epify!'}
                    </div>
                  </div>
                </div>

                <div className="user-card-actions">
                  <button
                    className="btn-success"
                    onClick={() => handleAccept(request.id)}
                    title="Aceptar solicitud de amistad"
                  >
                    <Check size={16} />
                    <span>Aceptar</span>
                  </button>
                  <button
                    className="btn-muted"
                    onClick={() => rejectFriendRequest(request.id)}
                    title="Rechazar solicitud"
                  >
                    <X size={16} />
                    <span>Rechazar</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pestaña: Enviadas */}
      {activeSubTab === 'sent' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sentRequests.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">⏳</span>
              <h4>No has enviado solicitudes recientes</h4>
              <p>Busca a tus compañeros o amigos para enviarles una solicitud.</p>
              <button className="btn-primary" onClick={() => setActiveTab('search')}>
                <UserPlus size={16} /> Buscar Amigos
              </button>
            </div>
          ) : (
            sentRequests.map(({ request, user }) => (
              <div key={request.id} className="user-card animate-pop-in">
                <div className="user-card-main">
                  <div className="user-avatar-wrapper">
                    <span>{user.avatar}</span>
                  </div>
                  <div className="user-info-text">
                    <div className="user-name-row">
                      <span className="user-name">{user.name}</span>
                      <span className="user-handle">@{user.username}</span>
                    </div>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.75rem',
                        color: '#B7791F',
                        background: '#FEFCBF',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        marginTop: 4,
                        fontWeight: 600,
                      }}
                    >
                      <Clock size={12} />
                      <span>Solicitud pendiente de aprobación</span>
                    </div>
                  </div>
                </div>

                <div className="user-card-actions">
                  <button
                    className="btn-muted"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => cancelFriendRequest(request.id)}
                    title="Cancelar solicitud enviada"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
