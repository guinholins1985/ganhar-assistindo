
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, user, onAddReward, onToggleFavorite, newlyAddedVideoId, onScrolledToNewVideo, rewardAmount, rewardTimeSeconds, isAudioUnlocked, onUnlockAudio }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(videos.length > 0 ? videos[0].id : null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newlyAddedVideoId) {
      const element = document.getElementById(`video-container-${newlyAddedVideoId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          if (onScrolledToNewVideo) onScrolledToNewVideo();
        }, 100); 
      }
    }
  }, [newlyAddedVideoId, onScrolledToNewVideo]);

  useEffect(() => {
    const options = {
      root: feedRef.current,
      threshold: 0.6, // Video is "active" when 60% is visible
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveVideoId(entry.target.id.replace('video-container-', ''));
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    const elements = Array.from(document.querySelectorAll('.video-container'));
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, [videos]);
  
  const handleVideoEnd = (endedVideoId: string) => {
    const currentIndex = videos.findIndex(v => v.id === endedVideoId);

    if (currentIndex > -1) {
      const nextIndex = (currentIndex + 1) % videos.length;
      const nextVideo = videos[nextIndex];
      if (nextVideo) {
        const element = document.getElementById(`video-container-${nextVideo.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const activeIndex = activeVideoId ? videos.findIndex(v => v.id === activeVideoId) : 0;

  return (
    <div ref={feedRef} className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory">
      {videos.map((video, index) => {
        let loadState: 'active' | 'preload' | 'lazy' = 'lazy';
        if (index === activeIndex) {
          loadState = 'active';
        } else if (Math.abs(index - activeIndex) === 1) {
          loadState = 'preload';
        }

        return (
          <div key={video.id} id={`video-container-${video.id}`} className="video-container h-screen w-full snap-start flex items-center justify-center relative">
            <VideoPlayer
              video={video}
              user={user}
              onAddReward={onAddReward}
              onToggleFavorite={onToggleFavorite}
              rewardAmount={rewardAmount}
              rewardTimeSeconds={rewardTimeSeconds}
              onVideoEnd={handleVideoEnd}
              loadState={loadState}
              isAudioUnlocked={isAudioUnlocked}
              onUnlockAudio={onUnlockAudio}
            />
          </div>
        );
      })}
    </div>
  );
};

export default VideoFeed;
