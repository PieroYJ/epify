import React, { useState } from 'react';
import { TetrisGame } from './TetrisGame';
import { PacmanGame } from './PacmanGame';

export const GamesView: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<'tetris' | 'pacman'>('tetris');

  return (
    <div style={{ paddingBottom: 28 }}>
      {/* Selector de Juegos amigable para niños */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          margin: '10px auto 14px',
          maxWidth: 380,
          padding: '4px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--border-color)',
        }}
      >
        <button
          onClick={() => setSelectedGame('tetris')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: selectedGame === 'tetris' ? 'var(--bg-card)' : 'transparent',
            color: selectedGame === 'tetris' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            boxShadow: selectedGame === 'tetris' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <span>🧱</span> Tetris Kids
        </button>

        <button
          onClick={() => setSelectedGame('pacman')}
          style={{
            flex: 1,
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: selectedGame === 'pacman' ? 'var(--bg-card)' : 'transparent',
            color: selectedGame === 'pacman' ? '#8A6800' : 'var(--text-secondary)',
            boxShadow: selectedGame === 'pacman' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <span>🟡</span> Google PAC-MAN
        </button>
      </div>

      {/* Vista del juego seleccionado */}
      {selectedGame === 'tetris' ? <TetrisGame /> : <PacmanGame />}
    </div>
  );
};
