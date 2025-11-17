import React, { useEffect } from 'react';
import { Video, User } from '../types';
import VideoPlayer from './VideoPlayer';

interface VideoFeedProps {
  videos: Video[];
  user: User;
  onAddReward: (videoId: string, amount: number) => void;
  onToggleFavorite: (videoId: string) => void;
  newlyAddedVideoId?: string | null;
  onScrolledToNewVideo?: () => void;
  rewardAmount: number;
  rewardTimeSeconds: number;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, user, onAddReward, onToggleFavorite, newlyAddedVideoId, onScrolledToNewVideo, rewardAmount, rewardTimeSeconds }) => {
  useEffect(() => {
    if (newlyAddedVideoId) {
      const element = document.getElementById(`video-${newlyAddedVideoId}`);
      if (element) {
        // Use a slight delay to ensure the DOM is updated before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (onScrolledToNewVideo) {
            onScrolledToNewVideo();
          }
        }, 100); 
      }
    }
  }, [newlyAddedVideoId, onScrolledToNewVideo]);
  
  return (
    <div className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory">
      {videos.map((video) => (
        <div key={video.id} id={`video-${video.id}`} className="h-screen w-full snap-start flex items-center justify-center relative">
          <VideoPlayer
            video={video}
            user={user}
            onAddReward={onAddReward}
            onToggleFavorite={onToggleFavorite}
            rewardAmount={rewardAmount}
            rewardTimeSeconds={rewardTimeSeconds}
          />
        </div>
      ))}
    </div>
  );
};

export default VideoFeed;