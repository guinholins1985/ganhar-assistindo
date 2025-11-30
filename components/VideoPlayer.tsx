import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const SideActionButton: React.FC<{
  icon: 'volume-up' | 'volume-off' | 'heart-filled' | 'heart' | 'comment' | 'share' | 'check-circle' | 'clipboard';
  label?: string;
  isToggled?: boolean;
  onClick: (e: React.MouseEvent) => void;
}> = ({ icon, label, isToggled, onClick }) => (
  <button 
    onClick={onClick} 
    className="flex flex-col items-center group"
    aria-label={label}
    >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-black/40 shadow-lg transition-all duration-200 transform group-hover:scale-110 group-active:scale-95 ${isToggled ? 'text-primary' : 'text-white'}`}>
       <Icon name={icon} className={`w-7 h-7 drop-shadow-lg ${isToggled && icon==='check-circle' ? 'text-green-400' : ''}`} />
    </div>
    {label && <span className="text-xs font-bold text-white mt-1 drop-shadow-md">{label}</span>}
  </button>
);

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, user, onAddReward, onToggleFavorite, rewardAmount, rewardTimeSeconds, onVideoEnd, loadState, isAudioUnlocked }) => {
  const [isMuted, setIsMuted] = useState(!isAudioUnlocked);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isRewarded, setIsRewarded] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const isFavorite = user.favorites.includes(video.id);
  const playerRef = useRef<ReactPlayer>(null);
  
  // Reset state when video changes to ensure fresh state for new video
  useEffect(() => {
    setCurrentTime(0);
    setTotalDuration(0);
    setIsRewarded(false);
    setIsPlaying(true); // Autoplay new videos
    setIsMuted(!isAudioUnlocked);
    setIsLinkCopied(false);
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

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleSeek = (seconds: number) => {
    if (playerRef.current) {
        const newTime = Math.max(0, Math.min(totalDuration, playerRef.current.getCurrentTime() + seconds));
        playerRef.current.seekTo(newTime, 'seconds');
        setCurrentTime(newTime);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.url).then(() => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
        console.error("Failed to copy link:", err);
        alert("Failed to copy link.");
    });
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
    <div className="relative w-full h-full bg-black" onClick={handleTogglePlay}>
      <ReactPlayer
        ref={playerRef}
        url={video.url}
        playing={loadState === 'active' && isPlaying}
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
      
      {loadState === 'active' && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="bg-black/40 p-5 rounded-full">
                  <Icon name="play" className="w-16 h-16 text-white" />
              </div>
          </div>
      )}

      <div className="absolute bottom-40 left-4 right-20 text-white z-10 space-y-3">
        <div>
            <h3 className="font-bold text-xl shadow-black [text-shadow:1px_1px_3px_var(--tw-shadow-color)]">{video.title}</h3>
            <p className="text-sm font-semibold shadow-black [text-shadow:1px_1px_3px_var(--tw-shadow-color)]">{video.channel}</p>
        </div>
      </div>

      <div className="absolute bottom-20 right-4 flex flex-col items-center space-y-5 z-10">
        <SideActionButton icon={isMuted ? 'volume-off' : 'volume-up'} onClick={(e) => { e.stopPropagation(); setIsMuted(p => !p); }} />
        <SideActionButton icon={isFavorite ? 'heart-filled' : 'heart'} isToggled={isFavorite} onClick={(e) => { e.stopPropagation(); onToggleFavorite(video.id); }} />
        <SideActionButton icon="comment" onClick={(e) => e.stopPropagation()} />
        <SideActionButton icon="share" onClick={(e) => e.stopPropagation()} />
        <SideActionButton icon={isLinkCopied ? 'check-circle' : 'clipboard'} isToggled={isLinkCopied} onClick={handleCopyLink} />
        
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

      {/* Playback Controls */}
      {totalDuration > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2">
           <div className="w-full flex items-center gap-2 text-white text-xs font-mono [text-shadow:1px_1px_1px_#000]">
                <span>{formatTime(currentTime)}</span>
                <div className="flex-grow bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    if(playerRef.current) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const width = rect.width;
                        const newTime = (clickX / width) * totalDuration;
                        playerRef.current.seekTo(newTime, 'seconds');
                        setCurrentTime(newTime);
                    }
                }}>
                    <div 
                        className="bg-white/90 h-full rounded-full transition-all duration-100 ease-linear"
                        style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
                    ></div>
                </div>
                <span>{formatTime(totalDuration)}</span>
            </div>
            <div className="flex items-center justify-center gap-10">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleSeek(-10); }}
                    className="p-2 text-white transition-transform hover:scale-110 active:scale-95 drop-shadow-lg"
                    aria-label="Rewind 10 seconds"
                >
                    <Icon name="rewind" className="w-8 h-8" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleSeek(10); }}
                    className="p-2 text-white transition-transform hover:scale-110 active:scale-95 drop-shadow-lg"
                    aria-label="Forward 10 seconds"
                >
                    <Icon name="forward" className="w-8 h-8" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;