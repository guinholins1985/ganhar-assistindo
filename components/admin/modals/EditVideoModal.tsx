
import React, { useState } from 'react';
import { Video, Category } from '../../../types';
import Icon from '../../Icon';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface EditVideoModalProps {
    video: Video;
    categories: Category[];
    onClose: () => void;
    onUpdateVideo: (video: Video) => Promise<void>;
    showToast: ShowToastFn;
}

const EditVideoModal: React.FC<EditVideoModalProps> = ({ video, categories, onClose, onUpdateVideo, showToast }) => {
    const [formData, setFormData] = useState(video);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        await onUpdateVideo(formData);
        showToast('Vídeo atualizado com sucesso!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-base-300 rounded-lg shadow-xl w-full max-w-lg">
                <header className="flex items-center justify-between p-4 border-b border-base-200">
                    <h2 className="text-xl font-bold text-white">Editar Vídeo</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-base-200">
                        <Icon name="close" className="w-6 h-6 text-gray-400" />
                    </button>
                </header>
                <main className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-base-200 p-2 rounded"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Canal</label>
                        <input type="text" name="channel" value={formData.channel} onChange={handleChange} className="w-full bg-base-200 p-2 rounded"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
                        <select name="categoryId" value={formData.categoryId || ''} onChange={handleChange} className="w-full bg-base-200 p-2 rounded">
                            <option value="">Sem Categoria</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </main>
                 <footer className="p-4 bg-base-200/50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-secondary text-white">Cancelar</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded bg-primary text-white font-bold">Salvar Alterações</button>
                </footer>
            </div>
        </div>
    );
};

export default EditVideoModal;
