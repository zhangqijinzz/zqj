import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Home, RotateCcw, Trophy, Target, Zap, Star } from 'lucide-react';
import type { Rank } from '../types';
import { useAppStore } from '../store';
import { WaveformVisualizer } from '../components';
import { triggerVibration } from '../utils/vibration';
import { cn } from '../lib/utils';

const rankConfig: Record<Rank, { label: string; className: string; glowClass: string }> = {
  S: {
    label: 'S',
    className: 'text-neon-pink',
    glowClass: 'drop-shadow-[0_0_60px_#FF00E5]',
  },
  A: {
    label: 'A',
    className: 'text-neon-cyan',
    glowClass: 'drop-shadow-[0_0_60px_#00F5FF]',
  },
  B: {
    label: 'B',
    className: 'text-electric-purple',
    glowClass: 'drop-shadow-[0_0_60px_#A855F7]',
  },
  C: {
    label: 'C',
    className: 'text-vibrant-orange',
    glowClass: 'drop-shadow-[0_0_60px_#FF6B35]',
  },
  D: {
    label: 'D',
    className: 'text-moon-dim',
    glowClass: '',
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function GameResultPage() {
  const navigate = useNavigate();
  const currentLevel = useAppStore((state) => state.currentLevel);
  const levels = useAppStore((state) => state.levels);
  const gameState = useAppStore((state) => state.gameState);
  const setCurrentLevel = useAppStore((state) => state.setCurrentLevel);
  const resetGameState = useAppStore((state) => state.resetGameState);

  const level = currentLevel || levels[0];

  const { accuracy, rank, totalNotes } = useMemo(() => {
    const { perfect, great, good, miss } = gameState.hitCount;
    const total = perfect + great + good + miss;
    const weightedScore = perfect * 100 + great * 80 + good * 50;
    const maxScore = total * 100;
    const acc = total > 0 ? (weightedScore / maxScore) * 100 : 0;

    let r: Rank = 'D';
    if (acc >= 95) r = 'S';
    else if (acc >= 90) r = 'A';
    else if (acc >= 80) r = 'B';
    else if (acc >= 70) r = 'C';

    return { accuracy: acc, rank: r, totalNotes: total };
  }, [gameState.hitCount]);

  const handleRetry = () => {
    triggerVibration(30);
    resetGameState();
    navigate('/game/play');
  };

  const handleBackToLanding = () => {
    triggerVibration(20);
    setCurrentLevel(null);
    resetGameState();
    navigate('/game');
  };

  const rankInfo = rankConfig[rank];

  return (
    <div className="min-h-screen pb-20">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.3 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-vibrant-orange to-neon-pink shadow-neon-orange"
          >
            <Trophy className="w-10 h-10 text-ocean-dark" />
          </motion.div>
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="text-gradient">游戏结算</span>
          </h1>
          <p className="text-moon-dim">
            {level?.title} · {level?.song.artist}
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-8">
          <div className="glass-card p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.6, delay: 0.5 }}
                  className={cn(
                    'font-display font-black text-9xl mb-2',
                    rankInfo.className,
                    rankInfo.glowClass
                  )}
                >
                  {rankInfo.label}
                </motion.div>
                <div className="flex items-center justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-6 h-6 transition-all',
                        i < (rank === 'S' ? 5 : rank === 'A' ? 4 : rank === 'B' ? 3 : rank === 'C' ? 2 : 1)
                          ? 'text-vibrant-orange fill-vibrant-orange'
                          : 'text-moon-dim/30'
                      )}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <span className="text-moon-dim">最终分数</span>
                  </div>
                  <span className="font-display text-3xl font-bold text-neon-cyan">
                    {Math.floor(gameState.score).toLocaleString()}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-vibrant-orange/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-vibrant-orange" />
                    </div>
                    <span className="text-moon-dim">最大连击</span>
                  </div>
                  <span className="font-display text-3xl font-bold text-vibrant-orange">
                    {gameState.maxCombo}
                  </span>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-electric-purple/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-electric-purple" />
                    </div>
                    <span className="text-moon-dim">准确率</span>
                  </div>
                  <span className="font-display text-3xl font-bold text-electric-purple">
                    {accuracy.toFixed(1)}%
                  </span>
                </motion.div>
              </div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="space-y-3"
              >
                <h3 className="font-display font-semibold text-moon-white text-center mb-4">判定统计</h3>
                {[
                  { key: 'perfect', label: 'Perfect', count: gameState.hitCount.perfect, color: 'neon-pink', bg: 'bg-neon-pink/20', text: 'text-neon-pink' },
                  { key: 'great', label: 'Great', count: gameState.hitCount.great, color: 'neon-cyan', bg: 'bg-neon-cyan/20', text: 'text-neon-cyan' },
                  { key: 'good', label: 'Good', count: gameState.hitCount.good, color: 'neon-green', bg: 'bg-neon-green/20', text: 'text-neon-green' },
                  { key: 'miss', label: 'Miss', count: gameState.hitCount.miss, color: 'vibrant-orange', bg: 'bg-vibrant-orange/20', text: 'text-vibrant-orange' },
                ].map((item, index) => {
                  const percentage = totalNotes > 0 ? (item.count / totalNotes) * 100 : 0;
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', item.bg.replace('/20', ''))} />
                          <span className="text-moon-dim">{item.label}</span>
                        </div>
                        <span className={cn('font-display font-bold', item.text)}>
                          {item.count} <span className="text-moon-dim/50">({percentage.toFixed(0)}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 1 + index * 0.1 }}
                          className={cn('h-full rounded-full', item.bg.replace('/20', ''))}
                          style={{
                            boxShadow: `0 0 10px var(--tw-shadow-color)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-vibrant-orange" />
              <h3 className="font-display font-semibold text-moon-white">震动波形复盘</h3>
            </div>
            <WaveformVisualizer
              sequence={level?.vibrationPattern}
              isPlaying={false}
              currentTime={level?.vibrationPattern.totalDuration || 0}
              height={120}
              barCount={80}
              color="#FF6B35"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-md mx-auto">
          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRetry}
              className="btn-primary flex items-center justify-center gap-2 py-4"
            >
              <Play className="w-5 h-5" />
              再玩一次
            </motion.button>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRetry}
                className="btn-neon-orange flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                重新挑战
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBackToLanding}
                className="btn-neon-purple flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                返回选曲
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
