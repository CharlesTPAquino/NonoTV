import { useCallback, useRef, useEffect } from 'react';

const SOUND_EFFECTS = {
  intro: '/sounds/intro.mp3',
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
};

class SoundGenerator {
  constructor() {
    this.audioContext = null;
  }

  getContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  playTransition() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.3);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.5);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.5);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (err) {
      console.warn('[SoundGenerator] Erro:', err.message);
    }
  }

  playSuccess() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.25);
      gain.gain.linearRampToValueAtTime(0, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (err) {
      console.warn('[SoundGenerator] Erro:', err.message);
    }
  }

  playClick() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (err) {
      console.warn('[SoundGenerator] Erro:', err.message);
    }
  }

  playError() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(150, now + 0.3);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (err) {
      console.warn('[SoundGenerator] Erro:', err.message);
    }
  }

  playIntro() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);
      filter.frequency.exponentialRampToValueAtTime(2000, now + 1.5);
      filter.frequency.exponentialRampToValueAtTime(400, now + 3);

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(440, now + 0.5);
      osc1.frequency.exponentialRampToValueAtTime(220, now + 1.5);
      osc1.frequency.exponentialRampToValueAtTime(330, now + 2.5);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(220, now + 0.2);
      osc2.frequency.exponentialRampToValueAtTime(880, now + 0.8);
      osc2.frequency.exponentialRampToValueAtTime(440, now + 2);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(55, now + 1);
      osc3.frequency.setValueAtTime(55, now + 2.5);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.08, now + 1.5);
      gain.gain.linearRampToValueAtTime(0.06, now + 2.5);
      gain.gain.linearRampToValueAtTime(0, now + 3.5);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + 3.5);
      osc2.stop(now + 3.5);
      osc3.stop(now + 3.5);
    } catch (err) {
      console.warn('[SoundGenerator] Erro:', err.message);
    }
  }
}

const soundGenerator = new SoundGenerator();

export function useSound() {
  const playSound = useCallback((key, options = {}) => {
    switch (key) {
      case 'intro':
        soundGenerator.playIntro();
        break;
      case 'transition':
        soundGenerator.playTransition();
        break;
      case 'success':
        soundGenerator.playSuccess();
        break;
      case 'click':
        soundGenerator.playClick();
        break;
      case 'error':
        soundGenerator.playError();
        break;
      default:
        break;
    }
  }, []);

  return { playSound };
}

export default useSound;