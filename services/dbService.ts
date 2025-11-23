

import { openDB, IDBPDatabase } from 'idb';
// FIX: Import Category and SystemLog types.
import { User, Video, Transaction, WithdrawalRequest, AppSettings, Category, SystemLog } from '../types';
import { INITIAL_USERS, INITIAL_VIDEOS, INITIAL_TRANSACTIONS, INITIAL_WITHDRAWAL_REQUESTS, INITIAL_SETTINGS, INITIAL_CATEGORIES } from '../constants';

const DB_NAME = 'VideoRewardsDB';
const DB_VERSION = 1;

const STORES = {
    USERS: 'users',
    VIDEOS: 'videos',
    TRANSACTIONS: 'transactions',
    WITHDRAWAL_REQUESTS: 'withdrawalRequests',
    SETTINGS: 'settings',
    // FIX: Add stores for categories and system logs.
    CATEGORIES: 'categories',
    SYSTEM_LOGS: 'systemLogs',
};

let db: IDBPDatabase;

export const initDB = async () => {
    if (db) return;

    db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORES.USERS)) {
                db.createObjectStore(STORES.USERS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.VIDEOS)) {
                db.createObjectStore(STORES.VIDEOS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
                db.createObjectStore(STORES.TRANSACTIONS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.WITHDRAWAL_REQUESTS)) {
                db.createObjectStore(STORES.WITHDRAWAL_REQUESTS, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'appName' });
            }
            // FIX: Create object stores for new types if they don't exist.
            if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
                db.createObjectStore(STORES.CATEGORIES, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORES.SYSTEM_LOGS)) {
                db.createObjectStore(STORES.SYSTEM_LOGS, { keyPath: 'id' });
            }
        },
    });

    await seedInitialData();
};

const seedInitialData = async () => {
    // Settings
    const settingsCount = await db.count(STORES.SETTINGS);
    if (settingsCount === 0) {
        await db.add(STORES.SETTINGS, INITIAL_SETTINGS);
    } else {
        // Ensure new settings fields are added if they don't exist
        const currentSettings = await db.get(STORES.SETTINGS, INITIAL_SETTINGS.appName);
        const updatedSettings = { ...INITIAL_SETTINGS, ...currentSettings };
        await db.put(STORES.SETTINGS, updatedSettings);
    }
    
    // Users
    const usersCount = await db.count(STORES.USERS);
    if (usersCount === 0) {
        const tx = db.transaction(STORES.USERS, 'readwrite');
        await Promise.all(INITIAL_USERS.map(user => tx.store.add(user)));
        await tx.done;
    }

    // Videos
    const videosCount = await db.count(STORES.VIDEOS);
    if (videosCount === 0) {
        const tx = db.transaction(STORES.VIDEOS, 'readwrite');
        await Promise.all(INITIAL_VIDEOS.map(video => tx.store.add(video)));
        await tx.done;
    }

    // Transactions
    const transactionsCount = await db.count(STORES.TRANSACTIONS);
    if (transactionsCount === 0) {
        const tx = db.transaction(STORES.TRANSACTIONS, 'readwrite');
        await Promise.all(INITIAL_TRANSACTIONS.map(t => tx.store.add(t)));
        await tx.done;
    }

    // Withdrawal Requests
    const requestsCount = await db.count(STORES.WITHDRAWAL_REQUESTS);
    if (requestsCount === 0) {
        const tx = db.transaction(STORES.WITHDRAWAL_REQUESTS, 'readwrite');
        await Promise.all(INITIAL_WITHDRAWAL_REQUESTS.map(r => tx.store.add(r)));
        await tx.done;
    }

    // Categories
    const categoriesCount = await db.count(STORES.CATEGORIES);
    if (categoriesCount === 0) {
        const tx = db.transaction(STORES.CATEGORIES, 'readwrite');
        await Promise.all(INITIAL_CATEGORIES.map(cat => tx.store.add(cat)));
        await tx.done;
    }
};


// Generic helpers
const getAll = <T>(storeName: string): Promise<T[]> => db.getAll(storeName);
const add = <T>(storeName: string, value: T): Promise<IDBValidKey> => db.add(storeName, value);
const put = <T>(storeName: string, value: T): Promise<IDBValidKey> => db.put(storeName, value);
const deleteFromStore = (storeName: string, key: string): Promise<void> => db.delete(storeName, key);

// Users
export const getAllUsers = (): Promise<User[]> => getAll<User>(STORES.USERS);
export const updateUser = (user: User) => put(STORES.USERS, user);
export const deleteUser = (id: string) => deleteFromStore(STORES.USERS, id);

// Videos
export const getAllVideos = (): Promise<Video[]> => getAll<Video>(STORES.VIDEOS);
export const addVideo = (video: Video) => add(STORES.VIDEOS, video);
export const updateVideo = (video: Video) => put(STORES.VIDEOS, video);
export const deleteVideo = (id: string) => deleteFromStore(STORES.VIDEOS, id);

// Transactions
export const getAllTransactions = (): Promise<Transaction[]> => getAll<Transaction>(STORES.TRANSACTIONS);
export const addTransaction = (transaction: Transaction) => add(STORES.TRANSACTIONS, transaction);

// Withdrawal Requests
export const getAllWithdrawalRequests = (): Promise<WithdrawalRequest[]> => getAll<WithdrawalRequest>(STORES.WITHDRAWAL_REQUESTS);
export const addWithdrawalRequest = (req: WithdrawalRequest) => add(STORES.WITHDRAWAL_REQUESTS, req);
export const updateWithdrawalRequest = (req: WithdrawalRequest) => put(STORES.WITHDRAWAL_REQUESTS, req);

// Settings
export const getSettings = async (): Promise<AppSettings> => {
    // Since there's only one settings object, we can get it by its known key.
    const settings = await db.get(STORES.SETTINGS, INITIAL_SETTINGS.appName)
    // Merge with defaults to ensure all keys are present
    return { ...INITIAL_SETTINGS, ...settings };
}
export const updateSettings = (settings: AppSettings) => put(STORES.SETTINGS, settings);

// FIX: Add service functions for categories.
// Categories
export const getAllCategories = (): Promise<Category[]> => getAll<Category>(STORES.CATEGORIES);
export const addCategory = (category: Category) => add(STORES.CATEGORIES, category);
export const updateCategory = (category: Category) => put(STORES.CATEGORIES, category);
export const deleteCategory = (id: string) => deleteFromStore(STORES.CATEGORIES, id);

// FIX: Add service functions for system logs.
// System Logs
export const getAllSystemLogs = (): Promise<SystemLog[]> => getAll<SystemLog>(STORES.SYSTEM_LOGS);
export const addSystemLog = (log: SystemLog) => add(STORES.SYSTEM_LOGS, log);