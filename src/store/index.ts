import { create } from 'zustand';
import type { User, Level, Chart, MVWork, GameState, UserSettings, HitResult, VibrationSequence, VisualChart } from '../types';
import { mockUser, mockLevels, mockCharts, mockMVWorks } from '../data/mockData';

interface AppStore {
  user: User | null;
  levels: Level[];
  charts: Chart[];
  mvWorks: MVWork[];
  currentLevel: Level | null;
  currentChart: Chart | null;
  gameState: GameState;
  favorites: string[];

  setUser: (user: User | null) => void;
  setCurrentLevel: (level: Level | null) => void;
  setCurrentChart: (chart: Chart | null) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  toggleFavorite: (chartId: string) => void;

  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  updateGameTime: (time: number) => void;
  registerHit: (result: HitResult) => void;
  resetGameState: () => void;

  saveChart: (chart: Omit<Chart, 'id' | 'user' | 'createdAt' | 'playCount' | 'likes'> & { id?: string }) => Chart;
  publishChart: (chart: Omit<Chart, 'id' | 'user' | 'createdAt' | 'playCount' | 'likes'>) => Chart;
  
  addMVWork: (work: Omit<MVWork, 'id' | 'user' | 'createdAt' | 'likes' | 'rating' | 'ratingCount'>) => MVWork;
}

const initialGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  hitCount: {
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
  },
};

export const useAppStore = create<AppStore>((set, get) => ({
  user: mockUser,
  levels: mockLevels,
  charts: mockCharts,
  mvWorks: mockMVWorks,
  currentLevel: null,
  currentChart: null,
  gameState: initialGameState,
  favorites: ['chart-001', 'chart-003'],

  setUser: (user) => set({ user }),
  setCurrentLevel: (level) => set({ currentLevel: level }),
  setCurrentChart: (chart) => set({ currentChart: chart }),

  updateSettings: (settings) =>
    set((state) => ({
      user: state.user ? { ...state.user, settings: { ...state.user.settings, ...settings } } : null,
    })),

  toggleFavorite: (chartId) =>
    set((state) => ({
      favorites: state.favorites.includes(chartId)
        ? state.favorites.filter((id) => id !== chartId)
        : [...state.favorites, chartId],
    })),

  startGame: () =>
    set({
      gameState: { ...initialGameState, isPlaying: true },
    }),

  pauseGame: () =>
    set((state) => ({
      gameState: { ...state.gameState, isPaused: true },
    })),

  resumeGame: () =>
    set((state) => ({
      gameState: { ...state.gameState, isPaused: false },
    })),

  endGame: () =>
    set((state) => ({
      gameState: { ...state.gameState, isPlaying: false, isPaused: false },
    })),

  updateGameTime: (time) =>
    set((state) => ({
      gameState: { ...state.gameState, currentTime: time },
    })),

  registerHit: (result) =>
    set((state) => {
      const newCombo = result.type === 'miss' ? 0 : state.gameState.combo + 1;
      return {
        gameState: {
          ...state.gameState,
          score: state.gameState.score + result.score * (1 + newCombo * 0.01),
          combo: newCombo,
          maxCombo: Math.max(state.gameState.maxCombo, newCombo),
          hitCount: {
            ...state.gameState.hitCount,
            [result.type]: state.gameState.hitCount[result.type] + 1,
          },
        },
      };
    }),

  resetGameState: () => set({ gameState: initialGameState }),

  saveChart: (chartData) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('用户未登录');

    if (chartData.id) {
      const updatedCharts = state.charts.map((c) =>
        c.id === chartData.id ? { ...c, ...chartData } : c
      );
      set({ charts: updatedCharts });
      return updatedCharts.find((c) => c.id === chartData.id)!;
    }

    const newChart: Chart = {
      ...chartData,
      id: `chart-${Date.now()}`,
      user,
      playCount: 0,
      likes: 0,
      createdAt: new Date(),
    };
    set({ charts: [newChart, ...state.charts] });
    return newChart;
  },

  publishChart: (chartData) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('用户未登录');

    const newChart: Chart = {
      ...chartData,
      id: `chart-${Date.now()}`,
      user,
      playCount: 0,
      likes: 0,
      createdAt: new Date(),
    };
    set({ charts: [newChart, ...state.charts] });
    return newChart;
  },

  addMVWork: (workData) => {
    const state = get();
    const user = state.user;
    if (!user) throw new Error('用户未登录');

    const newWork: MVWork = {
      ...workData,
      id: `mv-${Date.now()}`,
      user,
      likes: 0,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
    };
    set({ mvWorks: [newWork, ...state.mvWorks] });
    return newWork;
  },
}));
