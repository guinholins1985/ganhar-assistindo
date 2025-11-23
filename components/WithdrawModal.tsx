import React, { useState } from 'react';
import Icon from './Icon';

interface WithdrawModalProps {
  onClose: () => void;
  onRequestWithdrawal: (amount: number, pixKey: string) => void;
  currentBalance: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ onClose, onRequestWithdrawal, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (numericAmount > currentBalance) {
      setError('Withdrawal amount cannot exceed your balance.');
      return;
    }
    if (!pixKey.trim()) {
        setError('Please enter a valid PIX key.');
        return;
    }
    setError('');
    onRequestWithdrawal(numericAmount, pixKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-2">Request Withdrawal</h2>
        <p className="text-gray-400 mb-6">Current Balance: <span className="text-accent font-bold">${currentBalance.toFixed(2)}</span></p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-base-300 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="pix" className="block text-sm font-medium text-gray-300 mb-1">PIX Key (Email, Phone, or CPF)</label>
            <input
              type="text"
              id="pix"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="your.pix.key@example.com"
              className="w-full bg-base-300 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-primary/30 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawModal;