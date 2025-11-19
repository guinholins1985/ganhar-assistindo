
import React, { useEffect } from 'react';
import Icon from '../Icon';

interface AdminToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const AdminToast: React.FC<AdminToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const baseClasses = "fixed bottom-8 right-8 z-50 flex items-center text-white py-3 px-5 rounded-lg shadow-2xl transition-all duration-300 ease-in-out animate-fade-in-up";
  const typeClasses = type === 'success' 
    ? "bg-green-600" 
    : "bg-red-600";
  const iconName = type === 'success' ? 'check-circle' : 'warning';

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <Icon name={iconName} className="w-6 h-6 mr-3"/>
      <span className="font-semibold">{message}</span>
    </div>
  );
};

export default AdminToast;
