import React from 'react';
import { TetrisGame } from './TetrisGame';

export const GamesView: React.FC = () => {
  return (
    <div style={{ paddingBottom: 24 }}>
      <TetrisGame />
    </div>
  );
};
