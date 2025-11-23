

import { Video, Mission, User, WithdrawalRequest, AppSettings, Transaction, Category } from './types';

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alice', email: 'alice@example.com', avatarUrl: 'https://picsum.photos/seed/u1/100', balance: 1250.50, favorites: ['v3'], status: 'active', adminNotes: '' },
  { id: 'u2', name: 'Bob', email: 'bob@example.com', avatarUrl: 'https://picsum.photos/seed/u2/100', balance: 50.25, favorites: [], status: 'active', adminNotes: '' },
  { id: 'u3', name: 'Charlie', email: 'charlie@example.com', avatarUrl: 'https://picsum.photos/seed/u3/100', balance: 0.00, favorites: [], status: 'banned', adminNotes: 'Banned for spam.' },
  { id: 'u4', name: 'Diana', email: 'diana@example.com', avatarUrl: 'https://picsum.photos/seed/u4/100', balance: 532.10, favorites: ['v3'], status: 'active', adminNotes: '' },
];

const vimeoUrls = [
    'https://vimeo.com/1139312677', 'https://vimeo.com/1139310657', 'https://vimeo.com/1139310608', 'https://vimeo.com/1139310571', 
    'https://vimeo.com/1139310539', 'https://vimeo.com/1139310939', 'https://vimeo.com/1139310903', 'https://vimeo.com/1139310877', 
    'https://vimeo.com/1139310851', 'https://vimeo.com/1139310816', 'https://vimeo.com/1139310781', 'https://vimeo.com/1139310755', 
    'https://vimeo.com/1138716624', 'https://vimeo.com/1138716513', 'https://vimeo.com/1139310467', 'https://vimeo.com/1139310408', 
    'https://vimeo.com/1139310365', 'https://vimeo.com/1139310287', 'https://vimeo.com/1139309758', 'https://vimeo.com/1139309919', 
    'https://vimeo.com/1139310724', 'https://vimeo.com/1139312016', 'https://vimeo.com/1139311798', 'https://vimeo.com/1139311409', 
    'https://vimeo.com/1139311387', 'https://vimeo.com/1139311198', 'https://vimeo.com/1139311131', 'https://vimeo.com/1139311089', 
    'https://vimeo.com/1139311061', 'https://vimeo.com/1139310990', 'https://vimeo.com/1139310966', 'https://vimeo.com/1139310691', 
    'https://vimeo.com/1139312642', 'https://vimeo.com/1139312621', 'https://vimeo.com/1139312598', 'https://vimeo.com/1139312579', 
    'https://vimeo.com/1139312554', 'https://vimeo.com/1139312525', 'https://vimeo.com/1139311852', 'https://vimeo.com/1139311839', 
    'https://vimeo.com/1139311826', 'https://vimeo.com/1139311766', 'https://vimeo.com/1139311741', 'https://vimeo.com/1139311724', 
    'https://vimeo.com/1139311695', 'https://vimeo.com/1139311651', 'https://vimeo.com/1139311631', 'https://vimeo.com/1139311019', 
    'https://vimeo.com/1139311362', 'https://vimeo.com/1139311334', 'https://vimeo.com/1139311307', 'https://vimeo.com/1139311288', 
    'https://vimeo.com/1139311237', 'https://vimeo.com/1139311157', 'https://vimeo.com/1139311614', 'https://vimeo.com/1139311591', 
    'https://vimeo.com/1139311507', 'https://vimeo.com/1139311483', 'https://vimeo.com/1139311427', 'https://vimeo.com/1139311577', 
    'https://vimeo.com/1139311559', 'https://vimeo.com/1139311535', 'https://vimeo.com/1139312496', 'https://vimeo.com/1139312468', 
    'https://vimeo.com/1139312444', 'https://vimeo.com/1139312399', 'https://vimeo.com/1139312325', 'https://vimeo.com/1139312298', 
    'https://vimeo.com/1139312270', 'https://vimeo.com/1139312254', 'https://vimeo.com/1139312236', 'https://vimeo.com/1139312109', 
    'https://vimeo.com/1139312092', 'https://vimeo.com/1139312061', 'https://vimeo.com/1139312194', 'https://vimeo.com/1139312171', 
    'https://vimeo.com/1139312152', 'https://vimeo.com/1139311991', 'https://vimeo.com/1139311942', 'https://vimeo.com/1139311909'
];

const existingUrls = [
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

const combinedUrls = [...new Set([...existingUrls, ...vimeoUrls])];

export const INITIAL_VIDEOS: Video[] = combinedUrls.map((url, index) => ({
  id: `v-${Date.now() + index}`,
  url,
  title: `Vimeo Video ${index + 1}`,
  channel: 'Vimeo Creator',
  thumbnailUrl: `https://picsum.photos/seed/vimeo${index}/400/800`,
  duration: 'N/A',
  type: 'video',
  status: 'active',
  // FIX: Added missing isFeatured property to match the Video type.
  isFeatured: false, 
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
    // FIX: Added missing userId property to match the Transaction type.
    { id: 't1', userId: 'u1', type: 'reward', amount: 10, description: 'Watched "Epic Fails Compilation"', timestamp: new Date() },
    { id: 't2', userId: 'u1', type: 'bonus', amount: 50, description: 'Daily Login Bonus', timestamp: new Date(Date.now() - 86400000) },
];

export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [
    { id: 'wr1', userId: 'u2', userName: 'Bob', amount: 25.00, pixKey: 'bob@pix.com', status: 'pending', requestDate: new Date(Date.now() - 3600000) },
    { id: 'wr2', userId: 'u4', userName: 'Diana', amount: 150.00, pixKey: 'diana-key', status: 'pending', requestDate: new Date(Date.now() - 7200000) },
    { id: 'wr3', userId: 'u1', userName: 'Alice', amount: 500.00, pixKey: '123.456.789-00', status: 'approved', requestDate: new Date(Date.now() - 86400000) },
    { id: 'wr4', userId: 'u2', userName: 'Bob', amount: 10.00, pixKey: 'bob@pix.com', status: 'declined', requestDate: new Date(Date.now() - 172800000) },
];

export const INITIAL_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Engraçado' },
    { id: 'cat-2', name: 'Música' },
    { id: 'cat-3', name: 'Dança' },
    { id: 'cat-4', name: 'Natureza' },
];


export const INITIAL_SETTINGS: AppSettings = {
  appName: 'CASH VIRAL',
  logoUrl: '/logo.png',
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
  welcomeBonus: 5.00,
  maintenanceMode: false,
  maintenanceMessage: 'Estamos em manutenção. Voltamos em breve!',
  allowNewSignups: true,
  globalNotification: '',
  dailyBonusAmount: 25,
  doubleRewardsEnabled: false,
};