


import React, { useState } from 'react';
import Icon from '../Icon';
import { AppSettings } from '../../types';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface SettingsSectionProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => Promise<void>;
    showToast: ShowToastFn;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ settings, onUpdateSettings, showToast }) => {
    const [formData, setFormData] = useState<AppSettings>(settings);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value,
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
            }));
        }
    };
    
    const handleSave = async () => {
        await onUpdateSettings(formData);
        showToast('Configurações salvas com sucesso!', 'success');
    };

    return (
        <div className="space-y-8">
            <div className="bg-base-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Informações do App</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nome do App</label>
                        <input 
                            type="text" 
                            name="appName"
                            value={formData.appName}
                            onChange={handleChange}
                            className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">URL da Logo</label>
                        <input 
                            type="text" 
                            name="logoUrl"
                            value={formData.logoUrl}
                            onChange={handleChange}
                            className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" 
                        />
                    </div>
                </div>
            </div>
            
             <div className="bg-base-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Monetização (Google AdSense)</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                         <label htmlFor="isAdsEnabled" className="block text-sm font-medium text-gray-300">Ativar Anúncios</label>
                         <label htmlFor="isAdsEnabled" className="flex items-center cursor-pointer">
                            <div className="relative">
                                <input type="checkbox" id="isAdsEnabled" name="isAdsEnabled" className="sr-only" checked={formData.isAdsEnabled} onChange={handleChange} />
                                <div className="block bg-gray-600 w-11 h-6 rounded-full"></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isAdsEnabled ? 'translate-x-5' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ID de Cliente AdSense (ca-pub-...)</label>
                            <input type="text" name="adsenseClientId" value={formData.adsenseClientId} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Frequência de Anúncios no Feed (a cada X vídeos)</label>
                            <input type="number" name="adFrequencyInFeed" value={formData.adFrequencyInFeed} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ID do Anúncio no Feed</label>
                            <input type="text" name="adSlots.inFeed" value={formData.adSlots.inFeed} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ID do Anúncio do Perfil</label>
                            <input type="text" name="adSlots.profileBanner" value={formData.adSlots.profileBanner} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">ID do Anúncio da Página de Ganhos</label>
                            <input type="text" name="adSlots.earnBanner" value={formData.adSlots.earnBanner} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-base-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Chaves de API</h3>
                 {/* FIX: Removed Gemini API Key field and adjusted grid layout. */}
                 <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Chave de API do YouTube</label>
                        <input type="password" name="youtubeApiKey" value={formData.youtubeApiKey} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-base-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Configurações de Recompensa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Recompensa por Vídeo ($)</label>
                        <input type="number" name="rewardPerVideo" value={formData.rewardPerVideo} onChange={handleChange} step="0.01" className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tempo Mínimo de Exibição (segundos)</label>
                        <input type="number" name="minWatchTime" value={formData.minWatchTime} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>
            </div>

            <div className="bg-base-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Limites de Saque</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Saque Mínimo ($)</label>
                        <input type="number" name="minWithdrawal" value={formData.minWithdrawal} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Diário / Usuário ($)</label>
                        <input type="number" name="maxDailyWithdrawalUser" value={formData.maxDailyWithdrawalUser} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Diário / Total ($)</label>
                        <input type="number" name="maxDailyWithdrawalTotal" value={formData.maxDailyWithdrawalTotal} onChange={handleChange} className="w-full bg-base-300 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all duration-300 ease-in-out shadow-lg hover:shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/50">
                    <Icon name="check-circle" className="w-5 h-5 mr-2"/>
                    <span>Salvar Todas as Alterações</span>
                </button>
            </div>
        </div>
    );
};

export default SettingsSection;