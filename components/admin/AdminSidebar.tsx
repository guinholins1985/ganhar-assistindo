import React from 'react';
import { AdminView } from '../../types';
import Icon from '../Icon';

interface AdminSidebarProps {
    activeView: AdminView;
    setActiveView: (view: AdminView) => void;
    isOpen: boolean;
    setOpen: (isOpen: boolean) => void;
}

const NavItem: React.FC<{
    icon: 'dashboard' | 'users' | 'video-camera' | 'currency-dollar' | 'cog';
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <li>
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); onClick(); }}
            className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:bg-base-300 hover:text-white'
            }`}
        >
            <Icon name={icon} className="w-6 h-6" />
            <span className="ml-4 font-medium">{label}</span>
        </a>
    </li>
);

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView, isOpen, setOpen }) => {
    return (
        <>
            <div className={`fixed inset-0 bg-black/50 z-20 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)}></div>
            <aside className={`absolute md:relative z-30 flex flex-col w-64 h-full bg-base-200 shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex items-center justify-center h-20 border-b border-base-300">
                    <Icon name="recommendations" className="w-8 h-8 text-primary"/>
                    <h1 className="text-2xl font-bold ml-3 text-white tracking-wider">Admin</h1>
                </div>
                <nav className="flex-1 px-4 py-4">
                    <ul>
                        <NavItem icon="dashboard" label="Painel" isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                        <NavItem icon="users" label="Usuários" isActive={activeView === 'users'} onClick={() => setActiveView('users')} />
                        <NavItem icon="video-camera" label="Vídeos" isActive={activeView === 'videos'} onClick={() => setActiveView('videos')} />
                        <NavItem icon="currency-dollar" label="Recompensas" isActive={activeView === 'rewards'} onClick={() => setActiveView('rewards')} />
                        <NavItem icon="cog" label="Configurações" isActive={activeView === 'settings'} onClick={() => setActiveView('settings')} />
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default AdminSidebar;