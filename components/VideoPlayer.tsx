import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Video, User } from '../types';
import Icon from './Icon';

interface VideoPlayerProps {
  video: Video;
  user: User;
  onAddReward: (videoId: string, amount: number) => void;
  onToggleFavorite: (videoId: string) => void;
  rewardAmount: number;
  rewardTimeSeconds: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, user, onAddReward, onToggleFavorite, rewardAmount, rewardTimeSeconds }) => {
  const [progress, setProgress] = useState(0);
  const [isRewarded, setIsRewarded] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  const isFavorite = user.favorites.includes(video.id);
  
  const rewardTimeMs = rewardTimeSeconds * 1000;

  const startTimer = useCallback(() => {
    if (isRewarded || rewardTimeMs <= 0) return;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 100;
        if (newProgress >= rewardTimeMs) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onAddReward(video.id, rewardAmount);
          setIsRewarded(true);
          return rewardTimeMs;
        }
        return newProgress;
      });
    }, 100);
  }, [isRewarded, onAddReward, video.id, rewardAmount, rewardTimeMs]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const observerCallback = useCallback(([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        startTimer();
      } else {
        stopTimer();
      }
    }, [startTimer, stopTimer]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.8 });
    const currentRef = playerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      stopTimer();
    };
  }, [playerRef, observerCallback, stopTimer]);
  
  const getEmbedUrl = (videoItem: Video): string | null => {
      // YouTube
      if (videoItem.url.includes('youtube.com') || videoItem.url.includes('youtu.be')) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = videoItem.url.match(regExp);
          const videoId = (match && match[2].length === 11) ? match[2] : null;
          if (videoId) {
              // Always embed the single video, ignore playlist parameters in the URL.
              // The `&playlist=${videoId}` parameter makes the single video loop.
              return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&iv_load_policy=3`;
          }
      }
      // Vimeo
      if (videoItem.url.includes('vimeo.com')) {
          const videoIdMatch = videoItem.url.match(/vimeo.com\/(\d+)/);
          if (videoIdMatch) {
              return `https://player.vimeo.com/video/${videoIdMatch[1]}?autoplay=1&muted=1&loop=1&autopause=0&background=1`;
          }
      }
      // Dailymotion
      if (videoItem.url.includes('dailymotion.com')) {
          const regex = /dailymotion.com\/(?:video|embed\/video)\/([^_?]+)/;
          const match = videoItem.url.match(regex);
          const videoId = match ? match[1] : null;
          if (videoId) {
              return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=1&ui-logo=false&ui-start-screen-info=false`;
          }
      }
      // Kwai
      if (videoItem.url.includes('kw.ai') || videoItem.url.includes('kuaishou.com')) {
          // Extracts video ID from formats like /video/ID or /short-video/ID
          const kwaiRegex = /(?:video|short-video)\/([a-zA-Z0-9_-]+)/;
          const match = videoItem.url.match(kwaiRegex);
          const videoId = match ? match[1] : null;
          
          if (videoId) {
              return `https://www.kwai.com/embed/${videoId}?autoplay=1&mute=1`;
          }
      }
      return null;
  };

  const embedUrl = getEmbedUrl(video);
  const rewardProgress = rewardTimeMs > 0 ? (progress / rewardTimeMs) * 100 : 100;

  return (
    <div ref={playerRef} className="relative w-full h-full bg-black">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          frameBorder="0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full object-cover"
          title={video.title}
        ></iframe>
      ) : (
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

      <div className="absolute bottom-20 left-4 text-white z-10 pr-16">
        <h3 className="font-bold text-lg shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{video.title}</h3>
        <p className="text-sm shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{video.channel}</p>
      </div>

      <div className="absolute bottom-24 right-4 flex flex-col items-center space-y-6 z-10">
        <button onClick={() => onToggleFavorite(video.id)} className="flex flex-col items-center text-white">
          <Icon name={isFavorite ? 'heart-filled' : 'heart'} className="w-8 h-8 drop-shadow-lg" />
          <span className="text-xs mt-1 font-semibold">Like</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <Icon name="comment" className="w-8 h-8 drop-shadow-lg" />
          <span className="text-xs mt-1 font-semibold">1,234</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <Icon name="share" className="w-8 h-8 drop-shadow-lg" />
          <span className="text-xs mt-1 font-semibold">Share</span>
        </button>
        
        {/* Reward Timer */}
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle className="text-gray-600/50" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                <circle
                    className={isRewarded ? "text-yellow-400" : "text-blue-500"}
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={(2 * Math.PI * 20) * (1 - rewardProgress / 100)}
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="24"
                    cy="24"
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
            </svg>
            <div className="absolute">
                {isRewarded ? <Icon name="check-circle" className="w-6 h-6 text-yellow-400"/> : <Icon name="coin" className="w-6 h-6 text-blue-400"/>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;