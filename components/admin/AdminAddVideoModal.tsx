import React, { useState } from 'react';
import Icon from '../Icon';

interface AdminAddVideoModalProps {
  onClose: () => void;
  onAddVideo: (url: string) => void;
}

const AdminAddVideoModal: React.FC<AdminAddVideoModalProps> = ({ onClose, onAddVideo }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddVideo(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md relative border border-gray-700 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">Adicionar Novo Vídeo</h2>
        <p className="text-gray-400 mb-6">Cole um link de vídeo (ex: YouTube, Dailymotion, Kwai). O sistema buscará os detalhes automaticamente.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-gray-700 text-white p-3 rounded-lg mb-6 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            aria-label="URL do Vídeo"
          />
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={!url.trim()}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddVideoModal;