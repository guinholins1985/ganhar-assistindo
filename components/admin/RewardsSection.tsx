
import React from 'react';
import { WithdrawalRequest } from '../../types';
import Icon from '../Icon';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface RewardsSectionProps {
    requests: WithdrawalRequest[];
    onProcess: (requestId: string, status: 'approved' | 'declined') => Promise<void>;
    showToast: ShowToastFn;
}

const RewardsSection: React.FC<RewardsSectionProps> = ({ requests, onProcess, showToast }) => {
    const pendingRequests = requests.filter(r => r.status === 'pending');

    const handleProcess = async (requestId: string, status: 'approved' | 'declined') => {
        await onProcess(requestId, status);
        showToast(`Solicitação foi ${status === 'approved' ? 'aprovada' : 'recusada'}.`, 'success');
    };

    return (
        <div className="bg-base-300 rounded-lg p-4 sm:p-6 shadow-lg">
            <h3 className="text-2xl font-bold mb-6 text-white">Solicitações de Saque Pendentes</h3>
            {pendingRequests.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <p>Nenhuma solicitação pendente no momento.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="w-full text-left">
                            <thead className="border-b border-base-200 text-gray-400 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4">Valor</th>
                                    <th className="p-4">Chave PIX</th>
                                    <th className="p-4">Data</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map(req => (
                                    <tr key={req.id} className="border-b border-base-200 hover:bg-base-200/50">
                                        <td className="p-4 font-semibold text-white">{req.userName}</td>
                                        <td className="p-4 font-mono text-accent">${req.amount.toFixed(2)}</td>
                                        <td className="p-4 font-mono">{req.pixKey}</td>
                                        <td className="p-4 text-gray-400">{req.requestDate.toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleProcess(req.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center transition-colors">
                                                    <Icon name="check-circle" className="w-4 h-4 mr-1"/> Aprovar
                                                </button>
                                                <button onClick={() => handleProcess(req.id, 'declined')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center transition-colors">
                                                    <Icon name="close" className="w-4 h-4 mr-1"/> Recusar
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
                        {pendingRequests.map(req => (
                            <div key={req.id} className="bg-base-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-lg text-white">{req.userName}</p>
                                        <p className="font-mono text-accent text-xl">${req.amount.toFixed(2)}</p>
                                    </div>
                                    <p className="text-xs text-gray-400">{req.requestDate.toLocaleDateString()}</p>
                                </div>
                                <div className="text-sm mb-4">
                                    <p className="text-gray-400">Chave PIX:</p>
                                    <p className="font-mono">{req.pixKey}</p>
                                </div>
                                 <div className="flex justify-end space-x-2 border-t border-base-300 pt-3">
                                    <button onClick={() => handleProcess(req.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center transition-colors">
                                        <Icon name="check-circle" className="w-4 h-4 mr-1"/> Aprovar
                                    </button>
                                    <button onClick={() => handleProcess(req.id, 'declined')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center transition-colors">
                                        <Icon name="close" className="w-4 h-4 mr-1"/> Recusar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RewardsSection;