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
  loadState: 'active' | 'preload' | 'lazy';
}

const parseDuration = (durationStr: string): number => {
    if (!durationStr || ['N/A', 'Playlist'].includes(durationStr)) return 0;
    const parts = durationStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    else if (parts.length === 1) seconds = parts[0];
    return isNaN(seconds) ? 0 : seconds;
};

const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const totalSeconds = Math.floor(timeInSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, user, onAddReward, onToggleFavorite, rewardAmount, rewardTimeSeconds, onVideoEnd, loadState }) => {
  const [isRewarded, setIsRewarded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const youtubeTimeIntervalRef = useRef<number | null>(null);
  const isFavorite = user.favorites.includes(video.id);
  
  const isYoutube = useMemo(() => video.url.includes('youtube.com') || video.url.includes('youtu.be'), [video.url]);
  const isVimeo = useMemo(() => video.url.includes('vimeo.com'), [video.url]);
  const isDailymotion = useMemo(() => video.url.includes('dailymotion.com'), [video.url]);

  const postMessageToPlayer = useCallback((message: any) => {
    if (iframeRef.current?.contentWindow) {
        const target = isYoutube ? 'https://www.youtube.com' : isVimeo ? 'https://player.vimeo.com' : isDailymotion ? 'https://www.dailymotion.com' : '*';
        const payload = typeof message === 'object' ? JSON.stringify(message) : message;
        iframeRef.current.contentWindow.postMessage(payload, target);
    }
  }, [isYoutube, isVimeo, isDailymotion]);

  useEffect(() => {
    setTotalDuration(parseDuration(video.duration));
    setCurrentTime(0);
    setIsRewarded(false);
    setPlayerReady(false);
  }, [video.id, video.duration]);

  useEffect(() => {
    if (isRewarded || rewardTimeSeconds <= 0) return;
    if (currentTime >= rewardTimeSeconds) {
      onAddReward(video.id, rewardAmount);
      setIsRewarded(true);
    }
  }, [currentTime, isRewarded, rewardTimeSeconds, onAddReward, video.id, rewardAmount]);

  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
        if (!event.source || event.source !== iframeRef.current?.contentWindow) return;
        let data = event.data;
        if (typeof data === 'string') try { data = JSON.parse(data); } catch (e) { /* Not JSON, handle as string */ }
        
        const eventName = data.event || (typeof event.data === 'string' ? event.data.split('=')[0] : null);

        if (['onReady', 'ready'].includes(eventName)) {
            setPlayerReady(true);
            if (isVimeo) {
                postMessageToPlayer({ method: 'addEventListener', value: 'timeupdate' });
                postMessageToPlayer({ method: 'addEventListener', value: 'finish' });
                postMessageToPlayer({ method: 'getDuration' });
            }
            if (isDailymotion) {
                postMessageToPlayer('addEventListener=timeupdate');
                postMessageToPlayer('addEventListener=end');
                postMessageToPlayer('duration');
            }
            if (isYoutube) {
                if (youtubeTimeIntervalRef.current) clearInterval(youtubeTimeIntervalRef.current);
                youtubeTimeIntervalRef.current = window.setInterval(() => {
                    postMessageToPlayer({ event: 'command', func: 'getCurrentTime', args: '' });
                    postMessageToPlayer({ event: 'command', func: 'getDuration', args: '' });
                }, 500);
            }
        }
        
        if (isYoutube && eventName === 'infoDelivery') {
            if (data.info?.currentTime) setCurrentTime(data.info.currentTime);
            if (data.info?.duration) setTotalDuration(data.info.duration);
        }
        if (isVimeo) {
            if (eventName === 'timeupdate') setCurrentTime(data.data.seconds);
            if (data.method === 'getDuration') setTotalDuration(data.value);
            if (eventName === 'finish') onVideoEnd(video.id);
        }
        if (isDailymotion) {
            if (eventName === 'timeupdate') setCurrentTime(parseFloat(event.data.split('=')[1]));
            if (eventName === 'duration') setTotalDuration(parseFloat(event.data.split('=')[1]));
            if (eventName === 'end') onVideoEnd(video.id);
        }
        if (isYoutube && eventName === 'onStateChange' && data.info?.playerState === 0) onVideoEnd(video.id);
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => {
      window.removeEventListener('message', handlePlayerMessage);
      if (youtubeTimeIntervalRef.current) clearInterval(youtubeTimeIntervalRef.current);
    };
  }, [isYoutube, isVimeo, isDailymotion, postMessageToPlayer, onVideoEnd, video.id]);

  useEffect(() => {
    if (playerReady) {
        if (isYoutube) postMessageToPlayer({ event: 'command', func: isMuted ? 'mute' : 'unMute', args: '' });
        if (isVimeo) postMessageToPlayer({ method: 'setVolume', value: isMuted ? 0 : 1 });
        if (isDailymotion) postMessageToPlayer(isMuted ? 'volume=0' : 'volume=1');
    }
  }, [playerReady, isMuted, isYoutube, isVimeo, isDailymotion, postMessageToPlayer]);

  const observerCallback = useCallback(([entry]: IntersectionObserverEntry[]) => {
      const shouldPlay = entry.isIntersecting && loadState === 'active';
      if (playerReady) {
          const command = shouldPlay ? 'play' : 'pause';
          if (isYoutube) postMessageToPlayer({ event: 'command', func: `${command}Video`, args: '' });
          if (isVimeo) postMessageToPlayer({ method: command });
          if (isDailymotion) postMessageToPlayer(command);
      }
    }, [playerReady, isYoutube, isVimeo, isDailymotion, postMessageToPlayer, loadState]);

  useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.8 });
    const currentRef = playerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, [playerRef, observerCallback]);
  
  const getEmbedUrl = useCallback((videoItem: Video): string | null => {
      const origin = `${window.location.protocol}//${window.location.host}`;
      if (isYoutube) {
          const videoId = videoItem.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.pop();
          if (videoId?.length === 11) return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${origin}`;
      }
      if (isVimeo) {
          const videoId = videoItem.url.match(/vimeo.com\/(\d+)/)?.pop();
          if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&autopause=0&controls=0&api=1`;
      }
      if (isDailymotion) {
          const videoId = videoItem.url.match(/dailymotion.com\/(?:video|embed\/video)\/([^_?]+)/)?.pop();
          if (videoId) return `https://www.dailymotion.com/embed/video/${videoId}?autoplay=1&mute=1&ui-logo=false&ui-start-screen-info=false&api=1&origin=${origin}`;
      }
      if (videoItem.url.includes('kw.ai') || videoItem.url.includes('kuaishou.com')) {
          const videoId = videoItem.url.match(/(?:video|short-video)\/([a-zA-Z0-9_-]+)/)?.pop();
          if (videoId) return `https://www.kwai.com/embed/${videoId}?autoplay=1&mute=1`;
      }
      return null;
  }, [isVimeo, isYoutube, isDailymotion]);

  if (loadState === 'lazy') {
    return (
      <div className="w-full h-full bg-black">
        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(video);
  const rewardProgress = rewardTimeSeconds > 0 ? (Math.min(currentTime, rewardTimeSeconds) / rewardTimeSeconds) * 100 : 0;

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
                        style={{ width: `${totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}%` }}
                    ></div>
                </div>
                <span>{formatTime(totalDuration)}</span>
            </div>
        )}
      </div>
      <div className="absolute bottom-24 right-4 flex flex-col items-center space-y-6 z-10">
        <button onClick={() => setIsMuted(p => !p)} className="flex flex-col items-center text-white">
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