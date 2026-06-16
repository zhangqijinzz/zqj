import type { User, Song, Level, Chart, MVWork, VibrationSequence, VisualChart } from '../types';

export const mockUser: User = {
  id: 'user-001',
  username: '光之舞者',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=rhythm',
  bio: '用视觉感受节奏，用震动体验音乐 🎵',
  experience: 12580,
  badges: ['新手创作者', '连击大师', '社区新星'],
  settings: {
    vibrationIntensity: 0.8,
    brightness: 1.0,
    colorTheme: 'cyberpunk',
    sensitivity: 0.7,
    particleDensity: 1.0,
  },
  createdAt: new Date('2024-01-15'),
};

const createVibrationPattern = (bpm: number, duration: number): VibrationSequence => {
  const beatsPerSecond = bpm / 60;
  const beats: VibrationSequence['beats'] = [];
  const totalBeats = Math.floor(duration * beatsPerSecond);

  for (let i = 0; i < totalBeats; i++) {
    const time = (i / beatsPerSecond) * 1000;
    const isStrong = i % 4 === 0;
    beats.push({
      time,
      duration: isStrong ? 120 : 60,
      intensity: isStrong ? 1.0 : 0.6,
      frequency: isStrong ? 'low' : 'mid',
      waveform: isStrong ? 'square' : 'sine',
    });
    if (i % 2 === 1 && Math.random() > 0.5) {
      beats.push({
        time: time + 250,
        duration: 40,
        intensity: 0.4,
        frequency: 'high',
        waveform: 'sine',
      });
    }
  }

  return {
    version: '1.0',
    bpm,
    beats,
    totalDuration: duration * 1000,
  };
};

const createVisualChart = (bpm: number, duration: number): VisualChart => {
  const beatsPerSecond = bpm / 60;
  const notes: VisualChart['notes'] = [];
  const particles: VisualChart['particles'] = [];
  const colors = ['#00F5FF', '#A855F7', '#FF6B35', '#FF00E5', '#39FF14'];
  const totalBeats = Math.floor(duration * beatsPerSecond);

  for (let i = 0; i < totalBeats; i++) {
    const time = (i / beatsPerSecond) * 1000;
    const lane = i % 4;
    const color = colors[lane];
    const isHold = i % 8 === 3;

    notes.push({
      time,
      lane,
      type: isHold ? 'hold' : 'tap',
      color,
      duration: isHold ? 500 : undefined,
    });

    if (i % 4 === 0) {
      particles.push({
        triggerTime: time,
        type: 'explosion',
        color,
        position: { x: 25 + lane * 25, y: 80 },
        duration: 600,
      });
    }
  }

  return {
    version: '1.0',
    bpm,
    notes,
    particles,
    backgroundTheme: 'cyberpunk',
    totalDuration: duration * 1000,
  };
};

export const mockSongs: Song[] = [
  {
    id: 'song-001',
    title: '霓虹脉冲',
    artist: 'Cyber Wave',
    bpm: 128,
    duration: 180,
    lyrics: '在数字的海洋中遨游\n感受每一个节拍的震动\n光与影交织的夜晚\n我们用视觉聆听...',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20neon%20city%20night%20synthwave%20purple%20cyan%20music%20album%20cover&image_size=square',
    signLanguageVideo: '#demo',
    genre: 'electronic',
  },
  {
    id: 'song-002',
    title: '光之交响',
    artist: 'Vision Orchestra',
    bpm: 96,
    duration: 240,
    lyrics: '当光线穿过棱镜\n七彩的旋律在空中飘荡\n每一个音符都是色彩\n每一段旋律都是画面...',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ethereal%20light%20prism%20orchestra%20colorful%20music%20abstract%20art&image_size=square',
    signLanguageVideo: '#demo',
    genre: 'classical',
  },
  {
    id: 'song-003',
    title: '震动脉冲',
    artist: 'Bass Master',
    bpm: 140,
    duration: 200,
    lyrics: '感受地面的震动\n血液随着节拍跳动\n这是属于我们的节奏\n不需要耳朵去聆听...',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=powerful%20bass%20vibration%20sound%20waves%20orange%20red%20energy%20music&image_size=square',
    signLanguageVideo: '#demo',
    genre: 'rock',
  },
  {
    id: 'song-004',
    title: '星河漫步',
    artist: 'Dream Walker',
    bpm: 110,
    duration: 220,
    lyrics: '在银河中漫步\n每颗星星都是一个音符\n宇宙的旋律无声却壮美\n我们用心去感受...',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dreamy%20galaxy%20stars%20space%20walk%20pastel%20purple%20blue%20ethereal&image_size=square',
    signLanguageVideo: '#demo',
    genre: 'pop',
  },
  {
    id: 'song-005',
    title: '爵士光影',
    artist: 'Smooth Trio',
    bpm: 88,
    duration: 260,
    lyrics: '昏暗的灯光下\n萨克斯的光影在流动\n咖啡的香气与旋律交织\n这是无声的浪漫...',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=jazz%20club%20saxophone%20warm%20light%20shadow%20coffee%20atmosphere&image_size=square',
    signLanguageVideo: '#demo',
    genre: 'jazz',
  },
];

export const mockLevels: Level[] = mockSongs.map((song, index) => ({
  id: `level-${String(index + 1).padStart(3, '0')}`,
  title: song.title,
  songId: song.id,
  song,
  difficulty: (['easy', 'normal', 'hard', 'expert', 'normal'] as const)[index],
  genre: song.genre,
  coverImage: song.coverImage,
  vibrationPattern: createVibrationPattern(song.bpm, song.duration),
  visualChart: createVisualChart(song.bpm, song.duration),
  playCount: Math.floor(Math.random() * 10000) + 1000,
  likes: Math.floor(Math.random() * 5000) + 500,
}));

export const mockCharts: Chart[] = [
  {
    id: 'chart-001',
    title: '极光之舞',
    userId: 'user-002',
    user: {
      ...mockUser,
      id: 'user-002',
      username: '极光创作者',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=aurora',
    },
    description: '灵感来自北极光，用渐变色彩模拟极光流动，配合舒缓的震动节奏。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aurora%20borealis%20northern%20lights%20green%20purple%20dance%20night%20sky&image_size=square',
    vibrationData: createVibrationPattern(100, 180),
    visualData: createVisualChart(100, 180),
    difficulty: 'normal',
    playCount: 3420,
    likes: 892,
    tags: ['极光', '舒缓', '治愈'],
    createdAt: new Date('2024-06-10'),
  },
  {
    id: 'chart-002',
    title: '闪电风暴',
    userId: 'user-003',
    user: {
      ...mockUser,
      id: 'user-003',
      username: '雷霆之锤',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=thunder',
    },
    description: '高难度快节奏谱面，闪电般的视觉效果配合强力震动，挑战你的极限！',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lightning%20storm%20thunder%20electric%20blue%20purple%20dramatic%20power&image_size=square',
    vibrationData: createVibrationPattern(160, 200),
    visualData: createVisualChart(160, 200),
    difficulty: 'expert',
    playCount: 1580,
    likes: 634,
    tags: ['高难度', '快节奏', '挑战'],
    createdAt: new Date('2024-06-12'),
  },
  {
    id: 'chart-003',
    title: '樱花飘落',
    userId: 'user-004',
    user: {
      ...mockUser,
      id: 'user-004',
      username: '樱之诗人',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sakura',
    },
    description: '春日樱花漫天飞舞，柔美而富有诗意的视觉谱面，适合入门玩家。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cherry%20blossom%20sakura%20falling%20petals%20pink%20spring%20japanese%20aesthetic&image_size=square',
    vibrationData: createVibrationPattern(85, 210),
    visualData: createVisualChart(85, 210),
    difficulty: 'easy',
    playCount: 5670,
    likes: 1203,
    tags: ['樱花', '入门', '诗意'],
    createdAt: new Date('2024-06-08'),
  },
  {
    id: 'chart-004',
    title: '机械纪元',
    userId: 'user-005',
    user: {
      ...mockUser,
      id: 'user-005',
      username: '机械之心',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=mecha',
    },
    description: '赛博朋克风格的机械节奏，工业感十足的震动序列，硬核玩家推荐。',
    coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mecha%20robot%20cyberpunk%20industrial%20gear%20metal%20neon%20futuristic&image_size=square',
    vibrationData: createVibrationPattern(135, 190),
    visualData: createVisualChart(135, 190),
    difficulty: 'hard',
    playCount: 2890,
    likes: 756,
    tags: ['机械', '赛博朋克', '硬核'],
    createdAt: new Date('2024-06-15'),
  },
];

export const mockMVWorks: MVWork[] = [
  {
    id: 'mv-001',
    userId: 'user-006',
    user: {
      ...mockUser,
      id: 'user-006',
      username: '手语艺术家',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=signer',
    },
    songId: 'song-001',
    song: mockSongs[0],
    title: '霓虹脉冲 - 手语演绎',
    videoUrl: '#demo',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sign%20language%20performer%20neon%20lights%20cyberpunk%20artistic%20portrait&image_size=landscape_16_9',
    likes: 1245,
    rating: 4.8,
    ratingCount: 156,
    createdAt: new Date('2024-06-14'),
  },
  {
    id: 'mv-002',
    userId: 'user-007',
    user: {
      ...mockUser,
      id: 'user-007',
      username: '光之舞者',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dancer',
    },
    songId: 'song-004',
    song: mockSongs[3],
    title: '星河漫步 - 梦幻手语',
    videoUrl: '#demo',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sign%20language%20dance%20starry%20sky%20dreamy%20galaxy%20elegant&image_size=landscape_16_9',
    likes: 892,
    rating: 4.9,
    ratingCount: 98,
    createdAt: new Date('2024-06-13'),
  },
  {
    id: 'mv-003',
    userId: 'user-008',
    user: {
      ...mockUser,
      id: 'user-008',
      username: '节奏诗人',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=poet',
    },
    songId: 'song-002',
    song: mockSongs[1],
    title: '光之交响 - 诗意演绎',
    videoUrl: '#demo',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sign%20language%20orchestra%20light%20prism%20colorful%20artistic%20elegant&image_size=landscape_16_9',
    likes: 678,
    rating: 4.7,
    ratingCount: 76,
    createdAt: new Date('2024-06-11'),
  },
];
