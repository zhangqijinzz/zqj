import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Mic,
  Square,
  RotateCcw,
  Upload,
  ArrowLeft,
  Eye,
  Hand,
  Video,
  Clock,
  Star,
  Check,
} from 'lucide-react';
import { useAppStore } from '../store';
import { triggerVibration } from '../utils/vibration';
import { cn } from '../lib/utils';

type RecordState = 'idle' | 'recording' | 'paused' | 'preview' | 'submitting';

export default function SignLanguageRecordPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentLevel = useAppStore((state) => state.currentLevel);
  const levels = useAppStore((state) => state.levels);
  const addMVWork = useAppStore((state) => state.addMVWork);
  
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [recordedTime, setRecordedTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  
  const recordTimerRef = useRef<number>();
  const playTimerRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const level = currentLevel || levels.find((l) => l.id === id) || levels[0];
  const totalDuration = level ? level.song.duration * 1000 : 0;

  const lyrics = useMemo(() => {
    if (!level) return [];
    return level.song.lyrics.split('\n').filter(Boolean).map((line, index) => ({
      id: index,
      text: line,
      startTime: index * 8000,
      endTime: (index + 1) * 8000,
    }));
  }, [level]);

  const currentLyricIndex = useMemo(() => {
    return lyrics.findIndex(
      (line) => currentTime >= line.startTime && currentTime < line.endTime
    );
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (recordState === 'recording') {
      startTimeRef.current = performance.now() - pausedTimeRef.current;
      recordTimerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTimeRef.current;
        setRecordedTime(elapsed);
        setCurrentTime(elapsed);
        
        if (elapsed >= totalDuration) {
          setRecordState('preview');
          setRecordedTime(totalDuration);
          setCurrentTime(totalDuration);
          triggerVibration([50, 100, 50]);
        }
      }, 100);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
      if (recordState === 'paused') {
        pausedTimeRef.current = performance.now() - startTimeRef.current;
      }
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [recordState, totalDuration]);

  useEffect(() => {
    if (isPlaying && recordState === 'preview') {
      const startTime = performance.now() - currentTime;
      playTimerRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startTime;
        if (elapsed >= recordedTime) {
          setIsPlaying(false);
          setCurrentTime(recordedTime);
        } else {
          setCurrentTime(elapsed);
        }
      }, 100);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, recordState, recordedTime, currentTime]);

  const handleStartRecord = () => {
    triggerVibration([30, 50, 30]);
    setRecordState('recording');
    setRecordedTime(0);
    setCurrentTime(0);
    pausedTimeRef.current = 0;
  };

  const handlePauseRecord = () => {
    triggerVibration(20);
    setRecordState('paused');
  };

  const handleResumeRecord = () => {
    triggerVibration(20);
    setRecordState('recording');
  };

  const handleStopRecord = () => {
    triggerVibration([20, 30, 20]);
    setRecordState('preview');
  };

  const handleReset = () => {
    triggerVibration(20);
    setRecordState('idle');
    setRecordedTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    pausedTimeRef.current = 0;
  };

  const handlePreviewToggle = () => {
    triggerVibration(15);
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = () => {
    if (!level) return;
    triggerVibration([30, 50, 30, 50, 30]);
    setRecordState('submitting');
    
    setTimeout(() => {
      try {
        addMVWork({
          userId: '',
          songId: level.id,
          song: level.song,
          title: videoTitle || `我的${level.title}手语演绎`,
          videoUrl: `recorded-${Date.now()}.webm`,
          thumbnail: `https://picsum.photos/seed/${encodeURIComponent(level.title + Date.now())}/320/180`,
        });
        setShowSubmitSuccess(true);
        setRecordState('preview');
        setTimeout(() => {
          navigate('/signlanguage');
        }, 2000);
      } catch (error) {
        console.error('提交失败:', error);
        setRecordState('preview');
      }
    }, 1500);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const msec = Math.floor((ms % 1000) / 10);
    return `${mins}:${String(secs).padStart(2, '0')}.${String(msec).padStart(2, '0')}`;
  };

  const progress = recordState === 'preview' 
    ? (currentTime / recordedTime) * 100 
    : (recordedTime / totalDuration) * 100;

  if (!level) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <Hand className="w-16 h-16 text-moon-dim mx-auto mb-4" />
          <p className="text-moon-dim text-lg">请先从歌曲库选择一首歌曲</p>
          <button
            onClick={() => navigate('/signlanguage')}
            className="mt-4 px-6 py-2 rounded-xl bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-display font-semibold"
          >
            返回歌曲库
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate('/signlanguage')}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-moon-dim hover:text-neon-cyan hover:border-neon-cyan/50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-gradient">
              录制手语演绎
            </h1>
            <p className="text-sm text-moon-dim">{level.title} · {level.song.artist}</p>
          </div>
          {recordState === 'recording' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-display font-semibold text-sm">录制中</span>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-deep-ocean via-electric-purple/10 to-neon-pink/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  {recordState === 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-pink/30 to-vibrant-orange/30 flex items-center justify-center">
                        <Video className="w-12 h-12 text-neon-pink" />
                      </div>
                      <p className="text-moon-white font-display font-semibold mb-2">准备开始录制</p>
                      <p className="text-moon-dim text-sm">点击下方按钮开始你的手语演绎</p>
                    </motion.div>
                  )}

                  {(recordState === 'recording' || recordState === 'paused') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={recordState === 'recording' ? {
                            scale: [1, 1.05, 1],
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-9xl mb-6"
                        >
                          🧑‍🎤
                        </motion.div>
                        <div className="flex justify-center gap-8">
                          {['👐', '✋', '🤚', '🖐️'].map((emoji, i) => (
                            <motion.span
                              key={i}
                              animate={recordState === 'recording' ? {
                                y: [0, -15, 0],
                                rotate: [0, 10, -10, 0],
                              } : {}}
                              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                              className={cn(
                                'text-5xl transition-opacity',
                                recordState === 'paused' && 'opacity-50'
                              )}
                            >
                              {emoji}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {recordState === 'preview' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={isPlaying ? {
                            scale: [1, 1.05, 1],
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-9xl mb-6 opacity-80"
                        >
                          🎬
                        </motion.div>
                        <p className="text-moon-white font-display font-semibold mb-2">
                          {isPlaying ? '回放中...' : '录制完成'}
                        </p>
                        <p className="text-moon-dim text-sm">
                          时长: {formatTime(recordedTime)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {recordState !== 'idle' && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                    <span className="text-sm font-display font-mono text-moon-white">
                      {formatTime(recordState === 'preview' ? currentTime : recordedTime)}
                    </span>
                  </div>
                )}

                {recordState === 'recording' && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/30 backdrop-blur-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-300 font-display">REC</span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-5 space-y-4">
              <div
                className="relative h-2 rounded-full bg-white/10 cursor-pointer group"
                onClick={(e) => {
                  if (recordState === 'preview') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    setCurrentTime(percent * recordedTime);
                  }
                }}
              >
                <motion.div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full',
                    recordState === 'recording'
                      ? 'bg-gradient-to-r from-red-500 to-neon-pink'
                      : 'bg-gradient-to-r from-neon-cyan via-electric-purple to-vibrant-orange'
                  )}
                  style={{ width: `${progress}%` }}
                />
                <motion.div
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-moon-white',
                    recordState === 'recording' ? 'shadow-neon-pink' : 'shadow-neon-cyan'
                  )}
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-moon-dim font-mono">
                  {formatTime(recordState === 'preview' ? currentTime : recordedTime)}
                </span>
                <span className="text-sm text-moon-dim font-mono">
                  {formatTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center justify-center gap-4">
                {recordState === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartRecord}
                    className="p-5 rounded-full bg-gradient-to-br from-red-500 to-neon-pink text-white shadow-lg hover:shadow-neon-purple transition-all"
                  >
                    <Mic className="w-7 h-7" />
                  </motion.button>
                )}

                {recordState === 'recording' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePauseRecord}
                      className="p-4 rounded-full bg-white/10 border border-white/20 text-moon-white hover:bg-white/20 transition-all"
                    >
                      <Pause className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleStopRecord}
                      className="p-4 rounded-full bg-gradient-to-br from-red-500 to-vibrant-orange text-white shadow-neon-orange transition-all"
                    >
                      <Square className="w-6 h-6" />
                    </motion.button>
                  </>
                )}

                {recordState === 'paused' && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleReset}
                      className="p-4 rounded-full bg-white/10 border border-white/20 text-moon-dim hover:text-moon-white hover:bg-white/20 transition-all"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleResumeRecord}
                      className="p-5 rounded-full bg-gradient-to-br from-red-500 to-neon-pink text-white shadow-neon-purple transition-all"
                    >
                      <Play className="w-7 h-7 ml-1" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleStopRecord}
                      className="p-4 rounded-full bg-gradient-to-br from-vibrant-orange to-neon-pink text-white transition-all"
                    >
                      <Square className="w-6 h-6" />
                    </motion.button>
                  </>
                )}

                {(recordState === 'preview' || recordState === 'submitting') && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleReset}
                      disabled={recordState === 'submitting'}
                      className="p-4 rounded-full bg-white/10 border border-white/20 text-moon-dim hover:text-moon-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePreviewToggle}
                      disabled={recordState === 'submitting'}
                      className="p-5 rounded-full bg-gradient-to-br from-neon-cyan via-electric-purple to-vibrant-orange text-ocean-dark shadow-neon-purple hover:shadow-neon-cyan transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSubmit}
                      disabled={recordState === 'submitting'}
                      className={cn(
                        'p-4 rounded-full transition-all',
                        recordState === 'submitting'
                          ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-br from-neon-green to-neon-cyan text-ocean-dark shadow-lg hover:shadow-neon-cyan'
                      )}
                    >
                      {recordState === 'submitting' ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-2 border-ocean-dark/30 border-t-ocean-dark rounded-full"
                        />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </motion.button>
                  </>
                )}
              </div>

              {recordState === 'preview' && !showSubmitSuccess && (
                <div className="pt-4 border-t border-white/5">
                  <label className="text-sm text-moon-dim block mb-2">作品标题</label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder={`我的${level.title}手语演绎`}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-moon-white placeholder-moon-dim focus:outline-none focus:border-neon-cyan/50 transition-all"
                  />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-moon-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-neon-cyan" />
                  歌词同步
                </h3>
                <div className="flex items-center gap-1 text-xs text-moon-dim">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(currentTime)}
                </div>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {lyrics.map((line, index) => (
                  <motion.div
                    key={line.id}
                    animate={index === currentLyricIndex ? {
                      backgroundColor: 'rgba(0, 245, 255, 0.1)',
                      borderColor: 'rgba(0, 245, 255, 0.5)',
                    } : {}}
                    className={cn(
                      'p-3 rounded-xl border transition-all duration-300',
                      index === currentLyricIndex
                        ? 'border-neon-cyan/50 bg-neon-cyan/10'
                        : 'border-white/5 bg-white/[0.02]'
                    )}
                  >
                    <p
                      className={cn(
                        'font-display transition-colors',
                        index === currentLyricIndex
                          ? 'text-neon-cyan text-lg font-semibold'
                          : index < currentLyricIndex
                          ? 'text-moon-dim/50'
                          : 'text-moon-dim'
                      )}
                    >
                      {line.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="font-display font-bold text-moon-white flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-vibrant-orange" />
                录制提示
              </h3>
              <div className="space-y-3 text-sm text-moon-dim">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-neon-cyan">1.</span>
                  <p>确保光线充足，让双手动作清晰可见</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-neon-pink">2.</span>
                  <p>跟随歌词节奏，用自然流畅的动作表达</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-electric-purple">3.</span>
                  <p>可以先观看示范视频，熟悉动作后再录制</p>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-vibrant-orange">4.</span>
                  <p>录制完成后可以预览，满意后再提交</p>
                </div>
              </div>
            </div>

            {recordState === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/signlanguage/learn/${level.id}`)}
                className="w-full glass-card p-4 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                <Video className="w-5 h-5 text-electric-purple" />
                <span className="font-display font-semibold text-moon-white">
                  先观看示范
                </span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showSubmitSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-card p-8 text-center max-w-sm mx-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center shadow-neon-cyan"
              >
                <Check className="w-10 h-10 text-ocean-dark" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-moon-white mb-2">
                提交成功！
              </h3>
              <p className="text-moon-dim mb-4">
                你的手语演绎作品已成功提交到社区
              </p>
              <p className="text-sm text-moon-dim/60">
                正在跳转到手语歌曲库...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
