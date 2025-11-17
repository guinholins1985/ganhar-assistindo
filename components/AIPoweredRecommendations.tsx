
import React, { useState, useEffect } from 'react';
import { Video } from '../types';
import { getRecommendations } from '../services/geminiService';
import Icon from './Icon';

interface AIPoweredRecommendationsProps {
  watchedVideos: Video[];
}

const AIPoweredRecommendations: React.FC<AIPoweredRecommendationsProps> = ({ watchedVideos }) => {
  const [recommendations, setRecommendations] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getRecommendations(watchedVideos);
        setRecommendations(result);
      } catch (err) {
        setError('Failed to fetch recommendations.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once when component mounts

  return (
    <div className="pt-12 pb-24 px-4 h-full overflow-y-auto bg-gray-900">
      <div className="text-center mb-8">
        <Icon name="recommendations" className="w-16 h-16 mx-auto text-blue-400 mb-4" />
        <h2 className="text-3xl font-bold">Your AI Recommendations</h2>
        <p className="text-gray-400 mt-2">Discover new content tailored just for you!</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center space-y-2 text-gray-400">
            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Analyzing your watch history...</span>
          </div>
        )}
        {error && <p className="text-red-400">{error}</p>}
        {!isLoading && !error && (
          <p className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {recommendations}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIPoweredRecommendations;
