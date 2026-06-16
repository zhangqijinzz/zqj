import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Heart,
  Download,
  User,
  MessageSquare,
  Send,
  ThumbsUp,
  Eye,
  Activity,
  Star,
} from 'lucide-react';
import { useAppStore } from '../store';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { triggerVibration } from '../utils/vibration';
import type { Comment } from '../types';
import { cn } from '../lib/utils';

const mockComments: Comment[] = [
  {
    id: 'comment-001',
    chartId: 'chart-001',
    userId: 'user-010',
    user: {
      id: 'user-010',
      username: '极光追梦人',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dreamer',
      bio: '',
      experience: 5000,
      badges: [],
      settings: { vibrationIntensity: 0.8, brightness: 1, colorTheme: '', sensitivity: 0.5, particleDensity: 1 },
      createdAt: new Date(),
    },
    content: '这个谱面太美了！极光的效果做得非常细腻，配合舒缓的震动节奏，玩的时候真的有一种在看极光的感觉。强烈推荐给喜欢治愈系的玩家！',
    createdAt: new Date('2024-06-15T10:30:00'),
  },
  {
    id: 'comment-002',
    chartId: 'chart-001',
    userId: 'user-011',
    user: {
      id: 'user-011',
      username: '节奏小白',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=newbie',
      bio: '',
      experience: 2000,
      badges: [],
      settings: { vibrationIntensity: 0.8, brightness: 1, colorTheme: '', sensitivity: 0.5, particleDensity: 1 },
      createdAt: new Date(),
    },
    content: '作为入门玩家，这个谱面的难度刚好，不会太简单无聊，也不会太难挫败。视觉效果真的很惊艳！',
    createdAt: new Date('2024-06-14T15:20:00'),
  },
  {
    id: 'comment-003',
    chartId: 'chart-001',
    userId: 'user-012',
    user: {
      id: 'user-012',
      username: '振动大师',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=master',
      bio: '',
      experience: 20000,
      badges: [],
      settings: { vibrationIntensity: 0.8, brightness: 1, colorTheme: '', sensitivity: 0.5, particleDensity: 1 },
      createdAt: new Date(),
    },
    content: '震动序列的设计很有层次感，从弱到强的渐变非常自然。期待作者更多作品！',
    createdAt: new Date('2024-06-13T09:15:00'),
  },
];

export default function ChartDetailPage() {
  const currentChart = useAppStore((state) => state.currentChart);
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const user = useAppStore((state) => state.user);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [isPlaying, setIsPlaying] = useState(false);

  const isFavorite = currentChart ? favorites.includes(currentChart.id) : false;

  const handlePlay = () => {
    triggerVibration([30, 50, 30]);
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleFavorite = () => {
    if (currentChart) {
      triggerVibration(25);
      toggleFavorite(currentChart.id);
    }
  };

  const handleDownload = () => {
    triggerVibration([20, 30, 20]);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() || !user) return;
    triggerVibration(20);
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      chartId: currentChart?.id || '',
      userId: user.id,
      user,
      content: commentText,
      createdAt: new Date(),
    };
    setComments([newComment, ...comments]);
    setCommentText('');
  };

  if (!currentChart) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-16 h-16 text-moon-dim mx-auto mb-4" />
          <p className="text-moon-dim text-lg">请先从社区选择一个谱面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-moon-dim hover:text-neon-cyan hover:border-neon-cyan/50 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-display font-bold text-moon-white">谱面详情</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card overflow-hidden mb-6"
        >
          <div className="relative h-64 sm:h-80">
            <img
              src={currentChart.coverImage}
              alt={currentChart.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-ocean via-deep-ocean/50 to-transparent" />

            <div className="absolute top-4 left-4">
              <DifficultyBadge difficulty={currentChart.difficulty} />
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-gradient mb-2">
                {currentChart.title}
              </h2>
              <div className="flex items-center gap-2 text-moon-dim">
                <img
                  src={currentChart.user.avatar}
                  alt={currentChart.user.username}
                  className="w-6 h-6 rounded-full border border-white/10"
                />
                <span className="hover:text-neon-cyan transition-colors cursor-pointer">
                  {currentChart.user.username}
                </span>
                <span className="mx-2">·</span>
                <span>{new Date(currentChart.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-moon-dim leading-relaxed">{currentChart.description}</p>

            <div className="flex flex-wrap gap-2">
              {currentChart.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full bg-electric-purple/10 text-electric-purple text-sm border border-electric-purple/30"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6 py-4 border-y border-white/5">
              <div className="flex items-center gap-2 text-moon-dim">
                <Eye className="w-5 h-5 text-neon-cyan" />
                <span className="font-display font-bold text-moon-white">{currentChart.playCount}</span>
                <span className="text-sm">游玩次数</span>
              </div>
              <div className="flex items-center gap-2 text-moon-dim">
                <Heart className="w-5 h-5 text-neon-pink" />
                <span className="font-display font-bold text-moon-white">{currentChart.likes}</span>
                <span className="text-sm">点赞数</span>
              </div>
              <div className="flex items-center gap-2 text-moon-dim">
                <Star className="w-5 h-5 text-vibrant-orange fill-vibrant-orange" />
                <span className="font-display font-bold text-moon-white">4.8</span>
                <span className="text-sm">评分</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-moon-dim font-medium">
                <Activity className="w-4 h-4 text-neon-cyan" />
                震动波形预览
              </div>
              <WaveformVisualizer
                sequence={currentChart.vibrationData}
                isPlaying={isPlaying}
                height={100}
                color="#00F5FF"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePlay}
                className="col-span-1 sm:col-span-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-neon-cyan via-electric-purple to-vibrant-orange text-ocean-dark font-display font-bold text-lg rounded-xl hover:shadow-neon-cyan hover:shadow-neon-purple transition-all duration-500"
              >
                <Play className="w-5 h-5 ml-0.5" />
                开始游玩
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleFavorite}
                className={cn(
                  'flex items-center justify-center gap-2 px-6 py-4 font-display font-semibold rounded-xl transition-all duration-300',
                  isFavorite
                    ? 'bg-neon-pink/20 border border-neon-pink/50 text-neon-pink hover:shadow-neon-purple'
                    : 'bg-white/5 border border-white/10 text-moon-dim hover:bg-white/10 hover:text-neon-pink hover:border-neon-pink/50'
                )}
              >
                <Heart className={cn('w-5 h-5', isFavorite && 'fill-neon-pink')} />
                {isFavorite ? '已收藏' : '收藏'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-moon-dim font-display font-semibold rounded-xl hover:bg-white/10 hover:text-neon-cyan hover:border-neon-cyan/50 transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                下载
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-bold text-xl text-moon-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon-cyan" />
            玩家评论
            <span className="text-sm text-moon-dim font-normal">({comments.length})</span>
          </h3>

          {user && (
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-3">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border border-white/10 shrink-0"
                />
                <div className="flex-1 space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="分享你的游玩感受..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-moon-white placeholder-moon-dim resize-none focus:outline-none focus:border-neon-cyan/50 transition-all"
                  />
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim()}
                      className={cn(
                        'flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold transition-all',
                        commentText.trim()
                          ? 'bg-neon-cyan/15 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/25'
                          : 'bg-white/5 border border-white/10 text-moon-dim/50 cursor-not-allowed'
                      )}
                    >
                      <Send className="w-4 h-4" />
                      发表评论
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
              >
                <div className="flex gap-3">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    className="w-10 h-10 rounded-full border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-display font-semibold text-moon-white hover:text-neon-cyan transition-colors cursor-pointer">
                        {comment.user.username}
                      </span>
                      <span className="text-xs text-moon-dim">
                        {new Date(comment.createdAt).toLocaleString('zh-CN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-moon-dim leading-relaxed">{comment.content}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => triggerVibration(10)}
                        className="flex items-center gap-1.5 text-xs text-moon-dim hover:text-neon-pink transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        有帮助
                      </motion.button>
                      <button className="text-xs text-moon-dim hover:text-neon-cyan transition-colors">
                        回复
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
