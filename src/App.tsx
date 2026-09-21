import React, { useState, useEffect } from 'react';
import { EpifyProvider, useEpify } from './context/EpifyContext';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { SidebarNav } from './components/layout/SidebarNav';
import { HomeView } from './components/home/HomeView';
import { FriendsListView } from './components/friends/FriendsListView';
import { RequestsView } from './components/requests/RequestsView';
import { SearchFriendsView } from './components/search/SearchFriendsView';
import { ChatView } from './components/chat/ChatView';
import { EpibotView } from './components/assistant/EpibotView';
import { GamesView } from './components/games/GamesView';
import { ProfileView } from './components/profile/ProfileView';
import { LoginView } from './components/auth/LoginView';
import './styles/components.css';

const EpifyMain: React.FC = () => {
  const { isAuthenticated, activeTab, activeChatUserId, closeChat } = useEpify();
  const [isDesktop, setIsDesktop] = useState<boolean>(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Si el usuario no ha iniciado sesión, mostrar pantalla de bienvenida / login
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Renderizado de la vista según la pestaña activa
  const renderCurrentView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView />;
      case 'friends':
        return <FriendsListView />;
      case 'search':
        return <SearchFriendsView />;
      case 'requests':
        return <RequestsView />;
      case 'assistant':
        return <EpibotView />;
      case 'games':
        return <GamesView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <HomeView />;
    }
  };

  // En móvil: Si hay un chat abierto, se muestra a pantalla completa con botón atrás
  if (!isDesktop && activeChatUserId) {
    return (
      <div className="app-container">
        <ChatView onBack={closeChat} />
      </div>
    );
  }

  // Layout Desktop (>= 768px)
  if (isDesktop) {
    return (
      <div className="app-container">
        <div className="desktop-shell">
          {/* Barra Lateral Izquierda */}
          <SidebarNav />

          {/* Panel Central y Derecho */}
          <div className="desktop-center-view">
            <Header />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeChatUserId ? <ChatView onBack={closeChat} /> : renderCurrentView()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout Mobile (< 768px)
  return (
    <div className="app-container">
      <Header />
      <main className="app-main-content">{renderCurrentView()}</main>
      <BottomNav />
    </div>
  );
};

export function App() {
  return (
    <EpifyProvider>
      <EpifyMain />
    </EpifyProvider>
  );
}

export default App;
