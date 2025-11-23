

import React from 'react';
import Icon from '../Icon';
import { WithdrawalRequest, Transaction, User, SystemLog } from '../../types';
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
    systemLogs: SystemLog[];
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


const DashboardSection: React.FC<DashboardSectionProps> = ({ stats, withdrawalRequests, transactions, users, systemLogs }) => {
    const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending');
    const pendingWithdrawalsTotal = pendingWithdrawals.reduce((sum, r) => sum + r.amount, 0);

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
                    <h3 className="text-xl font-semibold mb-4 text-white">Logs do Sistema</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {systemLogs.slice(0, 10).map(log => (
                             <div key={log.id} className="flex items-start text-sm">
                                <Icon name={'cog'} className="w-5 h-5 mr-3 mt-1 text-gray-500 flex-shrink-0"/>
                                <div>
                                    <p className="text-gray-300">{log.description}</p>
                                    <p className="text-xs text-gray-500">{log.timestamp.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                         {systemLogs.length === 0 && <p className="text-gray-500 text-center py-4">Nenhum log do sistema.</p>}
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
