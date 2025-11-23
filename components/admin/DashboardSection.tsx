

import React from 'react';
import Icon from '../Icon';
import { WithdrawalRequest, Transaction, User } from '../../types';
import Chart from '../common/Chart';

interface DashboardSectionProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        totalBalance: number;
    };
    withdrawalRequests: WithdrawalRequest[];
    transactions: Transaction[];
    users: User[];
}

const StatCard: React.FC<{ icon: 'users' | 'check-circle' | 'currency-dollar' | 'gift', title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-base-200 rounded-xl p-5 flex items-center shadow-lg transition-transform hover:scale-105">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <Icon name={icon} className="w-7 h-7 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-black text-white">{value}</p>
        </div>
    </div>
);


const DashboardSection: React.FC<DashboardSectionProps> = ({ stats, withdrawalRequests, transactions, users }) => {
    const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending');
    const pendingWithdrawalsTotal = pendingWithdrawals.reduce((sum, r) => sum + r.amount, 0);

    const recentActivities = [...pendingWithdrawals, ...transactions]
        .sort((a, b) => ('requestDate' in a ? a.requestDate.getTime() : a.timestamp.getTime()) < ('requestDate' in b ? b.requestDate.getTime() : b.timestamp.getTime()) ? 1 : -1)
        .slice(0, 5);


    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="users" title="Total de Usuários" value={stats.totalUsers.toString()} color="bg-primary" />
                <StatCard icon="check-circle" title="Usuários Ativos" value={stats.activeUsers.toString()} color="bg-green-600" />
                <StatCard icon="currency-dollar" title="Recompensas Pagas" value={`$${transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s - t.amount, 0).toFixed(2)}`} color="bg-blue-600" />
                <StatCard icon="gift" title="Saques Pendentes" value={`$${pendingWithdrawalsTotal.toFixed(2)}`} color="bg-red-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-base-200 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-white">Crescimento de Usuários</h3>
                    <Chart type="line" />
                </div>
                 <div className="bg-base-200 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-4 text-white">Atividade Recente</h3>
                    <div className="space-y-4">
                        {recentActivities.map(activity => (
                             <div key={activity.id} className="flex items-start text-sm">
                                <Icon name={'requestDate' in activity ? 'gift' : 'coin'} className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0"/>
                                <div>
                                    {'requestDate' in activity ? (
                                        <p><span className="font-bold text-white">{activity.userName}</span> solicitou um saque de <span className="text-accent">${activity.amount.toFixed(2)}</span>.</p>
                                    ) : (
                                        <p><span className="font-bold text-white">Nova transação:</span> {activity.description} (<span className={activity.amount > 0 ? 'text-green-400' : 'text-red-400'}>${activity.amount.toFixed(2)}</span>).</p>
                                    )}
                                    <p className="text-xs text-gray-500">{('requestDate' in activity ? activity.requestDate : activity.timestamp).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                         {recentActivities.length === 0 && <p className="text-gray-500 text-center py-4">Nenhuma atividade recente.</p>}
                    </div>
                </div>
            </div>
             <div className="bg-base-200 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-white">Receita vs. Custos</h3>
                <Chart type="bar" />
            </div>
        </div>
    );
};

export default DashboardSection;