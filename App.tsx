import React, { useState, useCallback } from 'react';
import { User, Video, Transaction, Mission, View, ModalType, WithdrawalRequest, AppSettings } from './types';
import { INITIAL_VIDEOS, INITIAL_MISSIONS, INITIAL_USERS, INITIAL_WITHDRAWAL_REQUESTS, INITIAL_SETTINGS } from './constants';
import { fetchYouTubeVideoData, fetchDailymotionVideoData, fetchKwaiVideoData } from './services/youtubeService';
import BottomNav from './components/BottomNav';
import VideoFeed from './components/VideoFeed';
import ProfilePage from './components/ProfilePage';
import EarnPage from './components/EarnPage';
import AddVideoModal from './components/AddVideoModal';
import WithdrawModal from './components/WithdrawModal';
import AIPoweredRecommendations from './components/AIPoweredRecommendations';
import AdminPanel from './components/admin/AdminPanel';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [newlyAddedVideoId, setNewlyAddedVideoId] = useState<string | null>(null);

  // Simulate a logged-in user
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);

  // Simulate database tables
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [videos, setVideos] = useState<Video[]>(INITIAL_VIDEOS);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 't1', type: 'reward', amount: 10, description: 'Watched "Epic Fails Compilation"', timestamp: new Date() },
    { id: 't2', type: 'bonus', amount: 50, description: 'Daily Login Bonus', timestamp: new Date(Date.now() - 86400000) },
  ]);
  const [missions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  const handleAddReward = useCallback((videoId: string, amount: number) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setCurrentUser(prevUser => ({
        ...prevUser,
        balance: prevUser.balance + amount,
      }));
      const newTransaction: Transaction = {
        id: `t-${Date.now()}`,
        type: 'reward',
        amount: amount,
        description: `Watched "${video.title}"`,
        timestamp: new Date(),
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
  }, [videos]);

  const handleToggleFavorite = useCallback((videoId: string) => {
    setCurrentUser(prevUser => {
      const newFavorites = prevUser.favorites.includes(videoId)
        ? prevUser.favorites.filter(id => id !== videoId)
        : [...prevUser.favorites, videoId];
      return { ...prevUser, favorites: newFavorites };
    });
  }, []);
  
  const handleAddVideo = useCallback(async (url: string): Promise<void> => {
    let videoData: Partial<Video> | null = null;
    let errorOccurred = false;

    try {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            videoData = await fetchYouTubeVideoData(url, settings.youtubeApiKey);
        } else if (url.includes('dailymotion.com')) {
            videoData = await fetchDailymotionVideoData(url);
        } else if (url.includes('kw.ai') || url.includes('kuaishou.com')) {
            videoData = await fetchKwaiVideoData(url);
        }
    } catch (error) {
        console.warn(`Could not fetch video metadata for ${url}. Will create a generic entry.`, error);
        errorOccurred = true;
    }
    
    // Fallback for non-supported services or API errors
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
            alert("URL inválida. Por favor, insira um link válido.");
            return;
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

    setVideos(prevVideos => [newVideo, ...prevVideos]);
    setNewlyAddedVideoId(newVideoId);
    setActiveModal(null);
    if(errorOccurred) {
        alert(`API indisponível. Vídeo genérico "${newVideo.title}" adicionado.`);
    } else {
        alert(`Vídeo "${newVideo.title}" adicionado com sucesso!`);
    }
  }, [settings.youtubeApiKey]);

  const handleRequestWithdrawal = useCallback((amount: number, pixKey: string) => {
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
        setWithdrawalRequests(prev => [newRequest, ...prev]);
        setActiveModal(null);
        alert("Solicitação de saque enviada! Será processada por um administrador em breve.");
    } else {
        alert("Saldo insuficiente!");
    }
  }, [currentUser]);

  const handleProcessWithdrawal = useCallback((requestId: string, status: 'approved' | 'declined') => {
      const request = withdrawalRequests.find(r => r.id === requestId);
      if (!request) return;

      if (status === 'approved') {
          const userIndex = users.findIndex(u => u.id === request.userId);
          if (userIndex !== -1 && users[userIndex].balance >= request.amount) {
              const updatedUsers = [...users];
              updatedUsers[userIndex] = {
                  ...updatedUsers[userIndex],
                  balance: updatedUsers[userIndex].balance - request.amount
              };
              setUsers(updatedUsers);
              
              if (currentUser.id === request.userId) {
                  setCurrentUser(updatedUsers[userIndex]);
              }

              const newTransaction: Transaction = {
                  id: `t-${Date.now()}`,
                  type: 'withdrawal',
                  amount: -request.amount,
                  description: `Saque para PIX aprovado`,
                  timestamp: new Date(),
              };
              setTransactions(prev => [newTransaction, ...prev]);
          } else {
            alert("O usuário não tem fundos suficientes ou não existe.");
            // Decline it instead if funds are insufficient
            setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'declined' } : r));
            return;
          }
      }
      
      setWithdrawalRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
  }, [withdrawalRequests, users, currentUser.id]);

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if(currentUser.id === updatedUser.id) {
        setCurrentUser(updatedUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      alert("Você não pode excluir o usuário atualmente logado.");
      return;
    }
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
  };
  
  const handleUpdateVideo = (updatedVideo: Video) => {
    setVideos(prevVideos => prevVideos.map(v => v.id === updatedVideo.id ? updatedVideo : v));
  };

  const handleDeleteVideo = (videoId: string) => {
    const videoTitle = videos.find(v => v.id === videoId)?.title || 'O vídeo selecionado';
    setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
    alert(`O vídeo "${videoTitle}" foi excluído com sucesso!`);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };
  
  const handleScrolledToNewVideo = useCallback(() => {
    setNewlyAddedVideoId(null);
  }, []);


  const renderContent = () => {
    const activeVideos = videos.filter(v => v.status === 'active');
    switch (activeView) {
      case 'home':
        return <VideoFeed videos={activeVideos} user={currentUser} onAddReward={handleAddReward} onToggleFavorite={handleToggleFavorite} newlyAddedVideoId={newlyAddedVideoId} onScrolledToNewVideo={handleScrolledToNewVideo} rewardAmount={settings.rewardPerVideo} rewardTimeSeconds={settings.minWatchTime}/>;
      case 'earn':
        return <EarnPage missions={missions} onInvite={() => alert("Invite link copied!")} />;
      case 'profile':
        return <ProfilePage user={currentUser} transactions={transactions} onWithdraw={() => setActiveModal('withdraw')} />;
      case 'recommendations':
        const watchedVideos = videos.filter(v => transactions.some(t => t.description.includes(v.title)));
        return <AIPoweredRecommendations watchedVideos={watchedVideos} />;
      default:
        return <VideoFeed videos={activeVideos} user={currentUser} onAddReward={handleAddReward} onToggleFavorite={handleToggleFavorite} newlyAddedVideoId={newlyAddedVideoId} onScrolledToNewVideo={handleScrolledToNewVideo} rewardAmount={settings.rewardPerVideo} rewardTimeSeconds={settings.minWatchTime}/>;
    }
  };
  
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

  return (
    <div className="bg-black text-white h-screen w-screen overflow-hidden font-sans">
      <main className="h-full">
        {renderContent()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} onAddVideoClick={() => setActiveModal('addVideo')} />
      {activeModal === 'addVideo' && <AddVideoModal onClose={() => setActiveModal(null)} onAddVideo={handleAddVideo} />}
      {activeModal === 'withdraw' && <WithdrawModal onClose={() => setActiveModal(null)} onRequestWithdrawal={handleRequestWithdrawal} currentBalance={currentUser.balance} />}
      
      {/* Secret button to toggle admin view */}
      <button 
        onClick={() => setIsAdminView(true)}
        className="absolute bottom-24 right-4 bg-gray-700 p-2 rounded-full z-50 opacity-50 hover:opacity-100"
        aria-label="Abrir Painel do Admin"
        >
        <Icon name="cog" className="w-6 h-6"/>
      </button>
    </div>
  );
};

export default App;