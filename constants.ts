
import { Video, Mission, User, WithdrawalRequest, AppSettings, Transaction } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com', avatarUrl: 'https://picsum.photos/seed/u1/100', balance: 1250.50, favorites: ['v1', 'v3'], status: 'active' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100', balance: 50.25, favorites: ['v2'], status: 'active' },
  { id: 'u3', name: 'Charlie', email: 'charlie@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100', balance: 0.00, favorites: [], status: 'banned' },
  { id: 'u4', name: 'Diana', email: 'diana@example.com', avatarUrl: 'https://picsum.photos/seed/u4/100', balance: 532.10, favorites: ['v1','v2','v4'], status: 'active' },
];

export const INITIAL_VIDEOS: Video[] = [
  {
    id: 'v1',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Relaxing Nature Scenes',
    channel: 'NatureVibes',
    thumbnailUrl: 'https://picsum.photos/seed/v1/400/800',
    duration: '10:32',
    type: 'video',
    status: 'active',
  },
  {
    id: 'v2',
    url: 'https://www.youtube.com/watch?v=36YnV9STBqU',
    title: 'Lo-fi Beats to Study/Relax to',
    channel: 'ChillHop Music',
    thumbnailUrl: 'https://picsum.photos/seed/v2/400/800',
    duration: '1:24:15',
    type: 'video',
    status: 'active',
  },
  {
    id: 'v3',
    url: 'https://vimeo.com/253986711',
    title: 'Amazing Drone Footage',
    channel: 'DroneScapes',
    thumbnailUrl: 'https://picsum.photos/seed/v3/400/800',
    duration: '4:18',
    type: 'video',
    status: 'active',
  },
  {
    id: 'v4',
    url: 'https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10',
    title: 'Tech Gadgets 2024',
    channel: 'TechReview',
    thumbnailUrl: 'https://picsum.photos/seed/v4/400/800',
    duration: 'Playlist',
    type: 'playlist',
    status: 'active',
  }
];

export const INITIAL_MISSIONS: Mission[] = [
    {
      id: 'm1',
      title: 'Watch 5 videos',
      description: 'Finish watching 5 videos today.',
      reward: 100,
      progress: 2,
      goal: 5,
    },
    {
      id: 'm2',
      title: 'Like 3 videos',
      description: 'Add 3 videos to your favorites.',
      reward: 50,
      progress: 1,
      goal: 3,
    },
    {
      id: 'm3',
      title: 'Daily Check-in',
      description: 'Open the app to claim your daily bonus.',
      reward: 25,
      progress: 1,
      goal: 1,
    }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 't1', type: 'reward', amount: 10, description: 'Watched "Epic Fails Compilation"', timestamp: new Date() },
    { id: 't2', type: 'bonus', amount: 50, description: 'Daily Login Bonus', timestamp: new Date(Date.now() - 86400000) },
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
    { id: 'wr1', userId: 'u2', userName: 'Bob', amount: 25.00, pixKey: 'bob@pix.com', status: 'pending', requestDate: new Date(Date.now() - 3600000) },
    { id: 'wr2', userId: 'u4', userName: 'Diana', amount: 150.00, pixKey: 'diana-key', status: 'pending', requestDate: new Date(Date.now() - 7200000) },
    { id: 'wr3', userId: 'u1', userName: 'Alice', amount: 500.00, pixKey: '123.456.789-00', status: 'approved', requestDate: new Date(Date.now() - 86400000) },
    { id: 'wr4', userId: 'u2', userName: 'Bob', amount: 10.00, pixKey: 'bob@pix.com', status: 'declined', requestDate: new Date(Date.now() - 172800000) },
];

export const INITIAL_SETTINGS: AppSettings = {
  appName: 'VideoRewards AI',
  logoUrl: '/logo.png',
  geminiApiKey: '••••••••••••••••••••',
  youtubeApiKey: '••••••••••••••••••••',
  minWithdrawal: 10.00,
  maxDailyWithdrawalUser: 500.00,
  maxDailyWithdrawalTotal: 10000.00,
  rewardPerVideo: 0.10,
  minWatchTime: 10,
};
