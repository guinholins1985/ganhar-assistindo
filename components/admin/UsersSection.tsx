
import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import Icon from '../Icon';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface UsersSectionProps {
    users: User[];
    onUpdateUser: (user: User) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
    showToast: ShowToastFn;
}

const UsersSection: React.FC<UsersSectionProps> = ({ users, onUpdateUser, onDeleteUser, showToast }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'banned'>('all');

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

    const handleStatusChange = async (user: User) => {
        const newStatus = user.status === 'active' ? 'banned' : 'active';
        await onUpdateUser({ ...user, status: newStatus });
        showToast(`Status de ${user.name} atualizado.`, 'success');
    };

    const handleResetBalance = async (user: User) => {
        if(window.confirm(`Você tem certeza que deseja zerar o saldo de ${user.name}?`)) {
            await onUpdateUser({ ...user, balance: 0 });
            showToast(`Saldo de ${user.name} zerado.`, 'success');
        }
    };
    
    const handleDelete = async (user: User) => {
        if(window.confirm(`ATENÇÃO: Esta ação é irreversível. Deseja realmente excluir o usuário ${user.name}?`)) {
            await onDeleteUser(user.id);
            showToast(`Usuário ${user.name} foi excluído.`, 'success');
        }
    };

    return (
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

            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-left">
                    <thead className="border-b border-base-200 text-gray-400 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4">Usuário</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Saldo</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-base-200 hover:bg-base-200/50">
                                <td className="p-4 flex items-center">
                                    <img src={user.avatarUrl} alt={user.name} className="w-11 h-11 rounded-full mr-4" />
                                    <p className="font-bold text-lg text-white">{user.name}</p>
                                </td>
                                <td className="p-4 text-gray-300">{user.email}</td>
                                <td className="p-4 font-mono text-accent text-lg">${user.balance.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                        user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                    }`}>
                                        {user.status === 'active' ? 'ativo' : 'banido'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end space-x-1 sm:space-x-2">
                                        <button onClick={() => handleStatusChange(user)} title={user.status === 'active' ? 'Banir Usuário' : 'Desbanir Usuário'} className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-base-200 transition-colors">
                                            <Icon name="shield-check" className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleResetBalance(user)} title="Zerar Saldo" className="p-2 text-gray-400 hover:text-blue-400 rounded-full hover:bg-base-200 transition-colors">
                                            <Icon name="currency-dollar" className="w-5 h-5"/>
                                        </button>
                                         <button onClick={() => handleDelete(user)} title="Excluir Usuário" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-base-200 transition-colors">
                                            <Icon name="trash" className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-base-200 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                             <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full mr-4" />
                             <div>
                                <p className="font-bold text-lg text-white">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                             </div>
                        </div>
                        <div className="flex justify-between items-center mb-4 text-sm">
                            <div>
                                <p className="text-gray-400">Saldo</p>
                                <p className="font-mono text-accent text-lg">${user.balance.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Status</p>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                        user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                    }`}>
                                    {user.status === 'active' ? 'ativo' : 'banido'}
                                </span>
                            </div>
                        </div>
                         <div className="flex justify-end space-x-2 border-t border-base-300 pt-3 mt-3">
                            <button onClick={() => handleStatusChange(user)} title={user.status === 'active' ? 'Banir Usuário' : 'Desbanir Usuário'} className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-base-100 transition-colors">
                                <Icon name="shield-check" className="w-5 h-5"/>
                            </button>
                            <button onClick={() => handleResetBalance(user)} title="Zerar Saldo" className="p-2 text-gray-400 hover:text-blue-400 rounded-full hover:bg-base-100 transition-colors">
                                <Icon name="currency-dollar" className="w-5 h-5"/>
                            </button>
                                <button onClick={() => handleDelete(user)} title="Excluir Usuário" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-base-100 transition-colors">
                                <Icon name="trash" className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

             {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>Nenhum usuário encontrado.</p>
                </div>
            )}
        </div>
    );
};

export default UsersSection;