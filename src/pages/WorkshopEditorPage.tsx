import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Save,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  Palette,
  Sparkles,
  Waves,
  Settings,
  GripVertical,
  Volume2,
  Eye,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { triggerVibration, stopVibration, playVibrationSequence } from '../utils/vibration';
import { cn } from '../lib/utils';
import type {
  VisualNote,
  VibrationBeat,
  ParticleEffect,
  VibrationSequence,
  VisualChart,
  Frequency,
  Waveform,
  NoteType,
  ParticleType,
} from '../types';

const TRACK_COLORS = [
  { name: '霓虹青', color: '#00F5FF', bg: 'bg-neon-cyan', border: 'border-neon-cyan', shadow: 'shadow-neon-cyan' },
  { name: '电光紫', color: '#A855F7', bg: 'bg-electric-purple', border: 'border-electric-purple', shadow: 'shadow-neon-purple' },
  { name: '活力橙', color: '#FF6B35', bg: 'bg-vibrant-orange', border: 'border-vibrant-orange', shadow: 'shadow-neon-orange' },
  { name: '霓虹粉', color: '#FF00E5', bg: 'bg-neon-pink', border: 'border-neon-pink', shadow: 'shadow-neon-pink' },
];

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'low', label: '低频' },
  { value: 'mid', label: '中频' },
  { value: 'high', label: '高频' },
];

const WAVEFORMS: { value: Waveform; label: string; icon: string }[] = [
  { value: 'sine', label: '正弦波', icon: '∿' },
  { value: 'square', label: '方波', icon: '⊓⊔' },
  { value: 'sawtooth', label: '锯齿波', icon: '⋰⋱' },
];

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: 'tap', label: '点击' },
  { value: 'hold', label: '长按' },
  { value: 'slide', label: '滑动' },
  { value: 'swing', label: '摆动' },
];

const PARTICLE_TYPES: { value: ParticleType; label: string }[] = [
  { value: 'explosion', label: '爆炸' },
  { value: 'wave', label: '波纹' },
  { value: 'sparkle', label: '闪烁' },
  { value: 'trail', label: '尾迹' },
];

const THEMES = [
  { id: 'cyberpunk', name: '赛博朋克', colors: ['#00F5FF', '#A855F7', '#FF6B35'], bg: 'from-deep-ocean to-ocean-dark' },
  { id: 'aurora', name: '极光之夜', colors: ['#39FF14', '#00F5FF', '#A855F7'], bg: 'from-emerald-950 to-deep-ocean' },
  { id: 'sunset', name: '落日余晖', colors: ['#FF6B35', '#FF00E5', '#A855F7'], bg: 'from-orange-950 to-deep-ocean' },
  { id: 'ocean', name: '深海秘境', colors: ['#00F5FF', '#00B8C2', '#A855F7'], bg: 'from-cyan-950 to-ocean-dark' },
];

const TOTAL_DURATION = 60000;
const PIXELS_PER_MS_BASE = 0.1;

interface EditorNote extends VisualNote {
  id: string;
}

interface EditorParticle extends ParticleEffect {
  id: string;
}

export default function WorkshopEditorPage() {
  const { id } = useParams<{ id: string }>();
  const charts = useAppStore((state) => state.charts);
  const existingChart = charts.find((c) => c.id === id);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'vibration' | 'particle' | 'theme'>('vibration');
  const [bpm, setBpm] = useState(existingChart?.vibrationData.bpm || 120);
  const [title, setTitle] = useState(existingChart?.title || '未命名作品');
  const [description, setDescription] = useState(existingChart?.description || '');
  const [theme, setTheme] = useState(THEMES[0]);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [vibrationConfig, setVibrationConfig] = useState({
    intensity: 0.8,
    frequency: 'mid' as Frequency,
    waveform: 'sine' as Waveform,
  });

  const [particleConfig, setParticleConfig] = useState({
    type: 'explosion' as ParticleType,
    color: '#00F5FF',
    duration: 600,
    density: 1.0,
  });

  const [notes, setNotes] = useState<EditorNote[]>(() => {
    if (existingChart) {
      return existingChart.visualData.notes.map((n, i) => ({
        ...n,
        id: `note-${i}-${Date.now()}`,
      }));
    }
    return [
      { id: 'note-1', time: 2000, lane: 0, type: 'tap', color: TRACK_COLORS[0].color },
      { id: 'note-2', time: 4000, lane: 1, type: 'tap', color: TRACK_COLORS[1].color },
      { id: 'note-3', time: 6000, lane: 2, type: 'hold', color: TRACK_COLORS[2].color, duration: 1000 },
      { id: 'note-4', time: 8000, lane: 3, type: 'tap', color: TRACK_COLORS[3].color },
    ];
  });

  const [particles, setParticles] = useState<EditorParticle[]>(() => {
    if (existingChart) {
      return existingChart.visualData.particles.map((p, i) => ({
        ...p,
        id: `particle-${i}-${Date.now()}`,
      }));
    }
    return [
      { id: 'p-1', triggerTime: 2000, type: 'explosion', color: '#00F5FF', position: { x: 25, y: 80 }, duration: 600 },
    ];
  });

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const stopVibrationFnRef = useRef<(() => void) | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragNoteRef = useRef<{ id: string; startX: number; startTime: number; startLane: number } | null>(null);

  const pixelsPerMs = PIXELS_PER_MS_BASE * zoom;

  const vibrationSequence: VibrationSequence = {
    version: '1.0',
    bpm,
    beats: notes.map<Omit<VibrationBeat, 'id'> & { id?: string }>((note) => ({
      time: note.time,
      duration: note.duration || 100,
      intensity: vibrationConfig.intensity,
      frequency: vibrationConfig.frequency,
      waveform: vibrationConfig.waveform,
    })),
    totalDuration: TOTAL_DURATION,
  };

  const visualChart: VisualChart = {
    version: '1.0',
    bpm,
    notes: notes.map(({ id, ...rest }) => rest),
    particles: particles.map(({ id, ...rest }) => rest),
    backgroundTheme: theme.id,
    totalDuration: TOTAL_DURATION,
  };

  const animate = useCallback(() => {
    const elapsed = performance.now() - startTimeRef.current;
    if (elapsed >= TOTAL_DURATION) {
      setIsPlaying(false);
      setCurrentTime(0);
      stopVibration();
      return;
    }
    setCurrentTime(elapsed);
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startTimeRef.current = performance.now() - currentTime;
      animationRef.current = requestAnimationFrame(animate);
      stopVibrationFnRef.current = playVibrationSequence(
        vibrationSequence,
        vibrationConfig.intensity
      );
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (stopVibrationFnRef.current) {
        stopVibrationFnRef.current();
        stopVibrationFnRef.current = null;
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (stopVibrationFnRef.current) stopVibrationFnRef.current();
    };
  }, [isPlaying, animate, vibrationSequence, vibrationConfig.intensity, currentTime]);

  const handlePlayPause = () => {
    triggerVibration(20);
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    triggerVibration(15);
    setIsPlaying(false);
    setCurrentTime(0);
    stopVibration();
  };

  const handleAddNote = (lane: number) => {
    triggerVibration(25);
    const beatMs = 60000 / bpm;
    const snappedTime = Math.round(currentTime / beatMs) * beatMs;
    const newNote: EditorNote = {
      id: `note-${Date.now()}`,
      time: Math.max(0, snappedTime),
      lane,
      type: 'tap',
      color: TRACK_COLORS[lane].color,
    };
    setNotes((prev) => [...prev, newNote]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (noteId: string) => {
    triggerVibration(15);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNoteId === noteId) setSelectedNoteId(null);
  };

  const handleAddParticle = () => {
    triggerVibration(25);
    const newParticle: EditorParticle = {
      id: `particle-${Date.now()}`,
      triggerTime: currentTime,
      type: particleConfig.type,
      color: particleConfig.color,
      position: { x: 50, y: 50 },
      duration: particleConfig.duration,
    };
    setParticles((prev) => [...prev, newParticle]);
    setSelectedParticleId(newParticle.id);
  };

  const handleDeleteParticle = (particleId: string) => {
    triggerVibration(15);
    setParticles((prev) => prev.filter((p) => p.id !== particleId));
    if (selectedParticleId === particleId) setSelectedParticleId(null);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPlaying) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pixelsPerMs;
    setCurrentTime(Math.max(0, Math.min(time, TOTAL_DURATION)));
  };

  const handleNoteMouseDown = (e: React.MouseEvent, note: EditorNote) => {
    if (isPlaying) return;
    e.stopPropagation();
    triggerVibration(10);
    setSelectedNoteId(note.id);
    dragNoteRef.current = {
      id: note.id,
      startX: e.clientX,
      startTime: note.time,
      startLane: note.lane,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragNoteRef.current || !timelineRef.current) return;
    const dx = e.clientX - dragNoteRef.current.startX;
    const dt = dx / pixelsPerMs;
    const newTime = Math.max(0, dragNoteRef.current.startTime + dt);

    const timelineRect = timelineRef.current.getBoundingClientRect();
    const trackHeight = timelineRect.height / 4;
    const relativeY = e.clientY - timelineRect.top;
    const newLane = Math.max(0, Math.min(3, Math.floor(relativeY / trackHeight)));

    setNotes((prev) =>
      prev.map((n) =>
        n.id === dragNoteRef.current?.id
          ? { ...n, time: newTime, lane: newLane, color: TRACK_COLORS[newLane].color }
          : n
      )
    );
  }, [pixelsPerMs]);

  const handleMouseUp = useCallback(() => {
    dragNoteRef.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    triggerVibration(30);
    console.log('Saving:', { title, description, bpm, vibrationSequence, visualChart });
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const msec = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${msec.toString().padStart(2, '0')}`;
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  return (
    <div className={`min-h-screen pt-20 pb-8 bg-gradient-to-b ${theme.bg} relative z-10`}>
      <div className="max-w-[1800px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-4">
            <Link
              to="/workshop"
              onClick={() => triggerVibration(15)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-moon-dim hover:text-moon-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="font-display font-bold text-2xl bg-transparent text-moon-white focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 rounded-lg px-2 py-1 -ml-2"
                placeholder="作品标题"
              />
              <p className="text-sm text-moon-dim">BPM: {bpm} · 时长: {formatTime(TOTAL_DURATION)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-4 top-20 z-50 glass-card p-2 min-w-48"
                >
                  <button
                    onClick={() => { setShowExportMenu(false); triggerVibration(15); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-moon-dim hover:text-moon-white hover:bg-white/5 transition-colors"
                  >
                    <Download className="w-4 h-4" /> 导出 JSON
                  </button>
                  <button
                    onClick={() => { setShowExportMenu(false); triggerVibration(15); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-moon-dim hover:text-moon-white hover:bg-white/5 transition-colors"
                  >
                    <Share2 className="w-4 h-4" /> 导出分享链接
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleSave}
              className="btn-neon-cyan flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Save className="w-4 h-4" /> 保存
            </button>
            <button
              onClick={() => { setShowExportMenu(!showExportMenu); triggerVibration(15); }}
              className="btn-neon-purple flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Download className="w-4 h-4" /> 导出
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => triggerVibration(25)}
              className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Share2 className="w-4 h-4" /> 发布
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStop}
                      className="w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-moon-white flex items-center justify-center transition-colors"
                    >
                      <Square className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                        isPlaying
                          ? 'bg-vibrant-orange text-ocean-dark shadow-neon-orange'
                          : 'bg-gradient-to-br from-neon-cyan to-electric-purple text-ocean-dark shadow-neon-cyan hover:scale-105'
                      )}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                    </button>
                  </div>
                  <div className="font-display font-mono text-2xl text-moon-white tabular-nums">
                    {formatTime(currentTime)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <Volume2 className="w-4 h-4 text-moon-dim" />
                    <span className="text-sm text-moon-dim w-10">BPM</span>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(Number(e.target.value) || 120)}
                      className="w-14 bg-transparent text-moon-white font-mono text-sm focus:outline-none"
                      min={40}
                      max={240}
                    />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <button
                      onClick={() => { setZoom((z) => Math.max(0.5, z - 0.25)); triggerVibration(10); }}
                      className="p-1.5 rounded hover:bg-white/10 text-moon-dim hover:text-moon-white transition-colors"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-moon-dim w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                    <button
                      onClick={() => { setZoom((z) => Math.min(4, z + 0.25)); triggerVibration(10); }}
                      className="p-1.5 rounded hover:bg-white/10 text-moon-dim hover:text-moon-white transition-colors"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <WaveformVisualizer
                sequence={vibrationSequence}
                isPlaying={isPlaying}
                currentTime={currentTime}
                height={70}
                color="#00F5FF"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-moon-white flex items-center gap-2">
                  <Waves className="w-5 h-5 text-neon-cyan" />
                  多轨道时间轴
                </h3>
                <div className="text-sm text-moon-dim">
                  {notes.length} 音符 · {particles.length} 粒子
                </div>
              </div>

              <div className="flex">
                <div className="w-16 shrink-0 space-y-1 pr-2">
                  {TRACK_COLORS.map((track, i) => (
                    <div
                      key={i}
                      className="h-14 flex items-center justify-end pr-2"
                    >
                      <div className={cn('w-3 h-3 rounded-full', track.bg, track.shadow)} />
                    </div>
                  ))}
                </div>

                <div className="flex-1 overflow-x-auto">
                  <div
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                    className="relative select-none"
                    style={{ width: TOTAL_DURATION * pixelsPerMs, minWidth: '100%' }}
                  >
                    <div className="h-6 border-b border-white/10 relative">
                      {Array.from({ length: Math.ceil(TOTAL_DURATION / 1000) + 1 }, (_, i) => i * 1000).map((t) => (
                        <div
                          key={t}
                          className="absolute top-0 bottom-0 border-l border-white/10"
                          style={{ left: t * pixelsPerMs }}
                        >
                          <span className="absolute top-0.5 left-1 text-xs text-moon-dim font-mono">
                            {Math.floor(t / 1000)}s
                          </span>
                        </div>
                      ))}
                    </div>

                    {TRACK_COLORS.map((track, laneIndex) => (
                      <div
                        key={laneIndex}
                        className={cn(
                          'h-14 border-b border-white/5 relative group/track',
                          laneIndex % 2 === 0 ? 'bg-white/[0.02]' : ''
                        )}
                      >
                        <button
                          onClick={() => handleAddNote(laneIndex)}
                          className="absolute inset-0 opacity-0 group-hover/track:opacity-100 flex items-center justify-center transition-opacity pointer-events-auto"
                        >
                          <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm flex items-center gap-1 text-xs text-moon-dim">
                            <Plus className="w-3 h-3" /> 点击添加音符
                          </div>
                        </button>

                        {notes
                          .filter((n) => n.lane === laneIndex)
                          .map((note) => (
                            <motion.div
                              key={note.id}
                              layout
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              onMouseDown={(e) => handleNoteMouseDown(e, note)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNoteId(note.id);
                                triggerVibration(10);
                              }}
                              className={cn(
                                'absolute top-2 bottom-2 rounded-lg cursor-grab active:cursor-grabbing flex items-center gap-1 px-2',
                                selectedNoteId === note.id
                                  ? 'ring-2 ring-white ring-offset-2 ring-offset-deep-ocean'
                                  : '',
                                'hover:brightness-125 transition-all'
                              )}
                              style={{
                                left: note.time * pixelsPerMs,
                                width: (note.duration || 200) * pixelsPerMs,
                                backgroundColor: note.color,
                                boxShadow: `0 0 8px ${note.color}60`,
                                minWidth: 20,
                              }}
                            >
                              <GripVertical className="w-3 h-3 text-ocean-dark/70 shrink-0" />
                              {note.type !== 'tap' && (
                                <span className="text-[10px] font-bold text-ocean-dark truncate">
                                  {note.type.toUpperCase()}
                                </span>
                              )}
                              {selectedNoteId === note.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNote(note.id);
                                  }}
                                  className="ml-auto p-0.5 rounded bg-black/30 hover:bg-red-500 text-ocean-dark hover:text-white transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </motion.div>
                          ))}
                      </div>
                    ))}

                    {isPlaying && (
                      <motion.div
                        className="absolute top-0 bottom-0 w-0.5 bg-neon-pink pointer-events-none z-20"
                        style={{
                          left: currentTime * pixelsPerMs,
                          boxShadow: '0 0 10px #FF00E5',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-card p-4"
            >
              <h3 className="font-display font-bold text-moon-white mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-electric-purple" />
                视觉预览
              </h3>
              <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-b from-ocean-dark to-deep-ocean border border-white/10">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute inset-0 flex justify-around">
                  {TRACK_COLORS.map((track, i) => (
                    <div
                      key={i}
                      className="w-px h-full"
                      style={{ backgroundColor: `${track.color}20` }}
                    />
                  ))}
                </div>
                {notes
                  .filter((n) => Math.abs(n.time - currentTime) < 3000)
                  .map((note) => {
                    const progress = (currentTime - note.time) / (note.duration || 200);
                    if (progress < -0.2 || progress > 1.2) return null;
                    const y = 10 + (1 - Math.max(0, Math.min(1, progress + 0.2)) / 1.2) * 80;
                    const x = 12.5 + note.lane * 25;
                    return (
                      <motion.div
                        key={note.id}
                        className="absolute w-10 h-10 rounded-xl -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          backgroundColor: note.color,
                          boxShadow: `0 0 20px ${note.color}`,
                          opacity: progress >= 0 && progress <= 1 ? 1 : 0.4,
                          scale: progress >= 0 && progress <= 1 ? 1.2 : 1,
                        }}
                      />
                    );
                  })}
                {particles
                  .filter((p) => Math.abs(p.triggerTime - currentTime) < p.duration)
                  .map((p) => {
                    const progress = (currentTime - p.triggerTime) / p.duration;
                    if (progress < 0 || progress > 1) return null;
                    return (
                      <motion.div
                        key={p.id}
                        className="absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2"
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 1 + progress * 2, opacity: 1 - progress }}
                        style={{
                          left: `${p.position.x}%`,
                          top: `${p.position.y}%`,
                          border: `2px solid ${p.color}`,
                          boxShadow: `0 0 20px ${p.color}`,
                        }}
                      />
                    );
                  })}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="glass-card p-1 flex">
              {([
                { key: 'vibration', label: '震动', icon: Waves },
                { key: 'particle', label: '粒子', icon: Sparkles },
                { key: 'theme', label: '主题', icon: Palette },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActivePanel(tab.key); triggerVibration(15); }}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all',
                    activePanel === tab.key
                      ? 'bg-white/10 text-moon-white'
                      : 'text-moon-dim hover:text-moon-white'
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activePanel === 'vibration' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <Waves className="w-5 h-5 text-neon-cyan" />
                  <h3 className="font-display font-bold text-moon-white">震动配置</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-moon-dim">震动强度</label>
                    <span className="text-sm font-mono text-neon-cyan tabular-nums">
                      {Math.round(vibrationConfig.intensity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={vibrationConfig.intensity}
                    onChange={(e) => setVibrationConfig((c) => ({ ...c, intensity: Number(e.target.value) }))}
                    className="w-full accent-neon-cyan"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-moon-dim block">频率</label>
                  <div className="grid grid-cols-3 gap-2">
                    {FREQUENCIES.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => {
                          setVibrationConfig((c) => ({ ...c, frequency: f.value }));
                          triggerVibration(20);
                        }}
                        className={cn(
                          'py-2 rounded-lg text-sm font-medium transition-all',
                          vibrationConfig.frequency === f.value
                            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                            : 'bg-white/5 text-moon-dim border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-moon-dim block">波形</label>
                  <div className="grid grid-cols-3 gap-2">
                    {WAVEFORMS.map((w) => (
                      <button
                        key={w.value}
                        onClick={() => {
                          setVibrationConfig((c) => ({ ...c, waveform: w.value }));
                          triggerVibration(20);
                        }}
                        className={cn(
                          'py-3 rounded-lg text-sm font-medium transition-all flex flex-col items-center gap-1',
                          vibrationConfig.waveform === w.value
                            ? 'bg-electric-purple/20 text-electric-purple border border-electric-purple/50'
                            : 'bg-white/5 text-moon-dim border border-white/10 hover:bg-white/10'
                        )}
                      >
                        <span className="text-lg font-mono">{w.icon}</span>
                        <span className="text-xs">{w.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => playVibrationSequence(vibrationSequence, vibrationConfig.intensity)}
                  className="w-full btn-neon-orange py-2.5 flex items-center justify-center gap-2"
                >
                  <Volume2 className="w-4 h-4" /> 测试震动
                </button>
              </motion.div>
            )}

            {activePanel === 'particle' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-vibrant-orange" />
                    <h3 className="font-display font-bold text-moon-white">粒子效果</h3>
                  </div>
                  <button
                    onClick={handleAddParticle}
                    className="p-2 rounded-lg bg-vibrant-orange/20 text-vibrant-orange hover:bg-vibrant-orange/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-moon-dim block">粒子类型</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PARTICLE_TYPES.map((pt) => (
                      <button
                        key={pt.value}
                        onClick={() => {
                          setParticleConfig((c) => ({ ...c, type: pt.value }));
                          triggerVibration(15);
                        }}
                        className={cn(
                          'py-2 rounded-lg text-sm font-medium transition-all',
                          particleConfig.type === pt.value
                            ? 'bg-vibrant-orange/20 text-vibrant-orange border border-vibrant-orange/50'
                            : 'bg-white/5 text-moon-dim border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-moon-dim">颜色</label>
                  </div>
                  <div className="flex gap-2">
                    {TRACK_COLORS.map((t) => (
                      <button
                        key={t.color}
                        onClick={() => {
                          setParticleConfig((c) => ({ ...c, color: t.color }));
                          triggerVibration(10);
                        }}
                        className={cn(
                          'w-10 h-10 rounded-lg transition-all',
                          particleConfig.color === t.color ? 'ring-2 ring-white ring-offset-2 ring-offset-deep-ocean scale-110' : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: t.color, boxShadow: `0 0 10px ${t.color}` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-moon-dim">持续时间</label>
                    <span className="text-sm font-mono text-vibrant-orange tabular-nums">
                      {particleConfig.duration}ms
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={50}
                    value={particleConfig.duration}
                    onChange={(e) => setParticleConfig((c) => ({ ...c, duration: Number(e.target.value) }))}
                    className="w-full accent-vibrant-orange"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-moon-dim">粒子密度</label>
                    <span className="text-sm font-mono text-vibrant-orange tabular-nums">
                      {particleConfig.density.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.2}
                    max={2}
                    step={0.1}
                    value={particleConfig.density}
                    onChange={(e) => setParticleConfig((c) => ({ ...c, density: Number(e.target.value) }))}
                    className="w-full accent-vibrant-orange"
                  />
                </div>

                {particles.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="text-sm text-moon-dim">已添加粒子 ({particles.length})</label>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {particles.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedParticleId(p.id);
                            setCurrentTime(p.triggerTime);
                            triggerVibration(10);
                          }}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                            selectedParticleId === p.id
                              ? 'bg-white/10'
                              : 'bg-white/5 hover:bg-white/10'
                          )}
                        >
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className="text-sm text-moon-white flex-1">{p.type}</span>
                          <span className="text-xs text-moon-dim font-mono">
                            {formatTime(p.triggerTime)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteParticle(p.id);
                            }}
                            className="p-1 rounded hover:bg-red-500/50 text-moon-dim hover:text-white transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activePanel === 'theme' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5 space-y-5"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-electric-purple" />
                  <h3 className="font-display font-bold text-moon-white">视觉主题</h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t);
                        triggerVibration(20);
                      }}
                      className={cn(
                        'relative overflow-hidden rounded-xl p-4 text-left transition-all border-2',
                        theme.id === t.id
                          ? 'border-white/50'
                          : 'border-white/10 hover:border-white/30'
                      )}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${t.bg}`} />
                      <div className="relative">
                        <div className="flex gap-1 mb-3">
                          {t.colors.map((c) => (
                            <div
                              key={c}
                              className="w-5 h-5 rounded-full"
                              style={{ backgroundColor: c, boxShadow: `0 0 6px ${c}` }}
                            />
                          ))}
                        </div>
                        <div className="font-display font-semibold text-moon-white text-sm">
                          {t.name}
                        </div>
                      </div>
                      {theme.id === t.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center">
                          <Check className="w-4 h-4 text-ocean-dark" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {selectedNote && (
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <h4 className="font-display font-bold text-moon-white text-sm">选中音符属性</h4>
                    <div className="space-y-2">
                      <label className="text-sm text-moon-dim block">音符类型</label>
                      <div className="grid grid-cols-2 gap-2">
                        {NOTE_TYPES.map((nt) => (
                          <button
                            key={nt.value}
                            onClick={() => {
                              setNotes((prev) =>
                                prev.map((n) =>
                                  n.id === selectedNote.id
                                    ? {
                                        ...n,
                                        type: nt.value,
                                        duration: nt.value === 'hold' ? 1000 : undefined,
                                      }
                                    : n
                                )
                              );
                              triggerVibration(15);
                            }}
                            className={cn(
                              'py-2 rounded-lg text-sm font-medium transition-all',
                              selectedNote.type === nt.value
                                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50'
                                : 'bg-white/5 text-moon-dim border border-white/10 hover:bg-white/10'
                            )}
                          >
                            {nt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedNote.type === 'hold' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-moon-dim">持续时间</label>
                          <span className="text-sm font-mono text-neon-cyan tabular-nums">
                            {selectedNote.duration || 1000}ms
                          </span>
                        </div>
                        <input
                          type="range"
                          min={200}
                          max={4000}
                          step={100}
                          value={selectedNote.duration || 1000}
                          onChange={(e) =>
                            setNotes((prev) =>
                              prev.map((n) =>
                                n.id === selectedNote.id
                                  ? { ...n, duration: Number(e.target.value) }
                                  : n
                              )
                            )
                          }
                          className="w-full accent-neon-cyan"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm text-moon-dim">时间位置</label>
                        <span className="text-sm font-mono text-neon-cyan tabular-nums">
                          {formatTime(selectedNote.time)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={TOTAL_DURATION}
                        step={50}
                        value={selectedNote.time}
                        onChange={(e) =>
                          setNotes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNote.id
                                ? { ...n, time: Number(e.target.value) }
                                : n
                            )
                          )
                        }
                        className="w-full accent-neon-cyan"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteNote(selectedNote.id)}
                      className="w-full py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> 删除音符
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-5 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-moon-dim" />
                <h3 className="font-display font-bold text-moon-white">作品信息</h3>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-moon-dim block">描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="为你的作品添加描述..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-moon-white placeholder-moon-dim focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 resize-none"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
