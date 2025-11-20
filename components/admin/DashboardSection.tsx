
import React from 'react';
import Icon from '../Icon';
import { WithdrawalRequest } from '../../types';

interface DashboardSectionProps {
    stats: {
        totalUsers: number;
        activeUsers: number;
        totalBalance: number;
    };
    withdrawalRequests: WithdrawalRequest[];
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


const DashboardSection: React.FC<DashboardSectionProps> = ({ stats, withdrawalRequests }) => {
    const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon="users" title="Total de Usuários" value={stats.totalUsers.toString()} color="bg-primary" />
                <StatCard icon="check-circle" title="Usuários Ativos" value={stats.activeUsers.toString()} color="bg-green-600" />
                <StatCard icon="currency-dollar" title="Saldo a Pagar" value={`$${stats.totalBalance.toFixed(2)}`} color="bg-accent" />
                <StatCard icon="gift" title="Saques Pendentes" value={`$${pendingWithdrawals.toFixed(2)}`} color="bg-red-600" />
            </div>

            <div className="bg-base-200 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-white">Crescimento de Usuários</h3>
                <div className="h-80 flex items-center justify-center bg-base-300/50 rounded-lg">
                    <p className="text-gray-500">[Gráfico demonstrando o crescimento de usuários estaria aqui]</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardSection;