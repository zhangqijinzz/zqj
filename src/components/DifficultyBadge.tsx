import { motion } from 'framer-motion';
import type { Difficulty } from '../types';
import { cn } from '../lib/utils';

const difficultyConfig: Record<Difficulty, { label: string; className: string; icon: string }> = {
  easy: {
    label: '简单',
    className: 'bg-neon-green/15 text-neon-green border-neon-green/40',
    icon: '●',
  },
  normal: {
    label: '普通',
    className: 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/40',
    icon: '●●',
  },
  hard: {
    label: '困难',
    className: 'bg-vibrant-orange/15 text-vibrant-orange border-vibrant-orange/40',
    icon: '●●●',
  },
  expert: {
    label: '专家',
    className: 'bg-neon-pink/15 text-neon-pink border-neon-pink/40',
    icon: '●●●●',
  },
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

export const DifficultyBadge = ({ difficulty, size = 'md' }: DifficultyBadgeProps) => {
  const config = difficultyConfig[difficulty];

  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-display font-bold text-xs',
        config.className,
        size === 'sm' && 'px-2 py-0.5 text-[10px]'
      )}
    >
      <span className="tracking-tight">{config.icon}</span>
      {config.label}
    </motion.span>
  );
};
