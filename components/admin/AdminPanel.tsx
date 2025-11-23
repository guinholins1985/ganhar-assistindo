

import React, { useState } from 'react';
// FIX: Import Category and SystemLog types to be used in props.
import { AdminView, User, Video, WithdrawalRequest, AppSettings, Transaction, Category, SystemLog } from '../../types';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardSection from './DashboardSection';
import UsersSection from './UsersSection';
import VideosSection from './VideosSection';
import RewardsSection from './RewardsSection';
import SettingsSection from './SettingsSection';
import AdminToast from './AdminToast';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

// FIX: Update props to accept categories, system logs, and their respective handlers from App.tsx.
interface AdminPanelProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        totalBalance: number;
    };
    users: User[];
    videos: Video[];
    withdrawalRequests: WithdrawalRequest[];
    transactions: Transaction[];
    settings: AppSettings;
    categories: Category[];
    systemLogs: SystemLog[];
    currentUser: User;
    onProcessWithdrawal: (requestId: string, status: 'approved' | 'declined') => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateVideo: (video: Video) => void;
    onDeleteVideo: (videoId: string) => void;
    onAddVideo: (url: string) => Promise<string>;
    onUpdateSettings: (settings: AppSettings) => void;
    onSwitchView: () => void;
    onAddCategory: (name: string) => Promise<void>;
    onUpdateCategory: (category: Category) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
    logAdminAction: (description: string) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const showToast: ShowToastFn = (message, type = 'success') => {
        setToast({ message, type });
    };

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardSection stats={props.stats} withdrawalRequests={props.withdrawalRequests} transactions={props.transactions} users={props.users} systemLogs={props.systemLogs} />;
            case 'users':
                // FIX: Pass videos and transactions to UsersSection
                return <UsersSection users={props.users} videos={props.videos} transactions={props.transactions} onUpdateUser={props.onUpdateUser} onDeleteUser={props.onDeleteUser} showToast={showToast} />;
            case 'videos':
                return <VideosSection videos={props.videos} categories={props.categories} onUpdateVideo={props.onUpdateVideo} onDeleteVideo={props.onDeleteVideo} onAddVideo={props.onAddVideo} showToast={showToast} onAddCategory={props.onAddCategory} onUpdateCategory={props.onUpdateCategory} onDeleteCategory={props.onDeleteCategory} logAdminAction={props.logAdminAction} />;
            case 'rewards':
                return <RewardsSection requests={props.withdrawalRequests} transactions={props.transactions} onProcess={props.onProcessWithdrawal} showToast={showToast} />;
            case 'settings':
                return <SettingsSection settings={props.settings} onUpdateSettings={props.onUpdateSettings} showToast={showToast} />;
            default:
                return <DashboardSection stats={props.stats} withdrawalRequests={props.withdrawalRequests} transactions={props.transactions} users={props.users} systemLogs={props.systemLogs}/>;
        }
    };

    return (
        <div className="flex h-screen bg-base-100 text-base-content font-sans">
            <AdminSidebar activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} setOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader 
                    onSwitchView={props.onSwitchView} 
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                    activeView={activeView}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-base-100 p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>
            {toast && <AdminToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default AdminPanel;
