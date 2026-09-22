/**
 * Motor de Audio Retro Chiptune para Tetris Kids
 * Basado puramente en Web Audio API (cero dependencias externas, cero errores de red o CORS).
 * Incluye el tema legendario Korobeiniki (Type A) y efectos de sonido para las acciones.
 */

// Notas musicales con frecuencias precisas en Hertz (Hz)
const NOTE_FREQS: Record<string, number> = {
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  G3s: 207.65,
  A3: 220.00,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  G4s: 415.30,
  A4: 440.00,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  G5s: 830.61,
  A5: 880.00,
  B5: 987.77,
  C6: 1046.50,
  REST: 0,
};

// Melodía principal de Korobeiniki (Nota, Duración en semicorcheas/unidades)
// Unidad base = ~0.115s (130 BPM)
interface MelodyStep {
  note: string;
  duration: number; // En múltiplos de unidad
  bass?: string;
}

const KOROBEINIKI_THEME: MelodyStep[] = [
  // Frase 1
  { note: 'E5', duration: 4, bass: 'E3' },
  { note: 'B4', duration: 2, bass: 'B2' },
  { note: 'C5', duration: 2, bass: 'E3' },
  { note: 'D5', duration: 4, bass: 'B2' },
  { note: 'C5', duration: 2, bass: 'D3' },
  { note: 'B4', duration: 2, bass: 'A2' },
  { note: 'A4', duration: 4, bass: 'A2' },
  { note: 'A4', duration: 2, bass: 'E3' },
  { note: 'C5', duration: 2, bass: 'A2' },
  { note: 'E5', duration: 4, bass: 'E3' },
  { note: 'D5', duration: 2, bass: 'B2' },
  { note: 'C5', duration: 2, bass: 'E3' },
  { note: 'B4', duration: 6, bass: 'E3' },
  { note: 'C5', duration: 2, bass: 'B2' },
  { note: 'D5', duration: 4, bass: 'E3' },
  { note: 'E5', duration: 4, bass: 'B2' },
  { note: 'C5', duration: 4, bass: 'A2' },
  { note: 'A4', duration: 4, bass: 'E3' },
  { note: 'A4', duration: 6, bass: 'A2' },
  { note: 'REST', duration: 2, bass: 'REST' },

  // Frase 2 (Segunda mitad ascendente)
  { note: 'D5', duration: 4, bass: 'D3' },
  { note: 'F5', duration: 2, bass: 'A2' },
  { note: 'A5', duration: 4, bass: 'D3' },
  { note: 'G5', duration: 2, bass: 'A2' },
  { note: 'F5', duration: 2, bass: 'D3' },
  { note: 'E5', duration: 6, bass: 'C3' },
  { note: 'C5', duration: 2, bass: 'G3' },
  { note: 'E5', duration: 4, bass: 'C3' },
  { note: 'D5', duration: 2, bass: 'G3' },
  { note: 'C5', duration: 2, bass: 'C3' },
  { note: 'B4', duration: 4, bass: 'E3' },
  { note: 'B4', duration: 2, bass: 'B2' },
  { note: 'C5', duration: 2, bass: 'E3' },
  { note: 'D5', duration: 4, bass: 'E3' },
  { note: 'E5', duration: 4, bass: 'B2' },
  { note: 'C5', duration: 4, bass: 'A2' },
  { note: 'A4', duration: 4, bass: 'E3' },
  { note: 'A4', duration: 6, bass: 'A2' },
  { note: 'REST', duration: 2, bass: 'REST' },
];

class TetrisAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private currentStepIndex: number = 0;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  constructor() {
    try {
      const saved = localStorage.getItem('epify_tetris_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {
      // Ignorar en entornos sin localStorage
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music gain (suave para no molestar al jugar)
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // SFX gain (un poco más presente para feedback táctil)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('epify_tetris_muted', String(this.isMuted));
    } catch {
      // Ignorar
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Inicia la música de fondo de Tetris en bucle suave
   */
  public startMusic() {
    this.initContext();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.currentStepIndex = 0;

    const unitDuration = 0.115; // Segundos por unidad (semicorchea ~130bpm)

    const scheduleNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

      const step = KOROBEINIKI_THEME[this.currentStepIndex];
      const durationSec = step.duration * unitDuration;
      const startTime = this.ctx.currentTime + 0.01;

      // Reproducir nota melódica (onda cuadrada suave con filtro)
      if (step.note !== 'REST' && NOTE_FREQS[step.note]) {
        this.playVoice(NOTE_FREQS[step.note], startTime, durationSec * 0.88, 'triangle', 0.22);
      }

      // Reproducir nota de bajo si existe
      if (step.bass && step.bass !== 'REST' && NOTE_FREQS[step.bass]) {
        this.playVoice(NOTE_FREQS[step.bass], startTime, durationSec * 0.9, 'sine', 0.25);
      }

      this.currentStepIndex = (this.currentStepIndex + 1) % KOROBEINIKI_THEME.length;

      // Programar siguiente paso
      this.musicInterval = setTimeout(scheduleNextNote, durationSec * 1000);
    };

    scheduleNextNote();
  }

  public pauseMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public resumeMusic() {
    if (!this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public stopMusic() {
    this.pauseMusic();
    this.currentStepIndex = 0;
  }

  /**
   * Genera un tono sintetizado con envolvente de volumen ADSR suave
   */
  private playVoice(
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'triangle',
    volume = 0.2
  ) {
    if (!this.ctx || !this.musicGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Envolvente rápida para evitar clics de audio
      const attack = 0.012;
      const release = 0.03;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + attack);
      gain.gain.setValueAtTime(volume, startTime + Math.max(attack, duration - release));
      gain.gain.linearRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // AudioContext desconectado o bloqueado
    }
  }

  // ===================== EFECTOS DE SONIDO (SFX) =====================

  /**
   * SFX: Giro de pieza (bip agudo corto y placentero)
   */
  public playRotate() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * SFX: Movimiento lateral suave
   */
  public playMove() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  /**
   * SFX: Caída rápida (Hard Drop) con golpe seco e impacto satisfactorio
   */
  public playHardDrop() {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;

      // Sonido de barrido y choque (impacto)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  /**
   * SFX: Línea completada (arpegio de campanita alegre)
   */
  public playLineClear(linesCount = 1) {
    this.initContext();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const notes = linesCount >= 4 ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 783.99, 987.77];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const t = now + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.19);
      });
    } catch {}
  }

  /**
   * SFX: Game Over (melodía cómica descendente retro)
   */
  public playGameOver() {
    this.pauseMusic();
    this.initContext();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [392, 369.99, 349.23, 311.13];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const t = now + idx * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch {}
  }
}

// Exportar una única instancia para todo el ciclo de vida del juego
export const tetrisAudio = new TetrisAudioEngine();
