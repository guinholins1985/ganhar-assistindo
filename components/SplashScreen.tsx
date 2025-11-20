import React from 'react';
import Icon from './Icon';

interface SplashScreenProps {
  onStart: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-base-200 to-base-100 flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-8">
        <Icon name="recommendations" className="w-24 h-24 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
        Bem-vindo ao <span className="text-primary">VideoRewards AI</span>
      </h1>
      <p className="text-lg text-gray-300 max-w-xl mb-12">
        Assista a vídeos incríveis, complete missões e ganhe recompensas. Sua próxima descoberta está a um deslize de distância.
      </p>
      <button
        onClick={onStart}
        className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-10 rounded-full text-lg flex items-center space-x-3 transition-transform hover:scale-105 shadow-lg shadow-primary/30"
      >
        <Icon name="play" className="w-6 h-6" />
        <span>Começar a Assistir</span>
      </button>
    </div>
  );
};

export default SplashScreen;
