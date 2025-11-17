
import React from 'react';
import { Mission } from '../types';
import Icon from './Icon';

interface EarnPageProps {
  missions: Mission[];
  onInvite: () => void;
}

const EarnPage: React.FC<EarnPageProps> = ({ missions, onInvite }) => {
  return (
    <div className="pt-12 pb-24 px-4 h-full overflow-y-auto bg-gray-900">
      <h2 className="text-3xl font-bold text-center mb-8">Earn More Rewards</h2>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Invite Friends</h3>
          <p className="text-sm">Earn $5 for every friend who signs up!</p>
        </div>
        <button onClick={onInvite} className="bg-white text-blue-600 font-bold py-2 px-4 rounded-lg flex items-center space-x-2">
          <Icon name="users" className="w-5 h-5"/>
          <span>Invite</span>
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Daily Missions</h3>
        <div className="space-y-4">
          {missions.map(mission => (
            <div key={mission.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{mission.title}</p>
                  <p className="text-sm text-gray-400">{mission.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Icon name="coin" className="w-5 h-5" />
                  <span className="font-bold">{mission.reward}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(mission.progress / mission.goal) * 100}%` }}></div>
                </div>
                <p className="text-right text-xs text-gray-400 mt-1">{mission.progress}/{mission.goal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarnPage;
