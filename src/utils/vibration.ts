import type { VibrationSequence, VibrationBeat } from '../types';

export const triggerVibration = (pattern: number | number[]): void => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.warn('Vibration not supported:', e);
    }
  }
};

export const stopVibration = (): void => {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch (e) {
      console.warn('Vibration not supported:', e);
    }
  }
};

export const playVibrationSequence = (
  sequence: VibrationSequence,
  intensity: number = 1.0,
  onBeat?: (beat: VibrationBeat) => void
): () => void => {
  const timeouts: number[] = [];
  const startTime = performance.now();

  sequence.beats.forEach((beat) => {
    const timeout = window.setTimeout(() => {
      const adjustedDuration = beat.duration * intensity;
      const adjustedIntensity = beat.intensity * intensity;

      if (adjustedIntensity > 0.3) {
        triggerVibration(Math.floor(adjustedDuration));
      }

      onBeat?.(beat);
    }, beat.time);

    timeouts.push(timeout);
  });

  return () => {
    timeouts.forEach((t) => clearTimeout(t));
    stopVibration();
  };
};

export const beatToVibrationPattern = (beat: VibrationBeat, intensity: number = 1.0): number[] => {
  const duration = Math.floor(beat.duration * intensity);
  const gap = Math.floor(50 * intensity);

  switch (beat.waveform) {
    case 'square':
      return [duration, gap, duration, gap, duration];
    case 'sawtooth':
      return [Math.floor(duration * 0.3), gap, Math.floor(duration * 0.6), gap, duration];
    case 'sine':
    default:
      return [duration];
  }
};
