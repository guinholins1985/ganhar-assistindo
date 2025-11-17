
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
    <div className="pt-12 pb-24 px-4 h-full overflow-y-auto bg-gray-900">
      <div className="flex flex-col items-center mb-8">
        <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4" />
        <h2 className="text-2xl font-bold">{user.name}</h2>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8 text-center">
        <p className="text-gray-400 text-sm">Your Balance</p>
        <p className="text-4xl font-bold text-yellow-400 my-2">
          ${user.balance.toFixed(2)}
        </p>
        <button onClick={onWithdraw} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full">
          Withdraw Funds
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
        <div className="space-y-3">
          {transactions.map(t => (
            <div key={t.id} className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{t.description}</p>
                <p className="text-gray-400 text-sm">{t.timestamp.toLocaleDateString()}</p>
              </div>
              <p className={`font-bold text-lg ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
