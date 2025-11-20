
import React from 'react';
import { User, Transaction } from '../types';
import Icon from './Icon';

interface ProfilePageProps {
  user: User;
  transactions: Transaction[];
  onWithdraw: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, transactions, onWithdraw }) => {
  return (
    <div className="pt-12 pb-24 h-full overflow-y-auto bg-base-100 text-base-content">
      <div className="px-4">
        <div className="flex flex-col items-center mb-8">
          <img src={user.avatarUrl} alt={user.name} className="w-28 h-28 rounded-full border-4 border-primary mb-4 shadow-lg" />
          <h2 className="text-3xl font-bold">{user.name}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        <div className="bg-primary rounded-2xl p-6 mb-8 text-center shadow-lg text-white">
          <p className="text-sm opacity-80">Seu Saldo</p>
          <p className="text-5xl font-black my-2 tracking-tight">
            ${user.balance.toFixed(2)}
          </p>
          <button 
            onClick={onWithdraw} 
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 rounded-xl transition-colors w-full mt-2"
          >
            Sacar Fundos
          </button>
        </div>
      </div>

      <div className="px-4">
        <h3 className="text-xl font-semibold mb-4">Histórico de Transações</h3>
        <div className="space-y-3">
          {transactions.length > 0 ? transactions.map(t => (
            <div key={t.id} className="bg-base-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{t.description}</p>
                <p className="text-gray-400 text-sm">{t.timestamp.toLocaleDateString()}</p>
              </div>
              <p className={`font-bold text-lg ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {t.amount >= 0 ? '+' : ''}${t.amount.toFixed(2)}
              </p>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-500 bg-base-200 rounded-xl">
              <p>Nenhuma transação ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;