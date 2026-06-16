import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Flame, Clock, Heart, Filter, Sparkles, Tag } from 'lucide-react';
import { useAppStore } from '../store';
import { ChartCard } from '../components/ChartCard';
import { triggerVibration } from '../utils/vibration';
import type { Genre, Difficulty, Chart } from '../types';
import { cn } from '../lib/utils';

type SortType = 'hot' | 'latest' | 'mostLiked';

const sortOptions: { value: SortType; label: string; icon: typeof Flame }[] = [
  { value: 'hot', label: '热门', icon: Flame },
  { value: 'latest', label: '最新', icon: Clock },
  { value: 'mostLiked', label: '收藏最多', icon: Heart },
];

const genreLabels: Record<Genre, string> = {
  electronic: '电子',
  classical: '古典',
  rock: '摇滚',
  pop: '流行',
  jazz: '爵士',
  hiphop: '嘻哈',
};

const difficultyOptions: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'easy', label: '简单' },
  { value: 'normal', label: '普通' },
  { value: 'hard', label: '困难' },
  { value: 'expert', label: '专家' },
];

const allTags = [
  '治愈', '挑战', '快节奏', '慢节奏', '诗意', '赛博朋克',
  '自然', '机械', '梦幻', '硬核', '入门', '极光', '樱花', '闪电',
];

export default function CommunityPage() {
  const charts = useAppStore((state) => state.charts);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('hot');
  const [selectedGenre, setSelectedGenre] = useState<Genre | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    triggerVibration(15);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredCharts = useMemo(() => {
    let result = [...charts];

    if (searchQuery) {
      result = result.filter(
        (chart) =>
          chart.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chart.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chart.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== 'all') {
      result = result.filter((chart) => {
        const level = useAppStore.getState().levels.find((l) => l.id === chart.levelId);
        return level?.genre === selectedGenre;
      });
    }

    if (selectedDifficulty !== 'all') {
      result = result.filter((chart) => chart.difficulty === selectedDifficulty);
    }

    if (selectedTags.length > 0) {
      result = result.filter((chart) =>
        selectedTags.some((tag) => chart.tags.includes(tag))
      );
    }

    switch (sortBy) {
      case 'hot':
        result.sort((a, b) => b.playCount * 2 + b.likes - (a.playCount * 2 + a.likes));
        break;
      case 'latest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'mostLiked':
        result.sort((a, b) => b.likes - a.likes);
        break;
    }

    return result;
  }, [charts, searchQuery, sortBy, selectedGenre, selectedDifficulty, selectedTags]);

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-gradient mb-2 flex items-center gap-3">
            <Sparkles className="w-9 h-9 text-vibrant-orange" />
            谱面社区
          </h1>
          <p className="text-moon-dim">探索玩家自制的创意谱面，分享你的视觉节奏世界</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 space-y-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-moon-dim" />
            <input
              type="text"
              placeholder="搜索谱面、作者或描述..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-moon-white placeholder-moon-dim focus:outline-none focus:border-electric-purple/50 focus:shadow-neon-purple transition-all"
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm text-moon-dim font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              排序方式
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSortBy(option.value);
                      triggerVibration(15);
                    }}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm transition-all duration-300',
                      sortBy === option.value
                        ? 'bg-vibrant-orange/20 border border-vibrant-orange/50 text-vibrant-orange shadow-neon-orange'
                        : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10 hover:text-moon-white'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {option.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-sm text-moon-dim font-medium">音乐风格</div>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedGenre('all');
                    triggerVibration(15);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-display transition-all',
                    selectedGenre === 'all'
                      ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan'
                      : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10'
                  )}
                >
                  全部
                </motion.button>
                {(Object.keys(genreLabels) as Genre[]).map((genre) => (
                  <motion.button
                    key={genre}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedGenre(genre);
                      triggerVibration(15);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-display transition-all',
                      selectedGenre === genre
                        ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan'
                        : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10'
                    )}
                  >
                    {genreLabels[genre]}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-moon-dim font-medium">难度等级</div>
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
                      'px-3 py-1.5 rounded-lg text-xs font-display transition-all',
                      selectedDifficulty === option.value
                        ? 'bg-electric-purple/20 border border-electric-purple/50 text-electric-purple'
                        : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10'
                    )}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-moon-dim font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              标签云
              {selectedTags.length > 0 && (
                <span className="text-xs text-neon-pink">
                  (已选 {selectedTags.length} 个)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const size = isSelected ? 'text-sm' : Math.random() > 0.5 ? 'text-xs' : 'text-sm';
                return (
                  <motion.button
                    key={tag}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full font-display transition-all',
                      size,
                      isSelected
                        ? 'bg-neon-pink/20 border border-neon-pink/50 text-neon-pink shadow-neon-purple'
                        : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10 hover:text-moon-white'
                    )}
                  >
                    #{tag}
                  </motion.button>
                );
              })}
            </div>
            {selectedTags.length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelectedTags([])}
                className="text-xs text-moon-dim hover:text-neon-cyan transition-colors"
              >
                清除全部标签
              </motion.button>
            )}
          </div>
        </motion.div>

        <div className="mb-6 text-moon-dim">
          共找到 <span className="text-electric-purple font-bold">{filteredCharts.length}</span> 个谱面
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredCharts.map((chart: Chart, index: number) => (
            <div key={chart.id} className="break-inside-avoid">
              <ChartCard chart={chart} index={index} />
            </div>
          ))}
        </div>

        {filteredCharts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Sparkles className="w-16 h-16 text-moon-dim mx-auto mb-4" />
            <p className="text-moon-dim text-lg">没有找到匹配的谱面</p>
            <p className="text-moon-dim/60 text-sm mt-2">试试调整筛选条件或搜索关键词</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
