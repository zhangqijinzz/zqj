import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  Hand,
  ArrowLeft,
  Volume2,
  Eye,
} from 'lucide-react';
import { useAppStore } from '../store';
import { triggerVibration } from '../utils/vibration';
import { cn } from '../lib/utils';

const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function SignLanguageLearnPage() {
  const currentLevel = useAppStore((state) => state.currentLevel);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showActionBreakdown, setShowActionBreakdown] = useState(true);
  const timerRef = useRef<number>();

  const lyrics = useMemo(() => {
    if (!currentLevel) return [];
    return currentLevel.song.lyrics.split('\n').filter(Boolean).map((line, index) => ({
      id: index,
      text: line,
      startTime: index * 8000,
      endTime: (index + 1) * 8000,
      actions: [
        { name: '双手抬起', icon: '👐', duration: '2s' },
        { name: '右手画弧', icon: '✋', duration: '1.5s' },
        { name: '胸前交叉', icon: '🙏', duration: '1.5s' },
        { name: '向外展开', icon: '🤲', duration: '2s' },
        { name: '手指轻点', icon: '👆', duration: '1s' },
      ].slice(0, Math.min(5, (index % 3) + 3)),
    }));
  }, [currentLevel]);

  const totalDuration = currentLevel ? currentLevel.song.duration * 1000 : 0;

  const currentLyricIndex = useMemo(() => {
    return lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    );
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (isPlaying) {
      const interval = 100 / speed;
      timerRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return prev + 100;
        });
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalDuration]);

  const togglePlay = () => {
    triggerVibration(20);
    setIsPlaying(!isPlaying);
  };

  const handlePrevLine = () => {
    triggerVibration(15);
    if (currentLyricIndex > 0) {
      setCurrentTime(lyrics[currentLyricIndex - 1].startTime);
    } else {
      setCurrentTime(0);
    }
  };

  const handleNextLine = () => {
    triggerVibration(15);
    if (currentLyricIndex < lyrics.length - 1) {
      setCurrentTime(lyrics[currentLyricIndex + 1].startTime);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    triggerVibration(15);
    setSpeed(newSpeed);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(percent * totalDuration);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (!currentLevel) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <Hand className="w-16 h-16 text-moon-dim mx-auto mb-4" />
          <p className="text-moon-dim text-lg">请先从歌曲库选择一首歌曲</p>
        </div>
      </div>
    );
  }

  const currentLyric = lyrics[currentLyricIndex] || lyrics[0];

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-moon-dim hover:text-neon-cyan hover:border-neon-cyan/50 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">
              {currentLevel.title}
            </h1>
            <p className="text-sm text-moon-dim">{currentLevel.song.artist}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-deep-ocean via-electric-purple/20 to-neon-cyan/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentLyricIndex}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="text-center"
                    >
                      <motion.div
                        animate={isPlaying ? {
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0],
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-9xl mb-6"
                      >
                        🧑‍🎤
                      </motion.div>
                      <div className="flex justify-center gap-8">
                        {['👐', '✋', '🤚', '🖐️'].map((emoji, i) => (
                          <motion.span
                            key={i}
                            animate={isPlaying ? {
                              y: [0, -15, 0],
                              rotate: [0, 10, -10, 0],
                            } : {}}
                            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                            className="text-5xl"
                          >
                            {emoji}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="absolute inset-0 pointer-events-none">
                  {isPlaying && Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 2] }}
                      transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                      className="absolute w-32 h-32 rounded-full border-2 border-neon-cyan/30"
                      style={{
                        left: `${20 + (i % 4) * 20}%`,
                        top: `${20 + Math.floor(i / 4) * 40}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                  <Volume2 className="w-4 h-4 text-neon-cyan" />
                  <span className="text-sm text-neon-cyan font-display">手语演示</span>
                </div>

                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                  <span className="text-sm text-moon-white font-display">
                    {speed}x 速度
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <div
                className="relative h-2 rounded-full bg-white/10 cursor-pointer group"
                onClick={handleProgressClick}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-neon-cyan via-electric-purple to-vibrant-orange"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-moon-white shadow-neon-cyan"
                  style={{ left: `calc(${(currentTime / totalDuration) * 100}% - 8px)` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-moon-dim font-mono">{formatTime(currentTime)}</span>
                <span className="text-sm text-moon-dim font-mono">{formatTime(totalDuration)}</span>
              </div>

              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrevLine}
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-moon-dim hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="p-5 rounded-full bg-gradient-to-br from-neon-cyan via-electric-purple to-vibrant-orange text-ocean-dark shadow-neon-purple hover:shadow-neon-cyan transition-all"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNextLine}
                  className="p-3 rounded-full bg-white/5 border border-white/10 text-moon-dim hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Gauge className="w-4 h-4 text-moon-dim" />
                {speedOptions.map((s) => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSpeedChange(s)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-display transition-all',
                      speed === s
                        ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan'
                        : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10'
                    )}
                  >
                    {s}x
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-moon-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-neon-cyan" />
                  歌词提示
                </h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {lyrics.map((line, index) => (
                  <motion.div
                    key={line.id}
                    animate={index === currentLyricIndex ? {
                      backgroundColor: 'rgba(0, 245, 255, 0.1)',
                      borderColor: 'rgba(0, 245, 255, 0.5)',
                    } : {}}
                    className={cn(
                      'p-3 rounded-xl border transition-all duration-300',
                      index === currentLyricIndex
                        ? 'border-neon-cyan/50 bg-neon-cyan/10'
                        : 'border-white/5 bg-white/[0.02]'
                    )}
                  >
                    <p
                      className={cn(
                        'font-display transition-colors',
                        index === currentLyricIndex
                          ? 'text-neon-cyan text-lg font-semibold'
                          : index < currentLyricIndex
                          ? 'text-moon-dim/50'
                          : 'text-moon-dim'
                      )}
                    >
                      {line.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowActionBreakdown(!showActionBreakdown)}
              className="w-full glass-card p-4 flex items-center justify-between"
            >
              <span className="font-display font-bold text-moon-white flex items-center gap-2">
                <Hand className="w-5 h-5 text-electric-purple" />
                动作分解
              </span>
              <motion.span
                animate={{ rotate: showActionBreakdown ? 180 : 0 }}
                className="text-moon-dim"
              >
                ▼
              </motion.span>
            </motion.button>

            <AnimatePresence>
              {showActionBreakdown && currentLyric && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card p-5 overflow-hidden"
                >
                  <h4 className="text-sm text-moon-dim mb-4">当前句子动作分解：</h4>
                  <div className="space-y-3">
                    {currentLyric.actions.map((action, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                      >
                        <motion.div
                          animate={isPlaying ? {
                            scale: [1, 1.2, 1],
                          } : {}}
                          transition={{ duration: 1, delay: index * 0.2, repeat: Infinity }}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-purple/30 to-neon-cyan/30 flex items-center justify-center text-2xl"
                        >
                          {action.icon}
                        </motion.div>
                        <div className="flex-1">
                          <p className="font-display font-semibold text-moon-white">
                            {action.name}
                          </p>
                          <p className="text-xs text-moon-dim">持续 {action.duration}</p>
                        </div>
                        <span className="text-xs font-display text-neon-cyan px-2 py-1 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
                          步骤 {index + 1}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
