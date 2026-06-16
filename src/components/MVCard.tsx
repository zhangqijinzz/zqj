import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Heart, User } from 'lucide-react';
import type { MVWork } from '../types';
import { triggerVibration } from '../utils/vibration';

interface MVCardProps {
  work: MVWork;
  index?: number;
}

export const MVCard = ({ work, index = 0 }: MVCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      onClick={() => triggerVibration(25)}
      className="group glass-card overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={work.thumbnail}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-ocean/90 via-deep-ocean/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-vibrant-orange to-neon-pink flex items-center justify-center shadow-neon-orange opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-7 h-7 text-ocean-dark ml-1" />
          </div>
        </motion.div>

        <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-vibrant-orange text-vibrant-orange" />
          <span className="text-sm font-display font-bold text-moon-white">{work.rating}</span>
        </div>

        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-xs text-moon-dim">
          {new Date(work.createdAt).toLocaleDateString('zh-CN')}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-moon-white group-hover:text-vibrant-orange transition-colors">
            {work.title}
          </h3>
          <p className="text-sm text-moon-dim mt-0.5">{work.song.title} - {work.song.artist}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={work.user.avatar}
              alt={work.user.username}
              className="w-7 h-7 rounded-full border border-white/10"
            />
            <span className="text-sm text-moon-dim">{work.user.username}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-moon-dim">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-neon-pink" />
              {work.likes}
            </span>
            <span>({work.ratingCount}评价)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
