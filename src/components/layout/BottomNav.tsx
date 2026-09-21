import React from 'react';
import { Home, Users, Search, Gamepad2, UserCheck, User } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import type { ActiveTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, unreadRequestsCount, closeChat } = useEpify();

  const handleTabChange = (tab: ActiveTab) => {
    closeChat();
    setActiveTab(tab);
  };

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'home', label: 'Inicio', icon: <Home size={19} /> },
    { tab: 'friends', label: 'Amigos', icon: <Users size={19} /> },
    { tab: 'search', label: 'Buscar', icon: <Search size={19} /> },
    { tab: 'games', label: 'Juegos', icon: <Gamepad2 size={19} /> },
    {
      tab: 'requests',
      label: 'Solicitudes',
      icon: <UserCheck size={19} />,
      badge: unreadRequestsCount > 0 ? unreadRequestsCount : undefined,
    },
    { tab: 'profile', label: 'Perfil', icon: <User size={19} /> },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleTabChange(item.tab)}
          >
            <div className="nav-icon-wrapper">
              {item.icon}
              {item.badge !== undefined && (
                <span className="badge-count nav-badge-floating">{item.badge}</span>
              )}
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
