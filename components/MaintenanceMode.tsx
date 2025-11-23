import React from 'react';
import Icon from './Icon';

interface MaintenanceModeProps {
  message: string;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ message }) => {
  return (
    <div className="h-screen w-screen bg-base-100 text-base-content flex flex-col items-center justify-center p-4 text-center">
      <Icon name="cog" className="w-20 h-20 text-primary animate-spin mb-8" />
      <h1 className="text-4xl font-black text-white mb-4">Em Manutenção</h1>
      <p className="text-lg text-gray-300 max-w-xl">
        {message}
      </p>
    </div>
  );
};

export default MaintenanceMode;
