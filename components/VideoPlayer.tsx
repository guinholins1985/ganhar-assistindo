import React, { useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player/lazy';
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
  loadState: 'active' | 'preload' | 'lazy';
  isAudioUnlocked: boolean;
}

const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const totalSeconds = Math.floor(timeInSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, user, onAddReward, onToggleFavorite, rewardAmount, rewardTimeSeconds, onVideoEnd, loadState, isAudioUnlocked }) => {
  const [isMuted, setIsMuted] = useState(!isAudioUnlocked);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isRewarded, setIsRewarded] = useState(false);
  const isFavorite = user.favorites.includes(video.id);
  
  // Reset state when video changes to ensure fresh state for new video
  useEffect(() => {
    setCurrentTime(0);
    setTotalDuration(0);
    setIsRewarded(false);
    setIsMuted(!isAudioUnlocked);
  }, [video.id, isAudioUnlocked]);

  // Handle reward logic based on real video progress
  useEffect(() => {
    if (isRewarded || rewardTimeSeconds <= 0) return;
    if (currentTime >= rewardTimeSeconds) {
      onAddReward(video.id, rewardAmount);
      setIsRewarded(true);
    }
  }, [currentTime, isRewarded, rewardTimeSeconds, onAddReward, video.id, rewardAmount]);
  
  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (duration: number) => {
    setTotalDuration(duration);
  };
  
  if (loadState === 'lazy') {
    return (
      <div className="w-full h-full bg-black">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    );
  }

  const rewardProgress = rewardTimeSeconds > 0 ? (Math.min(currentTime, rewardTimeSeconds) / rewardTimeSeconds) * 100 : 0;
  
  return (
    <div className="relative w-full h-full bg-black">
      <ReactPlayer
        url={video.url}
        playing={loadState === 'active'}
        muted={isMuted}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={() => onVideoEnd(video.id)}
        width="100%"
        height="100%"
        playsinline
        config={{
          youtube: { playerVars: { controls: 0, showinfo: 0, iv_load_policy: 3, modestbranding: 1 } },
          vimeo: { playerOptions: { controls: false, autopause: false, background: false } },
          dailymotion: { params: { 'ui-logo': false, 'ui-start-screen-info': false, controls: false } },
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none"></div>
      
      <div className="absolute bottom-20 left-4 right-20 text-white z-10 space-y-3">
        <div>
            <h3 className="font-bold text-xl shadow-black [text-shadow:1px_1px_3px_var(--tw-shadow-color)]">{video.title}</h3>
            <p className="text-sm font-semibold shadow-black [text-shadow:1px_1px_3px_var(--tw-shadow-color)]">{video.channel}</p>
        </div>
        {totalDuration > 0 && (
            <div className="w-full flex items-center gap-2 text-white text-xs font-mono [text-shadow:1px_1px_1px_#000]">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-grow bg-white/20 h-1 rounded-full overflow-hidden">
                    <div 
                        className="bg-white/90 h-1 rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
                    ></div>
                </div>
                <span>{formatTime(totalDuration)}</span>
            </div>
        )}
      </div>

      <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-5 z-10">
        <button onClick={() => setIsMuted(p => !p)} className="flex flex-col items-center text-white p-2 bg-black/20 rounded-full">
          <Icon name={isMuted ? 'volume-off' : 'volume-up'} className="w-7 h-7 drop-shadow-lg" />
        </button>
        <button onClick={() => onToggleFavorite(video.id)} className="flex flex-col items-center text-white p-2 bg-black/20 rounded-full">
          <Icon name={isFavorite ? 'heart-filled' : 'heart'} className="w-7 h-7 drop-shadow-lg" />
        </button>
        <button className="flex flex-col items-center text-white p-2 bg-black/20 rounded-full">
          <Icon name="comment" className="w-7 h-7 drop-shadow-lg" />
        </button>
        <button className="flex flex-col items-center text-white p-2 bg-black/20 rounded-full">

          <Icon name="share" className="w-7 h-7 drop-shadow-lg" />
        </button>
        <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle className="text-gray-600/50" strokeWidth="3" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                <circle
                    className={isRewarded ? "text-accent" : "text-primary"}
                    strokeWidth="3"
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
                {isRewarded ? <Icon name="check-circle" className="w-6 h-6 text-accent"/> : <Icon name="coin" className="w-6 h-6 text-primary-light"/>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;