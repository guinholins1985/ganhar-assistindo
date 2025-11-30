

import React, { useState } from 'react';
import { WithdrawalRequest, Transaction } from '../../types';
import Icon from '../Icon';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface RewardsSectionProps {
    requests: WithdrawalRequest[];
    transactions: Transaction[];
    onProcess: (requestId: string, status: 'approved' | 'declined') => Promise<void>;
    showToast: ShowToastFn;
}

const RewardsSection: React.FC<RewardsSectionProps> = ({ requests, transactions, onProcess, showToast }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'declined' | 'history'>('pending');
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    
    const filteredRequests = requests.filter(r => r.status === activeTab);

    const handleSelectRequest = (requestId: string) => {
        setSelectedRequests(prev =>
            prev.includes(requestId) ? prev.filter(id => id !== requestId) : [...prev, requestId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRequests(filteredRequests.map(r => r.id));
        } else {
            setSelectedRequests([]);
        }
    };
    
    const handleBulkProcess = async (status: 'approved' | 'declined') => {
        if (selectedRequests.length === 0) return;
        if (window.confirm(`Você tem certeza que deseja ${status === 'approved' ? 'aprovar' : 'recusar'} ${selectedRequests.length} solicitações?`)) {
            for (const requestId of selectedRequests) {
                await onProcess(requestId, status);
            }
            showToast(`${selectedRequests.length} solicitações foram processadas.`, 'success');
            setSelectedRequests([]);
        }
    };

    return (
        <div className="bg-base-300 rounded-lg p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white">Recompensas e Saques</h2>
                <div className="flex space-x-1 bg-base-200 p-1 rounded-lg flex-wrap justify-center">
                    <button onClick={() => { setActiveTab('pending'); setSelectedRequests([]); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'pending' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-base-300'}`}>Pendentes</button>
                    <button onClick={() => { setActiveTab('approved'); setSelectedRequests([]); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'approved' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-base-300'}`}>Aprovados</button>
                    <button onClick={() => { setActiveTab('declined'); setSelectedRequests([]); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'declined' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-base-300'}`}>Recusados</button>
                    <button onClick={() => { setActiveTab('history'); setSelectedRequests([]); }} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'history' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-base-300'}`}>Histórico</button>
                </div>
            </div>

            {selectedRequests.length > 0 && activeTab === 'pending' && (
                <div className="bg-base-200 p-3 rounded-lg mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold">{selectedRequests.length} solicitações selecionadas</p>
                    <div className="flex space-x-2">
                        <button onClick={() => handleBulkProcess('approved')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded">Aprovar</button>
                        <button onClick={() => handleBulkProcess('declined')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded">Recusar</button>
                    </div>
                </div>
            )}
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-base-200 text-gray-400 uppercase text-xs tracking-wider">
                         {activeTab === 'history' ? (
                            <tr>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Data</th>
                            </tr>
                        ) : (
                             <tr>
                                {activeTab === 'pending' && <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} className="bg-base-200 rounded"/></th>}
                                <th className="p-4">Usuário</th>
                                <th className="p-4 hidden sm:table-cell">Valor</th>
                                <th className="p-4 hidden md:table-cell">Chave PIX</th>
                                <th className="p-4 hidden md:table-cell">Data</th>
                                {activeTab === 'pending' && <th className="p-4 text-right">Ações</th>}
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {activeTab === 'history' ? (
                            transactions.map(t => (
                                <tr key={t.id} className="border-b border-base-200 hover:bg-base-200/50">
                                    <td className="p-4 text-white">{t.description}</td>
                                    <td className="p-4 capitalize text-gray-300">{t.type}</td>
                                    <td className={`p-4 font-mono ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>{t.amount >= 0 ? '+' : ''}${t.amount.toFixed(2)}</td>
                                    <td className="p-4 text-gray-400">{t.timestamp.toLocaleString()}</td>
                                </tr>
                            ))
                        ) : (
                            filteredRequests.map(req => (
                                <tr key={req.id} className="border-b border-base-200 hover:bg-base-200/50">
                                    {activeTab === 'pending' && <td className="p-4"><input type="checkbox" checked={selectedRequests.includes(req.id)} onChange={() => handleSelectRequest(req.id)} className="bg-base-200 rounded"/></td>}
                                    <td className="p-4 font-semibold text-white">{req.userName}</td>
                                    <td className="p-4 font-mono text-accent hidden sm:table-cell">${req.amount.toFixed(2)}</td>
                                    <td className="p-4 font-mono hidden md:table-cell">{req.pixKey}</td>
                                    <td className="p-4 text-gray-400 hidden md:table-cell">{req.requestDate.toLocaleDateString()}</td>
                                    {activeTab === 'pending' && (
                                        <td className="p-4">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => onProcess(req.id, 'approved')} className="bg-green-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center shadow-lg shadow-green-600/30 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md">
                                                    <Icon name="check-circle" className="w-4 h-4 mr-1"/> Aprovar
                                                </button>
                                                <button onClick={() => onProcess(req.id, 'declined')} className="bg-red-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center shadow-lg shadow-red-600/30 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md">
                                                    <Icon name="close" className="w-4 h-4 mr-1"/> Recusar
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
             {(activeTab === 'history' ? transactions : filteredRequests).length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>Nenhum item nesta categoria.</p>
                </div>
            )}
        </div>
    );
};

export default RewardsSection;