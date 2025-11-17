import React, { useState } from 'react';
import { Video } from '../../types';
import Icon from '../Icon';
import AdminAddVideoModal from './AdminAddVideoModal';

interface VideosSectionProps {
    videos: Video[];
    onUpdateVideo: (video: Video) => void;
    onDeleteVideo: (videoId: string) => void;
    onAddVideo: (url: string) => void;
}

const VideosSection: React.FC<VideosSectionProps> = ({ videos, onUpdateVideo, onDeleteVideo, onAddVideo }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleStatus = (video: Video) => {
        const newStatus = video.status === 'active' ? 'inactive' : 'active';
        onUpdateVideo({ ...video, status: newStatus });
    };

    const handleDelete = (video: Video) => {
        if (window.confirm(`Você tem certeza que deseja excluir o vídeo "${video.title}"?`)) {
            onDeleteVideo(video.id);
        }
    };
    
    const handleAddVideoSubmit = (url: string) => {
        onAddVideo(url);
        setIsModalOpen(false);
        alert('Vídeo adicionado com sucesso!');
    };


    return (
        <>
            <div className="bg-gray-800 rounded-lg p-4 sm:p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-white">Gerenciar Vídeos</h2>
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors self-start sm:self-center">
                        <Icon name="add" className="w-5 h-5 mr-2"/>
                        <span>Adicionar Vídeo</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700 text-gray-300 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="p-4">Vídeo</th>
                                <th className="p-4 hidden md:table-cell">Canal</th>
                                <th className="p-4 hidden sm:table-cell">Tipo</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {videos.map(video => (
                                <tr key={video.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                    <td className="p-4 flex items-center">
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-20 h-20 object-cover rounded-md mr-4 hidden sm:block flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-lg text-white">{video.title}</p>
                                            <p className="text-sm text-gray-400 sm:hidden">{video.channel}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell text-gray-300">{video.channel}</td>
                                    <td className="p-4 hidden sm:table-cell capitalize text-gray-300">{video.type}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                                            video.status === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {video.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center items-center space-x-2">
                                            {/* Toggle Switch */}
                                            <label htmlFor={`toggle-${video.id}`} className="flex items-center cursor-pointer" title={video.status === 'active' ? 'Desativar Vídeo' : 'Ativar Vídeo'}>
                                                <div className="relative">
                                                    <input type="checkbox" id={`toggle-${video.id}`} className="sr-only" checked={video.status === 'active'} onChange={() => toggleStatus(video)} />
                                                    <div className="block bg-gray-600 w-11 h-6 rounded-full"></div>
                                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${video.status === 'active' ? 'translate-x-5' : ''}`}></div>
                                                </div>
                                            </label>
                                            {/* Delete Button */}
                                            <button onClick={() => handleDelete(video)} title="Excluir Vídeo" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-600 transition-colors">
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
            {isModalOpen && (
                <AdminAddVideoModal 
                    onClose={() => setIsModalOpen(false)}
                    onAddVideo={handleAddVideoSubmit}
                />
            )}
        </>
    );
};

export default VideosSection;