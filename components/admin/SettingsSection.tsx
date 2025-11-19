
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
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };
    
    const handleSave = async () => {
        await onUpdateSettings(formData);
        showToast('Configurações salvas com sucesso!', 'success');
    };

    return (
        <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Informações do App</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Nome do App</label>
                        <input 
                            type="text" 
                            name="appName"
                            value={formData.appName}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">URL da Logo</label>
                        <input 
                            type="text" 
                            name="logoUrl"
                            value={formData.logoUrl}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Chaves de API</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Chave de API Gemini AI</label>
                        <input 
                            type="password" 
                            name="geminiApiKey"
                            value={formData.geminiApiKey}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Chave de API do YouTube</label>
                        <input 
                            type="password" 
                            name="youtubeApiKey"
                            value={formData.youtubeApiKey}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Configurações de Recompensa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Recompensa por Vídeo ($)</label>
                        <input 
                            type="number"
                            name="rewardPerVideo"
                            value={formData.rewardPerVideo}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Tempo Mínimo de Exibição (segundos)</label>
                        <input 
                            type="number"
                            name="minWatchTime"
                            value={formData.minWatchTime}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Limites de Saque</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Saque Mínimo ($)</label>
                        <input 
                            type="number"
                            name="minWithdrawal"
                            value={formData.minWithdrawal}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Diário / Usuário ($)</label>
                        <input 
                            type="number"
                            name="maxDailyWithdrawalUser"
                            value={formData.maxDailyWithdrawalUser}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Máx. Diário / Total ($)</label>
                        <input 
                            type="number"
                            name="maxDailyWithdrawalTotal"
                            value={formData.maxDailyWithdrawalTotal}
                            onChange={handleChange}
                            className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-8">
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center transition-all duration-300 ease-in-out shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/50">
                    <Icon name="check-circle" className="w-5 h-5 mr-2"/>
                    <span>Salvar Todas as Alterações</span>
                </button>
            </div>
        </div>
    );
};

export default SettingsSection;
