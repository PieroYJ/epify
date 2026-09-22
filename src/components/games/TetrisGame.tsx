import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  RefreshCw,
  Zap,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { tetrisAudio } from './tetrisAudio';

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 24;

// Piezas clásicas de Tetris con colores infantiles alegres y vibrantes
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

interface Piece {
  key: TetrominoKey;
  shape: number[][];
  color: string;
}

function getRandomPiece(): Piece {
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

  // ================= ESTADO SÍNCRONO DEL JUEGO (REFS) =================
  // Evita carreras críticas y cierres obsoletos (stale closures) en React
  const boardRef = useRef<(string | null)[][]>(createEmptyBoard());
  const currentPieceRef = useRef<Piece>(getRandomPiece());
  const nextPieceRef = useRef<Piece>(getRandomPiece());
  const piecePosRef = useRef<{ x: number; y: number }>({ x: 3, y: 0 });
  const scoreRef = useRef<number>(0);
  const linesRef = useRef<number>(0);
  const levelRef = useRef<number>(1);
  const highScoreRef = useRef<number>(Number(localStorage.getItem('epify_tetris_highscore') || 0));
  const isPlayingRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const gameOverRef = useRef<boolean>(false);
  const dropTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHardDroppingRef = useRef<boolean>(false);
  const dropTickRef = useRef<() => void>(() => {});

  // ================= ESTADOS DE REACT PARA ACTUALIZAR LA INTERFAZ =================
  const [score, setScore] = useState<number>(0);
  const [lines, setLines] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('epify_tetris_highscore') || 0);
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => tetrisAudio.getMuted());

  // Comprobar colisión síncrona contra cualquier tablero (por defecto el actual)
  const checkCollision = useCallback(
    (shape: number[][], offset: { x: number; y: number }, testBoard = boardRef.current): boolean => {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c] !== 0) {
            const newX = offset.x + c;
            const newY = offset.y + r;

            if (newX < 0 || newX >= COLS || newY >= ROWS) {
              return true;
            }
            if (newY >= 0 && testBoard[newY][newX] !== null) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  // Dibuja un bloque individual con esquinas redondeadas y brillo
  const drawBlock = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    size = BLOCK_SIZE
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 1.5, y + 1.5, size - 3, size - 3, 5);
    ctx.fill();

    // Brillo superior amigable estilo gominola
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.beginPath();
    ctx.roundRect(x + 2.5, y + 2.5, size - 5, (size - 4) / 3, 3);
    ctx.fill();
  };

  // Renderizar lienzo principal y preview
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const board = boardRef.current;
    const currentPiece = currentPieceRef.current;
    const piecePos = piecePosRef.current;
    const playing = isPlayingRef.current;
    const isOver = gameOverRef.current;

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
    if (playing && !isOver) {
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

      // Dibujar pieza activa en movimiento
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

    // Dibujar preview de la siguiente pieza
    const nextCanvas = nextCanvasRef.current;
    if (nextCanvas) {
      const nextCtx = nextCanvas.getContext('2d');
      if (nextCtx) {
        nextCtx.fillStyle = '#FAFBFD';
        nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

        const nextP = nextPieceRef.current;
        const shape = nextP.shape;
        const size = 18;
        const offsetX = (nextCanvas.width - shape[0].length * size) / 2;
        const offsetY = (nextCanvas.height - shape.length * size) / 2;

        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 0) {
              drawBlock(nextCtx, offsetX + c * size, offsetY + r * size, nextP.color, size);
            }
          }
        }
      }
    }
  }, [checkCollision]);

  // Limpiar temporizador de caída
  const clearDropTimer = useCallback(() => {
    if (dropTimerRef.current) {
      clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
    }
  }, []);

  // Programar siguiente caída automática
  const scheduleNextTick = useCallback(() => {
    clearDropTimer();
    if (!isPlayingRef.current || isPausedRef.current || gameOverRef.current) return;

    const speed = Math.max(120, 800 - (levelRef.current - 1) * 70);
    dropTimerRef.current = setTimeout(() => {
      dropTickRef.current();
    }, speed);
  }, [clearDropTimer]);

  // Fijar la pieza actual en una posición (x, y) de forma síncrona en el tablero
  const lockPieceAt = useCallback(
    (x: number, y: number) => {
      const currentPiece = currentPieceRef.current;
      const board = boardRef.current;

      // 1. Integrar bloques de la pieza en el tablero
      let isOutOfBounds = false;
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const boardY = y + r;
            const boardX = x + c;
            if (boardY < 0) {
              isOutOfBounds = true;
            } else if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
              board[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }

      if (isOutOfBounds) {
        gameOverRef.current = true;
        isPlayingRef.current = false;
        clearDropTimer();
        setGameOver(true);
        setIsPlaying(false);
        tetrisAudio.playGameOver();
        draw();
        return;
      }

      // 2. Limpiar líneas completas
      let cleared = 0;
      const filteredBoard = board.filter((row) => {
        const isFull = row.every((cell) => cell !== null);
        if (isFull) cleared++;
        return !isFull;
      });

      while (filteredBoard.length < ROWS) {
        filteredBoard.unshift(Array(COLS).fill(null));
      }
      boardRef.current = filteredBoard;

      // 3. Puntuación y efectos
      if (cleared > 0) {
        const points = [0, 100, 300, 500, 800][cleared] * levelRef.current;
        const newScore = scoreRef.current + points;
        const newLines = linesRef.current + cleared;
        const newLevel = Math.floor(newLines / 5) + 1;

        scoreRef.current = newScore;
        linesRef.current = newLines;
        levelRef.current = newLevel;

        setScore(newScore);
        setLines(newLines);
        setLevel(newLevel);

        if (newScore > highScoreRef.current) {
          highScoreRef.current = newScore;
          setHighScore(newScore);
          localStorage.setItem('epify_tetris_highscore', String(newScore));
        }

        tetrisAudio.playLineClear(cleared);

        if (cleared >= 4) {
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#FF7A59', '#FFD93D', '#4D96FF'],
            });
          } catch {}
        }
      }

      // 4. Traer la siguiente pieza de forma síncrona
      const spawnedPiece = nextPieceRef.current;
      const brandNew = getRandomPiece();

      currentPieceRef.current = spawnedPiece;
      nextPieceRef.current = brandNew;
      piecePosRef.current = { x: 3, y: 0 };

      // 5. Verificar Game Over para la nueva pieza
      if (checkCollision(spawnedPiece.shape, { x: 3, y: 0 }, boardRef.current)) {
        gameOverRef.current = true;
        isPlayingRef.current = false;
        clearDropTimer();
        setGameOver(true);
        setIsPlaying(false);
        tetrisAudio.playGameOver();
      }

      draw();
    },
    [checkCollision, clearDropTimer, draw]
  );

  // Caída automática de un paso (tick)
  const dropTick = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current || gameOverRef.current) return;

    const currentPiece = currentPieceRef.current;
    const currentPos = piecePosRef.current;
    const board = boardRef.current;

    if (!checkCollision(currentPiece.shape, { x: currentPos.x, y: currentPos.y + 1 }, board)) {
      piecePosRef.current = { ...currentPos, y: currentPos.y + 1 };
      draw();
      scheduleNextTick();
    } else {
      lockPieceAt(currentPos.x, currentPos.y);
      if (isPlayingRef.current && !gameOverRef.current) {
        scheduleNextTick();
      }
    }
  }, [checkCollision, draw, lockPieceAt, scheduleNextTick]);

  // Mantener la referencia actualizada de dropTick
  useEffect(() => {
    dropTickRef.current = dropTick;
  }, [dropTick]);

  // Iniciar partida
  const startGame = useCallback(() => {
    clearDropTimer();
    boardRef.current = createEmptyBoard();

    const first = getRandomPiece();
    const second = getRandomPiece();
    currentPieceRef.current = first;
    nextPieceRef.current = second;
    piecePosRef.current = { x: 3, y: 0 };
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    isPlayingRef.current = true;
    isPausedRef.current = false;
    gameOverRef.current = false;
    isHardDroppingRef.current = false;

    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);

    // Arrancar música de Tetris
    tetrisAudio.startMusic();

    draw();
    scheduleNextTick();
  }, [clearDropTimer, draw, scheduleNextTick]);

  // Rotar pieza en sentido horario con wall kicks
  const rotatePiece = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current || gameOverRef.current) return;

    const currentPiece = currentPieceRef.current;
    const shape = currentPiece.shape;
    const rotated = shape[0].map((_, i) => shape.map((row) => row[i]).reverse());

    let newX = piecePosRef.current.x;
    const currentY = piecePosRef.current.y;
    if (checkCollision(rotated, { x: newX, y: currentY }, boardRef.current)) {
      if (!checkCollision(rotated, { x: newX - 1, y: currentY }, boardRef.current)) {
        newX -= 1;
      } else if (!checkCollision(rotated, { x: newX + 1, y: currentY }, boardRef.current)) {
        newX += 1;
      } else {
        return;
      }
    }

    currentPieceRef.current = { ...currentPiece, shape: rotated };
    piecePosRef.current = { ...piecePosRef.current, x: newX };
    tetrisAudio.playRotate();
    draw();
  }, [checkCollision, draw]);

  // Mover lateralmente
  const moveHorizontal = useCallback(
    (dir: number) => {
      if (!isPlayingRef.current || isPausedRef.current || gameOverRef.current) return;

      const currentPiece = currentPieceRef.current;
      const targetPos = { x: piecePosRef.current.x + dir, y: piecePosRef.current.y };

      if (!checkCollision(currentPiece.shape, targetPos, boardRef.current)) {
        piecePosRef.current = targetPos;
        tetrisAudio.playMove();
        draw();
      }
    },
    [checkCollision, draw]
  );

  // Bajar suavemente (un paso)
  const softDrop = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current || gameOverRef.current) return;
    dropTick();
  }, [dropTick]);

  // CAÍDA RÁPIDA (Hard Drop) ATÓMICA Y SIN DESAPARICIÓN DE BLOQUES
  const hardDrop = useCallback(() => {
    if (!isPlayingRef.current || isPausedRef.current || gameOverRef.current) return;
    if (isHardDroppingRef.current) return; // Evita ejecución duplicada o reentrante
    isHardDroppingRef.current = true;

    // 1. Cancelar el temporizador cíclico de inmediato para que ningún tick pendiente sobreescriba
    clearDropTimer();

    const currentPiece = currentPieceRef.current;
    const currentX = piecePosRef.current.x;
    let targetY = piecePosRef.current.y;
    const currentBoard = boardRef.current;

    // 2. Calcular la posición más baja posible con el tablero síncrono actual
    while (!checkCollision(currentPiece.shape, { x: currentX, y: targetY + 1 }, currentBoard)) {
      targetY++;
    }

    // 3. Sonido de impacto de caída rápida
    tetrisAudio.playHardDrop();

    // 4. Bonificación de puntos por caída rápida
    const dropBonus = (targetY - piecePosRef.current.y) * 2;
    if (dropBonus > 0) {
      const newScore = scoreRef.current + dropBonus;
      scoreRef.current = newScore;
      setScore(newScore);
      if (newScore > highScoreRef.current) {
        highScoreRef.current = newScore;
        setHighScore(newScore);
        localStorage.setItem('epify_tetris_highscore', String(newScore));
      }
    }

    // 5. Fijar inmediatamente la pieza en targetY
    lockPieceAt(currentX, targetY);

    // 6. Si el juego sigue activo, reprogramar el temporizador para la nueva pieza
    if (isPlayingRef.current && !gameOverRef.current) {
      scheduleNextTick();
    }

    isHardDroppingRef.current = false;
  }, [clearDropTimer, checkCollision, lockPieceAt, scheduleNextTick]);

  // Alternar pausa
  const togglePause = useCallback(() => {
    if (!isPlayingRef.current || gameOverRef.current) return;
    const nextPaused = !isPausedRef.current;
    isPausedRef.current = nextPaused;
    setIsPaused(nextPaused);

    if (nextPaused) {
      clearDropTimer();
      tetrisAudio.pauseMusic();
    } else {
      tetrisAudio.resumeMusic();
      scheduleNextTick();
    }
  }, [clearDropTimer, scheduleNextTick]);

  // Alternar sonido/música
  const toggleSound = useCallback(() => {
    const muted = tetrisAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'ArrowLeft') moveHorizontal(-1);
      else if (e.key === 'ArrowRight') moveHorizontal(1);
      else if (e.key === 'ArrowUp') rotatePiece();
      else if (e.key === 'ArrowDown') softDrop();
      else if (e.key === ' ') hardDrop();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveHorizontal, rotatePiece, softDrop, hardDrop]);

  // Dibujar estado inicial o redibujar al montar
  useEffect(() => {
    draw();
  }, [draw]);

  // Limpieza al desmontar el componente (parar timers y música)
  useEffect(() => {
    return () => {
      clearDropTimer();
      tetrisAudio.stopMusic();
    };
  }, [clearDropTimer]);

  return (
    <div className="view-container animate-fade-in" style={{ alignItems: 'center' }}>
      {/* Cabecera del juego con botón de sonido */}
      <div style={{ textAlign: 'center', width: '100%', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.6rem' }}>🧱</span>
          <h2 style={{ fontSize: '1.4rem' }}>Tetris Kids</h2>
          <span className="user-badge-tag" style={{ background: 'var(--accent-yellow-light)', color: '#8A6800' }}>
            Juego Seguro
          </span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          ¡Acomoda los bloques, escucha la música clásica y rompe tu récord!
        </p>
      </div>

      {/* Panel Superior de Puntuación */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          width: '100%',
          maxWidth: 360,
          justifyContent: 'space-between',
        }}
      >
        <div className="stat-card" style={{ flex: 1, padding: '8px 10px', gap: 6 }}>
          <div style={{ fontSize: '1.1rem' }}>⭐</div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{score}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Puntos</div>
          </div>
        </div>

        <div className="stat-card" style={{ flex: 1, padding: '8px 10px', gap: 6 }}>
          <Trophy size={18} color="#FFD93D" />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{highScore}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Récord</div>
          </div>
        </div>

        <div className="stat-card" style={{ flex: 1, padding: '8px 10px', gap: 6 }}>
          <div style={{ fontSize: '1.1rem' }}>🚀</div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Nivel {level}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lines} líneas</div>
          </div>
        </div>
      </div>

      {/* Contenedor del Juego y Siguiente Pieza */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
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
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: 220 }}>
                Usa los botones en pantalla o las flechas de tu teclado. ¡Música retro incluida!
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={startGame}
                style={{ padding: '10px 24px', fontSize: '0.95rem' }}
              >
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
              <button type="button" className="btn-primary" onClick={startGame} style={{ padding: '10px 20px', gap: 6 }}>
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
              <button type="button" className="btn-secondary" onClick={togglePause}>
                Reanudar
              </button>
            </div>
          )}
        </div>

        {/* Panel Lateral: Siguiente Pieza, Audio y Botones de Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 88 }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 6,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
              Siguiente:
            </div>
            <canvas ref={nextCanvasRef} width={76} height={76} style={{ borderRadius: 'var(--radius-sm)' }} />
          </div>

          {/* Botón de Música / Sonido */}
          <button
            type="button"
            className={isMuted ? 'btn-muted' : 'btn-secondary'}
            style={{
              padding: '8px 10px',
              fontSize: '0.74rem',
              gap: 5,
              borderRadius: 'var(--radius-md)',
              color: isMuted ? 'var(--text-muted)' : 'var(--brand-primary)',
            }}
            onClick={toggleSound}
            title={isMuted ? 'Activar música y sonidos' : 'Silenciar música y sonidos'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {isMuted ? 'Mudo' : 'Música'}
          </button>

          {isPlaying && (
            <button
              type="button"
              className="btn-muted"
              style={{ padding: '8px 10px', fontSize: '0.74rem', gap: 5, borderRadius: 'var(--radius-md)' }}
              onClick={togglePause}
            >
              {isPaused ? <Play size={13} /> : <Pause size={13} />}
              {isPaused ? 'Seguir' : 'Pausa'}
            </button>
          )}

          <button
            type="button"
            className="btn-muted"
            style={{ padding: '8px 10px', fontSize: '0.74rem', gap: 5, borderRadius: 'var(--radius-md)' }}
            onClick={startGame}
            title="Reiniciar partida"
          >
            <RotateCcw size={13} /> Reiniciar
          </button>
        </div>
      </div>

      {/* Controles Táctiles para Niños en Celulares y Tablets */}
      <div
        style={{
          width: '100%',
          maxWidth: 340,
          marginTop: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ flex: 1, padding: '14px 0', fontSize: '1.2rem', borderRadius: 'var(--radius-md)' }}
            onClick={() => moveHorizontal(-1)}
            title="Mover Izquierda"
          >
            <ArrowLeft size={22} />
          </button>

          <button
            type="button"
            className="btn-primary"
            style={{ flex: 1.3, padding: '14px 0', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', gap: 6 }}
            onClick={rotatePiece}
            title="Girar Pieza"
          >
            <RefreshCw size={18} /> Girar
          </button>

          <button
            type="button"
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
            type="button"
            className="btn-muted"
            style={{ flex: 1, padding: '12px 0', fontSize: '0.85rem', borderRadius: 'var(--radius-md)', gap: 6 }}
            onClick={softDrop}
            title="Bajar un paso"
          >
            <ArrowDown size={18} /> Bajar
          </button>

          <button
            type="button"
            className="btn-secondary"
            style={{
              flex: 1.2,
              padding: '12px 0',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              gap: 6,
              background: 'var(--accent-yellow-light)',
              color: '#8A6800',
              borderColor: '#FFE58F',
              fontWeight: 700,
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
