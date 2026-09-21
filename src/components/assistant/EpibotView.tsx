import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShieldCheck } from 'lucide-react';
import { useEpify } from '../../context/EpifyContext';

export const EpibotView: React.FC = () => {
  const { currentUser, getConversationWith, sendMessage } = useEpify();
  if (!currentUser) return null;
  const [inputContent, setInputContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = getConversationWith('assistant_epibot');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    sendMessage('assistant_epibot', inputContent);
    setInputContent('');
  };

  const handleChipClick = (prompt: string) => {
    sendMessage('assistant_epibot', prompt);
  };

  const chips = [
    { label: '😂 Cuéntame un chiste', prompt: 'Cuéntame un chiste infantil divertido' },
    { label: '🧩 Dame una adivinanza', prompt: 'Dame una adivinanza divertida con respuesta' },
    { label: '🪐 Curiosidad del espacio', prompt: 'Dime una curiosidad sobre los planetas o el espacio' },
    { label: '🐾 Curiosidad de animales', prompt: 'Dime una curiosidad asombrosa de animales' },
    { label: '🛡️ Consejo de seguridad', prompt: 'Dame un consejo de seguridad para navegar por internet' },
  ];

  return (
    <div className="chat-window animate-fade-in" style={{ height: '100%' }}>
      {/* Cabecera especial de Epibot */}
      <div
        className="chat-header"
        style={{
          background: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
          color: '#FFFFFF',
          borderBottom: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            }}
          >
            🧸
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem' }}>Epibot IA</h3>
              <span
                style={{
                  fontSize: '0.68rem',
                  background: 'rgba(255,255,255,0.25)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}
              >
                Safe Bot
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.75rem' }}>
              Tu compañero divertido y seguro en Epify
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={18} color="#FFD93D" />
        </div>
      </div>

      {/* Banner de protección */}
      <div
        style={{
          background: '#F6EDFC',
          borderBottom: '1px solid #E4CCFC',
          padding: '6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: '0.76rem',
          color: 'var(--accent-purple)',
          fontWeight: 600,
        }}
      >
        <ShieldCheck size={14} />
        <span>Epibot está programado especialmente con contenidos educativos y seguros para niños.</span>
      </div>

      {/* Mensajes de Epibot */}
      <div className="chat-messages-area">
        {messages.map((msg) => {
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
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7F00FF, #E100FF)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    alignSelf: 'flex-end',
                    flexShrink: 0,
                  }}
                >
                  🧸
                </div>
              )}
              <div>
                <div
                  className="chat-bubble"
                  style={
                    !isOutgoing
                      ? {
                          background: '#FFFFFF',
                          border: '1.5px solid #EBD4FC',
                          boxShadow: '0 4px 12px rgba(157, 78, 221, 0.08)',
                        }
                      : {}
                  }
                >
                  {msg.content}
                </div>
                <div className="chat-bubble-time">
                  <span>{timeStr}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugerencias interactivas para el niño */}
      <div className="suggestion-chips-bar">
        {chips.map((chip, idx) => (
          <button
            key={idx}
            className="suggestion-chip"
            onClick={() => handleChipClick(chip.prompt)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Formulario de envío */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          className="chat-input-field"
          placeholder="Pregúntale algo divertido a Epibot..."
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
        />
        <button
          type="submit"
          className="btn-send-message"
          style={{ background: 'var(--accent-purple)' }}
          disabled={!inputContent.trim()}
          title="Enviar a Epibot"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
