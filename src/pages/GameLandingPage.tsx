import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles, Filter } from 'lucide-react';
import type { Difficulty, Genre } from '../types';
import { useAppStore } from '../store';
import { LevelCard } from '../components';
import { triggerVibration } from '../utils/vibration';
import { cn } from '../lib/utils';

type DifficultyFilter = 'all' | Difficulty;
type GenreFilter = 'all' | Genre;

const difficultyFilters: { key: DifficultyFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'easy', label: '简单' },
  { key: 'normal', label: '普通' },
  { key: 'hard', label: '困难' },
  { key: 'expert', label: '专家' },
];

const genreFilters: { key: GenreFilter; label: string }[] = [
  { key: 'all', label: '全部风格' },
  { key: 'electronic', label: '电子' },
  { key: 'rock', label: '摇滚' },
  { key: 'pop', label: '流行' },
  { key: 'classical', label: '古典' },
  { key: 'jazz', label: '爵士' },
  { key: 'hiphop', label: '嘻哈' },
];

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

export default function GameLandingPage() {
  const levels = useAppStore((state) => state.levels);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [genreFilter, setGenreFilter] = useState<GenreFilter>('all');

  const filteredLevels = levels.filter((level) => {
    const matchesDifficulty = difficultyFilter === 'all' || level.difficulty === difficultyFilter;
    const matchesGenre = genreFilter === 'all' || level.genre === genreFilter;
    return matchesDifficulty && matchesGenre;
  });

  const handleDifficultyChange = (key: DifficultyFilter) => {
    triggerVibration(20);
    setDifficultyFilter(key);
  };

  const handleGenreChange = (key: GenreFilter) => {
    triggerVibration(20);
    setGenreFilter(key);
  };

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
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-gradient-to-br from-neon-cyan to-electric-purple shadow-neon-cyan"
          >
            <Music className="w-10 h-10 text-ocean-dark" />
          </motion.div>
          <h1 className="font-display text-5xl font-bold mb-3">
            <span className="text-gradient">触觉节拍</span>
          </h1>
          <p className="text-moon-dim text-lg max-w-2xl mx-auto">
            用震动感受节奏，用指尖触碰音符。选择你的关卡，开始一场视听触觉的沉浸式之旅。
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-5 h-5 text-neon-cyan" />
              <span className="font-display font-semibold text-moon-white">难度筛选</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {difficultyFilters.map((filter) => (
                <motion.button
                  key={filter.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDifficultyChange(filter.key)}
                  className={cn(
                    'px-4 py-2 rounded-xl font-display font-semibold text-sm transition-all duration-300 border',
                    difficultyFilter === filter.key
                      ? 'bg-neon-cyan text-ocean-dark border-neon-cyan shadow-neon-cyan'
                      : 'bg-white/5 text-moon-dim border-white/10 hover:border-neon-cyan/50 hover:text-neon-cyan'
                  )}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-8">
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-electric-purple" />
              <span className="font-display font-semibold text-moon-white">音乐风格</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {genreFilters.map((filter) => (
                <motion.button
                  key={filter.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGenreChange(filter.key)}
                  className={cn(
                    'px-4 py-2 rounded-xl font-display font-semibold text-sm transition-all duration-300 border',
                    genreFilter === filter.key
                      ? 'bg-electric-purple text-ocean-dark border-electric-purple shadow-neon-purple'
                      : 'bg-white/5 text-moon-dim border-white/10 hover:border-electric-purple/50 hover:text-electric-purple'
                  )}
                >
                  {filter.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          {filteredLevels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLevels.map((level, index) => (
                <LevelCard key={level.id} level={level} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Music className="w-10 h-10 text-moon-dim" />
              </div>
              <p className="text-moon-dim text-lg">没有找到符合条件的关卡</p>
              <p className="text-moon-dim/60 text-sm mt-2">试试调整筛选条件</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
