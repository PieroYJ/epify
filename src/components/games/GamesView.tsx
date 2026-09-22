import React, { useState } from 'react';
import { TetrisGame } from './TetrisGame';
import { PacmanGame } from './PacmanGame';
import { StickmanGame } from './StickmanGame';

export const GamesView: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<'stickman' | 'tetris' | 'pacman'>('stickman');

  return (
    <div style={{ paddingBottom: 28 }}>
      {/* Selector de Juegos amigable para niños */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
          margin: '10px auto 14px',
          maxWidth: 520,
          padding: '4px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--border-color)',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSelectedGame('stickman')}
          style={{
            flex: 1,
            minWidth: 140,
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: selectedGame === 'stickman' ? 'var(--bg-card)' : 'transparent',
            color: selectedGame === 'stickman' ? '#FF4757' : 'var(--text-secondary)',
            boxShadow: selectedGame === 'stickman' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <span>🥊</span> Stickman Brawl
        </button>

        <button
          onClick={() => setSelectedGame('tetris')}
          style={{
            flex: 1,
            minWidth: 120,
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.86rem',
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
            minWidth: 130,
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            fontSize: '0.86rem',
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
          <span>🟡</span> PAC-MAN
        </button>
      </div>

      {/* Vista del juego seleccionado */}
      {selectedGame === 'stickman' && <StickmanGame />}
      {selectedGame === 'tetris' && <TetrisGame />}
      {selectedGame === 'pacman' && <PacmanGame />}
    </div>
  );
};
