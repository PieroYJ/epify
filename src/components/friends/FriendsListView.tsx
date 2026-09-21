import React, { useState } from 'react';
import { Search, MessageCircle, MoreVertical, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import type { User } from '../../types';
import { ReportModal } from '../common/ReportModal';
import { BlockModal } from '../common/BlockModal';

export const FriendsListView: React.FC = () => {
  const { getFriends, openChatWithUser, setActiveTab } = useEpify();
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpenUserId, setMenuOpenUserId] = useState<string | null>(null);
  const [userToReport, setUserToReport] = useState<User | null>(null);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);

  const friends = getFriends();

  const filteredFriends = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: User['status']) => {
    switch (status) {
      case 'online':
        return '● Disponible';
      case 'playing':
        return '🎮 Jugando';
      case 'studying':
        return '📚 Estudiando';
      case 'offline':
      default:
        return '○ Desconectado';
    }
  };

  return (
    <div className="view-container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Mis Amigos</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Solo contactos que han aceptado tu solicitud pueden conversar contigo.
          </p>
        </div>
        <span className="badge-count" style={{ fontSize: '0.82rem', padding: '2px 8px' }}>
          {friends.length}
        </span>
      </div>

      {/* Buscador de amigos en la lista */}
      {friends.length > 0 && (
        <div className="search-box-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Filtrar por nombre o @usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Lista de amigos */}
      {friends.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">👥</span>
          <h4>Aún no tienes amigos agregados</h4>
          <p>
            ¡Busca a otros niños usando su @usuario y envíales una solicitud de amistad para comenzar
            a chatear!
          </p>
          <button className="btn-primary" onClick={() => setActiveTab('search')}>
            <Search size={16} /> Buscar Amigos
          </button>
        </div>
      ) : filteredFriends.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h4>No se encontraron amigos</h4>
          <p>No coincide ningún amigo con tu búsqueda "{searchTerm}".</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredFriends.map((friend) => (
            <div key={friend.id} className="user-card">
              <div className="user-card-main" onClick={() => openChatWithUser(friend.id)}>
                <div className="user-avatar-wrapper">
                  <span>{friend.avatar}</span>
                  <span className={`status-dot ${friend.status}`} />
                </div>
                <div className="user-info-text">
                  <div className="user-name-row">
                    <span className="user-name">{friend.name}</span>
                    <span className="user-handle">@{friend.username}</span>
                    {friend.badge && <span className="user-badge-tag">{friend.badge}</span>}
                  </div>
                  <div className="user-status-msg">
                    <span style={{ fontWeight: 600, color: friend.status === 'online' ? 'var(--accent-green)' : 'inherit' }}>
                      {getStatusLabel(friend.status)}
                    </span>
                    {friend.statusMessage && ` • ${friend.statusMessage}`}
                  </div>
                </div>
              </div>

              <div className="user-card-actions">
                <button
                  className="btn-primary"
                  onClick={() => openChatWithUser(friend.id)}
                  title="Abrir conversación"
                >
                  <MessageCircle size={15} />
                  <span>Chatear</span>
                </button>

                <div style={{ position: 'relative' }}>
                  <button
                    className="btn-icon-subtle"
                    onClick={() => setMenuOpenUserId(menuOpenUserId === friend.id ? null : friend.id)}
                    title="Más opciones de seguridad"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpenUserId === friend.id && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        background: '#FFFFFF',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)',
                        zIndex: 30,
                        minWidth: 160,
                        padding: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <button
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          fontSize: '0.82rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                        onClick={() => {
                          setMenuOpenUserId(null);
                          setUserToReport(friend);
                        }}
                      >
                        <AlertTriangle size={15} color="var(--primary)" />
                        Reportar amigo
                      </button>
                      <button
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          fontSize: '0.82rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--danger)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                        onClick={() => {
                          setMenuOpenUserId(null);
                          setUserToBlock(friend);
                        }}
                      >
                        <ShieldAlert size={15} color="var(--danger)" />
                        Bloquear amigo
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Reporte */}
      {userToReport && (
        <ReportModal userToReport={userToReport} onClose={() => setUserToReport(null)} />
      )}

      {/* Modal de Bloqueo */}
      {userToBlock && (
        <BlockModal userToBlock={userToBlock} onClose={() => setUserToBlock(null)} />
      )}
    </div>
  );
};
