
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
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-full transition-all duration-200 transform active:scale-90 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-base-content'}`}
  >
    <div className="relative w-full flex justify-center">
      <Icon name={icon} className="w-6 h-6 mb-1" />
      {isActive && <div className="absolute -bottom-1 w-2 h-2 bg-primary rounded-full"></div>}
    </div>
    <span className={`text-[0.6rem] font-bold tracking-wide uppercase ${isActive ? 'text-primary' : ''}`}>{label}</span>
  </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView, onAddVideoClick }) => {
  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-base-200/50 backdrop-blur-lg flex items-center z-50 shadow-t-lg">
      <div className="flex justify-around items-center w-full h-full">
        <NavButton label="Home" icon="home" isActive={activeView === 'home'} onClick={() => setActiveView('home')} />
        <NavButton label="Earn" icon="earn" isActive={activeView === 'earn'} onClick={() => setActiveView('earn')} />
        
        {/* FAB Placeholder */}
        <div className="w-20"></div>

        <NavButton label="AI Recs" icon="recommendations" isActive={activeView === 'recommendations'} onClick={() => setActiveView('recommendations')} />
        <NavButton label="Profile" icon="profile" isActive={activeView === 'profile'} onClick={() => setActiveView('profile')} />
      </div>
      
      {/* Floating Action Button */}
      <button 
        onClick={onAddVideoClick} 
        className="absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/40 transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:shadow-md"
        aria-label="Add Video"
      >
        <Icon name="add" className="w-8 h-8 text-white" />
      </button>
    </nav>
  );
};

export default BottomNav;