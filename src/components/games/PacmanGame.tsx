import React, { useRef } from 'react';
import { RotateCcw, ExternalLink } from 'lucide-react';

export const PacmanGame: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleReload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const handleOpenNewTab = () => {
    window.open('/games/pacman/index.html', '_blank');
  };

  return (
    <div className="view-container animate-fade-in" style={{ alignItems: 'center' }}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.6rem' }}>🟡</span>
          <h2 style={{ fontSize: '1.4rem' }}>Google PAC-MAN</h2>
          <span className="user-badge-tag" style={{ background: '#FFF3C4', color: '#8A6800' }}>
            Doodle Clásico
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          ¡El legendario PAC-MAN del 30.° Aniversario de Google! Come todos los puntos y huye de los fantasmas.
        </p>
      </div>

      {/* Barra de herramientas del juego */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: 620,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>⌨️ Flechas del teclado</span>
          <span>•</span>
          <span>📱 D-Pad táctil</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="btn-muted"
            style={{ padding: '6px 10px', fontSize: '0.75rem', gap: 4 }}
            onClick={handleReload}
            title="Reiniciar Pac-Man"
          >
            <RotateCcw size={13} /> Reiniciar
          </button>
          <button
            className="btn-muted"
            style={{ padding: '6px 10px', fontSize: '0.75rem', gap: 4 }}
            onClick={handleOpenNewTab}
            title="Abrir en pantalla completa"
          >
            <ExternalLink size={13} /> Pantalla completa
          </button>
        </div>
      </div>

      {/* Contenedor Iframe del Juego Pac-Man */}
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          height: 520,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          border: '2px solid var(--border-color)',
          background: '#0B0E14',
          position: 'relative',
        }}
      >
        <iframe
          ref={iframeRef}
          src="/games/pacman/index.html"
          title="Google Pac-Man Doodle"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          allow="autoplay"
        />
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 500 }}>
        Adaptado con sintetizador Web Audio moderno para funcionar de forma segura y sin conexión. © 1980 NAMCO BANDAI Games Inc. & Google.
      </div>
    </div>
  );
};
