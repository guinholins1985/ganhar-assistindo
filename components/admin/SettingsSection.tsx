import React, { useState, useEffect } from 'react';
import Icon from '../Icon';
import { AppSettings } from '../../types';

interface SettingsSectionProps {
    settings: AppSettings;
    onUpdateSettings: (settings: AppSettings) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ settings, onUpdateSettings }) => {
    const [formData, setFormData] = useState<AppSettings>(settings);
    const [showToast, setShowToast] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };
    
    const handleSave = () => {
        onUpdateSettings(formData);
        setShowToast(true);
    };

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

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
            
            {/* Toast Notification */}
            <div 
                aria-live="assertive" 
                className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                <div className="flex items-center bg-green-600 text-white py-3 px-5 rounded-lg shadow-2xl">
                    <Icon name="check-circle" className="w-6 h-6 mr-3"/>
                    <span className="font-semibold">Configurações salvas com sucesso!</span>
                </div>
            </div>
        </div>
    );
};

export default SettingsSection;