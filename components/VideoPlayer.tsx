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
  onVideoEnd: (videoId: string) => void;
}

const parseDuration = (durationStr: string): number => {
    if (!durationStr || ['N/A', 'Playlist'].includes(durationStr)) {
        return 0;
    }
    const parts = durationStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) { // HH:MM:SS
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) { // MM:SS
        seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) { // SS
        seconds = parts[0];
    }
    return isNaN(seconds) ? 0 : seconds;
};

const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const totalSeconds = Math.floor(timeInSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, user, onAddReward, onToggleFavorite, rewardAmount, rewardTimeSeconds, onVideoEnd }) => {
  const [progress, setProgress] = useState(0);
  const [isRewarded, setIsRewarded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rewardIntervalRef = useRef<number | null>(null);
  const isFavorite = user.favorites.includes(video.id);
  const isVimeo = video.url.includes('vimeo.com');

  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const playbackIntervalRef = useRef<number | null>(null);
  
  const rewardTimeMs = rewardTimeSeconds * 1000;

  useEffect(() => {
    const durationInSeconds = parseDuration(video.duration);
    setTotalDuration(durationInSeconds);
    setCurrentTime(0);
    setIsRewarded(false);
    setProgress(0);
  }, [video.id, video.duration]);

  // Effect to control Vimeo volume via postMessage when isMuted state changes.
  // This is necessary because Vimeo's URL parameters are unreliable for unmuting
  // an autoplaying video due to browser policies.
  useEffect(() => {
    if (isVimeo && iframeRef.current?.contentWindow) {
      const volume = isMuted ? 0 : 1;
      // After the user clicks the unmute button, we get permission to control audio.
      // We send a message to the Vimeo player API to set the volume.
      iframeRef.current.contentWindow.postMessage(
        { method: 'setVolume', value: volume },
        'https://player.vimeo.com'
      );
    }
  }, [isMuted, isVimeo]);

  const startRewardTimer = useCallback(() => {
    if (isRewarded || rewardTimeMs <= 0) return;
    if (rewardIntervalRef.current) clearInterval(rewardIntervalRef.current);
    rewardIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 100;
        if (newProgress >= rewardTimeMs) {
          if (rewardIntervalRef.current) clearInterval(rewardIntervalRef.current);
          onAddReward(video.id, rewardAmount);
          setIsRewarded(true);
          return rewardTimeMs;
        }
        return newProgress;
      });
    }, 100);
  }, [isRewarded, onAddReward, video.id, rewardAmount, rewardTimeMs]);

  const stopRewardTimer = useCallback(() => {
    if (rewardIntervalRef.current) {
      clearInterval(rewardIntervalRef.current);
      rewardIntervalRef.current = null;
    }
  }, []);

  const stopPlaybackTimer = useCallback(() => {
      if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
          playbackIntervalRef.current = null;
      }
  }, []);

  const startPlaybackTimer = useCallback(() => {
    if (totalDuration <= 0 || playbackIntervalRef.current) return;
    playbackIntervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
            if (prev >= totalDuration - 1) { // Video has ended
                stopPlaybackTimer();
                onVideoEnd(video.id);
                return totalDuration; // Keep progress bar at 100% until scroll
            }
            return prev + 1;
        });
    }, 1000);
  }, [totalDuration, stopPlaybackTimer, onVideoEnd, video.id]);

  const resetPlaybackTimer = useCallback(() => {
      stopPlaybackTimer();
      setCurrentTime(0);
  }, [stopPlaybackTimer]);

  const observerCallback = useCallback(([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        startRewardTimer();
        startPlaybackTimer();
      } else {
        stopRewardTimer();
        resetPlaybackTimer();
      }
    }, [startRewardTimer, stopRewardTimer, startPlaybackTimer, resetPlaybackTimer]
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
      stopRewardTimer();
      stopPlaybackTimer();
    };
  }, [playerRef, observerCallback, stopRewardTimer, stopPlaybackTimer]);
  
  const getEmbedUrl = (videoItem: Video, mutedState: boolean): string | null => {
      // YouTube
      if (videoItem.url.includes('youtube.com') || videoItem.url.includes('youtu.be')) {
          const muteParam = mutedState ? 1 : 0;
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = videoItem.url.match(regExp);
          const videoId = (match && match[2].length === 11) ? match[2] : null;
          if (videoId) {
              return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muteParam}&loop=1&playlist=${videoId}&controls=0&showinfo=0&iv_load_policy=3&playsinline=1`;
          }
      }
      // Vimeo
      if (videoItem.url.includes('vimeo.com')) {
          const videoIdMatch = videoItem.url.match(/vimeo.com\/(\d+)/);
          if (videoIdMatch) {
              // For Vimeo, we MUST start with muted=1 for autoplay to work.
              // Unmuting will be handled via postMessage API, so the URL itself doesn't need to change.
              return `https://player.vimeo.com/video/${videoIdMatch[1]}?autoplay=1&muted=1&loop=1&autopause=0&controls=0&api=1`;
          }
      }
      // Dailymotion
      if (videoItem.url.includes('dailymotion.com')) {
          const muteParam = mutedState ? 1 : 0;
          const regex = /dailymotion.com\/(?:video|embed\/video)\/([^_?]+)/;
          const match = videoItem.url.match(regex);
          const videoId = match ? match[1] : null;
          if (videoId) {
              return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=${muteParam}&ui-logo=false&ui-start-screen-info=false`;
          }
      }
      // Kwai
      if (videoItem.url.includes('kw.ai') || videoItem.url.includes('kuaishou.com')) {
          const muteParam = mutedState ? 1 : 0;
          const kwaiRegex = /(?:video|short-video)\/([a-zA-Z0-9_-]+)/;
          const match = videoItem.url.match(kwaiRegex);
          const videoId = match ? match[1] : null;
          if (videoId) {
              return `https://www.kwai.com/embed/${videoId}?autoplay=1&mute=${muteParam}`;
          }
      }
      return null;
  };

  const embedUrl = getEmbedUrl(video, isMuted);
  const rewardProgress = rewardTimeMs > 0 ? (progress / rewardTimeMs) * 100 : 100;

  return (
    <div ref={playerRef} className="relative w-full h-full bg-black">
      {embedUrl ? (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          frameBorder="0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full object-cover"
          title={video.title}
          // For Vimeo, key is stable to allow postMessage communication.
          // For others, we change the key to force a reload with the new mute param in the URL.
          key={isVimeo ? video.id : `${video.id}-${isMuted ? 'muted' : 'unmuted'}`}
        ></iframe>
      ) : (
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

      <div className="absolute bottom-20 left-4 right-20 text-white z-10 space-y-3">
        <div>
            <h3 className="font-bold text-lg shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{video.title}</h3>
            <p className="text-sm shadow-black [text-shadow:1px_1px_2px_var(--tw-shadow-color)]">{video.channel}</p>
        </div>
        {totalDuration > 0 && (
            <div className="w-full flex items-center gap-2 text-white text-xs font-mono [text-shadow:1px_1px_1px_#000]">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-grow bg-white/20 h-1.5 rounded-full">
                    <div 
                        className="bg-white h-1.5 rounded-full"
                        style={{ width: `${(currentTime / totalDuration) * 100}%`, transition: 'width 0.2s linear' }}
                    ></div>
                </div>
                <span>{formatTime(totalDuration)}</span>
            </div>
        )}
      </div>

      <div className="absolute bottom-24 right-4 flex flex-col items-center space-y-6 z-10">
        <button onClick={() => setIsMuted(prev => !prev)} className="flex flex-col items-center text-white">
          <Icon name={isMuted ? 'volume-off' : 'volume-up'} className="w-8 h-8 drop-shadow-lg" />
          <span className="text-xs mt-1 font-semibold">{isMuted ? 'Ativar Som' : 'Silenciar'}</span>
        </button>
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
