import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Users, Music } from 'lucide-react';
import type { Level } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { WaveformVisualizer } from './WaveformVisualizer';
import { triggerVibration } from '../utils/vibration';
import { useAppStore } from '../store';

interface LevelCardProps {
  level: Level;
  index?: number;
}

export const LevelCard = ({ level, index = 0 }: LevelCardProps) => {
  const setCurrentLevel = useAppStore((state) => state.setCurrentLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={() => triggerVibration(30)}
      className="group relative glass-card overflow-hidden cursor-pointer"
    >
      <Link
        to={`/game/play/${level.id}`}
        onClick={() => setCurrentLevel(level)}
        className="block"
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={level.coverImage}
            alt={level.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-ocean via-deep-ocean/50 to-transparent" />
          <div className="absolute top-3 left-3">
            <DifficultyBadge difficulty={level.difficulty} />
          </div>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
            <Music className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="text-xs font-display text-moon-white">{level.song.bpm} BPM</span>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-electric-purple flex items-center justify-center shadow-neon-cyan">
              <Play className="w-8 h-8 text-ocean-dark ml-1" />
            </div>
          </motion.div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-bold text-lg text-moon-white group-hover:text-neon-cyan transition-colors">
              {level.title}
            </h3>
            <p className="text-sm text-moon-dim">{level.song.artist}</p>
          </div>

          <WaveformVisualizer sequence={level.vibrationPattern} height={36} barCount={40} />

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 text-xs text-moon-dim">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {level.playCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {level.likes.toLocaleString()}
              </span>
            </div>
            <span className="text-xs font-medium text-neon-cyan capitalize">{level.genre}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
