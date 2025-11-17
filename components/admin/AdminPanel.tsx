import React, { useState } from 'react';
import { AdminView, User, Video, WithdrawalRequest, AppSettings } from '../../types';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardSection from './DashboardSection';
import UsersSection from './UsersSection';
import VideosSection from './VideosSection';
import RewardsSection from './RewardsSection';
import SettingsSection from './SettingsSection';

interface AdminPanelProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        totalBalance: number;
    };
    users: User[];
    videos: Video[];
    withdrawalRequests: WithdrawalRequest[];
    settings: AppSettings;
    onProcessWithdrawal: (requestId: string, status: 'approved' | 'declined') => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onUpdateVideo: (video: Video) => void;
    onDeleteVideo: (videoId: string) => void;
    onAddVideo: (url: string) => void;
    onUpdateSettings: (settings: AppSettings) => void;
    onSwitchView: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const [activeView, setActiveView] = useState<AdminView>('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const renderContent = () => {
        switch (activeView) {
            case 'dashboard':
                return <DashboardSection stats={props.stats} withdrawalRequests={props.withdrawalRequests} />;
            case 'users':
                return <UsersSection users={props.users} onUpdateUser={props.onUpdateUser} onDeleteUser={props.onDeleteUser} />;
            case 'videos':
                return <VideosSection videos={props.videos} onUpdateVideo={props.onUpdateVideo} onDeleteVideo={props.onDeleteVideo} onAddVideo={props.onAddVideo}/>;
            case 'rewards':
                return <RewardsSection requests={props.withdrawalRequests} onProcess={props.onProcessWithdrawal} />;
            case 'settings':
                return <SettingsSection settings={props.settings} onUpdateSettings={props.onUpdateSettings} />;
            default:
                return <DashboardSection stats={props.stats} withdrawalRequests={props.withdrawalRequests}/>;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <AdminSidebar activeView={activeView} setActiveView={setActiveView} isOpen={isSidebarOpen} setOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader 
                    onSwitchView={props.onSwitchView} 
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
                    activeView={activeView}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;