import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Gamepad2,
  Palette,
  Hand,
  Users,
  Zap,
  Sparkles,
  Music,
  Heart,
  ChevronRight,
  Star,
  Layers,
  Play,
} from 'lucide-react';
import { useAppStore } from '../store';
import { LevelCard, ChartCard, MVCard } from '../components';
import { triggerVibration } from '../utils/vibration';

const features = [
  {
    icon: Gamepad2,
    title: '触觉节拍引擎',
    subtitle: 'Tactile Beat Engine',
    description:
      '将音乐节奏转化为屏幕震动波形、光频闪烁和角色动作提示的三维反馈系统，让你用身体感受每一个节拍。',
    color: 'from-neon-cyan to-electric-purple',
    bgColor: 'bg-neon-cyan/10',
    textColor: 'text-neon-cyan',
    link: '/game',
    highlights: ['震动波形反馈', '光频闪烁同步', '角色动作提示'],
  },
  {
    icon: Palette,
    title: '视觉作曲工坊',
    subtitle: 'Visual Composition Workshop',
    description:
      '用色块、轨迹和粒子效果创作"可见的音乐"，支持导出为震动序列分享给其他听障玩家。',
    color: 'from-electric-purple to-neon-pink',
    bgColor: 'bg-electric-purple/10',
    textColor: 'text-electric-purple',
    link: '/workshop',
    highlights: ['多轨道时间轴', '粒子特效配置', '震动序列导出'],
  },
  {
    icon: Hand,
    title: '手语歌词MV',
    subtitle: 'Sign Language MV',
    description:
      '内置手语表演者录制的歌曲演绎，玩家可跟学并录制自己的版本参与社区评分。',
    color: 'from-neon-pink to-vibrant-orange',
    bgColor: 'bg-neon-pink/10',
    textColor: 'text-neon-pink',
    link: '/signlanguage',
    highlights: ['专业手语演绎', '逐句动作分解', '社区评分系统'],
  },
  {
    icon: Users,
    title: '震动谱面社区',
    subtitle: 'Vibration Chart Community',
    description:
      '玩家自制关卡完全基于触觉和视觉设计，形成听障玩家专属的音游生态，分享创意，连接彼此。',
    color: 'from-vibrant-orange to-neon-cyan',
    bgColor: 'bg-vibrant-orange/10',
    textColor: 'text-vibrant-orange',
    link: '/community',
    highlights: ['玩家自制谱面', '分享与交流', '专属生态系统'],
  },
];

const stats = [
  { label: '游戏曲目', value: '50+', icon: Music, color: 'text-neon-cyan' },
  { label: '社区谱面', value: '200+', icon: Layers, color: 'text-electric-purple' },
  { label: '活跃玩家', value: '10K+', icon: Users, color: 'text-neon-pink' },
  { label: '手语作品', value: '80+', icon: Hand, color: 'text-vibrant-orange' },
];

export default function Home() {
  const levels = useAppStore((state) => state.levels);
  const charts = useAppStore((state) => state.charts);
  const mvWorks = useAppStore((state) => state.mvWorks);

  const featuredLevels = levels.slice(0, 4);
  const featuredCharts = charts.slice(0, 3);
  const featuredMVs = mvWorks.slice(0, 3);

  const scrollToSection = (id: string) => {
    triggerVibration(15);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="absolute top-20 -left-32 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 -right-32 w-96 h-96 bg-electric-purple/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-vibrant-orange/10 rounded-full blur-3xl pointer-events-none" />

      <section className="relative z-10 pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <Zap className="w-4 h-4 text-vibrant-orange" />
              <span className="text-sm text-moon-dim">
                全球首个专为听障玩家设计的音乐游戏平台
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl md:text-7xl font-black mb-6 leading-tight"
            >
              <span className="text-moon-white">用视觉与触觉</span>
              <br />
              <span className="text-gradient">感受音乐的律动</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-moon-dim mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              RHYTHM VISION 是一款专为先天性或后天性听力障碍的游戏爱好者打造的音乐游戏。
              通过震动反馈、视觉特效和手语演绎，让每一个人都能体验音乐游戏的乐趣。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/game"
                onClick={() => triggerVibration(30)}
                className="btn-primary flex items-center gap-2 text-lg"
              >
                <Play className="w-5 h-5 ml-1" />
                开始游戏
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="btn-neon-purple flex items-center gap-2"
              >
                了解更多
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="glass-card p-6 text-center"
                >
                  <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <div className={`font-display text-3xl font-bold mb-1 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-moon-dim">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section id="features" className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-4">
              四大核心功能
            </h2>
            <p className="text-moon-dim text-lg max-w-2xl mx-auto">
              专为听障玩家设计的全方位音乐游戏体验
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.01 }}
                >
                  <Link
                    to={feature.link}
                    onClick={() => triggerVibration(25)}
                    className="block h-full"
                  >
                    <div className="glass-card p-8 h-full group">
                      <div className="flex items-start gap-6">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`w-8 h-8 ${feature.textColor}`} />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-display text-2xl font-bold text-moon-white mb-1 group-hover:text-gradient transition-all">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-moon-dim/70 mb-3 font-display">
                            {feature.subtitle}
                          </p>
                          <p className="text-moon-dim leading-relaxed mb-4">
                            {feature.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {feature.highlights.map((highlight) => (
                              <span
                                key={highlight}
                                className="px-3 py-1 rounded-full text-xs font-display bg-white/5 text-moon-dim border border-white/10"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-6 pt-6 border-t border-white/5">
                        <span className={`text-sm font-display ${feature.textColor} flex items-center gap-1`}>
                          立即体验
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
                <Music className="w-8 h-8 text-neon-cyan" />
                精选曲目
              </h2>
              <p className="text-moon-dim">体验精心设计的触觉节拍曲目</p>
            </div>
            <Link
              to="/game"
              onClick={() => triggerVibration(15)}
              className="text-neon-cyan hover:text-neon-cyan-dim flex items-center gap-1 text-sm font-display"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredLevels.map((level, index) => (
              <LevelCard key={level.id} level={level} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric-purple/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-electric-purple" />
                热门谱面
              </h2>
              <p className="text-moon-dim">探索玩家创作的精彩视觉谱面</p>
            </div>
            <Link
              to="/community"
              onClick={() => triggerVibration(15)}
              className="text-electric-purple hover:text-electric-purple-dim flex items-center gap-1 text-sm font-display"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCharts.map((chart, index) => (
              <ChartCard key={chart.id} chart={chart} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2 flex items-center gap-3">
                <Hand className="w-8 h-8 text-neon-pink" />
                手语MV精选
              </h2>
              <p className="text-moon-dim">用双手演绎音乐的美</p>
            </div>
            <Link
              to="/signlanguage"
              onClick={() => triggerVibration(15)}
              className="text-neon-pink hover:text-neon-pink/80 flex items-center gap-1 text-sm font-display"
            >
              查看全部
              <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMVs.map((mv, index) => (
              <MVCard key={mv.id} work={mv} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="glass-card p-10 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan via-electric-purple to-vibrant-orange" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-electric-purple/10 rounded-full blur-3xl" />

            <div className="relative">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-neon-cyan via-electric-purple to-vibrant-orange flex items-center justify-center shadow-neon-cyan"
              >
                <Heart className="w-10 h-10 text-ocean-dark" />
              </motion.div>

              <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-4">
                加入我们的社区
              </h2>
              <p className="text-moon-dim text-lg mb-8 max-w-xl mx-auto leading-relaxed">
                无论你是听障玩家还是音乐爱好者，这里都有属于你的舞台。
                分享创意，交流心得，一起打造最棒的无障碍音乐游戏社区。
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/community"
                  onClick={() => triggerVibration(30)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  探索社区
                </Link>
                <Link
                  to="/workshop"
                  onClick={() => triggerVibration(25)}
                  className="btn-neon-orange flex items-center gap-2"
                >
                  <Palette className="w-5 h-5" />
                  开始创作
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan via-electric-purple to-vibrant-orange flex items-center justify-center shadow-neon-cyan">
                  <Zap className="w-6 h-6 text-ocean-dark" />
                </div>
                <span className="font-display font-bold text-xl text-gradient">
                  RHYTHM VISION
                </span>
              </div>
              <p className="text-moon-dim text-sm leading-relaxed max-w-md">
                专为听障玩家设计的音乐游戏平台。我们相信，每个人都有感受音乐的权利，
                只是方式不同。用视觉与触觉，重新定义音乐游戏的体验。
              </p>
            </div>

            <div>
              <h4 className="font-display font-semibold text-moon-white mb-4">功能导航</h4>
              <div className="space-y-2">
                {[
                  { label: '触觉节拍', link: '/game' },
                  { label: '视觉作曲', link: '/workshop' },
                  { label: '手语MV', link: '/signlanguage' },
                  { label: '谱面社区', link: '/community' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.link}
                    onClick={() => triggerVibration(10)}
                    className="block text-sm text-moon-dim hover:text-neon-cyan transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-display font-semibold text-moon-white mb-4">关于我们</h4>
              <div className="space-y-2">
                {['团队介绍', '联系方式', '用户协议', '隐私政策'].map((item) => (
                  <button
                    key={item}
                    onClick={() => triggerVibration(10)}
                    className="block text-sm text-moon-dim hover:text-neon-cyan transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-moon-dim/60">
              © 2024 RHYTHM VISION. 用爱与科技，让音乐触手可及。
            </p>
            <div className="flex items-center gap-4">
              <Star className="w-4 h-4 text-vibrant-orange fill-vibrant-orange" />
              <span className="text-sm text-moon-dim">
                用心打造，无障碍设计
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
