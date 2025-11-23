

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Video, User, AppSettings } from '../types';
import VideoPlayer from './VideoPlayer';
import AdSenseAd from './common/AdSenseAd';

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
  adSettings: Pick<AppSettings, 'isAdsEnabled' | 'adsenseClientId' | 'adSlots' | 'adFrequencyInFeed'>;
}

const VideoFeed: React.FC<VideoFeedProps> = ({ videos, user, onAddReward, onToggleFavorite, newlyAddedVideoId, onScrolledToNewVideo, rewardAmount, rewardTimeSeconds, isAudioUnlocked, adSettings }) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(videos.length > 0 ? videos[0].id : null);
  const feedRef = useRef<HTMLDivElement>(null);

  const feedItems = useMemo(() => {
    if (!adSettings.isAdsEnabled || !adSettings.adSlots.inFeed || adSettings.adFrequencyInFeed <= 0) {
      return videos;
    }
    const items: (Video | { type: 'ad'; id: string })[] = [];
    videos.forEach((video, index) => {
      items.push(video);
      if ((index + 1) % adSettings.adFrequencyInFeed === 0) {
        items.push({ type: 'ad', id: `ad-${index}` });
      }
    });
    return items;
  }, [videos, adSettings]);
  
  useEffect(() => {
    if (newlyAddedVideoId) {
      const element = document.getElementById(`item-container-${newlyAddedVideoId}`);
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
      threshold: 0.6,
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveItemId(entry.target.id.replace('item-container-', ''));
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    const elements = Array.from(document.querySelectorAll('.feed-item'));
    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
  }, [feedItems]);
  
  const handleVideoEnd = (endedVideoId: string) => {
    const currentIndex = feedItems.findIndex(v => 'id' in v && v.id === endedVideoId);

    if (currentIndex > -1) {
      const nextIndex = (currentIndex + 1) % feedItems.length;
      const nextItem = feedItems[nextIndex];
      if (nextItem) {
        const element = document.getElementById(`item-container-${nextItem.id}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const activeIndex = activeItemId ? feedItems.findIndex(item => item.id === activeItemId) : 0;

  return (
    <div ref={feedRef} className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory">
      {feedItems.map((item, index) => {
        let loadState: 'active' | 'preload' | 'lazy' = 'lazy';
        if (index === activeIndex) {
          loadState = 'active';
        } else if (Math.abs(index - activeIndex) <= 1) { // Preload next and previous
          loadState = 'preload';
        }

        if ('url' in item) { // It's a Video
          return (
            <div key={item.id} id={`item-container-${item.id}`} className="feed-item h-screen w-full snap-start flex items-center justify-center relative">
              <VideoPlayer
                video={item}
                user={user}
                onAddReward={onAddReward}
                onToggleFavorite={onToggleFavorite}
                rewardAmount={rewardAmount}
                rewardTimeSeconds={rewardTimeSeconds}
                onVideoEnd={handleVideoEnd}
                loadState={loadState}
                isAudioUnlocked={isAudioUnlocked}
              />
            </div>
          );
        } else { // It's an Ad
          return (
             <div key={item.id} id={`item-container-${item.id}`} className="feed-item h-screen w-full snap-start flex items-center justify-center relative bg-base-200">
                <AdSenseAd clientId={adSettings.adsenseClientId} slotId={adSettings.adSlots.inFeed} />
            </div>
          );
        }
      })}
    </div>
  );
};

export default VideoFeed;