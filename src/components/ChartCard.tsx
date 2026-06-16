import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Play, Download, User } from 'lucide-react';
import type { Chart } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { useAppStore } from '../store';
import { cn } from '../lib/utils';
import { triggerVibration } from '../utils/vibration';

interface ChartCardProps {
  chart: Chart;
  index?: number;
}

export const ChartCard = ({ chart, index = 0 }: ChartCardProps) => {
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const setCurrentChart = useAppStore((state) => state.setCurrentChart);
  const isFavorite = favorites.includes(chart.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group glass-card overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={chart.coverImage}
          alt={chart.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-ocean via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <DifficultyBadge difficulty={chart.difficulty} size="sm" />
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite(chart.id);
            triggerVibration(20);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
        >
          <Heart
            className={cn(
              'w-5 h-5 transition-colors',
              isFavorite ? 'fill-neon-pink text-neon-pink' : 'text-moon-white'
            )}
          />
        </button>

        <Link
          to={`/community/chart/${chart.id}`}
          onClick={() => setCurrentChart(chart)}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-electric-purple to-neon-pink flex items-center justify-center shadow-neon-purple opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-6 h-6 text-ocean-dark ml-0.5" />
          </motion.div>
        </Link>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-bold text-base text-moon-white group-hover:text-electric-purple transition-colors">
            {chart.title}
          </h3>
          <p className="text-sm text-moon-dim line-clamp-2 mt-1">{chart.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {chart.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-moon-dim border border-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <Link
            to={`/user`}
            className="flex items-center gap-2 text-sm text-moon-dim hover:text-neon-cyan transition-colors"
          >
            <img
              src={chart.user.avatar}
              alt={chart.user.username}
              className="w-6 h-6 rounded-full border border-white/10"
            />
            <span>{chart.user.username}</span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-moon-dim">
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {chart.playCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {chart.likes}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
