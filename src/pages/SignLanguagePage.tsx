import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic, PlayCircle, Star, Music } from 'lucide-react';
import { useAppStore } from '../store';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { triggerVibration } from '../utils/vibration';
import type { Genre, Difficulty, Level } from '../types';
import { cn } from '../lib/utils';

const genreLabels: Record<Genre | 'all', string> = {
  all: '全部',
  electronic: '电子',
  classical: '古典',
  rock: '摇滚',
  pop: '流行',
  jazz: '爵士',
  hiphop: '嘻哈',
};

const difficultyOptions: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: '全部难度' },
  { value: 'easy', label: '简单' },
  { value: 'normal', label: '普通' },
  { value: 'hard', label: '困难' },
  { value: 'expert', label: '专家' },
];

const mockRatings: Record<string, number> = {
  'level-001': 4.8,
  'level-002': 4.6,
  'level-003': 4.9,
  'level-004': 4.5,
  'level-005': 4.7,
};

export default function SignLanguagePage() {
  const levels = useAppStore((state) => state.levels);
  const setCurrentLevel = useAppStore((state) => state.setCurrentLevel);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');

  const filteredLevels = useMemo(() => {
    return levels.filter((level) => {
      const matchesSearch =
        level.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        level.song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || level.genre === selectedGenre;
      const matchesDifficulty = selectedDifficulty === 'all' || level.difficulty === selectedDifficulty;
      return matchesSearch && matchesGenre && matchesDifficulty;
    });
  }, [levels, searchQuery, selectedGenre, selectedDifficulty]);

  const handleLearn = (level: Level) => {
    triggerVibration(30);
    setCurrentLevel(level);
  };

  const handleRecord = (level: Level) => {
    triggerVibration([20, 50, 20]);
    setCurrentLevel(level);
  };

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            🎵 手语歌曲库
          </h1>
          <p className="text-moon-dim">用双手感受音乐的律动，学习手语演绎每一首歌曲</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 space-y-5"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-moon-dim" />
            <input
              type="text"
              placeholder="搜索歌曲或艺术家..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-moon-white placeholder-moon-dim focus:outline-none focus:border-neon-cyan/50 focus:shadow-neon-cyan transition-all"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm text-moon-dim font-medium">音乐风格</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(genreLabels) as (Genre | 'all')[]).map((genre) => (
                <motion.button
                  key={genre}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedGenre(genre);
                    triggerVibration(15);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-xl font-display text-sm transition-all duration-300',
                    selectedGenre === genre
                      ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan shadow-neon-cyan'
                      : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10 hover:text-moon-white'
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    {genreLabels[genre]}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-moon-dim font-medium">难度筛选</div>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedDifficulty(option.value);
                    triggerVibration(15);
                  }}
                  className={cn(
                    'px-4 py-2 rounded-xl font-display text-sm transition-all duration-300',
                    selectedDifficulty === option.value
                      ? 'bg-electric-purple/20 border border-electric-purple/50 text-electric-purple shadow-neon-purple'
                      : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10 hover:text-moon-white'
                  )}
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mb-4 text-moon-dim">
          共找到 <span className="text-neon-cyan font-bold">{filteredLevels.length}</span> 首歌曲
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLevels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="group glass-card overflow-hidden"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={level.coverImage}
                  alt={level.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-ocean via-deep-ocean/30 to-transparent" />

                <div className="absolute top-3 left-3">
                  <DifficultyBadge difficulty={level.difficulty} size="sm" />
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
                  <Star className="w-3.5 h-3.5 fill-vibrant-orange text-vibrant-orange" />
                  <span className="text-sm font-display font-bold text-moon-white">
                    {mockRatings[level.id] || 4.5}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display font-bold text-xl text-moon-white">
                    {level.title}
                  </h3>
                  <p className="text-sm text-moon-dim mt-0.5">{level.song.artist}</p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between text-xs text-moon-dim">
                  <span>BPM: {level.song.bpm}</span>
                  <span>时长: {Math.floor(level.song.duration / 60)}:{String(level.song.duration % 60).padStart(2, '0')}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLearn(level)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan font-display font-semibold rounded-xl hover:bg-neon-cyan/20 hover:shadow-neon-cyan transition-all duration-300"
                  >
                    <PlayCircle className="w-5 h-5" />
                    学习
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleRecord(level)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-neon-pink/10 border border-neon-pink/50 text-neon-pink font-display font-semibold rounded-xl hover:bg-neon-pink/20 hover:shadow-neon-purple transition-all duration-300"
                  >
                    <Mic className="w-5 h-5" />
                    录制
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredLevels.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Music className="w-16 h-16 text-moon-dim mx-auto mb-4" />
            <p className="text-moon-dim text-lg">没有找到匹配的歌曲</p>
            <p className="text-moon-dim/60 text-sm mt-2">试试调整筛选条件</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
