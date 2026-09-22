import React from 'react';
import { Home, Users, Search, Gamepad2, UserCheck, Bot, User, ShieldCheck } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import type { ActiveTab } from '../../types';

export const SidebarNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unreadRequestsCount,
    getFriends,
    openChatWithUser,
    activeChatUserId,
    closeChat,
    isAdmin,
  } = useEpify();

  const friends = getFriends();

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'home', label: 'Inicio', icon: <Home size={18} /> },
    { tab: 'friends', label: 'Mis Amigos', icon: <Users size={18} /> },
    { tab: 'search', label: 'Buscar Amigos', icon: <Search size={18} /> },
    { tab: 'games', label: 'Juegos (Tetris) 🎮', icon: <Gamepad2 size={18} /> },
    {
      tab: 'requests',
      label: 'Solicitudes',
      icon: <UserCheck size={18} />,
      badge: unreadRequestsCount > 0 ? unreadRequestsCount : undefined,
    },
    { tab: 'assistant', label: 'Asistente Epibot 🧸', icon: <Bot size={18} /> },
    { tab: 'profile', label: 'Mi Perfil', icon: <User size={18} /> },
    ...(isAdmin
      ? [
          {
            tab: 'admin' as ActiveTab,
            label: 'Panel Admin 🛡️',
            icon: <ShieldCheck size={18} color="var(--brand-primary)" />,
          },
        ]
      : []),
  ];

  const handleNavClick = (tab: ActiveTab) => {
    closeChat();
    setActiveTab(tab);
  };

  return (
    <aside className="desktop-sidebar">
      <div className="sidebar-header">
        <div
          className="brand-badge"
          onClick={() => handleNavClick('home')}
          style={{ fontSize: '1.25rem' }}
        >
          <span className="brand-icon">🧸</span>
          <span className="brand-name">Epify</span>
          <span className="brand-tag">Kids</span>
        </div>
      </div>

      <nav className="sidebar-nav-menu">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab && !activeChatUserId;
          return (
            <button
              key={item.tab}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.tab)}
            >
              {item.icon}
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge !== undefined && <span className="badge-count">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      {/* Lista rápida de amigos en el lateral (Estilo desktop) */}
      <div className="sidebar-friends-section">
        <div className="sidebar-section-title">
          <span>Conversaciones</span>
          <span style={{ fontSize: '0.72rem' }}>{friends.length} amigos</span>
        </div>

        {/* Epibot siempre disponible */}
        <div
          onClick={() => openChatWithUser('assistant_epibot')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            borderRadius: 'var(--radius-md)',
            background:
              activeChatUserId === 'assistant_epibot' ? 'var(--accent-purple-light)' : 'transparent',
            cursor: 'pointer',
            marginBottom: 4,
            transition: 'background 0.15s ease',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #7F00FF, #E100FF)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            🧸
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)' }}>
              Epibot Asistente
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Compañero inteligente
            </div>
          </div>
        </div>

        {friends.length === 0 ? (
          <div style={{ padding: '16px 8px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            No tienes amigos aceptados todavía. ¡Busca en "Buscar Amigos"!
          </div>
        ) : (
          friends.map((f) => {
            const isSelected = activeChatUserId === f.id;
            return (
              <div
                key={f.id}
                onClick={() => openChatWithUser(f.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  cursor: 'pointer',
                  marginBottom: 2,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}
                  >
                    {f.avatar}
                  </div>
                  <span
                    className={`status-dot ${f.status}`}
                    style={{ position: 'absolute', bottom: -1, right: -1, width: 9, height: 9 }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {f.name}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {f.status === 'online'
                      ? '● Disponible'
                      : f.status === 'playing'
                        ? '🎮 Jugando'
                        : f.status === 'studying'
                          ? '📚 Estudiando'
                          : '○ Desconectado'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-color)',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <ShieldCheck size={16} color="var(--accent-green)" />
        <span>Epify Safe Kids Protection</span>
      </div>
    </aside>
  );
};
