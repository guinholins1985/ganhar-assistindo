

import React from 'react';
import { Mission, AppSettings } from '../types';
import Icon from './Icon';
import AdSenseAd from './common/AdSenseAd';


interface EarnPageProps {
  missions: Mission[];
  onInvite: () => void;
  settings: AppSettings;
}

const EarnPage: React.FC<EarnPageProps> = ({ missions, onInvite, settings }) => {
  const showAd = settings.isAdsEnabled && settings.adsenseClientId && settings.adSlots.earnBanner;

  return (
    <div className="pt-12 pb-24 px-4 h-full overflow-y-auto bg-base-100 text-base-content">
      <div className="text-center mb-8">
        <Icon name="earn" className="w-12 h-12 mx-auto text-primary mb-2" />
        <h2 className="text-3xl font-bold">Ganhe Mais Recompensas</h2>
        <p className="text-gray-400">Complete missões e convide amigos!</p>
      </div>


      <div className="bg-primary rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between text-white shadow-lg">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h3 className="text-2xl font-bold">Convide Amigos</h3>
          <p className="text-sm opacity-90">Ganhe $5 por cada amigo que se cadastrar!</p>
        </div>
        <button onClick={onInvite} className="bg-white text-primary-dark font-bold py-3 px-6 rounded-xl flex items-center space-x-2 shrink-0 transition-transform hover:scale-105">
          <Icon name="users" className="w-5 h-5"/>
          <span>Convidar</span>
        </button>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Missões Diárias</h3>
        <div className="space-y-4">
          {missions.map(mission => (
            <div key={mission.id} className="bg-base-200 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-lg">{mission.title}</p>
                  <p className="text-sm text-gray-400">{mission.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-accent">
                  <Icon name="coin" className="w-6 h-6" />
                  <span className="font-bold text-lg">{mission.reward}</span>
                </div>
              </div>
              <div>
                <div className="w-full bg-base-300 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(mission.progress / mission.goal) * 100}%` }}></div>
                </div>
                <p className="text-right text-xs text-gray-400 mt-1.5">{mission.progress}/{mission.goal}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

       {showAd && (
        <div className="mt-8">
          <AdSenseAd clientId={settings.adsenseClientId} slotId={settings.adSlots.earnBanner} />
        </div>
      )}
    </div>
  );
};

export default EarnPage;