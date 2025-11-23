
import { Video, Mission, User, WithdrawalRequest, AppSettings, Transaction } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com', avatarUrl: 'https://picsum.photos/seed/u1/100', balance: 1250.50, favorites: ['v3'], status: 'active' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100', balance: 50.25, favorites: [], status: 'active' },
  { id: 'u3', name: 'Charlie', email: 'charlie@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100', balance: 0.00, favorites: [], status: 'banned' },
  { id: 'u4', name: 'Diana', email: 'diana@example.com', avatarUrl: 'https://picsum.photos/seed/u4/100', balance: 532.10, favorites: ['v3'], status: 'active' },
];

const vimeoUrls = [
  'https://vimeo.com/1138716552', 'https://vimeo.com/1138716587', 'https://vimeo.com/1138603742',
  'https://vimeo.com/1138613578', 'https://vimeo.com/1138613622', 'https://vimeo.com/1138613773',
  'https://vimeo.com/1138613657', 'https://vimeo.com/1138613690', 'https://vimeo.com/1138613740',
  'https://vimeo.com/1138716725', 'https://vimeo.com/1138716746', 'https://vimeo.com/1138716787',
  'https://vimeo.com/1138716814', 'https://vimeo.com/1138716886', 'https://vimeo.com/1138716968',
  'https://vimeo.com/1138716993', 'https://vimeo.com/1138717011', 'https://vimeo.com/1138717045',
  'https://vimeo.com/1138717076', 'https://vimeo.com/1138717128', 'https://vimeo.com/1138716854',
  'https://vimeo.com/1138717205', 'https://vimeo.com/1138717250', 'https://vimeo.com/1138717357',
  'https://vimeo.com/1138716937', 'https://vimeo.com/1138717392', 'https://vimeo.com/1138717444',
  'https://vimeo.com/1138717486', 'https://vimeo.com/1138717518', 'https://vimeo.com/1138717544'
];

export const INITIAL_VIDEOS: Video[] = vimeoUrls.map((url, index) => ({
  id: `v-${Date.now() + index}`,
  url,
  title: `Vimeo Video ${index + 1}`,
  channel: 'Vimeo Creator',
  thumbnailUrl: `https://picsum.photos/seed/vimeo${index}/400/800`,
  duration: 'N/A',
  type: 'video',
  status: 'active',
}));


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
  appName: 'CASH VIRAL',
  logoUrl: '/logo.png',
  geminiApiKey: '••••••••••••••••••••',
  youtubeApiKey: '••••••••••••••••••••',
  minWithdrawal: 10.00,
  maxDailyWithdrawalUser: 500.00,
  maxDailyWithdrawalTotal: 10000.00,
  rewardPerVideo: 0.10,
  minWatchTime: 10,
  isAdsEnabled: false,
  adsenseClientId: '',
  adSlots: {
    inFeed: '',
    profileBanner: '',
    earnBanner: '',
  },
  adFrequencyInFeed: 10,
};