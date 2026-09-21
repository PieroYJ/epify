import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Trophy, ArrowLeft, ArrowRight, ArrowDown, RefreshCw, Zap } from 'lucide-react';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

// Piezas clásicas de Tetris con colores infantiles alegres
const TETROMINOES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#4D96FF', // Azul cielo
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#6C5CE7', // Morado brillante
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#FF7A59', // Naranja Epify
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#FFD93D', // Amarillo sol
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#6BCB77', // Verde menta
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#A370F7', // Lavanda
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#FF5A5F', // Rosa sandía
  },
};

type TetrominoKey = keyof typeof TETROMINOES;
const KEYS: TetrominoKey[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

function getRandomPiece() {
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  return {
    key,
    shape: TETROMINOES[key].shape,
    color: TETROMINOES[key].color,
  };
}

function createEmptyBoard(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);

  const [board, setBoard] = useState<(string | null)[][]>(createEmptyBoard);
  const [currentPiece, setCurrentPiece] = useState(getRandomPiece);
  const [nextPiece, setNextPiece] = useState(getRandomPiece);
  const [piecePos, setPiecePos] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('epify_tetris_highscore') || 0);
  });
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Comprobar colisión
  const checkCollision = useCallback(
    (shape: number[][], offset: { x: number; y: number }, currentBoard = board) => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const newX = offset.x + c;
            const newY = offset.y + r;

            if (newX < 0 || newX >= COLS || newY >= ROWS) {
              return true;
            }
            if (newY >= 0 && currentBoard[newY][newX] !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    [board]
  );

  // Iniciar juego
  const startGame = () => {
    setBoard(createEmptyBoard());
    const first = getRandomPiece();
    const second = getRandomPiece();
    setCurrentPiece(first);
    setNextPiece(second);
    setPiecePos({ x: 3, y: 0 });
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  };

  // Rotar pieza
  const rotatePiece = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return;
    const shape = currentPiece.shape;
    const rotated = shape[0].map((_, i) => shape.map((row) => row[i]).reverse());

    // Wall kicks simples
    let newX = piecePos.x;
    if (checkCollision(rotated, { x: newX, y: piecePos.y })) {
      if (!checkCollision(rotated, { x: newX - 1, y: piecePos.y })) {
        newX -= 1;
      } else if (!checkCollision(rotated, { x: newX + 1, y: piecePos.y })) {
        newX += 1;
      } else {
        return;
      }
    }

    setCurrentPiece((prev) => ({ ...prev, shape: rotated }));
    setPiecePos((prev) => ({ ...prev, x: newX }));
  }, [currentPiece, piecePos, checkCollision, isPlaying, isPaused, gameOver]);

  // Mover lateralmente
  const moveHorizontal = useCallback(
    (dir: number) => {
      if (!isPlaying || isPaused || gameOver) return;
      if (!checkCollision(currentPiece.shape, { x: piecePos.x + dir, y: piecePos.y })) {
        setPiecePos((prev) => ({ ...prev, x: prev.x + dir }));
      }
    },
    [currentPiece, piecePos, checkCollision, isPlaying, isPaused, gameOver]
  );

  // Fijar pieza y generar la siguiente de forma atómica
  const lockPiece = useCallback(
    (
      shape: number[][],
      color: string,
      pos: { x: number; y: number },
      currentBoard: (string | null)[][]
    ) => {
      const newBoard = currentBoard.map((row) => [...row]);
      let isOutOfBounds = false;

      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const y = pos.y + r;
            const x = pos.x + c;
            if (y < 0) {
              isOutOfBounds = true;
            } else if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
              newBoard[y][x] = color;
            }
          }
        }
      }

      if (isOutOfBounds) {
        setGameOver(true);
        setIsPlaying(false);
        return;
      }

      // Limpiar líneas completadas
      let cleared = 0;
      const filteredBoard = newBoard.filter((row) => {
        const isFull = row.every((cell) => cell !== null);
        if (isFull) cleared++;
        return !isFull;
      });

      while (filteredBoard.length < ROWS) {
        filteredBoard.unshift(Array(COLS).fill(null));
      }

      if (cleared > 0) {
        const points = [0, 100, 300, 500, 800][cleared] * level;
        const newScore = score + points;
        const newLines = lines + cleared;
        const newLevel = Math.floor(newLines / 5) + 1;

        setScore(newScore);
        setLines(newLines);
        setLevel(newLevel);
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('epify_tetris_highscore', String(newScore));
        }

        if (cleared >= 4) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#FF7A59', '#FFD93D', '#4D96FF'],
            });
          } catch {
            // Ignorar
          }
        }
      }

      setBoard(filteredBoard);

      // Traer la siguiente pieza
      const nextP = nextPiece;
      const brandNew = getRandomPiece();

      if (checkCollision(nextP.shape, { x: 3, y: 0 }, filteredBoard)) {
        setGameOver(true);
        setIsPlaying(false);
      } else {
        setCurrentPiece(nextP);
        setNextPiece(brandNew);
        setPiecePos({ x: 3, y: 0 });
      }
    },
    [level, score, lines, highScore, nextPiece, checkCollision]
  );

  // Bajar pieza un paso suave
  const dropPiece = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return;

    if (!checkCollision(currentPiece.shape, { x: piecePos.x, y: piecePos.y + 1 }, board)) {
      setPiecePos((prev) => ({ ...prev, y: prev.y + 1 }));
    } else {
      lockPiece(currentPiece.shape, currentPiece.color, piecePos, board);
    }
  }, [isPlaying, isPaused, gameOver, currentPiece, piecePos, board, checkCollision, lockPiece]);

  // Caída rápida (Hard Drop): instantánea y atómica sin desvanecer ni sobreescribir bloques
  const hardDrop = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return;

    let targetY = piecePos.y;
    while (!checkCollision(currentPiece.shape, { x: piecePos.x, y: targetY + 1 }, board)) {
      targetY++;
    }

    const dropBonus = (targetY - piecePos.y) * 2;
    if (dropBonus > 0) {
      setScore((prev) => {
        const s = prev + dropBonus;
        if (s > highScore) {
          setHighScore(s);
          localStorage.setItem('epify_tetris_highscore', String(s));
        }
        return s;
      });
    }

    // Fijar la pieza directamente en targetY en este mismo frame
    lockPiece(currentPiece.shape, currentPiece.color, { x: piecePos.x, y: targetY }, board);
  }, [isPlaying, isPaused, gameOver, currentPiece, piecePos, board, checkCollision, lockPiece, highScore]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;
    const speed = Math.max(120, 800 - (level - 1) * 70);
    const interval = setInterval(dropPiece, speed);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, gameOver, level, dropPiece]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') moveHorizontal(-1);
      if (e.key === 'ArrowRight') moveHorizontal(1);
      if (e.key === 'ArrowUp') rotatePiece();
      if (e.key === 'ArrowDown') dropPiece();
      if (e.key === ' ') hardDrop();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, rotatePiece, dropPiece, hardDrop]);

  // Renderizar canvas principal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fondo del tablero
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cuadrícula sutil
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }

    // Dibujar bloques fijos en el tablero
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = board[r][c];
        if (color) {
          drawBlock(ctx, c * BLOCK_SIZE, r * BLOCK_SIZE, color);
        }
      }
    }

    // Dibujar sombra / ghost piece de caída
    if (isPlaying && !gameOver) {
      let ghostY = piecePos.y;
      while (!checkCollision(currentPiece.shape, { x: piecePos.x, y: ghostY + 1 }, board)) {
        ghostY++;
      }

      if (ghostY > piecePos.y) {
        for (let r = 0; r < currentPiece.shape.length; r++) {
          for (let c = 0; c < currentPiece.shape[r].length; c++) {
            if (currentPiece.shape[r][c] !== 0) {
              const x = (piecePos.x + c) * BLOCK_SIZE;
              const y = (ghostY + r) * BLOCK_SIZE;
              if (y >= 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
                ctx.beginPath();
                ctx.roundRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4, 4);
                ctx.fill();

                ctx.strokeStyle = currentPiece.color;
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 3]);
                ctx.strokeRect(x + 2, y + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
                ctx.setLineDash([]);
              }
            }
          }
        }
      }

      // Dibujar pieza actual en movimiento
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const x = (piecePos.x + c) * BLOCK_SIZE;
            const y = (piecePos.y + r) * BLOCK_SIZE;
            if (y >= 0) {
              drawBlock(ctx, x, y, currentPiece.color);
            }
          }
        }
      }
    }
  }, [board, currentPiece, piecePos, isPlaying, gameOver, checkCollision]);

  // Renderizar preview de siguiente pieza
  useEffect(() => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FAFBFD';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const shape = nextPiece.shape;
    const size = 18;
    const offsetX = (canvas.width - shape[0].length * size) / 2;
    const offsetY = (canvas.height - shape.length * size) / 2;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          drawBlock(ctx, offsetX + c * size, offsetY + r * size, nextPiece.color, size);
        }
      }
    }
  }, [nextPiece]);

  function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = BLOCK_SIZE) {
    // Relleno redondeado suave
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 1.5, y + 1.5, size - 3, size - 3, 5);
    ctx.fill();

    // Brillo superior amigable
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, size - 4, (size - 4) / 3, 3);
    ctx.fill();
  }

  return (
    <div className="view-container animate-fade-in" style={{ alignItems: 'center' }}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.6rem' }}>🧱</span>
          <h2 style={{ fontSize: '1.4rem' }}>Tetris Kids</h2>
          <span className="user-badge-tag" style={{ background: 'var(--accent-yellow-light)', color: '#8A6800' }}>
            Juego Seguro
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          ¡Gira y acomoda los bloques de colores sin tocar el techo!
        </p>
      </div>

      {/* Panel Superior de Puntuación */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          width: '100%',
          maxWidth: 360,
          justifyContent: 'space-between',
        }}
      >
        <div className="stat-card" style={{ flex: 1, padding: '8px 12px', gap: 8 }}>
          <div style={{ fontSize: '1.2rem' }}>⭐</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{score}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Puntos</div>
          </div>
        </div>

        <div className="stat-card" style={{ flex: 1, padding: '8px 12px', gap: 8 }}>
          <Trophy size={20} color="#FFD93D" />
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{highScore}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Récord</div>
          </div>
        </div>

        <div className="stat-card" style={{ flex: 1, padding: '8px 12px', gap: 8 }}>
          <div style={{ fontSize: '1.2rem' }}>🚀</div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Nivel {level}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{lines} líneas</div>
          </div>
        </div>
      </div>

      {/* Contenedor del Juego y Siguiente Pieza */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', justifyContent: 'center' }}>
        {/* Tablero Principal */}
        <div
          style={{
            position: 'relative',
            border: '3px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          <canvas ref={canvasRef} width={COLS * BLOCK_SIZE} height={ROWS * BLOCK_SIZE} />

          {/* Pantalla de Inicio / Game Over / Pausa */}
          {!isPlaying && !gameOver && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem' }}>🎮</div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>¿Listo para jugar?</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Usa los botones en pantalla o las flechas de tu teclado.
              </p>
              <button className="btn-primary" onClick={startGame} style={{ padding: '10px 24px', fontSize: '0.95rem' }}>
                <Play size={16} /> ¡Jugar Ahora!
              </button>
            </div>
          )}

          {gameOver && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.5rem' }}>👏</div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>¡Gran intento!</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Puntaje final: <strong>{score}</strong>
              </p>
              <button className="btn-primary" onClick={startGame} style={{ padding: '10px 20px', gap: 6 }}>
                <RotateCcw size={15} /> Jugar otra vez
              </button>
            </div>
          )}

          {isPaused && isPlaying && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <div style={{ fontSize: '2.2rem' }}>⏸️</div>
              <h4>Juego en Pausa</h4>
              <button className="btn-secondary" onClick={() => setIsPaused(false)}>
                Reanudar
              </button>
            </div>
          )}
        </div>

        {/* Panel Lateral: Siguiente Pieza y Botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 10,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              Siguiente:
            </div>
            <canvas ref={nextCanvasRef} width={80} height={80} style={{ borderRadius: 'var(--radius-sm)' }} />
          </div>

          {isPlaying && (
            <button
              className="btn-muted"
              style={{ padding: '8px 12px', fontSize: '0.78rem', gap: 6 }}
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play size={13} /> : <Pause size={13} />}
              {isPaused ? 'Continuar' : 'Pausa'}
            </button>
          )}

          <button
            className="btn-muted"
            style={{ padding: '8px 12px', fontSize: '0.78rem', gap: 6 }}
            onClick={startGame}
            title="Reiniciar partida"
          >
            <RotateCcw size={13} /> Reiniciar
          </button>
        </div>
      </div>

      {/* Controles Táctiles para Niños en Celulares */}
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button
            className="btn-secondary"
            style={{ flex: 1, padding: '14px 0', fontSize: '1.2rem', borderRadius: 'var(--radius-md)' }}
            onClick={() => moveHorizontal(-1)}
            title="Mover Izquierda"
          >
            <ArrowLeft size={22} />
          </button>

          <button
            className="btn-primary"
            style={{ flex: 1.3, padding: '14px 0', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', gap: 6 }}
            onClick={rotatePiece}
            title="Girar Pieza"
          >
            <RefreshCw size={18} /> Girar
          </button>

          <button
            className="btn-secondary"
            style={{ flex: 1, padding: '14px 0', fontSize: '1.2rem', borderRadius: 'var(--radius-md)' }}
            onClick={() => moveHorizontal(1)}
            title="Mover Derecha"
          >
            <ArrowRight size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn-muted"
            style={{ flex: 1, padding: '12px 0', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', gap: 6 }}
            onClick={dropPiece}
            title="Bajar suave"
          >
            <ArrowDown size={18} /> Bajar
          </button>

          <button
            className="btn-secondary"
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              gap: 6,
              background: 'var(--accent-yellow-light)',
              color: '#8A6800',
              borderColor: '#FFE58F',
            }}
            onClick={hardDrop}
            title="Caída rápida instantánea"
          >
            <Zap size={18} /> Caída Rápida
          </button>
        </div>
      </div>
    </div>
  );
};
