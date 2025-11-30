import React, { useState } from 'react';
import Icon from '../Icon';

interface AdminAddVideoModalProps {
  onClose: () => void;
  onAddVideo: (url: string) => void;
}

const AdminAddVideoModal: React.FC<AdminAddVideoModalProps> = ({ onClose, onAddVideo }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await onAddVideo(url);
        // The parent component handles closing and showing the toast.
      } catch(e) {
        // Parent shows the toast on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
      <div className="bg-base-300 rounded-lg p-6 w-full max-w-md relative border border-base-200 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">Adicionar Novo Vídeo</h2>
        <p className="text-gray-400 mb-6">Cole um link de vídeo (ex: YouTube, Vimeo, Dailymotion, Kwai). O sistema buscará os detalhes automaticamente.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-base-200 text-white p-3 rounded-lg mb-6 border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
            aria-label="URL do Vídeo"
            disabled={isLoading}
          />
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-secondary hover:bg-gray-700 text-white font-semibold transition-colors">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={!url.trim() || isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Adicionar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddVideoModal;