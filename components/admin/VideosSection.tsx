

import React, { useState } from 'react';
import { Video, Category } from '../../types';
import Icon from '../Icon';
import EditVideoModal from './modals/EditVideoModal';
import ManageCategoriesModal from './modals/ManageCategoriesModal';
import AdminAddVideoModal from './modals/AdminAddVideoModal';

type ShowToastFn = (message: string, type?: 'success' | 'error') => void;

interface VideosSectionProps {
    videos: Video[];
    categories: Category[];
    onUpdateVideo: (video: Video) => Promise<void>;
    onDeleteVideo: (videoId: string) => Promise<void>;
    onAddVideo: (url: string) => Promise<string>;
    showToast: ShowToastFn;
    onAddCategory: (name: string) => Promise<void>;
    onUpdateCategory: (category: Category) => Promise<void>;
    onDeleteCategory: (id: string) => Promise<void>;
    logAdminAction: (description: string) => Promise<void>;
}

const VideosSection: React.FC<VideosSectionProps> = ({ videos, categories, onUpdateVideo, onDeleteVideo, onAddVideo, showToast, onAddCategory, onUpdateCategory, onDeleteCategory, logAdminAction }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

    const handleSelectVideo = (videoId: string) => {
        setSelectedVideos(prev =>
            prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedVideos(videos.map(v => v.id));
        } else {
            setSelectedVideos([]);
        }
    };
    
    const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedVideos.length === 0) return;
        const actionText = { activate: 'ativar', deactivate: 'desativar', delete: 'excluir' };
        if (window.confirm(`Você tem certeza que deseja ${actionText[action]} ${selectedVideos.length} vídeo(s) selecionado(s)?`)) {
            for (const videoId of selectedVideos) {
                const video = videos.find(v => v.id === videoId);
                if (video) {
                    if (action === 'delete') {
                        await onDeleteVideo(videoId);
                    } else {
                        const newStatus = action === 'activate' ? 'active' : 'inactive';
                        if (video.status !== newStatus) {
                            await onUpdateVideo({ ...video, status: newStatus });
                        }
                    }
                }
            }
            await logAdminAction(`${selectedVideos.length} vídeo(s) foram afetados pela ação em massa: ${action}.`);
            showToast(`${selectedVideos.length} vídeo(s) foram atualizados.`, 'success');
            setSelectedVideos([]);
        }
    };
    
    const handleAddVideoSubmit = async (url: string) => {
        try {
            const successMessage = await onAddVideo(url);
            setAddModalOpen(false);
            showToast(successMessage, 'success');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
            showToast(`Erro ao adicionar vídeo: ${errorMessage}`, 'error');
        }
    };

    return (
        <>
            <div className="bg-base-300 rounded-lg p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-white">Gerenciar Vídeos</h2>
                    <div className="flex space-x-2 self-start sm:self-center">
                        <button onClick={() => setCategoryModalOpen(true)} className="bg-secondary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Icon name="pencil" className="w-4 h-4 mr-2"/>
                            <span>Gerenciar Categorias</span>
                        </button>
                         <button onClick={() => setAddModalOpen(true)} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors">
                            <Icon name="add" className="w-5 h-5 mr-2"/>
                            <span>Adicionar Vídeo</span>
                        </button>
                    </div>
                </div>

                {selectedVideos.length > 0 && (
                    <div className="bg-base-200 p-3 rounded-lg mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold">{selectedVideos.length} vídeo(s) selecionado(s)</p>
                        <div className="flex space-x-2">
                            <button onClick={() => handleBulkAction('activate')} className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-1 px-3 rounded">Ativar</button>
                            <button onClick={() => handleBulkAction('deactivate')} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold py-1 px-3 rounded">Desativar</button>
                            <button onClick={() => handleBulkAction('delete')} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1 px-3 rounded">Excluir</button>
                        </div>
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-base-200 text-gray-400 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4 w-12"><input type="checkbox" onChange={handleSelectAll} className="bg-base-200 rounded"/></th>
                                <th className="p-4">Vídeo</th>
                                <th className="p-4 hidden md:table-cell">Canal</th>
                                <th className="p-4 hidden sm:table-cell">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {videos.map(video => (
                                <tr key={video.id} className="border-b border-base-200 hover:bg-base-200/50">
                                    <td className="p-4"><input type="checkbox" checked={selectedVideos.includes(video.id)} onChange={() => handleSelectVideo(video.id)} className="bg-base-200 rounded"/></td>
                                    <td className="p-4 flex items-center">
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0" />
                                        <p className="font-bold text-lg text-white">{video.title}</p>
                                    </td>
                                    <td className="p-4 text-gray-300 hidden md:table-cell">{video.channel}</td>
                                    <td className="p-4 hidden sm:table-cell">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                            video.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {video.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => setEditingVideo(video)} title="Editar Vídeo" className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-base-200 transition-colors">
                                                <Icon name="pencil" className="w-5 h-5"/>
                                            </button>
                                            <button onClick={() => onDeleteVideo(video.id)} title="Excluir Vídeo" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-base-200 transition-colors">
                                                <Icon name="trash" className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {videos.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Nenhum vídeo cadastrado.</p>
                    </div>
                )}
            </div>
            {isAddModalOpen && (
                <AdminAddVideoModal 
                    onClose={() => setAddModalOpen(false)}
                    onAddVideo={handleAddVideoSubmit}
                />
            )}
            {editingVideo && (
                <EditVideoModal
                    video={editingVideo}
                    categories={categories}
                    onClose={() => setEditingVideo(null)}
                    onUpdateVideo={onUpdateVideo}
                    showToast={showToast}
                />
            )}
            {isCategoryModalOpen && (
                <ManageCategoriesModal
                    categories={categories}
                    onClose={() => setCategoryModalOpen(false)}
                    onAddCategory={onAddCategory}
                    onUpdateCategory={onUpdateCategory}
                    onDeleteCategory={onDeleteCategory}
                    showToast={showToast}
                />
            )}
        </>
    );
};

export default VideosSection;
