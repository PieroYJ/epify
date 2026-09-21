import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';

export const Header: React.FC = () => {
  const { currentUser, setActiveTab, closeChat, logout } = useEpify();

  if (!currentUser) return null;

  const handleBrandClick = () => {
    closeChat();
    setActiveTab('home');
  };

  return (
    <header className="app-header">
      <div className="brand-badge" onClick={handleBrandClick}>
        <span className="brand-icon">🧸</span>
        <span className="brand-name">Epify</span>
        <span className="brand-tag">Kids</span>
      </div>

      <div className="header-actions">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.72rem',
            color: 'var(--accent-green)',
            background: 'var(--accent-green-light)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 600,
          }}
          title="Entorno seguro con verificación estricta de amistad"
        >
          <Shield size={13} />
          <span>Zona Segura</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px',
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="user-avatar-mini">
            <span>{currentUser.avatar}</span>
            <span className={`status-dot ${currentUser.status}`} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className="user-name-mini">{currentUser.name}</div>
          </div>
          <button
            className="btn-icon-subtle"
            style={{ width: 26, height: 26 }}
            onClick={logout}
            title="Cerrar sesión en esta pestaña"
          >
            <LogOut size={13} color="var(--text-muted)" />
          </button>
        </div>
      </div>
    </header>
  );
};
