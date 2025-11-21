

import React, { useState, useEffect, useCallback } from 'react';
import { User, Video, Transaction, Mission, View, ModalType, WithdrawalRequest, AppSettings } from './types';
import { INITIAL_MISSIONS } from './constants'; 
import { initDB, getAllUsers, updateUser, deleteUser, getAllVideos, addVideo, updateVideo, deleteVideo, getAllTransactions, addTransaction, getAllWithdrawalRequests, addWithdrawalRequest, updateWithdrawalRequest, getSettings, updateSettings } from './services/dbService';
import { fetchYouTubeVideoData, fetchDailymotionVideoData, fetchKwaiVideoData, fetchVimeoVideoData } from './services/youtubeService';
import BottomNav from './components/BottomNav';
import VideoFeed from './components/VideoFeed';
import ProfilePage from './components/ProfilePage';
import EarnPage from './components/EarnPage';
import AddVideoModal from './components/AddVideoModal';
import WithdrawModal from './components/WithdrawModal';
import AIPoweredRecommendations from './components/AIPoweredRecommendations';
import AdminPanel from './components/admin/AdminPanel';
import Icon from './components/Icon';
import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [newlyAddedVideoId, setNewlyAddedVideoId] = useState<string | null>(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  // Audio state
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // State will be loaded from DB
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [missions] = useState<Mission[]>(INITIAL_MISSIONS); // Missions are static for now
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data loading effect
  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        const [usersData, videosData, transactionsData, requestsData, settingsData] = await Promise.all([
          getAllUsers(),
          getAllVideos(),
          getAllTransactions(),
          getAllWithdrawalRequests(),
          getSettings(),
        ]);
        
        setUsers(usersData);
        setVideos(videosData.sort((a,b) => b.id.localeCompare(a.id))); // sort by newest
        setTransactions(
            transactionsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        );
        setWithdrawalRequests(requestsData);
        setSettings(settingsData);
        setCurrentUser(usersData.find(u => u.status === 'active') || null);
        
      } catch (error) {
        console.error("Failed to load data from database:", error);
        setLoadingError("Failed to load the app. Try reloading it.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  const handleStartSession = useCallback(async () => {
    // This is the crucial fix: Await the promise from playing the silent audio.
    // This ensures the browser's audio context is successfully unlocked *before*
    // we set the isAudioUnlocked state. This prevents a race condition that
    // was causing Vimeo videos to ignore the unmuted state.
    const audioEl = document.getElementById('audio-unlock') as HTMLAudioElement;
    if (audioEl) {
      try {
        await audioEl.play();
        // Only set unlocked to true after a successful play call.
        setIsAudioUnlocked(true);
      } catch (e) {
        console.warn("Audio context could not be unlocked automatically. Videos will start muted.", e);
      }
    }
    // Proceed to start the session regardless of audio lock status.
    setIsSessionStarted(true);
  }, []);


  const handleAddReward = useCallback(async (videoId: string, amount: number) => {
    const video = videos.find(v => v.id === videoId);
    if (video && currentUser) {
      const updatedUser = {
        ...currentUser,
        balance: currentUser.balance + amount,
      };
      
      const newTransaction: Transaction = {
        id: `t-${Date.now()}`,
        type: 'reward',
        amount: amount,
        description: `Watched "${video.title}"`,
        timestamp: new Date(),
      };
      
      await Promise.all([
        updateUser(updatedUser),
        addTransaction(newTransaction)
      ]);
      
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setTransactions(prev => [newTransaction, ...prev]);
    }
  }, [videos, currentUser]);

  const handleToggleFavorite = useCallback(async (videoId: string) => {
    if (!currentUser) return;
    const isFavorite = currentUser.favorites.includes(videoId);
    const newFavorites = isFavorite
        ? currentUser.favorites.filter(id => id !== videoId)
        : [...currentUser.favorites, videoId];

    const updatedUser = { ...currentUser, favorites: newFavorites };
    
    await updateUser(updatedUser);
    
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));

  }, [currentUser]);
  
  const handleAddVideo = useCallback(async (url: string): Promise<string> => {
    if (!settings) throw new Error("As configurações não foram carregadas.");
    let videoData: Partial<Video> | null = null;
    let errorOccurred = false;

    try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            videoData = await fetchYouTubeVideoData(url, settings.youtubeApiKey);
        } else if (url.includes('dailymotion.com')) {
            videoData = await fetchDailymotionVideoData(url);
        } else if (url.includes('vimeo.com')) {
            videoData = await fetchVimeoVideoData(url);
        } else if (url.includes('kw.ai') || url.includes('kuaishou.com')) {
            videoData = await fetchKwaiVideoData(url);
        }
    } catch (error) {
        console.warn(`Could not fetch video metadata for ${url}. Will create a generic entry.`, error);
        errorOccurred = true;
    }
    
    if (!videoData) {
        try {
            const urlObject = new URL(url);
            const domain = urlObject.hostname.replace('www.', '');
            videoData = {
                title: domain,
                channel: domain.split('.')[0] || 'Unknown',
                duration: 'N/A',
            };
        } catch (e) {
            throw new Error("URL inválida. Por favor, insira um link válido.");
        }
    }

    const isPlaylist = url.includes('list=');
    const newVideoId = `v-${Date.now()}`;
    const newVideo: Video = {
        id: newVideoId,
        url,
        title: videoData.title || 'Título Desconhecido',
        channel: videoData.channel || 'Canal Desconhecido',
        thumbnailUrl: videoData.thumbnailUrl || `https://picsum.photos/seed/${newVideoId}/400/800`,
        duration: isPlaylist ? 'Playlist' : videoData.duration || 'N/A',
        type: isPlaylist ? 'playlist' : 'video',
        status: 'active',
    };
    
    await addVideo(newVideo);

    setVideos(prevVideos => [newVideo, ...prevVideos]);
    setNewlyAddedVideoId(newVideoId);
    setActiveModal(null);
    
    const baseMessage = `Vídeo "${newVideo.title}" adicionado!`;
    return errorOccurred ? `${baseMessage} (API indisponível, dados genéricos usados).` : baseMessage;
  }, [settings]);

  const handleRequestWithdrawal = useCallback(async (amount: number, pixKey: string) => {
    if (!currentUser) return;
    if (currentUser.balance >= amount) {
        const newRequest: WithdrawalRequest = {
            id: `wr-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            amount,
            pixKey,
            status: 'pending',
            requestDate: new Date(),
        };
        
        await addWithdrawalRequest(newRequest);
        
        setWithdrawalRequests(prev => [newRequest, ...prev]);
        setActiveModal(null);
        alert("Solicitação de saque enviada! Será processada por um administrador em breve.");
    } else {
        alert("Saldo insuficiente!");
    }
  }, [currentUser]);

  const handleProcessWithdrawal = useCallback(async (requestId: string, status: 'approved' | 'declined') => {
      const request = withdrawalRequests.find(r => r.id === requestId);
      if (!request) return;

      let updatedRequest = { ...request, status };

      if (status === 'approved') {
          const user = users.find(u => u.id === request.userId);
          if (user && user.balance >= request.amount) {
              const updatedUser = { ...user, balance: user.balance - request.amount };
              
              const newTransaction: Transaction = {
                  id: `t-${Date.now()}`,
                  type: 'withdrawal',
                  amount: -request.amount,
                  description: `Saque para PIX aprovado`,
                  timestamp: new Date(),
              };
              
              await Promise.all([
                updateUser(updatedUser),
                addTransaction(newTransaction)
              ]);

              setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
              if (currentUser?.id === request.userId) {
                  setCurrentUser(updatedUser);
              }
              setTransactions(prev => [newTransaction, ...prev]);
          } else {
            alert("O usuário não tem fundos suficientes ou não existe.");
            updatedRequest = { ...request, status: 'declined' };
          }
      }
      
      await updateWithdrawalRequest(updatedRequest);
      setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? updatedRequest : r));
  }, [withdrawalRequests, users, currentUser]);

  const handleUpdateUser = async (updatedUser: User) => {
    await updateUser(updatedUser);
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if(currentUser?.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert("Você não pode excluir o usuário atualmente logado.");
      return;
    }
    await deleteUser(userId);
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };
  
  const handleUpdateVideo = async (updatedVideo: Video) => {
    await updateVideo(updatedVideo);
    setVideos(prevVideos => prevVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
  };

  const handleDeleteVideo = async (videoId: string) => {
    await deleteVideo(videoId);
    setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    await updateSettings(newSettings);
    setSettings(newSettings);
  };
  
  const handleScrolledToNewVideo = useCallback(() => {
    setNewlyAddedVideoId(null);
  }, []);


  const renderContent = () => {
    const activeVideos = videos.filter(v => v.status === 'active');
    const videoFeedProps = {
      videos: activeVideos,
      user: currentUser!,
      onAddReward: handleAddReward,
      onToggleFavorite: handleToggleFavorite,
      newlyAddedVideoId: newlyAddedVideoId,
      onScrolledToNewVideo: handleScrolledToNewVideo,
      rewardAmount: settings!.rewardPerVideo,
      rewardTimeSeconds: settings!.minWatchTime,
      isAudioUnlocked,
    };

    switch (activeView) {
      case 'home':
        return <VideoFeed {...videoFeedProps} />;
      case 'earn':
        return <EarnPage missions={missions} onInvite={() => alert("Invite link copied!")} />;
      case 'profile':
        return <ProfilePage user={currentUser!} transactions={transactions} onWithdraw={() => setActiveModal('withdraw')} />;
      case 'recommendations':
        const watchedVideos = videos.filter(v => transactions.some(t => t.description.includes(v.title)));
        return <AIPoweredRecommendations watchedVideos={watchedVideos} apiKey={settings.geminiApiKey} />;
      default:
        return <VideoFeed {...videoFeedProps} />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-base-200 text-base-content h-screen w-screen flex flex-col items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-lg">Carregando seus dados...</p>
      </div>
    );
  }

  if (loadingError || !currentUser || !settings) {
    return (
       <div className="bg-base-200 text-base-content h-screen w-screen flex flex-col items-center justify-center p-4 text-center">
        <Icon name="warning" className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Erro Inesperado</h1>
        <p className="text-gray-400 mb-6">{loadingError || "Não foi possível carregar os dados do usuário ou as configurações."}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Recarregar
        </button>
      </div>
    );
  }

  if (isAdminView) {
      return <AdminPanel 
        stats={{
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            totalBalance: users.reduce((acc, u) => acc + u.balance, 0)
        }}
        users={users}
        videos={videos}
        withdrawalRequests={withdrawalRequests}
        settings={settings}
        onProcessWithdrawal={handleProcessWithdrawal}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onUpdateVideo={handleUpdateVideo}
        onDeleteVideo={handleDeleteVideo}
        onAddVideo={handleAddVideo}
        onUpdateSettings={handleUpdateSettings}
        onSwitchView={() => setIsAdminView(false)}
       />;
  }
  
  if (!isSessionStarted) {
    return <SplashScreen onStart={handleStartSession} />;
  }


  return (
    <div className="bg-base-100 text-base-content h-screen w-screen overflow-hidden font-sans">
      <main className="h-full">
        {renderContent()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} onAddVideoClick={() => setActiveModal('addVideo')} />
      {activeModal === 'addVideo' && <AddVideoModal onClose={() => setActiveModal(null)} onAddVideo={handleAddVideo} />}
      {activeModal === 'withdraw' && <WithdrawModal onClose={() => setActiveModal(null)} onRequestWithdrawal={handleRequestWithdrawal} currentBalance={currentUser.balance} />}
      
      {/* Secret button to toggle admin view */}
      <button 
        onClick={() => setIsAdminView(true)}
        className="absolute top-4 right-4 bg-base-300 p-2 rounded-full z-40 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Abrir Painel do Admin"
        >
        <Icon name="cog" className="w-6 h-6"/>
      </button>
    </div>
  );
};

export default App;