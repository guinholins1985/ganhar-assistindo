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
  
  const handleVideoEnd = (endedVideoId: string) => {
    const currentIndex = videos.findIndex(v => v.id === endedVideoId);

    if (currentIndex > -1) {
      // Loop back to the first video if the current one is the last
      const nextIndex = (currentIndex + 1) % videos.length;
      const nextVideo = videos[nextIndex];
      if (nextVideo) {
        const element = document.getElementById(`video-${nextVideo.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

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
            onVideoEnd={handleVideoEnd}
          />
        </div>
      ))}
    </div>
  );
};

export default VideoFeed;