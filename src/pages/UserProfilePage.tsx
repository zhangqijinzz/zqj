import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Trophy,
  Flame,
  Zap,
  Star,
  Target,
  Heart,
  Music,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../store';
import { ChartCard } from '../components/ChartCard';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { triggerVibration } from '../utils/vibration';
import type { Difficulty, Chart } from '../types';
import { cn } from '../lib/utils';

type TabType = 'charts' | 'favorites' | 'achievements';

const badgeConfig: Record<string, { icon: typeof Award; color: string; bgColor: string }> = {
  '新手创作者': { icon: Sparkles, color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/15 border-neon-cyan/40' },
  '连击大师': { icon: Zap, color: 'text-vibrant-orange', bgColor: 'bg-vibrant-orange/15 border-vibrant-orange/40' },
  '社区新星': { icon: Star, color: 'text-neon-pink', bgColor: 'bg-neon-pink/15 border-neon-pink/40' },
  '完美演奏': { icon: Crown, color: 'text-electric-purple', bgColor: 'bg-electric-purple/15 border-electric-purple/40' },
  '震动达人': { icon: Flame, color: 'text-red-400', bgColor: 'bg-red-400/15 border-red-400/40' },
  '探索者': { icon: TrendingUp, color: 'text-green-400', bgColor: 'bg-green-400/15 border-green-400/40' },
};

const allAchievements = [
  { id: 'a1', name: '初次游玩', desc: '完成第一次游戏', icon: Trophy, unlocked: true, color: 'text-neon-cyan' },
  { id: 'a2', name: '连击新星', desc: '达成50连击', icon: Zap, unlocked: true, color: 'text-vibrant-orange' },
  { id: 'a3', name: '完美节奏', desc: '单局准确率达到95%', icon: Target, unlocked: true, color: 'text-neon-pink' },
  { id: 'a4', name: '谱面收藏家', desc: '收藏10个谱面', icon: Heart, unlocked: true, color: 'text-electric-purple' },
  { id: 'a5', name: '百局达人', desc: '累计游玩100次', icon: Flame, unlocked: true, color: 'text-red-400' },
  { id: 'a6', name: '创作者之路', desc: '发布第一个谱面', icon: Sparkles, unlocked: true, color: 'text-green-400' },
  { id: 'a7', name: '千分王者', desc: '单局得分超过100万', icon: Crown, unlocked: false, color: 'text-yellow-400' },
  { id: 'a8', name: '全连大师', desc: '任意谱面达成Full Combo', icon: Star, unlocked: false, color: 'text-blue-400' },
  { id: 'a9', name: '震动专家', desc: '游玩时震动强度100%累计1小时', icon: Music, unlocked: false, color: 'text-purple-400' },
];

export default function UserProfilePage() {
  const user = useAppStore((state) => state.user);
  const charts = useAppStore((state) => state.charts);
  const favorites = useAppStore((state) => state.favorites);
  const [activeTab, setActiveTab] = useState<TabType>('charts');

  const myCharts = charts.filter((c) => c.userId === user?.id);
  const favoriteCharts = charts.filter((c) => favorites.includes(c.id));

  const tabOptions: { value: TabType; label: string; icon: typeof Music }[] = [
    { value: 'charts', label: '我的谱面', icon: Music },
    { value: 'favorites', label: '我的收藏', icon: Heart },
    { value: 'achievements', label: '成就徽章', icon: Trophy },
  ];

  const bestDifficulty: Difficulty = 'hard';
  const stats = [
    { label: '总游玩次数', value: '328', icon: Flame, color: 'text-neon-cyan' },
    { label: '最高连击', value: '256', icon: Zap, color: 'text-vibrant-orange' },
    { label: '总得分', value: '8.6M', icon: Star, color: 'text-electric-purple' },
    { label: '最擅长难度', value: '困难', icon: Target, color: 'text-neon-pink', customBadge: true },
  ];

  if (!user) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-moon-dim mx-auto mb-4" />
          <p className="text-moon-dim text-lg">请先登录</p>
        </div>
      </div>
    );
  }

  const level = Math.floor(user.experience / 2000) + 1;
  const expInCurrentLevel = user.experience % 2000;
  const expProgress = (expInCurrentLevel / 2000) * 100;

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-end mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => triggerVibration(15)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-moon-dim hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
          >
            <Settings className="w-4 h-4" />
            设置
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(0, 245, 255, 0.3)',
                    '0 0 40px rgba(168, 85, 247, 0.3)',
                    '0 0 20px rgba(0, 245, 255, 0.3)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-neon-cyan via-electric-purple to-vibrant-orange"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full rounded-full bg-deep-ocean"
                />
              </motion.div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-neon-cyan to-electric-purple text-ocean-dark font-display font-bold text-sm">
                Lv.{level}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-display font-bold text-gradient mb-2">
                {user.username}
              </h1>
              <p className="text-moon-dim mb-4">{user.bio}</p>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-moon-dim">经验值</span>
                  <span className="text-neon-cyan font-display">
                    {expInCurrentLevel} / 2000 EXP
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${expProgress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-electric-purple to-vibrant-orange"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {user.badges.map((badge) => {
                  const config = badgeConfig[badge] || {
                    icon: Award,
                    color: 'text-neon-cyan',
                    bgColor: 'bg-neon-cyan/15 border-neon-cyan/40',
                  };
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={badge}
                      whileHover={{ scale: 1.05 }}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-display text-xs',
                        config.bgColor,
                        config.color
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {badge}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + index * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass-card p-5 text-center"
              >
                <Icon className={cn('w-7 h-7 mx-auto mb-2', stat.color)} />
                <div className={cn('text-2xl font-display font-bold mb-1', stat.color)}>
                  {stat.customBadge ? (
                    <DifficultyBadge difficulty={bestDifficulty} size="sm" />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="text-sm text-moon-dim">{stat.label}</div>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card overflow-hidden"
        >
          <div className="flex border-b border-white/5">
            {tabOptions.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <motion.button
                  key={tab.value}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveTab(tab.value);
                    triggerVibration(15);
                  }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-6 py-4 font-display font-semibold transition-all',
                    isActive
                      ? 'text-neon-cyan border-b-2 border-neon-cyan bg-neon-cyan/5'
                      : 'text-moon-dim hover:text-moon-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isActive ? 'bg-neon-cyan/20' : 'bg-white/5'
                  )}>
                    {tab.value === 'charts' && myCharts.length}
                    {tab.value === 'favorites' && favoriteCharts.length}
                    {tab.value === 'achievements' && `${allAchievements.filter(a => a.unlocked).length}/${allAchievements.length}`}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'charts' && (
                <motion.div
                  key="charts"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {myCharts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myCharts.map((chart: Chart, index: number) => (
                        <ChartCard key={chart.id} chart={chart} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Music className="w-12 h-12 text-moon-dim mx-auto mb-3" />
                      <p className="text-moon-dim">还没有发布谱面</p>
                      <p className="text-moon-dim/60 text-sm mt-1">创作你的第一个谱面吧！</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'favorites' && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {favoriteCharts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {favoriteCharts.map((chart: Chart, index: number) => (
                        <ChartCard key={chart.id} chart={chart} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-moon-dim mx-auto mb-3" />
                      <p className="text-moon-dim">还没有收藏谱面</p>
                      <p className="text-moon-dim/60 text-sm mt-1">去社区发现喜欢的谱面吧！</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allAchievements.map((achievement, index) => {
                      const Icon = achievement.icon;
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={achievement.unlocked ? { scale: 1.03, y: -2 } : {}}
                          className={cn(
                            'p-5 rounded-xl border transition-all',
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10'
                              : 'bg-white/[0.02] border-white/5 opacity-60'
                          )}
                        >
                          <div className="flex items-start gap-4">
                            <motion.div
                              animate={achievement.unlocked ? {
                                scale: [1, 1.1, 1],
                              } : {}}
                              transition={{ duration: 2, delay: index * 0.1, repeat: Infinity }}
                              className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                                achievement.unlocked
                                  ? 'bg-gradient-to-br from-neon-cyan/20 to-electric-purple/20'
                                  : 'bg-white/5'
                              )}
                            >
                              <Icon className={cn(
                                'w-6 h-6',
                                achievement.unlocked ? achievement.color : 'text-moon-dim'
                              )} />
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                'font-display font-semibold mb-1',
                                achievement.unlocked ? 'text-moon-white' : 'text-moon-dim'
                              )}>
                                {achievement.name}
                                {achievement.unlocked && (
                                  <span className="ml-2 text-xs text-green-400">已解锁</span>
                                )}
                              </h4>
                              <p className="text-sm text-moon-dim/80">{achievement.desc}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
