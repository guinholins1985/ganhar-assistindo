

import React, { useState, useEffect, useCallback } from 'react';
import { User, Video, Transaction, Mission, View, ModalType, WithdrawalRequest, AppSettings, Category, SystemLog } from './types';
import { INITIAL_MISSIONS } from './constants'; 
import { initDB, getAllUsers, updateUser, deleteUser, getAllVideos, addVideo, updateVideo, deleteVideo, getAllTransactions, addTransaction, getAllWithdrawalRequests, addWithdrawalRequest, updateWithdrawalRequest, getSettings, updateSettings, getAllCategories, addCategory, updateCategory, deleteCategory, getAllSystemLogs, addSystemLog } from './services/dbService';
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
import MaintenanceMode from './components/MaintenanceMode';


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
  const [categories, setCategories] = useState<Category[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  // Data loading effect
  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        const [usersData, videosData, transactionsData, requestsData, settingsData, categoriesData, logsData] = await Promise.all([
          getAllUsers(),
          getAllVideos(),
          getAllTransactions(),
          getAllWithdrawalRequests(),
          getSettings(),
          getAllCategories(),
          getAllSystemLogs(),
        ]);
        
        setUsers(usersData);
        setVideos(videosData.sort((a,b) => b.id.localeCompare(a.id))); // sort by newest
        setTransactions(
            transactionsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        );
        setWithdrawalRequests(requestsData);
        setSettings(settingsData);
        setCurrentUser(usersData.find(u => u.status === 'active') || null);
        setCategories(categoriesData);
        setSystemLogs(logsData);
        
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
    // was causing videos (especially from Vimeo) to ignore the unmuted state.
    const audioEl = document.getElementById('audio-unlock') as HTMLAudioElement;
    if (audioEl) {
      try {
        await audioEl.play();
        // Only set unlocked to true after a successful play call.
        setIsAudioUnlocked(true);
      } catch (e) {
        console.warn("Audio context could not be unlocked automatically. Videos will start muted.", e);
        // If it fails, audio remains locked, but we still start the session.
      }
    }
    setIsSessionStarted(true);
  }, []);

  const logAdminAction = async (description: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      description,
      level: 'info'
    };
    await addSystemLog(newLog);
    setSystemLogs(prev => [newLog, ...prev].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const handleAddReward = useCallback(async (videoId: string, amount: number) => {
    const video = videos.find(v => v.id === videoId);
    if (video && currentUser) {
      const updatedUser = {
        ...currentUser,
        balance: currentUser.balance + amount,
      };
      
      const newTransaction: Transaction = {
        id: `t-${Date.now()}`,
        userId: currentUser.id,
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
        isFeatured: false,
    };
    
    await addVideo(newVideo);
    await logAdminAction(`Vídeo adicionado: "${newVideo.title}"`);
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
                  userId: user.id,
                  type: 'withdrawal',
                  amount: -request.amount,
                  description: `Saque para PIX aprovado`,
                  timestamp: new Date(),
              };
              
              await Promise.all([
                updateUser(updatedUser),
                addTransaction(newTransaction)
              ]);
              await logAdminAction(`Saque de $${request.amount.toFixed(2)} para ${user.name} foi aprovado.`);

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
      if (status === 'declined') {
        await logAdminAction(`Saque de $${request.amount.toFixed(2)} para ${request.userName} foi recusado.`);
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
    const userToDelete = users.find(u => u.id === userId);
    if(userToDelete){
        await deleteUser(userId);
        await logAdminAction(`Usuário ${userToDelete.name} foi excluído.`);
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    }
  };
  
  const handleUpdateVideo = async (updatedVideo: Video) => {
    await updateVideo(updatedVideo);
    setVideos(prevVideos => prevVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
  };

  const handleDeleteVideo = async (videoId: string) => {
    const videoToDelete = videos.find(v => v.id === videoId);
    await deleteVideo(videoId);
    if(videoToDelete) await logAdminAction(`Vídeo "${videoToDelete.title}" foi excluído.`);
    setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
  };

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    await updateSettings(newSettings);
    await logAdminAction('Configurações do aplicativo foram atualizadas.');
    setSettings(newSettings);
  };
  
  const handleScrolledToNewVideo = useCallback(() => {
    setNewlyAddedVideoId(null);
  }, []);

  const handleAddCategory = async (name: string) => {
      const newCategory: Category = { id: `cat-${Date.now()}`, name };
      await addCategory(newCategory);
      await logAdminAction(`Categoria "${name}" foi criada.`);
      setCategories(prev => [...prev, newCategory]);
  };
  const handleUpdateCategory = async (category: Category) => {
      await updateCategory(category);
      await logAdminAction(`Categoria "${category.name}" foi atualizada.`);
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
  };
  const handleDeleteCategory = async (id: string) => {
      const categoryToDelete = categories.find(c => c.id === id);
      await deleteCategory(id);
      if(categoryToDelete) await logAdminAction(`Categoria "${categoryToDelete.name}" foi excluída.`);
      setCategories(prev => prev.filter(c => c.id !== id));
  };

  const renderContent = () => {
    const activeVideos = videos
      .filter(v => v.status === 'active')
      .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)); // Featured first
      
    const videoFeedProps = {
      videos: activeVideos,
      user: currentUser!,
      onAddReward: handleAddReward,
      onToggleFavorite: handleToggleFavorite,
      newlyAddedVideoId: newlyAddedVideoId,
      onScrolledToNewVideo: handleScrolledToNewVideo,
      rewardAmount: settings!.rewardPerVideo * (settings?.doubleRewardsEnabled ? 2 : 1),
      rewardTimeSeconds: settings!.minWatchTime,
      isAudioUnlocked,
      adSettings: {
        isAdsEnabled: settings!.isAdsEnabled,
        adsenseClientId: settings!.adsenseClientId,
        adSlots: settings!.adSlots,
        adFrequencyInFeed: settings!.adFrequencyInFeed,
      }
    };

    switch (activeView) {
      case 'home':
        return <VideoFeed {...videoFeedProps} />;
      case 'earn':
        return <EarnPage missions={missions} onInvite={() => alert("Invite link copied!")} settings={settings}/>;
      case 'profile':
        return <ProfilePage user={currentUser!} transactions={transactions.filter(t => t.userId === currentUser!.id)} onWithdraw={() => setActiveModal('withdraw')} settings={settings}/>;
      case 'recommendations':
        const watchedVideos = videos.filter(v => transactions.some(t => t.userId === currentUser?.id && t.description.includes(v.title)));
        return <AIPoweredRecommendations watchedVideos={watchedVideos} />;
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
  
  if (settings.maintenanceMode) {
    return <MaintenanceMode message={settings.maintenanceMessage} />;
  }

  if (isAdminView) {
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalBalance: users.reduce((sum, user) => sum + user.balance, 0),
      };
      return <AdminPanel 
        stats={stats}
        users={users}
        videos={videos}
        withdrawalRequests={withdrawalRequests}
        transactions={transactions}
        settings={settings}
        categories={categories}
        systemLogs={systemLogs}
        onProcessWithdrawal={handleProcessWithdrawal}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onUpdateVideo={handleUpdateVideo}
        onDeleteVideo={handleDeleteVideo}
        onAddVideo={handleAddVideo}
        onUpdateSettings={handleUpdateSettings}
        onSwitchView={() => setIsAdminView(false)}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        logAdminAction={logAdminAction}
        currentUser={currentUser}
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
      
      {settings.globalNotification && (
        <div className="absolute top-0 left-0 right-0 bg-accent text-secondary text-center p-2 z-50 text-sm font-semibold">
          {settings.globalNotification}
        </div>
      )}

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