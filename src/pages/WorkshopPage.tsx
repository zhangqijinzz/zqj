import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Palette,
  Music,
  Sparkles,
  TrendingUp,
  Clock,
  Heart,
  Play,
  Edit3,
  Trash2,
  ChevronRight,
  Zap,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../store';
import { triggerVibration } from '../utils/vibration';
import type { Chart } from '../types';
import { DifficultyBadge } from '../components/DifficultyBadge';

const templates = [
  {
    id: 'tpl-001',
    title: '电子脉冲',
    description: '快速BPM，强烈节奏感',
    bpm: 128,
    color: 'from-neon-cyan to-electric-purple',
    icon: Zap,
  },
  {
    id: 'tpl-002',
    title: '梦幻星河',
    description: '舒缓节奏，梦幻视觉',
    bpm: 90,
    color: 'from-electric-purple to-neon-pink',
    icon: Sparkles,
  },
  {
    id: 'tpl-003',
    title: '机械纪元',
    description: '工业风格，硬核节奏',
    bpm: 140,
    color: 'from-vibrant-orange to-neon-pink',
    icon: Layers,
  },
  {
    id: 'tpl-004',
    title: '光之交响',
    description: '优雅旋律，古典气息',
    bpm: 96,
    color: 'from-neon-cyan to-neon-green',
    icon: Music,
  },
];

const stats = [
  { label: '作品总数', value: '12', icon: Palette, color: 'text-neon-cyan' },
  { label: '累计播放', value: '8,642', icon: Play, color: 'text-electric-purple' },
  { label: '收获点赞', value: '1,256', icon: Heart, color: 'text-neon-pink' },
  { label: '创作时长', value: '24h', icon: Clock, color: 'text-vibrant-orange' },
];

const WorkCard = ({ chart, index }: { chart: Chart; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group glass-card overflow-hidden"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={chart.coverImage}
          alt={chart.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-ocean via-deep-ocean/50 to-transparent" />
        <div className="absolute top-3 left-3">
          <DifficultyBadge difficulty={chart.difficulty} size="sm" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/workshop/editor/${chart.id}`}
            onClick={() => triggerVibration(20)}
            className="p-3 rounded-full bg-neon-cyan/90 hover:bg-neon-cyan text-ocean-dark transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </Link>
          <button
            onClick={() => triggerVibration(15)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-moon-white transition-colors"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={() => triggerVibration(15)}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-red-500/80 text-moon-white transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-display font-bold text-moon-white group-hover:text-neon-cyan transition-colors">
          {chart.title}
        </h3>
        <p className="text-sm text-moon-dim line-clamp-2">{chart.description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex gap-1.5">
            {chart.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-moon-dim border border-white/10"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-moon-dim">
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {chart.playCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {chart.likes}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TemplateCard = ({ template, index }: { template: typeof templates[0]; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.03 }}
      onClick={() => triggerVibration(25)}
      className="group relative glass-card overflow-hidden cursor-pointer"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-20 group-hover:opacity-40 transition-opacity`} />
      <div className="relative p-5 space-y-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}>
          <template.icon className="w-6 h-6 text-ocean-dark" />
        </div>
        <div>
          <h4 className="font-display font-bold text-moon-white">{template.title}</h4>
          <p className="text-sm text-moon-dim mt-1">{template.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-moon-dim">BPM: {template.bpm}</span>
          <ChevronRight className="w-5 h-5 text-moon-dim group-hover:text-neon-cyan group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};

export default function WorkshopPage() {
  const charts = useAppStore((state) => state.charts);
  const user = useAppStore((state) => state.user);
  const myWorks = charts.filter((c) => c.userId === user?.id || c.userId === 'user-001');

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12"
        >
          <div className="relative overflow-hidden glass-card p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-electric-purple/10 to-vibrant-orange/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-electric-purple/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan via-electric-purple to-vibrant-orange flex items-center justify-center shadow-neon-cyan">
                      <Palette className="w-7 h-7 text-ocean-dark" />
                    </div>
                    <div>
                      <h1 className="font-display font-bold text-3xl md:text-4xl text-gradient">
                        视觉作曲工坊
                      </h1>
                      <p className="text-moon-dim mt-1">Visual Rhythm Workshop</p>
                    </div>
                  </div>
                  <p className="text-moon-dim leading-relaxed">
                    在这里，你可以自由创作属于自己的视觉音乐谱面。通过多轨道时间轴编排震动节拍与视觉音符，
                    配置粒子特效与主题风格，将你的创意转化为独特的视听体验。无论是舒缓的治愈系还是激烈的硬核风，
                    一切由你定义。
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/workshop/editor/new"
                    onClick={() => triggerVibration(30)}
                    className="btn-primary flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    创建新作品
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              whileHover={{ y: -2 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-white/5 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl text-moon-white">{stat.value}</div>
                  <div className="text-sm text-moon-dim">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-moon-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-vibrant-orange" />
                模板库
              </h2>
              <p className="text-moon-dim mt-1 text-sm">选择模板快速开始创作</p>
            </div>
            <button
              onClick={() => triggerVibration(15)}
              className="text-sm text-neon-cyan hover:text-neon-cyan-dim flex items-center gap-1 transition-colors"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {templates.map((tpl, i) => (
              <Link key={tpl.id} to={`/workshop/editor/new?template=${tpl.id}`}>
                <TemplateCard template={tpl} index={i} />
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl text-moon-white flex items-center gap-2">
                <Music className="w-6 h-6 text-electric-purple" />
                我的作品
              </h2>
              <p className="text-moon-dim mt-1 text-sm">共 {myWorks.length} 个作品</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerVibration(15)}
                className="px-4 py-2 rounded-lg bg-white/5 text-moon-dim hover:text-moon-white hover:bg-white/10 text-sm transition-colors border border-white/10"
              >
                最新
              </button>
              <button
                onClick={() => triggerVibration(15)}
                className="px-4 py-2 rounded-lg bg-white/5 text-moon-dim hover:text-moon-white hover:bg-white/10 text-sm transition-colors border border-white/10"
              >
                最热
              </button>
            </div>
          </div>

          {myWorks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {myWorks.map((chart, i) => (
                <WorkCard key={chart.id} chart={chart} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-16 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/5 flex items-center justify-center">
                <Palette className="w-10 h-10 text-moon-dim" />
              </div>
              <h3 className="font-display font-bold text-xl text-moon-white mb-2">还没有作品</h3>
              <p className="text-moon-dim mb-6">开始你的第一次视觉作曲创作吧！</p>
              <Link
                to="/workshop/editor/new"
                onClick={() => triggerVibration(30)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                创建第一个作品
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
