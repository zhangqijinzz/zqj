import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X, Home, RotateCcw, Zap } from 'lucide-react';
import type { HitResult } from '../types';
import { useAppStore } from '../store';
import { WaveformVisualizer } from '../components';
import { triggerVibration } from '../utils/vibration';
import { cn } from '../lib/utils';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface HitEffect {
  id: number;
  lane: number;
  type: 'perfect' | 'great' | 'good' | 'miss';
  time: number;
}

const LANE_KEYS = ['d', 'f', 'j', 'k'] as const;
const LANE_COLORS = ['#00F5FF', '#A855F7', '#FF6B35', '#FF00E5'];
const PERFECT_WINDOW = 50;
const GREAT_WINDOW = 100;
const GOOD_WINDOW = 150;
const MISS_WINDOW = 200;
const FALL_DURATION = 2000;
const LANE_COUNT = 4;

export default function GamePlayPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const hitEffectsRef = useRef<HitEffect[]>([]);
  const activeNotesRef = useRef<Set<number>>(new Set());
  const particleIdRef = useRef(0);
  const hitEffectIdRef = useRef(0);
  const keyPressedRef = useRef<boolean[]>([false, false, false, false]);

  const currentLevel = useAppStore((state) => state.currentLevel);
  const levels = useAppStore((state) => state.levels);
  const gameState = useAppStore((state) => state.gameState);
  const startGame = useAppStore((state) => state.startGame);
  const pauseGame = useAppStore((state) => state.pauseGame);
  const resumeGame = useAppStore((state) => state.resumeGame);
  const endGame = useAppStore((state) => state.endGame);
  const updateGameTime = useAppStore((state) => state.updateGameTime);
  const registerHit = useAppStore((state) => state.registerHit);
  const resetGameState = useAppStore((state) => state.resetGameState);

  const level = useMemo(() => currentLevel || levels[0], [currentLevel, levels]);
  const totalDuration = useMemo(() => level?.visualChart.totalDuration || 60000, [level]);
  const notes = useMemo(() => level?.visualChart.notes || [], [level]);

  const [isPaused, setIsPaused] = useState(false);
  const [showReady, setShowReady] = useState(true);
  const [lastHit, setLastHit] = useState<HitResult['type'] | null>(null);
  const [screenFlash, setScreenFlash] = useState<{ color: string; intensity: number } | null>(null);
  const [comboMilestone, setComboMilestone] = useState<number | null>(null);

  const createParticles = useCallback((x: number, y: number, color: string, count: number = 20) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 4,
      });
    }
    particlesRef.current = [...particlesRef.current, ...newParticles];
  }, []);

  const addHitEffect = useCallback((lane: number, type: HitResult['type']) => {
    hitEffectsRef.current.push({
      id: hitEffectIdRef.current++,
      lane,
      type,
      time: performance.now(),
    });
    setLastHit(type);
    setTimeout(() => setLastHit(null), 300);
  }, []);

  const judgeHit = useCallback((lane: number, currentTime: number): HitResult | null => {
    const laneNotes = notes.filter(
      (note, index) =>
        note.lane === lane &&
        !activeNotesRef.current.has(index) &&
        Math.abs(note.time - currentTime) < MISS_WINDOW
    );

    if (laneNotes.length === 0) return null;

    const noteIndex = notes.indexOf(laneNotes[0]);
    const note = laneNotes[0];
    const timeDiff = Math.abs(note.time - currentTime);

    activeNotesRef.current.add(noteIndex);

    let result: HitResult;
    if (timeDiff <= PERFECT_WINDOW) {
      result = { type: 'perfect', score: 300 };
    } else if (timeDiff <= GREAT_WINDOW) {
      result = { type: 'great', score: 200 };
    } else if (timeDiff <= GOOD_WINDOW) {
      result = { type: 'good', score: 100 };
    } else {
      result = { type: 'miss', score: 0 };
    }

    return result;
  }, [notes]);

  const handleKeyPress = useCallback((lane: number) => {
    if (isPaused || showReady) return;

    const currentTime = performance.now() - startTimeRef.current - pausedTimeRef.current;
    const result = judgeHit(lane, currentTime);

    if (result) {
      const prevCombo = gameState.combo;
      registerHit(result);
      addHitEffect(lane, result.type);

      const vibrationPatterns: Record<HitResult['type'], number[]> = {
        perfect: [80, 20, 80, 20, 80],
        great: [60, 20, 60],
        good: [40, 30, 40],
        miss: [100, 50, 100],
      };
      triggerVibration(vibrationPatterns[result.type]);

      const flashColors: Record<HitResult['type'], string> = {
        perfect: '#FF00E5',
        great: '#00F5FF',
        good: '#39FF14',
        miss: '#FF6B35',
      };
      const flashIntensity: Record<HitResult['type'], number> = {
        perfect: 0.4,
        great: 0.25,
        good: 0.15,
        miss: 0.3,
      };
      setScreenFlash({ color: flashColors[result.type], intensity: flashIntensity[result.type] });
      setTimeout(() => setScreenFlash(null), 100);

      const canvas = canvasRef.current;
      if (canvas) {
        const laneWidth = canvas.offsetWidth / LANE_COUNT;
        const hitY = canvas.offsetHeight * 0.85;
        const hitX = laneWidth * lane + laneWidth / 2;
        const baseCount = result.type === 'perfect' ? 40 : result.type === 'great' ? 25 : 12;

        createParticles(hitX, hitY, LANE_COLORS[lane], baseCount);

        if (result.type === 'perfect') {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              createParticles(hitX + (Math.random() - 0.5) * 40, hitY + (Math.random() - 0.5) * 40, LANE_COLORS[lane], 10);
            }, i * 50);
          }
        }
      }

      const newCombo = prevCombo + 1;
      if (newCombo > 0 && newCombo % 50 === 0 && result.type !== 'miss') {
        setComboMilestone(newCombo);
        triggerVibration([100, 50, 100, 50, 100, 50, 100]);
        setTimeout(() => setComboMilestone(null), 1500);
      }
    } else {
      triggerVibration([30, 20, 30]);
    }
  }, [isPaused, showReady, judgeHit, registerHit, addHitEffect, createParticles, gameState.combo]);

  const startGameLoop = useCallback(() => {
    startTimeRef.current = performance.now();
    pausedTimeRef.current = 0;
    setShowReady(false);
    resetGameState();
    startGame();
  }, [resetGameState, startGame]);

  const togglePause = useCallback(() => {
    if (showReady) return;

    if (isPaused) {
      pausedTimeRef.current += performance.now() - (startTimeRef.current + pausedTimeRef.current + (gameState.currentTime || 0));
      resumeGame();
      setIsPaused(false);
    } else {
      pauseGame();
      setIsPaused(true);
    }
  }, [isPaused, showReady, pauseGame, resumeGame, gameState.currentTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const laneIndex = LANE_KEYS.indexOf(e.key.toLowerCase() as typeof LANE_KEYS[number]);
      if (laneIndex !== -1 && !keyPressedRef.current[laneIndex]) {
        keyPressedRef.current[laneIndex] = true;
        handleKeyPress(laneIndex);
      }
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const laneIndex = LANE_KEYS.indexOf(e.key.toLowerCase() as typeof LANE_KEYS[number]);
      if (laneIndex !== -1) {
        keyPressedRef.current[laneIndex] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyPress, togglePause]);

  const handleRestart = useCallback(() => {
    setIsPaused(false);
    activeNotesRef.current.clear();
    particlesRef.current = [];
    hitEffectsRef.current = [];
    startGameLoop();
  }, [startGameLoop]);

  const handleExit = useCallback(() => {
    endGame();
    navigate('/game');
  }, [endGame, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showReady) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      if (!isPaused) {
        const currentTime = performance.now() - startTimeRef.current - pausedTimeRef.current;
        updateGameTime(currentTime);

        if (currentTime >= totalDuration) {
          endGame();
          navigate('/game/result');
          return;
        }

        notes.forEach((note, index) => {
          if (
            !activeNotesRef.current.has(index) &&
            currentTime - note.time > MISS_WINDOW
          ) {
            activeNotesRef.current.add(index);
            registerHit({ type: 'miss', score: 0 });
            addHitEffect(note.lane, 'miss');
          }
        });
      }

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const laneWidth = w / LANE_COUNT;
      const hitY = h * 0.85;
      const currentTime = gameState.currentTime;
      const combo = gameState.combo;

      ctx.clearRect(0, 0, w, h);

      const bgPulse = Math.sin(currentTime / 500) * 0.02 + 0.03;
      const bgGradient = ctx.createRadialGradient(w / 2, hitY, 0, w / 2, hitY, w * 0.8);
      bgGradient.addColorStop(0, `rgba(0, 245, 255, ${bgPulse * 3})`);
      bgGradient.addColorStop(0.5, `rgba(168, 85, 247, ${bgPulse * 2})`);
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < LANE_COUNT; i++) {
        const x = i * laneWidth;
        const gradient = ctx.createLinearGradient(x, 0, x, h);
        const lanePulse = Math.sin(currentTime / 400 + i * 0.8) * 0.01 + 0.02;
        gradient.addColorStop(0, 'rgba(0, 245, 255, 0.02)');
        gradient.addColorStop(1, `${LANE_COLORS[i]}${Math.floor(lanePulse * 255).toString(16).padStart(2, '0')}`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, 0, laneWidth, h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      const linePulse = Math.sin(currentTime / 150) * 0.3 + 0.7;
      const lineGlow = combo > 20 ? 15 + Math.min(combo * 0.5, 30) : 15;
      ctx.strokeStyle = `rgba(0, 245, 255, ${linePulse})`;
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00F5FF';
      ctx.shadowBlur = lineGlow;
      ctx.beginPath();
      ctx.moveTo(0, hitY);
      ctx.lineTo(w, hitY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      for (let i = 0; i < LANE_COUNT; i++) {
        const x = i * laneWidth;
        const isPressed = keyPressedRef.current[i];
        ctx.fillStyle = isPressed ? `${LANE_COLORS[i]}40` : `${LANE_COLORS[i]}10`;
        ctx.fillRect(x + 4, hitY, laneWidth - 8, h - hitY - 4);

        if (isPressed) {
          ctx.strokeStyle = LANE_COLORS[i];
          ctx.lineWidth = 2;
          ctx.shadowColor = LANE_COLORS[i];
          ctx.shadowBlur = 20;
          ctx.strokeRect(x + 4, hitY, laneWidth - 8, h - hitY - 4);
          ctx.shadowBlur = 0;
        }
      }

      notes.forEach((note, index) => {
        if (activeNotesRef.current.has(index)) return;

        const noteProgress = (currentTime - note.time) / FALL_DURATION;
        const noteY = hitY - noteProgress * hitY;

        if (noteY < -50 || noteY > h + 50) return;

        const x = note.lane * laneWidth;
        const noteWidth = laneWidth * 0.7;
        const noteX = x + (laneWidth - noteWidth) / 2;
        const noteHeight = note.type === 'hold' && note.duration ? (note.duration / FALL_DURATION) * hitY : 20;

        const gradient = ctx.createLinearGradient(noteX, noteY - noteHeight, noteX, noteY);
        gradient.addColorStop(0, `${note.color}00`);
        gradient.addColorStop(0.5, note.color);
        gradient.addColorStop(1, note.color);

        ctx.fillStyle = gradient;
        ctx.shadowColor = note.color;
        ctx.shadowBlur = 20;

        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(noteX + radius, noteY - noteHeight);
        ctx.lineTo(noteX + noteWidth - radius, noteY - noteHeight);
        ctx.quadraticCurveTo(noteX + noteWidth, noteY - noteHeight, noteX + noteWidth, noteY - noteHeight + radius);
        ctx.lineTo(noteX + noteWidth, noteY - radius);
        ctx.quadraticCurveTo(noteX + noteWidth, noteY, noteX + noteWidth - radius, noteY);
        ctx.lineTo(noteX + radius, noteY);
        ctx.quadraticCurveTo(noteX, noteY, noteX, noteY - radius);
        ctx.lineTo(noteX, noteY - noteHeight + radius);
        ctx.quadraticCurveTo(noteX, noteY - noteHeight, noteX + radius, noteY - noteHeight);
        ctx.fill();

        ctx.shadowBlur = 0;
      });

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.02;

        if (p.life <= 0) return false;

        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        return true;
      });

      hitEffectsRef.current = hitEffectsRef.current.filter((effect) => {
        const elapsed = performance.now() - effect.time;
        if (elapsed > 500) return false;

        const progress = elapsed / 500;
        const x = effect.lane * laneWidth + laneWidth / 2;
        const alpha = 1 - progress;
        const scale = 1 + progress * 0.5;

        let color: string;
        switch (effect.type) {
          case 'perfect':
            color = '#FF00E5';
            break;
          case 'great':
            color = '#00F5FF';
            break;
          case 'good':
            color = '#39FF14';
            break;
          default:
            color = '#FF6B35';
        }

        ctx.globalAlpha = alpha;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, hitY, 40 * scale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        return true;
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showReady, isPaused, notes, gameState.currentTime, totalDuration, registerHit, addHitEffect, endGame, navigate, updateGameTime]);

  const progress = Math.min((gameState.currentTime / totalDuration) * 100, 100);

  return (
    <div className="fixed inset-0 bg-ocean-dark overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="relative z-10 h-full flex">
        <div className="flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 bg-deep-ocean/80 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-moon-dim font-display">SCORE</p>
                <p className="font-display text-2xl font-bold text-neon-cyan">
                  {Math.floor(gameState.score).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-moon-dim font-display">COMBO</p>
                <p className={cn(
                  'font-display text-2xl font-bold transition-all',
                  gameState.combo > 0 ? 'text-vibrant-orange scale-110' : 'text-moon-white'
                )}>
                  {gameState.combo}
                </p>
              </div>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-moon-dim font-display">
                  {level?.title}
                </span>
                <span className="text-xs text-moon-dim font-display">
                  {Math.floor(progress)}%
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-cyan via-electric-purple to-vibrant-orange"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={togglePause}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-moon-white hover:border-neon-cyan hover:text-neon-cyan transition-all"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExit}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-moon-white hover:border-neon-pink hover:text-neon-pink transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <div className="flex-1 relative">
            <canvas ref={canvasRef} className="w-full h-full" />

            <AnimatePresence>
              {screenFlash && (
                <motion.div
                  key="screen-flash"
                  initial={{ opacity: screenFlash.intensity }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="absolute inset-0 pointer-events-none"
                  style={{ backgroundColor: screenFlash.color }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {comboMilestone && (
                <motion.div
                  key={`combo-${comboMilestone}`}
                  initial={{ opacity: 0, scale: 0.3, y: 50 }}
                  animate={{ opacity: 1, scale: 1.2, y: 0 }}
                  exit={{ opacity: 0, scale: 2, y: -50 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                >
                  <div className="text-center">
                    <p className="font-display text-7xl font-bold text-neon-pink drop-shadow-[0_0_30px_#FF00E5]">
                      {comboMilestone} COMBO!
                    </p>
                    <p className="font-display text-2xl text-neon-cyan mt-2 drop-shadow-[0_0_10px_#00F5FF]">
                      精彩继续！
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {lastHit && (
                <motion.div
                  key={lastHit}
                  initial={{ opacity: 0, scale: 0.5, y: 0 }}
                  animate={{ opacity: 1, scale: 1.2, y: -30 }}
                  exit={{ opacity: 0, scale: 1.5, y: -60 }}
                  className={cn(
                    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-6xl font-bold pointer-events-none',
                    lastHit === 'perfect' && 'text-neon-pink drop-shadow-[0_0_20px_#FF00E5]',
                    lastHit === 'great' && 'text-neon-cyan drop-shadow-[0_0_20px_#00F5FF]',
                    lastHit === 'good' && 'text-neon-green drop-shadow-[0_0_20px_#39FF14]',
                    lastHit === 'miss' && 'text-vibrant-orange drop-shadow-[0_0_20px_#FF6B35]'
                  )}
                >
                  {lastHit.toUpperCase()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-4 gap-2 p-3 bg-deep-ocean/80 backdrop-blur-md border-t border-white/10">
            {LANE_KEYS.map((key, index) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onMouseDown={() => handleKeyPress(index)}
                onTouchStart={(e) => { e.preventDefault(); handleKeyPress(index); }}
                className={cn(
                  'py-4 rounded-xl font-display text-xl font-bold transition-all border-2',
                  keyPressedRef.current[index]
                    ? 'bg-opacity-30 scale-95'
                    : 'bg-opacity-10 hover:bg-opacity-20'
                )}
                style={{
                  backgroundColor: `${LANE_COLORS[index]}20`,
                  borderColor: LANE_COLORS[index],
                  color: LANE_COLORS[index],
                  boxShadow: keyPressedRef.current[index] ? `0 0 30px ${LANE_COLORS[index]}` : `0 0 10px ${LANE_COLORS[index]}40`,
                }}
              >
                {key.toUpperCase()}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="w-48 bg-deep-ocean/80 backdrop-blur-md border-l border-white/10 p-4 flex flex-col">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-vibrant-orange" />
              <span className="font-display text-sm text-moon-white">震动波形</span>
            </div>
            <WaveformVisualizer
              sequence={level?.vibrationPattern}
              isPlaying={gameState.isPlaying && !isPaused}
              currentTime={gameState.currentTime}
              height={200}
              barCount={24}
              color="#FF6B35"
            />
          </div>

          <div className="space-y-3 flex-1">
            <div className="glass-card p-3">
              <p className="text-xs text-moon-dim mb-1">最大连击</p>
              <p className="font-display text-xl font-bold text-neon-cyan">{gameState.maxCombo}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card p-2 text-center">
                <p className="text-[10px] text-moon-dim">Perfect</p>
                <p className="font-display font-bold text-neon-pink">{gameState.hitCount.perfect}</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-[10px] text-moon-dim">Great</p>
                <p className="font-display font-bold text-neon-cyan">{gameState.hitCount.great}</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-[10px] text-moon-dim">Good</p>
                <p className="font-display font-bold text-neon-green">{gameState.hitCount.good}</p>
              </div>
              <div className="glass-card p-2 text-center">
                <p className="text-[10px] text-moon-dim">Miss</p>
                <p className="font-display font-bold text-vibrant-orange">{gameState.hitCount.miss}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ocean-dark/95 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <img
                  src={level?.coverImage}
                  alt={level?.title}
                  className="w-48 h-48 mx-auto rounded-2xl object-cover shadow-neon-purple"
                />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl font-bold text-gradient mb-2"
              >
                {level?.title}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-moon-dim mb-8"
              >
                {level?.song.artist} · {level?.song.bpm} BPM
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-4 mb-8"
              >
                <div className="flex gap-4">
                  {LANE_KEYS.map((key, i) => (
                    <div
                      key={key}
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl font-bold"
                      style={{
                        backgroundColor: `${LANE_COLORS[i]}20`,
                        borderColor: LANE_COLORS[i],
                        border: `2px solid ${LANE_COLORS[i]}`,
                        color: LANE_COLORS[i],
                      }}
                    >
                      {key.toUpperCase()}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-moon-dim">使用 D / F / J / K 键或点击下方按键</p>
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExit}
                  className="btn-neon-purple flex items-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  返回
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGameLoop}
                  className="btn-primary flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  开始游戏
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaused && !showReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ocean-dark/90 backdrop-blur-md flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-8 text-center max-w-md"
            >
              <Pause className="w-16 h-16 mx-auto mb-4 text-neon-cyan" />
              <h2 className="font-display text-3xl font-bold text-moon-white mb-2">游戏暂停</h2>
              <p className="text-moon-dim mb-8">休息一下，准备好了继续</p>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={togglePause}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  继续游戏
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRestart}
                  className="btn-neon-orange flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  重新开始
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExit}
                  className="btn-neon-purple flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  返回选曲
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
