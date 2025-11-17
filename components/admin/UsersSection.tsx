import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import Icon from '../Icon';

interface UsersSectionProps {
    users: User[];
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
}

const UsersSection: React.FC<UsersSectionProps> = ({ users, onUpdateUser, onDeleteUser }) => {
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

    const handleStatusChange = (user: User) => {
        const newStatus = user.status === 'active' ? 'banned' : 'active';
        onUpdateUser({ ...user, status: newStatus });
    };

    const handleResetBalance = (user: User) => {
        if(window.confirm(`Você tem certeza que deseja zerar o saldo de ${user.name}?`)) {
            onUpdateUser({ ...user, balance: 0 });
        }
    };
    
    const handleDelete = (user: User) => {
        if(window.confirm(`ATENÇÃO: Esta ação é irreversível. Deseja realmente excluir o usuário ${user.name}?`)) {
            onDeleteUser(user.id);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-2/5 bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="flex space-x-2 self-start sm:self-center">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Todos</button>
                    <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Ativos</button>
                    <button onClick={() => setFilter('banned')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'banned' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Banidos</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700 text-gray-300 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4">Usuário</th>
                            <th className="p-4 hidden lg:table-cell">Email</th>
                            <th className="p-4">Saldo</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                <td className="p-4 flex items-center">
                                    <img src={user.avatarUrl} alt={user.name} className="w-11 h-11 rounded-full mr-4" />
                                    <div>
                                        <p className="font-bold text-lg text-white">{user.name}</p>
                                        <p className="text-sm text-gray-400 lg:hidden">{user.email}</p>
                                    </div>
                                </td>
                                <td className="p-4 hidden lg:table-cell text-gray-300">{user.email}</td>
                                <td className="p-4 font-mono text-yellow-400 text-lg">${user.balance.toFixed(2)}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                        user.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                    }`}>
                                        {user.status === 'active' ? 'ativo' : 'banido'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end space-x-1 sm:space-x-2">
                                        <button onClick={() => handleStatusChange(user)} title={user.status === 'active' ? 'Banir Usuário' : 'Desbanir Usuário'} className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-gray-600 transition-colors">
                                            <Icon name="shield-check" className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleResetBalance(user)} title="Zerar Saldo" className="p-2 text-gray-400 hover:text-blue-400 rounded-full hover:bg-gray-600 transition-colors">
                                            <Icon name="currency-dollar" className="w-5 h-5"/>
                                        </button>
                                         <button onClick={() => handleDelete(user)} title="Excluir Usuário" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-600 transition-colors">
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
    );
};

export default UsersSection;