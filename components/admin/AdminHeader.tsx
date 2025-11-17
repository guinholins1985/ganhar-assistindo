import React from 'react';
import Icon from '../Icon';
import { AdminView } from '../../types';

interface AdminHeaderProps {
    onSwitchView: () => void;
    onToggleSidebar: () => void;
    activeView: AdminView;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSwitchView, onToggleSidebar, activeView }) => {
    
    const viewTitles: Record<AdminView, string> = {
        dashboard: 'Painel',
        users: 'Gerenciamento de Usuários',
        videos: 'Gerenciamento de Vídeos',
        rewards: 'Recompensas e Saques',
        settings: 'Configurações Gerais'
    };

    const viewTitle = viewTitles[activeView] || 'Painel';
    
    return (
        <header className="flex items-center justify-between h-20 px-6 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center">
                <button onClick={onToggleSidebar} className="text-gray-400 focus:outline-none md:hidden mr-4">
                    <Icon name="menu" className="w-6 h-6"/>
                </button>
                <h1 className="text-2xl font-semibold text-white">{viewTitle}</h1>
            </div>
            <div className="flex items-center space-x-4">
                 <button className="p-2 text-gray-400 bg-gray-700 rounded-full hover:bg-gray-600 hover:text-white transition-colors">
                    <Icon name="moon" className="w-5 h-5"/>
                </button>
                <button 
                    onClick={onSwitchView}
                    className="flex items-center text-sm text-gray-300 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                    <Icon name="logout" className="w-5 h-5 mr-2"/>
                    <span>Sair do Admin</span>
                </button>
            </div>
        </header>
    );
};

export default AdminHeader;