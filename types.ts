export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  balance: number;
  favorites: string[];
  status: 'active' | 'banned';
  // FIX: Added adminNotes property to align with data in constants.ts and usage in admin modals.
  adminNotes?: string;
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
  // FIX: Added isFeatured property to support featured videos.
  isFeatured: boolean;
  // FIX: Added categoryId to support video categorization feature.
  categoryId?: string;
}

export interface Transaction {
  id: string;
  // FIX: Added userId to associate transaction with a user.
  userId: string;
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
  // FIX: Removed geminiApiKey as it must be sourced from process.env.API_KEY.
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
  // FIX: Added missing settings properties to align with data in constants.ts.
  welcomeBonus: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  allowNewSignups: boolean;
  globalNotification: string;
  dailyBonusAmount: number;
  doubleRewardsEnabled: boolean;
}

// FIX: Added Category interface.
export interface Category {
  id: string;
  name: string;
}

// FIX: Added SystemLog interface.
export interface SystemLog {
  id: string;
  timestamp: Date;
  description: string;
  level: 'info' | 'warn' | 'error';
}

export type View = 'home' | 'earn' | 'recommendations' | 'profile';
export type ModalType = 'addVideo' | 'withdraw';
export type AdminView = 'dashboard' | 'users' | 'videos' | 'rewards' | 'settings';