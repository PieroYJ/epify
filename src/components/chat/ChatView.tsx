import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  MoreVertical,
  ShieldAlert,
  AlertTriangle,
  Smile,
  Shield,
} from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';
import { ReportModal } from '../common/ReportModal';
import { BlockModal } from '../common/BlockModal';

interface ChatViewProps {
  onBack?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ onBack }) => {
  const {
    activeChatUserId,
    users,
    currentUser,
    isFriend,
    isBlocked,
    getConversationWith,
    sendMessage,
    closeChat,
  } = useEpify();

  if (!currentUser) return null;

  const [inputContent, setInputContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isEpibot = activeChatUserId === 'assistant_epibot';
  const targetUser = isEpibot
    ? {
        id: 'assistant_epibot',
        username: 'epibot_ia',
        name: 'Epibot 🧸',
        avatar: '🧸',
        status: 'online' as const,
        statusMessage: 'Tu asistente seguro y compañero de juegos',
        badge: 'Asistente IA ✨',
        createdAt: '2026-01-01',
        blockedUserIds: [],
      }
    : users.find((u) => u.id === activeChatUserId);

  const messages = activeChatUserId ? getConversationWith(activeChatUserId) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !activeChatUserId) return;
    sendMessage(activeChatUserId, inputContent);
    setInputContent('');
  };

  const handleQuickEmoji = (emoji: string) => {
    if (!activeChatUserId) return;
    sendMessage(activeChatUserId, emoji);
  };

  const handleBack = () => {
    if (onBack) onBack();
    closeChat();
  };

  if (!targetUser) {
    return (
      <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span className="empty-icon">💬</span>
        <h4>Selecciona una conversación</h4>
        <p>Elige a uno de tus amigos aceptados o habla con Epibot para iniciar un chat.</p>
      </div>
    );
  }

  // Verificación estricta de la regla de Epify
  if (!isEpibot && !isFriend(currentUser.id, targetUser.id)) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <button className="btn-icon-subtle" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="chat-header-user">
            <span style={{ fontSize: '1.4rem' }}>{targetUser.avatar}</span>
            <div className="chat-header-info">
              <h3>{targetUser.name}</h3>
              <p>@{targetUser.username}</p>
            </div>
          </div>
        </div>

        <div style={{ padding: 24, textAlign: 'center', margin: 'auto 0' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              fontSize: '2rem',
            }}
          >
            🛡️
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 8, color: 'var(--text-primary)' }}>
            Conversación no disponible
          </h3>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              maxWidth: 380,
              margin: '0 auto 20px auto',
              lineHeight: 1.5,
            }}
          >
            <strong>Regla principal de Epify:</strong> Dos usuarios solamente pueden conversar
            cuando <em>ambos</em> han aceptado la relación de amistad.
          </p>
          <button className="btn-primary" onClick={handleBack}>
            Volver a Amigos
          </button>
        </div>
      </div>
    );
  }

  // Verificación si el usuario está bloqueado
  if (!isEpibot && isBlocked(currentUser.id, targetUser.id)) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <button className="btn-icon-subtle" onClick={handleBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="chat-header-user">
            <span style={{ fontSize: '1.4rem' }}>{targetUser.avatar}</span>
            <div className="chat-header-info">
              <h3>{targetUser.name}</h3>
            </div>
          </div>
        </div>
        <div style={{ padding: 24, textAlign: 'center', margin: 'auto 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🚫</div>
          <h3>Usuario Bloqueado</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 8 }}>
            Has bloqueado a este usuario. Puedes desbloquearlo en tu perfil para volver a interactuar.
          </p>
        </div>
      </div>
    );
  }

  const quickEmojis = ['👋', '😊', '🚀', '🎮', '🎨', '🦖', '🌟', '💖', '🍕', '🎉'];

  return (
    <div className="chat-window animate-fade-in">
      {/* Cabecera del Chat */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-icon-subtle" onClick={handleBack} title="Volver">
            <ArrowLeft size={20} />
          </button>
          <div className="chat-header-user">
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: isEpibot ? 'linear-gradient(135deg, #7F00FF, #E100FF)' : 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                }}
              >
                {targetUser.avatar}
              </div>
              {!isEpibot && (
                <span
                  className={`status-dot ${targetUser.status}`}
                  style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10 }}
                />
              )}
            </div>
            <div className="chat-header-info">
              <h3>{targetUser.name}</h3>
              <p>
                {isEpibot ? (
                  <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>
                    Asistente de IA Seguro
                  </span>
                ) : targetUser.status === 'online' ? (
                  <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>● Disponible</span>
                ) : targetUser.status === 'playing' ? (
                  <span>🎮 Jugando</span>
                ) : targetUser.status === 'studying' ? (
                  <span>📚 Estudiando</span>
                ) : (
                  <span>○ Desconectado</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Menú de seguridad (no necesario para Epibot) */}
        {!isEpibot && (
          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon-subtle"
              onClick={() => setShowMenu(!showMenu)}
              title="Opciones de seguridad"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
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
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}
                >
                  <AlertTriangle size={15} color="var(--primary)" />
                  Reportar chat
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
                    setShowMenu(false);
                    setShowBlockModal(true);
                  }}
                >
                  <ShieldAlert size={15} color="var(--danger)" />
                  Bloquear usuario
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banner de Seguridad para Niños */}
      <div className="chat-safety-banner">
        <Shield size={14} color="#8A6800" />
        <span>
          {isEpibot
            ? 'Epibot es un asistente seguro. Puedes hacerle preguntas divertidas y educativas.'
            : 'Chat seguro entre amigos. Nunca compartas tu dirección ni contraseñas.'}
        </span>
      </div>

      {/* Flujo de Mensajes */}
      <div className="chat-messages-area">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 6 }}>👋</div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
              ¡Saluda a {targetUser.name}!
            </h4>
            <p style={{ fontSize: '0.82rem', marginTop: 4 }}>
              Empieza la conversación enviando un mensaje o un emoji alegre.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOutgoing = msg.senderId === currentUser.id;
            const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={msg.id}
                className={`chat-bubble-row ${isOutgoing ? 'outgoing' : 'incoming'}`}
              >
                {!isOutgoing && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--bg-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      alignSelf: 'flex-end',
                      flexShrink: 0,
                    }}
                  >
                    {targetUser.avatar}
                  </div>
                )}
                <div>
                  <div className="chat-bubble">{msg.content}</div>
                  <div className="chat-bubble-time">
                    <span>{timeStr}</span>
                    {isOutgoing && <span>✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Barra de Emojis Rápidos para Niños */}
      <div className="quick-emoji-bar">
        <Smile size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        {quickEmojis.map((emoji) => (
          <button
            key={emoji}
            className="quick-emoji-btn"
            onClick={() => handleQuickEmoji(emoji)}
            title={`Enviar ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Formulario de Entrada */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          className="chat-input-field"
          placeholder={`Escribe un mensaje amigable para ${targetUser.name}...`}
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
        />
        <button
          type="submit"
          className="btn-send-message"
          disabled={!inputContent.trim()}
          title="Enviar mensaje"
        >
          <Send size={16} />
        </button>
      </form>

      {/* Modales */}
      {showReportModal && (
        <ReportModal userToReport={targetUser} onClose={() => setShowReportModal(false)} />
      )}
      {showBlockModal && (
        <BlockModal
          userToBlock={targetUser}
          onClose={() => setShowBlockModal(false)}
          onBlocked={() => closeChat()}
        />
      )}
    </div>
  );
};
