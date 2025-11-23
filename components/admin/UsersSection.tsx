

import React, { useState, useMemo } from 'react';
import { User, Video, Transaction } from '../../types';
import Icon from '../Icon';
import UserDetailsModal from './modals/UserDetailsModal';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface UsersSectionProps {
    users: User[];
    videos: Video[];
    transactions: Transaction[];
    onUpdateUser: (user: User) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    showToast: ShowToastFn;
}

const UsersSection: React.FC<UsersSectionProps> = ({ users, videos, transactions, onUpdateUser, onDeleteUser, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                if (filter === 'all') return true;
                return user.status === filter;
            })
            .filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [users, searchTerm, filter]);

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedUsers(filteredUsers.map(u => u.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleBulkAction = async (action: 'ban' | 'unban' | 'delete') => {
        if (selectedUsers.length === 0) return;
        const actionText = { ban: 'banir', unban: 'desbanir', delete: 'excluir' };
        if (window.confirm(`Você tem certeza que deseja ${actionText[action]} ${selectedUsers.length} usuário(s) selecionado(s)?`)) {
            for (const userId of selectedUsers) {
                const user = users.find(u => u.id === userId);
                if (user) {
                    if (action === 'delete') {
                        await onDeleteUser(userId);
                    } else {
                        const newStatus = action === 'ban' ? 'banned' : 'active';
                        if (user.status !== newStatus) {
                            await onUpdateUser({ ...user, status: newStatus });
                        }
                    }
                }
            }
            showToast(`${selectedUsers.length} usuário(s) foram atualizados.`, 'success');
            setSelectedUsers([]);
        }
    };

    return (
        <>
            <div className="bg-base-300 rounded-lg p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-2/5 bg-base-200 text-white p-3 rounded-lg border border-base-100 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    <div className="flex space-x-2 self-start sm:self-center">
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-base-200 hover:bg-gray-700'}`}>Todos</button>
                        <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-primary text-white' : 'bg-base-200 hover:bg-gray-700'}`}>Ativos</button>
                        <button onClick={() => setFilter('banned')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'banned' ? 'bg-primary text-white' : 'bg-base-200 hover:bg-gray-700'}`}>Banidos</button>
                    </div>
                </div>
                
                {selectedUsers.length > 0 && (
                    <div className="bg-base-200 p-3 rounded-lg mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold">{selectedUsers.length} usuário(s) selecionado(s)</p>
                        <div className="flex space-x-2">
                            <button onClick={() => handleBulkAction('ban')} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-3 rounded">Banir</button>
                            <button onClick={() => handleBulkAction('unban')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded">Desbanir</button>
                            <button onClick={() => handleBulkAction('delete')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded">Excluir</button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-base-200 text-gray-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} className="bg-base-200 rounded"/></th>
                                <th className="p-4">Usuário</th>
                                <th className="p-4 hidden md:table-cell">Email</th>
                                <th className="p-4 hidden lg:table-cell">Saldo</th>
                                <th className="p-4 hidden sm:table-cell">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="border-b border-base-200 hover:bg-base-200/50">
                                    <td className="p-4"><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} className="bg-base-200 rounded"/></td>
                                    <td className="p-4 flex items-center">
                                        <img src={user.avatarUrl} alt={user.name} className="w-11 h-11 rounded-full mr-4" />
                                        <p className="font-bold text-lg text-white">{user.name}</p>
                                    </td>
                                    <td className="p-4 text-gray-300 hidden md:table-cell">{user.email}</td>
                                    <td className="p-4 font-mono text-accent text-lg hidden lg:table-cell">${user.balance.toFixed(2)}</td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                            user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                        }`}>
                                            {user.status === 'active' ? 'ativo' : 'banido'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end space-x-1 sm:space-x-2">
                                            <button onClick={() => setViewingUser(user)} title="Ver Detalhes" className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-base-200 transition-colors">
                                                <Icon name="eye" className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => onDeleteUser(user.id)} title="Excluir Usuário" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-base-200 transition-colors">
                                                <Icon name="trash" className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 {filteredUsers.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Nenhum usuário encontrado.</p>
                    </div>
                )}
            </div>
            {viewingUser && (
                <UserDetailsModal 
                    user={viewingUser}
                    videos={videos}
                    transactions={transactions.filter(t => t.userId === viewingUser.id)}
                    onClose={() => setViewingUser(null)}
                    onUpdateUser={onUpdateUser}
                    showToast={showToast}
                />
            )}
        </>
    );
};

export default UsersSection;