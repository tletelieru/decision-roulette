import confetti from 'canvas-confetti';

let audio: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  audio ??= new AudioContext();
  if (audio.state === 'suspended') void audio.resume();
  return audio;
}

function tone(frequency: number, delay: number, length: number, volume: number) {
  const ctx = context();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + length);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + length);
}

export const playTick = () => tone(1500, 0, 0.03, 0.04);

export function playWin() {
  tone(660, 0, 0.14, 0.08);
  tone(880, 0.1, 0.14, 0.08);
  tone(1320, 0.2, 0.28, 0.08);
}

export const vibrate = (pattern: number | number[]) => navigator.vibrate?.(pattern);

export function burstConfetti() {
  void confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, disableForReducedMotion: true });
}

export const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
