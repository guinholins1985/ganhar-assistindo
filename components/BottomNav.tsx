
import React from 'react';
import { View } from '../types';
import Icon from './Icon';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onAddVideoClick: () => void;
}

const NavButton: React.FC<{
  label: string;
  icon: 'home' | 'earn' | 'recommendations' | 'profile';
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400'}`}>
    <Icon name={icon} className="w-7 h-7 mb-0.5" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, onAddVideoClick }) => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-20 bg-black/50 backdrop-blur-md flex items-center justify-around z-50">
      <NavButton label="Home" icon="home" isActive={activeView === 'home'} onClick={() => setActiveView('home')} />
      <NavButton label="Earn" icon="earn" isActive={activeView === 'earn'} onClick={() => setActiveView('earn')} />
      <button onClick={onAddVideoClick} className="w-16 h-10 bg-white rounded-xl flex items-center justify-center">
        <Icon name="add" className="w-8 h-8 text-black" />
      </button>
      <NavButton label="AI Recs" icon="recommendations" isActive={activeView === 'recommendations'} onClick={() => setActiveView('recommendations')} />
      <NavButton label="Profile" icon="profile" isActive={activeView === 'profile'} onClick={() => setActiveView('profile')} />
    </nav>
  );
};

export default BottomNav;
