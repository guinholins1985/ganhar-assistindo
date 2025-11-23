import React, { useState } from 'react';
import Icon from './Icon';

interface AddVideoModalProps {
  onClose: () => void;
  onAddVideo: (url: string) => void;
}

const AddVideoModal: React.FC<AddVideoModalProps> = ({ onClose, onAddVideo }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAddVideo(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 rounded-lg p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Add New Video</h2>
        <p className="text-gray-400 mb-6">Paste a link from YouTube, Vimeo, Dailymotion, Kwai, etc. We'll automatically fetch video details when available.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-base-300 text-white p-3 rounded-lg mb-4 border border-gray-600 focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button 
            type="submit" 
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-primary/30 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-md"
          >
            Add Video
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddVideoModal;