import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Vibrate,
  Sun,
  Palette,
  MousePointer,
  Sparkles,
  Play,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store';
import { triggerVibration, playVibrationSequence, stopVibration } from '../utils/vibration';
import type { UserSettings } from '../types';
import { cn } from '../lib/utils';

const themeOptions = [
  { id: 'cyberpunk', name: '赛博朋克', colors: ['#00F5FF', '#A855F7', '#FF6B35'] },
  { id: 'aurora', name: '极光之夜', colors: ['#39FF14', '#00F5FF', '#A855F7'] },
  { id: 'sunset', name: '落日余晖', colors: ['#FF6B35', '#FF00E5', '#A855F7'] },
  { id: 'ocean', name: '深海幽蓝', colors: ['#00F5FF', '#2563EB', '#1e40af'] },
];

interface SliderSettingProps {
  label: string;
  description: string;
  icon: typeof Vibrate;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  color: string;
  onChange: (value: number) => void;
  onPreview?: () => void;
  previewLabel?: string;
}

function SliderSetting({
  label,
  description,
  icon: Icon,
  value,
  min = 0,
  max = 1,
  step = 0.1,
  color,
  onChange,
  onPreview,
  previewLabel,
}: SliderSettingProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            `bg-${color}/15`
          )} style={{ backgroundColor: color ? `${color}20` : undefined }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h4 className="font-display font-semibold text-moon-white mb-1">{label}</h4>
            <p className="text-sm text-moon-dim">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-display font-bold" style={{ color }}>
            {Math.round(percent)}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative h-2 rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
              boxShadow: `0 0 10px ${color}50`,
            }}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-moon-white"
            style={{
              left: `calc(${percent}% - 8px)`,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        </div>

        {onPreview && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPreview}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display border transition-all"
            style={{
              borderColor: `${color}50`,
              backgroundColor: `${color}15`,
              color,
            }}
          >
            <Play className="w-3.5 h-3.5" />
            {previewLabel || '预览'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default function UserSettingsPage() {
  const user = useAppStore((state) => state.user);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (user) {
      setLocalSettings({ ...user.settings });
    }
  }, [user]);

  const handleSettingChange = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!localSettings) return;
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const handleVibrationPreview = () => {
    if (!localSettings) return;
    triggerVibration([50, 50, 100, 50, 50]);
  };

  const handleResetDefaults = () => {
    triggerVibration(20);
    setLocalSettings({
      vibrationIntensity: 0.8,
      brightness: 1.0,
      colorTheme: 'cyberpunk',
      sensitivity: 0.7,
      particleDensity: 1.0,
    });
  };

  const handleSave = () => {
    if (!localSettings) return;
    triggerVibration([30, 50, 30]);
    updateSettings(localSettings);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  if (!localSettings) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 text-moon-dim mx-auto mb-4" />
          <p className="text-moon-dim text-lg">加载设置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-moon-dim hover:text-neon-cyan hover:border-neon-cyan/50 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold text-gradient">用户设置</h1>
              <p className="text-sm text-moon-dim">自定义你的游戏体验</p>
            </div>
          </div>

          <AnimatedSaveButton saved={savedMessage} onSave={handleSave} />
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-bold text-lg text-moon-white mb-5 flex items-center gap-2">
              <Vibrate className="w-5 h-5 text-neon-cyan" />
              震动与触觉
            </h3>
            <div className="space-y-4">
              <SliderSetting
                label="震动强度"
                description="调整游戏过程中震动反馈的强度"
                icon={Vibrate}
                value={localSettings.vibrationIntensity}
                color="#00F5FF"
                onChange={(v) => handleSettingChange('vibrationIntensity', v)}
                onPreview={handleVibrationPreview}
                previewLabel="测试震动"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-bold text-lg text-moon-white mb-5 flex items-center gap-2">
              <Sun className="w-5 h-5 text-vibrant-orange" />
              视觉效果
            </h3>
            <div className="space-y-4">
              <SliderSetting
                label="光效亮度"
                description="调整特效和UI元素的明亮程度"
                icon={Sun}
                value={localSettings.brightness}
                color="#FF6B35"
                onChange={(v) => handleSettingChange('brightness', v)}
              />

              <SliderSetting
                label="粒子密度"
                description="控制击打时粒子效果的数量"
                icon={Sparkles}
                value={localSettings.particleDensity}
                color="#FF00E5"
                onChange={(v) => handleSettingChange('particleDensity', v)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-bold text-lg text-moon-white mb-5 flex items-center gap-2">
              <Palette className="w-5 h-5 text-electric-purple" />
              颜色主题
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themeOptions.map((theme) => {
                const isActive = localSettings.colorTheme === theme.id;
                return (
                  <motion.button
                    key={theme.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerVibration(15);
                      handleSettingChange('colorTheme', theme.id);
                    }}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      isActive
                        ? 'border-electric-purple/50 bg-electric-purple/10'
                        : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                    )}
                  >
                    <div className="flex gap-1 mb-3 justify-center">
                      {theme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <p className={cn(
                        'font-display text-sm font-semibold',
                        isActive ? 'text-electric-purple' : 'text-moon-white'
                      )}>
                        {theme.name}
                      </p>
                      {isActive && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-electric-purple">
                          <Check className="w-3 h-3" />
                          已选择
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-bold text-lg text-moon-white mb-5 flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-neon-pink" />
              游戏控制
            </h3>
            <div className="space-y-4">
              <SliderSetting
                label="游戏灵敏度"
                description="调整游戏操作的响应速度"
                icon={MousePointer}
                value={localSettings.sensitivity}
                color="#FF00E5"
                onChange={(v) => handleSettingChange('sensitivity', v)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 pb-8"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleResetDefaults}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-moon-dim font-display font-semibold rounded-xl hover:bg-white/10 hover:text-moon-white transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              恢复默认
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-neon-cyan via-electric-purple to-vibrant-orange text-ocean-dark font-display font-bold rounded-xl hover:shadow-neon-cyan hover:shadow-neon-purple transition-all duration-500"
            >
              <Save className="w-5 h-5" />
              保存设置
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AnimatedSaveButton({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSave}
      className={cn(
        'flex items-center gap-2 px-5 py-2.5 rounded-xl font-display font-semibold transition-all',
        saved
          ? 'bg-green-400/20 border border-green-400/50 text-green-400'
          : 'bg-neon-cyan/15 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/25'
      )}
    >
      <AnimatePresenceContent show={saved}>
        <Check className="w-4 h-4" />
      </AnimatePresenceContent>
      <AnimatePresenceContent show={!saved}>
        <Save className="w-4 h-4" />
      </AnimatePresenceContent>
      {saved ? '已保存' : '保存'}
    </motion.button>
  );
}

function AnimatePresenceContent({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      {children}
    </motion.span>
  );
}
