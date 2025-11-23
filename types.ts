export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  balance: number;
  favorites: string[];
  status: 'active' | 'banned';
}

export interface Video {
  id: string;
  url: string;
  title: string;
  channel: string;
  thumbnailUrl: string;
  duration: string;
  type: 'video' | 'playlist';
  status: 'active' | 'inactive';
}

export interface Transaction {
  id: string;
  type: 'reward' | 'bonus' | 'withdrawal';
  amount: number;
  description: string;
  timestamp: Date;
}

export interface Mission {
  id:string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  goal: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  pixKey: string;
  status: 'pending' | 'approved' | 'declined';
  requestDate: Date;
}

export interface AdSlots {
  inFeed: string;
  profileBanner: string;
  earnBanner: string;
}

export interface AppSettings {
  appName: string;
  logoUrl: string;
  geminiApiKey: string;
  youtubeApiKey: string;
  minWithdrawal: number;
  maxDailyWithdrawalUser: number;
  maxDailyWithdrawalTotal: number;
  rewardPerVideo: number;
  minWatchTime: number; // in seconds
  // AdSense Settings
  isAdsEnabled: boolean;
  adsenseClientId: string;
  adSlots: AdSlots;
  adFrequencyInFeed: number; // e.g., show an ad every 10 videos
}

export type View = 'home' | 'earn' | 'recommendations' | 'profile';
export type ModalType = 'addVideo' | 'withdraw';
export type AdminView = 'dashboard' | 'users' | 'videos' | 'rewards' | 'settings';