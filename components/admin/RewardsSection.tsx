import React from 'react';
import { WithdrawalRequest } from '../../types';
import Icon from '../Icon';

interface RewardsSectionProps {
    requests: WithdrawalRequest[];
    onProcess: (requestId: string, status: 'approved' | 'declined') => void;
}

const RewardsSection: React.FC<RewardsSectionProps> = ({ requests, onProcess }) => {
    const pendingRequests = requests.filter(r => r.status === 'pending');

    return (
        <div>
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Solicitações de Saque Pendentes</h3>
                {pendingRequests.length === 0 ? (
                    <p className="text-gray-500">Nenhuma solicitação pendente.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700 text-gray-400 text-sm">
                                <tr>
                                    <th className="p-3">Usuário</th>
                                    <th className="p-3">Valor</th>
                                    <th className="p-3 hidden md:table-cell">Chave PIX</th>
                                    <th className="p-3 hidden sm:table-cell">Data</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map(req => (
                                    <tr key={req.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3 font-semibold text-white">{req.userName}</td>
                                        <td className="p-3 font-mono text-yellow-400">${req.amount.toFixed(2)}</td>
                                        <td className="p-3 hidden md:table-cell">{req.pixKey}</td>
                                        <td className="p-3 hidden sm:table-cell text-gray-400">{req.requestDate.toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => onProcess(req.id, 'approved')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center">
                                                    <Icon name="check-circle" className="w-4 h-4 mr-1"/> Aprovar
                                                </button>
                                                <button onClick={() => onProcess(req.id, 'declined')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center">
                                                    <Icon name="close" className="w-4 h-4 mr-1"/> Recusar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RewardsSection;