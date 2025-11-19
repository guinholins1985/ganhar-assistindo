
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  isAudioUnlocked: boolean;
  onUnlockAudio: () => void;
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

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, user, onAddReward, onToggleFavorite, rewardAmount, rewardTimeSeconds, onVideoEnd, isAudioUnlocked, onUnlockAudio }) => {
  const [progress, setProgress] = useState(0);
  const [isRewarded, setIsRewarded] = useState(false);
  const [isMuted, setIsMuted] = useState(!isAudioUnlocked);
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const rewardIntervalRef = useRef<number | null>(null);
  const isFavorite = user.favorites.includes(video.id);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  const rewardTimeMs = rewardTimeSeconds * 1000;

  const isYoutube = useMemo(() => video.url.includes('youtube.com') || video.url.includes('youtu.be'), [video.url]);
  const isVimeo = useMemo(() => video.url.includes('vimeo.com'), [video.url]);
  const isDailymotion = useMemo(() => video.url.includes('dailymotion.com'), [video.url]);

  const postMessageToPlayer = useCallback((message: any) => {
    if (iframeRef.current?.contentWindow) {
        let target = '*';
        if (isYoutube) target = 'https://www.youtube.com';
        else if (isVimeo) target = 'https://player.vimeo.com';
        else if (isDailymotion) target = 'https://www.dailymotion.com';
        
        const payload = isYoutube ? JSON.stringify(message) : message;
        iframeRef.current.contentWindow.postMessage(payload, target);
    }
  }, [isYoutube, isVimeo, isDailymotion]);

  useEffect(() => {
    const durationInSeconds = parseDuration(video.duration);
    setTotalDuration(durationInSeconds);
    setCurrentTime(0);
    setIsRewarded(false);
    setProgress(0);
    setPlayerReady(false);
  }, [video.id, video.duration]);

  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
        let data = event.data;
        if (typeof data === 'string') {
            try { data = JSON.parse(data); } catch (e) { return; }
        }
        if (!data || !data.event) return;

        // Ready events
        if ((isYoutube && data.event === 'onReady') || (isVimeo && data.event === 'ready') || (isDailymotion && data.event === 'ready')) {
            setPlayerReady(true);
            if(isVimeo) {
                postMessageToPlayer({ method: 'addEventListener', value: 'timeupdate' });
                postMessageToPlayer({ method: 'addEventListener', value: 'finish' });
            }
            if(isDailymotion) {
                postMessageToPlayer('addEventListener', 'timeupdate');
                postMessageToPlayer('addEventListener', 'end');
            }
            if(isYoutube) {
                postMessageToPlayer({ event: 'command', func: 'addEventListener', args: ['onStateChange'] });
            }
        }
        
        // Time updates
        if (isVimeo && data.event === 'timeupdate') setCurrentTime(data.data.seconds);
        if (isDailymotion && data.event === 'timeupdate') setCurrentTime(data.time);
        
        // State changes and end events
        if (isYoutube && data.event === 'onStateChange' && data.info?.playerState === 0) onVideoEnd(video.id);
        if (isVimeo && data.event === 'finish') onVideoEnd(video.id);
        if (isDailymotion && data.event === 'end') onVideoEnd(video.id);
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [isYoutube, isVimeo, isDailymotion, postMessageToPlayer, onVideoEnd, video.id]);

  useEffect(() => {
    if (playerReady) {
        if (isYoutube) postMessageToPlayer({ event: 'command', func: isMuted ? 'mute' : 'unMute', args: '' });
        if (isVimeo) postMessageToPlayer({ method: 'setVolume', value: isMuted ? 0 : 1 });
        if (isDailymotion) postMessageToPlayer({ method: 'volume', value: isMuted ? 0 : 1 });
    }
  }, [playerReady, isMuted, isYoutube, isVimeo, isDailymotion, postMessageToPlayer]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
    if (!isAudioUnlocked) onUnlockAudio();
  }, [isAudioUnlocked, onUnlockAudio]);

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

  const observerCallback = useCallback(([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting) {
        if(playerReady) {
            if (isYoutube) postMessageToPlayer({ event: 'command', func: 'playVideo', args: '' });
            if (isVimeo) postMessageToPlayer({ method: 'play' });
            if (isDailymotion) postMessageToPlayer('play');
        }
        startRewardTimer();
      } else {
        if(playerReady) {
            if (isYoutube) postMessageToPlayer({ event: 'command', func: 'pauseVideo', args: '' });
            if (isVimeo) postMessageToPlayer({ method: 'pause' });
            if (isDailymotion) postMessageToPlayer('pause');
        }
        stopRewardTimer();
        setCurrentTime(0); // Reset time when out of view
      }
    }, [startRewardTimer, stopRewardTimer, playerReady, isYoutube, isVimeo, isDailymotion, postMessageToPlayer]);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.8 });
    const currentRef = playerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
      stopRewardTimer();
    };
  }, [playerRef, observerCallback, stopRewardTimer]);
  
  const getEmbedUrl = useCallback((videoItem: Video): string | null => {
      const origin = `${window.location.protocol}//${window.location.host}`;
      if (isYoutube) {
          const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
          const match = videoItem.url.match(regExp);
          const videoId = (match && match[2].length === 11) ? match[2] : null;
          if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${origin}`;
      }
      if (isVimeo) {
          const videoIdMatch = videoItem.url.match(/vimeo.com\/(\d+)/);
          if (videoIdMatch) return `https://player.vimeo.com/video/${videoIdMatch[1]}?autoplay=1&muted=1&loop=1&autopause=0&controls=0&api=1`;
      }
      if (isDailymotion) {
          const regex = /dailymotion.com\/(?:video|embed\/video)\/([^_?]+)/;
          const match = videoItem.url.match(regex);
          const videoId = match ? match[1] : null;
          if (videoId) return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=1&ui-logo=false&ui-start-screen-info=false&api=1`;
      }
      // Kwai has no official JS API, so re-rendering on mute change is the fallback.
      if (videoItem.url.includes('kw.ai') || videoItem.url.includes('kuaishou.com')) {
          const kwaiRegex = /(?:video|short-video)\/([a-zA-Z0-9_-]+)/;
          const match = videoItem.url.match(kwaiRegex);
          const videoId = match ? match[1] : null;
          if (videoId) return `https://www.kwai.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`;
      }
      return null;
  }, [isVimeo, isYoutube, isDailymotion, isMuted]);

  const embedUrl = getEmbedUrl(video);
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
          key={video.id}
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
        <button onClick={handleToggleMute} className="flex flex-col items-center text-white">
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