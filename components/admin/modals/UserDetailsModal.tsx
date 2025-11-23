

import React, { useState } from 'react';
import { User, Video, Transaction } from '../../../types';
import Icon from '../../Icon';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface UserDetailsModalProps {
    user: User;
    videos: Video[];
    transactions: Transaction[];
    onClose: () => void;
    onUpdateUser: (user: User) => Promise<void>;
    showToast: ShowToastFn;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, videos, transactions, onClose, onUpdateUser, showToast }) => {
    const [bonusAmount, setBonusAmount] = useState('');
    const [adminNotes, setAdminNotes] = useState(user.adminNotes || '');

    const favoriteVideos = videos.filter(v => user.favorites.includes(v.id));
    const userTransactions = transactions.filter(t => t.userId === user.id);

    const handleAddBonus = async () => {
        const amount = parseFloat(bonusAmount);
        if (isNaN(amount)) {
            showToast('Valor de bônus inválido.', 'error');
            return;
        }
        await onUpdateUser({ ...user, balance: user.balance + amount });
        showToast(`Bônus de $${amount.toFixed(2)} adicionado a ${user.name}.`, 'success');
        setBonusAmount('');
        onClose(); // Close after action
    };

    const handleSaveNotes = async () => {
        await onUpdateUser({ ...user, adminNotes });
        showToast(`Notas salvas para ${user.name}.`, 'success');
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-base-300 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-base-200">
                    <h2 className="text-xl font-bold text-white">Detalhes de {user.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200">
                        <Icon name="close" className="w-6 h-6 text-gray-400" />
                    </button>
                </header>

                <main className="p-6 overflow-y-auto space-y-6">
                    {/* User Info */}
                    <section>
                        <h3 className="font-semibold mb-2 text-primary">Informações do Usuário</h3>
                        <div className="bg-base-200 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><strong className="text-gray-400">ID:</strong> {user.id}</p>
                            <p><strong className="text-gray-400">Email:</strong> {user.email}</p>
                            <p><strong className="text-gray-400">Saldo:</strong> <span className="font-mono text-accent">${user.balance.toFixed(2)}</span></p>
                            <p><strong className="text-gray-400">Status:</strong> <span className={`capitalize ${user.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{user.status}</span></p>
                        </div>
                    </section>

                    {/* Admin Actions */}
                    <section>
                         <h3 className="font-semibold mb-2 text-primary">Ações do Administrador</h3>
                         <div className="bg-base-200 p-4 rounded-lg space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Adicionar Bônus/Penalidade</label>
                                <div className="flex space-x-2">
                                    <input type="number" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} placeholder="Ex: 50 ou -10" className="flex-grow bg-base-100 p-2 rounded"/>
                                    <button onClick={handleAddBonus} className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded">Aplicar</button>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Notas do Administrador</label>
                                <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={3} className="w-full bg-base-100 p-2 rounded"></textarea>
                                <button onClick={handleSaveNotes} className="bg-secondary hover:bg-gray-700 text-white font-bold px-4 py-2 rounded mt-2">Salvar Notas</button>
                            </div>
                         </div>
                    </section>

                    {/* Transaction History */}
                    <section>
                        <h3 className="font-semibold mb-2 text-primary">Histórico de Transações</h3>
                        <div className="bg-base-200 p-4 rounded-lg max-h-48 overflow-y-auto">
                            {userTransactions.length > 0 ? (
                                <ul className="space-y-2">
                                    {userTransactions.map(t => (
                                        <li key={t.id} className="flex justify-between text-sm">
                                            <span>{t.description}</span>
                                            <span className={`font-mono ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>${t.amount.toFixed(2)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-500 text-center">Nenhuma transação.</p>}
                        </div>
                    </section>
                    
                    {/* Favorite Videos */}
                    <section>
                        <h3 className="font-semibold mb-2 text-primary">Vídeos Favoritos</h3>
                         <div className="bg-base-200 p-4 rounded-lg max-h-48 overflow-y-auto">
                            {favoriteVideos.length > 0 ? (
                                <ul className="space-y-2">
                                    {favoriteVideos.map(v => (
                                        <li key={v.id} className="flex items-center text-sm">
                                            <img src={v.thumbnailUrl} className="w-10 h-10 object-cover rounded mr-3"/>
                                            <span>{v.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-500 text-center">Nenhum vídeo favorito.</p>}
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
};

export default UserDetailsModal;