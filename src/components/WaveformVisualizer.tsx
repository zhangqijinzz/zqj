import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { VibrationSequence } from '../types';

interface WaveformVisualizerProps {
  sequence?: VibrationSequence;
  isPlaying?: boolean;
  currentTime?: number;
  height?: number;
  barCount?: number;
  color?: string;
}

export const WaveformVisualizer = ({
  sequence,
  isPlaying = false,
  currentTime = 0,
  height = 80,
  barCount = 64,
  color = '#00F5FF',
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const bars = sequence
      ? Array.from({ length: barCount }, (_, i) => {
          const progress = i / barCount;
          const time = progress * (sequence.totalDuration || 60000);
          const nearbyBeat = sequence.beats.find(
            (b) => Math.abs(b.time - time) < (sequence.totalDuration / barCount) * 1.5
          );
          return nearbyBeat ? nearbyBeat.intensity : 0.1 + Math.random() * 0.2;
        })
      : Array.from({ length: barCount }, () => 0.3 + Math.random() * 0.5);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = height;
      const barWidth = w / barCount;
      const gap = 2;

      ctx.clearRect(0, 0, w, h);

      bars.forEach((intensity, i) => {
        const x = i * barWidth;
        let barHeight: number;

        if (isPlaying || !sequence) {
          phaseRef.current += 0.02;
          const wave = Math.sin(phaseRef.current + i * 0.15) * 0.3 + 0.7;
          barHeight = h * intensity * wave * (isPlaying ? 1 : 0.6);
        } else {
          const noteProgress = currentTime / (sequence?.totalDuration || 1);
          const barProgress = i / barCount;
          const isPast = barProgress <= noteProgress;
          barHeight = h * intensity * (isPast ? 1 : 0.3);
        }

        const y = (h - barHeight) / 2;

        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        if (sequence && currentTime / sequence.totalDuration > i / barCount) {
          gradient.addColorStop(0, '#A855F7');
          gradient.addColorStop(1, '#FF6B35');
        } else {
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, `${color}60`);
        }

        ctx.fillStyle = gradient;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
      });

      ctx.shadowBlur = 0;

      if (sequence) {
        const progressX = (currentTime / sequence.totalDuration) * w;
        ctx.fillStyle = '#FF00E5';
        ctx.shadowColor = '#FF00E5';
        ctx.shadowBlur = 10;
        ctx.fillRect(progressX - 1, 0, 2, h);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [sequence, isPlaying, currentTime, height, barCount, color]);

  return (
    <motion.div
      initial={{ opacity: 0, scaleY: 0.5 }}
      animate={{ opacity: 1, scaleY: 1 }}
      className="w-full rounded-xl overflow-hidden"
      style={{ height }}
    >
      <canvas ref={canvasRef} className="w-full h-full" style={{ height }} />
    </motion.div>
  );
};
