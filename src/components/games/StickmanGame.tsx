import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, RotateCcw, Bot, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { stickmanAudio } from './stickmanAudio';

type GameMode = '2p' | 'vs_cpu';
type MatchState = 'ready' | 'playing' | 'round_end' | 'match_over' | 'paused';
type FighterAction = 'idle' | 'running' | 'jumping' | 'punching' | 'kicking' | 'blocking' | 'hurt' | 'ko';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'spark' | 'star' | 'smoke';
}

interface ComicText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

interface Fighter {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1; // 1 = derecha, -1 = izquierda
  color: string;
  glowColor: string;
  name: string;
  avatar: string;
  hp: number;
  displayHp: number;
  maxHp: number;
  roundsWon: number;
  action: FighterAction;
  actionTimer: number;
  isGrounded: boolean;
  isBlocking: boolean;
  hurtCooldown: number;
  runCycle: number;
}

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const StickmanGame: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('2p');
  const [matchState, setMatchState] = useState<MatchState>('ready');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [roundWinner, setRoundWinner] = useState<string | null>(null);
  const [matchWinner, setMatchWinner] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(() => stickmanAudio.getMuted());
  const [showControls, setShowControls] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Referencias directas al DOM para actualización instantánea a 60 FPS de las barras de vida
  const p1HpBarRef = useRef<HTMLDivElement>(null);
  const p2HpBarRef = useRef<HTMLDivElement>(null);
  const p1HpTextRef = useRef<HTMLSpanElement>(null);
  const p2HpTextRef = useRef<HTMLSpanElement>(null);

  // Constantes de la física y arena
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 450;
  const FLOOR_Y = 380;
  const GRAVITY = 0.85;

  const platforms: Platform[] = [
    { x: 130, y: 270, width: 150, height: 14 },
    { x: 520, y: 270, width: 150, height: 14 },
  ];

  // Estado mutable de los luchadores en referencia (para animación síncrona a 60 FPS)
  const p1Ref = useRef<Fighter>({
    x: 200,
    y: FLOOR_Y,
    vx: 0,
    vy: 0,
    width: 40,
    height: 90,
    facing: 1,
    color: '#00D2FF',
    glowColor: 'rgba(0, 210, 255, 0.4)',
    name: 'Stickman Azul',
    avatar: '🔵',
    hp: 100,
    displayHp: 100,
    maxHp: 100,
    roundsWon: 0,
    action: 'idle',
    actionTimer: 0,
    isGrounded: true,
    isBlocking: false,
    hurtCooldown: 0,
    runCycle: 0,
  });

  const p2Ref = useRef<Fighter>({
    x: 600,
    y: FLOOR_Y,
    vx: 0,
    vy: 0,
    width: 40,
    height: 90,
    facing: -1,
    color: '#FF4757',
    glowColor: 'rgba(255, 71, 87, 0.4)',
    name: 'Stickman Rojo',
    avatar: '🔴',
    hp: 100,
    displayHp: 100,
    maxHp: 100,
    roundsWon: 0,
    action: 'idle',
    actionTimer: 0,
    isGrounded: true,
    isBlocking: false,
    hurtCooldown: 0,
    runCycle: 0,
  });

  const particlesRef = useRef<Particle[]>([]);
  const comicTextsRef = useRef<ComicText[]>([]);
  const screenShakeRef = useRef<number>(0);
  const aiCooldownRef = useRef<number>(0);

  // Inicializar o reiniciar ronda
  const resetRound = useCallback((round: number) => {
    p1Ref.current.x = 200;
    p1Ref.current.y = FLOOR_Y;
    p1Ref.current.vx = 0;
    p1Ref.current.vy = 0;
    p1Ref.current.hp = 100;
    p1Ref.current.displayHp = 100;
    p1Ref.current.facing = 1;
    p1Ref.current.action = 'idle';
    p1Ref.current.actionTimer = 0;
    p1Ref.current.isBlocking = false;
    p1Ref.current.hurtCooldown = 0;

    p2Ref.current.x = 600;
    p2Ref.current.y = FLOOR_Y;
    p2Ref.current.vx = 0;
    p2Ref.current.vy = 0;
    p2Ref.current.hp = 100;
    p2Ref.current.displayHp = 100;
    p2Ref.current.facing = -1;
    p2Ref.current.action = 'idle';
    p2Ref.current.actionTimer = 0;
    p2Ref.current.isBlocking = false;
    p2Ref.current.hurtCooldown = 0;

    particlesRef.current = [];
    comicTextsRef.current = [];
    screenShakeRef.current = 0;

    // Resetear elementos del HUD en el DOM
    if (p1HpBarRef.current) p1HpBarRef.current.style.width = '100%';
    if (p2HpBarRef.current) p2HpBarRef.current.style.width = '100%';
    if (p1HpTextRef.current) p1HpTextRef.current.textContent = '100%';
    if (p2HpTextRef.current) p2HpTextRef.current.textContent = '100%';

    setRoundNumber(round);
    setRoundWinner(null);
    setCountdown(3);
    setMatchState('ready');
  }, [FLOOR_Y]);

  // Reiniciar partida completa desde cero
  const resetMatch = useCallback(() => {
    p1Ref.current.roundsWon = 0;
    p2Ref.current.roundsWon = 0;
    setMatchWinner(null);
    resetRound(1);
  }, [resetRound]);

  // Cuenta atrás antes de iniciar combate
  useEffect(() => {
    if (matchState !== 'ready') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 700);
      return () => clearTimeout(timer);
    } else {
      setMatchState('playing');
    }
  }, [matchState, countdown]);

  // Manejo de eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      keysPressed.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Agregar partículas de impacto
  const spawnHitParticles = (x: number, y: number, color: string, isHeavy: boolean) => {
    const count = isHeavy ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 5 + 3) * (isHeavy ? 1.4 : 1);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 3,
        color,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 10,
        type: Math.random() > 0.5 ? 'star' : 'spark',
      });
    }

    const comicWords = isHeavy ? ['¡BAM!', '¡K.O.!', '¡BOOM!'] : ['¡POW!', '¡SMACK!', '¡ZAP!'];
    const chosenWord = comicWords[Math.floor(Math.random() * comicWords.length)];
    comicTextsRef.current.push({
      x: x + (Math.random() * 20 - 10),
      y: y - 20,
      text: chosenWord,
      color: isHeavy ? '#FFD700' : '#FFFFFF',
      alpha: 1,
      scale: isHeavy ? 1.5 : 1.1,
      life: 0,
    });
  };

  // IA para Jugador 2 en modo vs CPU
  const updateAi = (cpu: Fighter, target: Fighter) => {
    if (cpu.action === 'ko' || cpu.action === 'hurt') return;

    aiCooldownRef.current--;
    const dist = target.x - cpu.x;
    const absDist = Math.abs(dist);

    cpu.facing = dist > 0 ? 1 : -1;

    if (aiCooldownRef.current <= 0) {
      aiCooldownRef.current = 10 + Math.floor(Math.random() * 10);

      // Si el objetivo está atacando cerca, posibilidad de bloquear
      if (absDist < 85 && (target.action === 'punching' || target.action === 'kicking') && Math.random() < 0.6) {
        cpu.isBlocking = true;
        cpu.action = 'blocking';
        cpu.actionTimer = 20;
        return;
      }

      // Si está en rango de golpe
      if (absDist < 70) {
        cpu.isBlocking = false;
        if (Math.random() < 0.5) {
          cpu.action = 'punching';
          cpu.actionTimer = 14;
          stickmanAudio.playPunch();
        } else {
          cpu.action = 'kicking';
          cpu.actionTimer = 18;
          stickmanAudio.playKick();
        }
        return;
      }

      // Si está a media distancia, avanzar
      if (absDist >= 70) {
        cpu.isBlocking = false;
        cpu.vx = cpu.facing * 4.5;
        cpu.action = 'running';

        if (Math.random() < 0.15 && cpu.isGrounded) {
          cpu.vy = -15;
          cpu.isGrounded = false;
          stickmanAudio.playJump();
        }
      }
    }
  };

  // Bucle principal de animación a 60 FPS
  useEffect(() => {
    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const p1 = p1Ref.current;
      const p2 = p2Ref.current;

      // 1. FÍSICA Y ENTRADAS
      if (matchState === 'playing') {
        // --- CONTROLES JUGADOR 1 (A, D, W, S, F, G) ---
        if (p1.action !== 'ko' && p1.action !== 'hurt') {
          p1.isBlocking = false;

          if (keysPressed.current['KeyS'] && p1.isGrounded) {
            p1.isBlocking = true;
            p1.action = 'blocking';
            p1.vx = 0;
          } else {
            if (keysPressed.current['KeyA']) {
              p1.vx = -5.5;
              p1.facing = -1;
              if (p1.isGrounded) p1.action = 'running';
            } else if (keysPressed.current['KeyD']) {
              p1.vx = 5.5;
              p1.facing = 1;
              if (p1.isGrounded) p1.action = 'running';
            } else {
              p1.vx *= 0.75;
              if (p1.isGrounded && p1.action !== 'punching' && p1.action !== 'kicking') {
                p1.action = 'idle';
              }
            }

            if (keysPressed.current['KeyW'] && p1.isGrounded) {
              p1.vy = -16;
              p1.isGrounded = false;
              p1.action = 'jumping';
              stickmanAudio.playJump();
            }

            if (keysPressed.current['KeyF'] && p1.action !== 'punching' && p1.action !== 'kicking') {
              p1.action = 'punching';
              p1.actionTimer = 14;
              stickmanAudio.playPunch();
            }

            if (keysPressed.current['KeyG'] && p1.action !== 'punching' && p1.action !== 'kicking') {
              p1.action = 'kicking';
              p1.actionTimer = 18;
              stickmanAudio.playKick();
            }
          }
        }

        // --- CONTROLES JUGADOR 2 (Flechas, K, L) O CPU ---
        if (gameMode === '2p') {
          if (p2.action !== 'ko' && p2.action !== 'hurt') {
            p2.isBlocking = false;

            if (keysPressed.current['ArrowDown'] && p2.isGrounded) {
              p2.isBlocking = true;
              p2.action = 'blocking';
              p2.vx = 0;
            } else {
              if (keysPressed.current['ArrowLeft']) {
                p2.vx = -5.5;
                p2.facing = -1;
                if (p2.isGrounded) p2.action = 'running';
              } else if (keysPressed.current['ArrowRight']) {
                p2.vx = 5.5;
                p2.facing = 1;
                if (p2.isGrounded) p2.action = 'running';
              } else {
                p2.vx *= 0.75;
                if (p2.isGrounded && p2.action !== 'punching' && p2.action !== 'kicking') {
                  p2.action = 'idle';
                }
              }

              if (keysPressed.current['ArrowUp'] && p2.isGrounded) {
                p2.vy = -16;
                p2.isGrounded = false;
                p2.action = 'jumping';
                stickmanAudio.playJump();
              }

              if (
                (keysPressed.current['KeyK'] || keysPressed.current['Numpad1']) &&
                p2.action !== 'punching' &&
                p2.action !== 'kicking'
              ) {
                p2.action = 'punching';
                p2.actionTimer = 14;
                stickmanAudio.playPunch();
              }

              if (
                (keysPressed.current['KeyL'] || keysPressed.current['Numpad2']) &&
                p2.action !== 'punching' &&
                p2.action !== 'kicking'
              ) {
                p2.action = 'kicking';
                p2.actionTimer = 18;
                stickmanAudio.playKick();
              }
            }
          }
        } else {
          updateAi(p2, p1);
        }

        // Temporizadores de acción (puño, patada, bloqueo y recuperación ágil de golpes)
        if (p1.actionTimer > 0) {
          p1.actionTimer--;
          if (p1.actionTimer === 0 && p1.action !== 'ko') {
            p1.action = p1.isGrounded ? 'idle' : 'jumping';
            p1.isBlocking = false;
          }
        }

        if (p2.actionTimer > 0) {
          p2.actionTimer--;
          if (p2.actionTimer === 0 && p2.action !== 'ko') {
            p2.action = p2.isGrounded ? 'idle' : 'jumping';
            p2.isBlocking = false;
          }
        }

        if (p1.hurtCooldown > 0) p1.hurtCooldown--;
        if (p2.hurtCooldown > 0) p2.hurtCooldown--;

        // Aplicar gravedad y límites
        [p1, p2].forEach((p) => {
          p.vy += GRAVITY;
          p.x += p.vx;
          p.y += p.vy;

          if (p.y >= FLOOR_Y) {
            p.y = FLOOR_Y;
            p.vy = 0;
            p.isGrounded = true;
          } else {
            p.isGrounded = false;
          }

          platforms.forEach((plat) => {
            if (
              p.vy >= 0 &&
              p.x >= plat.x - 15 &&
              p.x <= plat.x + plat.width + 15 &&
              p.y >= plat.y &&
              p.y - p.vy <= plat.y + 12
            ) {
              p.y = plat.y;
              p.vy = 0;
              p.isGrounded = true;
            }
          });

          if (p.x < 45) p.x = 45;
          if (p.x > CANVAS_WIDTH - 45) p.x = CANVAS_WIDTH - 45;

          if (Math.abs(p.vx) > 0.5 && p.isGrounded) {
            p.runCycle = (p.runCycle + 0.25) % (Math.PI * 2);
          } else {
            p.runCycle = 0;
          }
        });

        // 2. DETECCIÓN DE GOLPES (Hitboxes precisas y consistentes)
        const checkHit = (attacker: Fighter, defender: Fighter) => {
          if (defender.hurtCooldown > 0 || defender.action === 'ko') return;

          const isAttacking = attacker.action === 'punching' || attacker.action === 'kicking';
          if (!isAttacking) return;

          // Verificar que el atacante mire hacia el defensor
          const isFacingDefender = (defender.x - attacker.x) * attacker.facing > 0;
          const distX = Math.abs(defender.x - attacker.x);
          const distY = Math.abs(defender.y - attacker.y);
          const maxDistX = attacker.action === 'kicking' ? 78 : 64;

          if (isFacingDefender && distX < maxDistX && distY < 60) {
            const isHeavy = attacker.action === 'kicking';
            let damage = isHeavy ? 16 : 10;
            let knockback = isHeavy ? 8 : 5;

            const hitX = (attacker.x + defender.x) / 2;
            const hitY = defender.y - 45;

            const isDefenderFacingAttacker = (defender.x - attacker.x) * defender.facing < 0;
            if (defender.isBlocking && isDefenderFacingAttacker) {
              damage = Math.max(2, Math.floor(damage * 0.25));
              knockback = 1.5;
              stickmanAudio.playBlock();
              spawnHitParticles(hitX, hitY, '#70A1FF', false);
            } else {
              if (isHeavy) {
                stickmanAudio.playKick();
                screenShakeRef.current = 8;
              } else {
                stickmanAudio.playPunch();
                screenShakeRef.current = 4;
              }
              spawnHitParticles(hitX, hitY, attacker.color, isHeavy);
              defender.action = 'hurt';
              defender.actionTimer = 8;
            }

            defender.hp = Math.max(0, defender.hp - damage);
            defender.hurtCooldown = 14;
            defender.vx = attacker.facing * knockback;
            defender.vy = -3;

            if (defender.hp <= 0) {
              defender.action = 'ko';
              stickmanAudio.playKO();
              screenShakeRef.current = 14;

              setMatchState('round_end');
              attacker.roundsWon++;

              const winnerName = attacker === p1 ? p1.name : p2.name;
              setRoundWinner(winnerName);

              if (attacker.roundsWon >= 2) {
                setMatchWinner(winnerName);
                stickmanAudio.playRoundWin();
                try {
                  confetti({
                    particleCount: 100,
                    spread: 90,
                    origin: { y: 0.6 },
                  });
                } catch {
                  // Ignorar
                }
              }
            }
          }
        };

        checkHit(p1, p2);
        checkHit(p2, p1);
      }

      // Suavizar barras de vida y actualizar el HUD del DOM en cada frame a 60 FPS
      p1.displayHp += (p1.hp - p1.displayHp) * 0.18;
      p2.displayHp += (p2.hp - p2.displayHp) * 0.18;

      if (p1HpBarRef.current) {
        p1HpBarRef.current.style.width = `${Math.max(0, p1.displayHp)}%`;
      }
      if (p2HpBarRef.current) {
        p2HpBarRef.current.style.width = `${Math.max(0, p2.displayHp)}%`;
      }
      if (p1HpTextRef.current) {
        p1HpTextRef.current.textContent = `${Math.max(0, Math.ceil(p1.hp))}%`;
      }
      if (p2HpTextRef.current) {
        p2HpTextRef.current.textContent = `${Math.max(0, Math.ceil(p2.hp))}%`;
      }

      // 3. RENDERIZADO EN CANVAS
      ctx.save();

      if (screenShakeRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(shakeX, shakeY);
        screenShakeRef.current *= 0.85;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      // Fondo
      const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGrad.addColorStop(0, '#101426');
      bgGrad.addColorStop(0.7, '#1E253F');
      bgGrad.addColorStop(1, '#0C0F1D');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < CANVAS_WIDTH; i += 60) {
        ctx.fillRect(i, 80, 40, 160);
      }

      // Suelo
      const floorGrad = ctx.createLinearGradient(0, FLOOR_Y, 0, CANVAS_HEIGHT);
      floorGrad.addColorStop(0, '#2F3652');
      floorGrad.addColorStop(0.1, '#1A1E30');
      floorGrad.addColorStop(1, '#0D101C');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y);

      ctx.strokeStyle = '#4E5A80';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR_Y);
      ctx.lineTo(CANVAS_WIDTH, FLOOR_Y);
      ctx.stroke();

      // Plataformas
      platforms.forEach((plat) => {
        ctx.fillStyle = '#262D47';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

        ctx.strokeStyle = '#536494';
        ctx.lineWidth = 2;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

        ctx.fillStyle = '#7086C2';
        ctx.fillRect(plat.x, plat.y, plat.width, 3);
      });

      // Partículas
      particlesRef.current.forEach((part, index) => {
        part.x += part.vx;
        part.y += part.vy;
        part.vy += 0.2;
        part.life++;
        part.alpha = Math.max(0, 1 - part.life / part.maxLife);

        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;

        if (part.type === 'star') {
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(part.x, part.y, part.size, part.size);
        }
        ctx.restore();

        if (part.life >= part.maxLife) {
          particlesRef.current.splice(index, 1);
        }
      });

      // Textos Cómicos
      comicTextsRef.current.forEach((item, index) => {
        item.y -= 1.2;
        item.life++;
        item.alpha = Math.max(0, 1 - item.life / 25);

        ctx.save();
        ctx.globalAlpha = item.alpha;
        ctx.font = `bold ${Math.round(20 * item.scale)}px "Impact", sans-serif`;
        ctx.fillStyle = item.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(item.text, item.x, item.y);
        ctx.fillText(item.text, item.x, item.y);
        ctx.restore();

        if (item.life >= 25) {
          comicTextsRef.current.splice(index, 1);
        }
      });

      // Dibujar Stickman
      const drawStickman = (p: Fighter) => {
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.action === 'ko') {
          ctx.rotate((p.facing * Math.PI) / 2.3);
        }

        ctx.strokeStyle = p.color;
        ctx.fillStyle = p.color;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (p.isGrounded && p.action !== 'ko') {
          ctx.save();
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.beginPath();
          ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        const headRadius = 15;
        const headY = -72;

        ctx.beginPath();
        ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(p.facing * 5, headY - 1, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#101426';
        ctx.beginPath();
        ctx.arc(p.facing * 6, headY - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, headY - 3, headRadius + 1, -0.6, 0.6);
        ctx.stroke();

        const neckY = headY + headRadius;
        const hipY = -35;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, neckY);
        ctx.lineTo(0, hipY);
        ctx.stroke();

        const legCycle = Math.sin(p.runCycle);
        let leftFootX = -12;
        let leftFootY = 0;
        let rightFootX = 12;
        let rightFootY = 0;

        if (p.action === 'kicking') {
          leftFootX = -p.facing * 10;
          leftFootY = 0;
          rightFootX = p.facing * 44;
          rightFootY = p.isGrounded ? -25 : -40;
        } else if (p.action === 'jumping') {
          leftFootX = -10;
          leftFootY = -12;
          rightFootX = 10;
          rightFootY = -8;
        } else if (p.action === 'running') {
          leftFootX = legCycle * 20;
          leftFootY = Math.abs(legCycle) * -8;
          rightFootX = -legCycle * 20;
          rightFootY = Math.abs(-legCycle) * -8;
        }

        ctx.beginPath();
        ctx.moveTo(0, hipY);
        ctx.lineTo(leftFootX * 0.5, hipY + 18);
        ctx.lineTo(leftFootX, leftFootY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, hipY);
        ctx.lineTo(rightFootX * 0.5, hipY + 18);
        ctx.lineTo(rightFootX, rightFootY);
        ctx.stroke();

        const shoulderY = neckY + 8;
        let handLX = -p.facing * 14;
        let handLY = shoulderY + 18;
        let handRX = p.facing * 16;
        let handRY = shoulderY + 14;

        if (p.action === 'punching') {
          handRX = p.facing * 42;
          handRY = shoulderY + 4;
          handLX = -p.facing * 8;
          handLY = shoulderY + 12;
        } else if (p.action === 'blocking') {
          handRX = p.facing * 12;
          handRY = shoulderY + 4;
          handLX = p.facing * 16;
          handLY = shoulderY + 10;

          ctx.save();
          ctx.strokeStyle = '#70A1FF';
          ctx.fillStyle = 'rgba(112, 161, 255, 0.2)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(p.facing * 20, shoulderY + 8, 26, -Math.PI / 2, Math.PI / 2, p.facing < 0);
          ctx.stroke();
          ctx.fill();
          ctx.restore();
        } else if (p.action === 'kicking') {
          handLX = -p.facing * 22;
          handLY = shoulderY - 8;
          handRX = p.facing * 12;
          handRY = shoulderY + 8;
        }

        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(handLX * 0.6, shoulderY + 10);
        ctx.lineTo(handLX, handLY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(handRX * 0.6, shoulderY + 8);
        ctx.lineTo(handRX, handRY);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(handRX, handRY, 5, 0, Math.PI * 2);
        ctx.arc(handLX, handLY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Barra de vida flotante sobre la cabeza del stickman
        if (p.action !== 'ko') {
          const barW = 34;
          const barH = 4;
          const barX = -barW / 2;
          const barY = headY - 16;

          ctx.save();
          ctx.fillStyle = 'rgba(10, 14, 26, 0.75)';
          ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

          const hpRatio = Math.max(0, p.hp) / p.maxHp;
          ctx.fillStyle = p.color;
          ctx.fillRect(barX, barY, barW * hpRatio, barH);
          ctx.restore();
        }

        ctx.restore();
      };

      drawStickman(p1);
      drawStickman(p2);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [matchState, gameMode, FLOOR_Y]);

  // Controles en pantalla táctil/ratón para pruebas o dispositivos móviles
  const triggerP1Action = (action: 'left' | 'right' | 'jump' | 'punch' | 'kick' | 'block') => {
    if (matchState !== 'playing') return;
    const p1 = p1Ref.current;

    if (action === 'left') {
      p1.vx = -6;
      p1.facing = -1;
    } else if (action === 'right') {
      p1.vx = 6;
      p1.facing = 1;
    } else if (action === 'jump' && p1.isGrounded) {
      p1.vy = -16;
      p1.isGrounded = false;
      p1.action = 'jumping';
      stickmanAudio.playJump();
    } else if (action === 'punch' && p1.action !== 'punching' && p1.action !== 'kicking') {
      p1.action = 'punching';
      p1.actionTimer = 14;
      stickmanAudio.playPunch();
    } else if (action === 'kick' && p1.action !== 'punching' && p1.action !== 'kicking') {
      p1.action = 'kicking';
      p1.actionTimer = 18;
      stickmanAudio.playKick();
    } else if (action === 'block' && p1.isGrounded) {
      p1.isBlocking = true;
      p1.action = 'blocking';
      p1.actionTimer = 20;
    }
  };

  const toggleSound = () => {
    const muted = stickmanAudio.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div
      style={{
        maxWidth: 820,
        margin: '0 auto',
        padding: '12px 14px 24px',
        fontFamily: 'var(--font-sans, system-ui)',
      }}
    >
      {/* Barra Superior de Control y Modos */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-card)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-color)',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00D2FF, #FF4757)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            🥊
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Stickman Brawl
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ¡Duelo arcade para 2 amigos en el mismo teclado!
            </p>
          </div>
        </div>

        {/* Selector de Modo y Sonido */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-full)',
              padding: 3,
              border: '1px solid var(--border-color)',
            }}
          >
            <button
              onClick={() => {
                setGameMode('2p');
                resetMatch();
              }}
              style={{
                border: 'none',
                background: gameMode === '2p' ? 'var(--bg-card)' : 'transparent',
                color: gameMode === '2p' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: gameMode === '2p' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              <UserCheck size={14} /> 2 Jugadores
            </button>
            <button
              onClick={() => {
                setGameMode('vs_cpu');
                resetMatch();
              }}
              style={{
                border: 'none',
                background: gameMode === 'vs_cpu' ? 'var(--bg-card)' : 'transparent',
                color: gameMode === 'vs_cpu' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: gameMode === 'vs_cpu' ? 'var(--shadow-xs)' : 'none',
              }}
            >
              <Bot size={14} /> vs Bot CPU
            </button>
          </div>

          <button
            className="btn-icon-subtle"
            onClick={toggleSound}
            title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
            }}
          >
            {isMuted ? <VolumeX size={17} color="var(--text-muted)" /> : <Volume2 size={17} color="var(--primary)" />}
          </button>

          <button
            className="btn-icon-subtle"
            onClick={resetMatch}
            title="Reiniciar combate"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={17} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Marcador Superior (HUD de Vida y Rondas) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0B0F19',
          padding: '12px 18px',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          border: '1px solid #1E253F',
          borderBottom: 'none',
          color: '#FFFFFF',
          gap: 12,
        }}
      >
        {/* Jugador 1 (Azul) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#00D2FF', display: 'flex', alignItems: 'center', gap: 6 }}>
              🔵 {p1Ref.current.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span ref={p1HpTextRef} style={{ fontSize: '0.78rem', fontWeight: 800, color: '#00D2FF' }}>
                100%
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1].map((r) => (
                  <span
                    key={r}
                    style={{
                      fontSize: '0.85rem',
                      opacity: p1Ref.current.roundsWon > r ? 1 : 0.25,
                      color: '#FFD700',
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              height: 14,
              background: '#1F2438',
              borderRadius: 7,
              overflow: 'hidden',
              border: '1.5px solid #00D2FF',
            }}
          >
            <div
              ref={p1HpBarRef}
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #00D2FF, #0099FF)',
              }}
            />
          </div>
        </div>

        {/* Centro: Ronda */}
        <div style={{ textAlign: 'center', padding: '0 8px', minWidth: 90 }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              background: '#1E253F',
              color: '#FFD700',
              padding: '3px 8px',
              borderRadius: 12,
              letterSpacing: 1,
            }}
          >
            RONDA {roundNumber}
          </span>
        </div>

        {/* Jugador 2 (Rojo) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1].map((r) => (
                  <span
                    key={r}
                    style={{
                      fontSize: '0.85rem',
                      opacity: p2Ref.current.roundsWon > r ? 1 : 0.25,
                      color: '#FFD700',
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <span ref={p2HpTextRef} style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FF4757' }}>
                100%
              </span>
            </div>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#FF4757', display: 'flex', alignItems: 'center', gap: 6 }}>
              {gameMode === 'vs_cpu' ? '🤖 Bot CPU' : '🔴 ' + p2Ref.current.name}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: 14,
              background: '#1F2438',
              borderRadius: 7,
              overflow: 'hidden',
              border: '1.5px solid #FF4757',
              direction: 'rtl',
            }}
          >
            <div
              ref={p2HpBarRef}
              style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #FF4757, #FF6B81)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Contenedor del Canvas de Combate con Overlays */}
      <div style={{ position: 'relative', width: '100%', background: '#0C0F1D', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            aspectRatio: '16/9',
          }}
        />

        {/* Overlay de Cuenta Atrás */}
        {matchState === 'ready' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(11, 15, 25, 0.65)',
              backdropFilter: 'blur(2px)',
              color: '#FFFFFF',
              zIndex: 10,
            }}
          >
            <h2 style={{ fontSize: '1.4rem', color: '#FFD700', margin: 0, textTransform: 'uppercase', letterSpacing: 2 }}>
              ¡Ronda {roundNumber}!
            </h2>
            <div
              style={{
                fontSize: '4.5rem',
                fontWeight: 900,
                color: countdown === 0 ? '#00D2FF' : '#FF4757',
                textShadow: '0 4px 16px rgba(0,0,0,0.6)',
              }}
            >
              {countdown === 0 ? '¡A PELEAR!' : countdown}
            </div>
          </div>
        )}

        {/* Overlay de Fin de Ronda (K.O.) */}
        {matchState === 'round_end' && !matchWinner && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(11, 15, 25, 0.75)',
              backdropFilter: 'blur(3px)',
              color: '#FFFFFF',
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: '4rem', fontWeight: 900, color: '#FF4757', textShadow: '0 4px 20px rgba(255,71,87,0.7)' }}>
              ¡K.O.!
            </div>
            <h3 style={{ fontSize: '1.3rem', margin: '8px 0 20px', color: '#FFD700' }}>
              Ronda para {roundWinner} 🏆
            </h3>
            <button
              className="btn-primary"
              onClick={() => resetRound(roundNumber + 1)}
              style={{
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              Siguiente Ronda ➔
            </button>
          </div>
        )}

        {/* Overlay de Fin de Combate / Victoria Final */}
        {matchWinner && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(11, 15, 25, 0.85)',
              backdropFilter: 'blur(4px)',
              color: '#FFFFFF',
              zIndex: 20,
              textAlign: 'center',
              padding: 20,
            }}
          >
            <div style={{ fontSize: '3.5rem', marginBottom: 6 }}>👑</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFD700', margin: 0 }}>
              ¡VICTORIA TOTAL!
            </h2>
            <p style={{ fontSize: '1.15rem', color: '#E2E8F0', marginTop: 6, marginBottom: 24 }}>
              ¡{matchWinner} ha ganado el combate! 🎉
            </p>
            <button
              className="btn-primary"
              onClick={resetMatch}
              style={{
                padding: '12px 28px',
                fontSize: '1.05rem',
                fontWeight: 800,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <RotateCcw size={18} /> ¡Jugar Revancha!
            </button>
          </div>
        )}
      </div>

      {/* Controles en Pantalla para Touch/Tablet */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setShowControls(!showControls)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
          }}
        >
          {showControls ? 'Ocultar guía de teclas ⌨️' : 'Ver guía de teclas ⌨️'}
        </button>

        {/* Botones virtuales rápidos para P1 */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onPointerDown={() => triggerP1Action('punch')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #00D2FF',
              background: 'rgba(0, 210, 255, 0.1)',
              color: '#00D2FF',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🥊 Puño (F)
          </button>
          <button
            onPointerDown={() => triggerP1Action('kick')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #00D2FF',
              background: 'rgba(0, 210, 255, 0.1)',
              color: '#00D2FF',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🦶 Patada (G)
          </button>
          <button
            onPointerDown={() => triggerP1Action('block')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid #00D2FF',
              background: 'rgba(0, 210, 255, 0.1)',
              color: '#00D2FF',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            🛡️ Bloqueo (S)
          </button>
        </div>
      </div>

      {/* Tarjeta de Guía de Controles */}
      {showControls && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 12,
            marginTop: 12,
          }}
        >
          {/* Controles Jugador 1 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(0, 210, 255, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              borderLeft: '4px solid #00D2FF',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#0099FF', fontWeight: 800 }}>
              🔵 Jugador 1 (Azul)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div><strong>A / D:</strong> Moverse ◄ ►</div>
              <div><strong>W:</strong> Saltar ▲</div>
              <div><strong>S:</strong> Cubrirse / Bloqueo 🛡️</div>
              <div><strong>F:</strong> Puñetazo 🥊</div>
              <div><strong>G:</strong> Patada voladora 🦶</div>
            </div>
          </div>

          {/* Controles Jugador 2 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255, 71, 87, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              borderLeft: '4px solid #FF4757',
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#FF4757', fontWeight: 800 }}>
              {gameMode === 'vs_cpu' ? '🤖 Bot CPU (Automático)' : '🔴 Jugador 2 (Rojo)'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <div><strong>Flechas ◄ ►:</strong> Moverse</div>
              <div><strong>Flecha ▲:</strong> Saltar</div>
              <div><strong>Flecha ▼:</strong> Cubrirse / Bloqueo 🛡️</div>
              <div><strong>K / Num 1:</strong> Puñetazo 🥊</div>
              <div><strong>L / Num 2:</strong> Patada voladora 🦶</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
