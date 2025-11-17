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
    <div className="bg-gray-800 rounded-lg p-6 flex items-center shadow-lg">
        <div className={`p-4 rounded-full mr-4 ${color}`}>
            <Icon name={icon} className="w-8 h-8 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-400 font-medium">{title}</p>
            <p className="text-4xl font-black text-white">{value}</p>
        </div>
    </div>
);


const DashboardSection: React.FC<DashboardSectionProps> = ({ stats, withdrawalRequests }) => {
    const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

    return (
        <div>
             <h2 className="text-3xl font-bold text-white mb-6">Visão Geral</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon="users" title="Total de Usuários" value={stats.totalUsers.toString()} color="bg-blue-500" />
                <StatCard icon="check-circle" title="Usuários Ativos" value={stats.activeUsers.toString()} color="bg-green-500" />
                <StatCard icon="currency-dollar" title="Saldo Total a Pagar" value={`$${stats.totalBalance.toFixed(2)}`} color="bg-yellow-500" />
                <StatCard icon="gift" title="Saques Pendentes" value={`$${pendingWithdrawals.toFixed(2)}`} color="bg-red-500" />
            </div>

            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-white">Crescimento de Usuários</h3>
                <div className="h-80 flex items-center justify-center">
                    <p className="text-gray-500">[Gráfico demonstrando o crescimento de usuários diário/semanal/mensal estaria aqui]</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardSection;