import { Video } from '../types';

// Extracts YouTube video ID from various URL formats
const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Fetches video data from YouTube API
export const fetchYouTubeVideoData = async (
    url: string, 
    apiKey: string
): Promise<Partial<Video> | null> => {
    const videoId = getYouTubeId(url);
    if (!videoId) {
        console.error("Invalid YouTube URL");
        return null;
    }

    if (!apiKey || apiKey.startsWith('••••')) {
        throw new Error("A chave de API do YouTube não está configurada. Adicione-a no painel de administração.");
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("YouTube API Error:", errorData.error.message);
            throw new Error(`Erro na API do YouTube: ${errorData.error.message}`);
        }
        const data = await response.json();
        if (data.items.length === 0) {
            throw new Error("Vídeo não encontrado no YouTube com o ID fornecido.");
        }

        const snippet = data.items[0].snippet;
        const contentDetails = data.items[0].contentDetails;
        
        const formatDuration = (isoDuration: string) => {
             const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
             if (!match) return "N/A";
             const hours = (parseInt(match[1], 10) || 0);
             const minutes = (parseInt(match[2], 10) || 0);
             const seconds = (parseInt(match[3], 10) || 0);
             if (hours > 0) {
                 return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
             }
             return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        return {
            title: snippet.title,
            channel: snippet.channelTitle,
            thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
            duration: formatDuration(contentDetails.duration),
        };
    } catch (error) {
        console.error("Failed to fetch YouTube video data:", error);
        throw error;
    }
};

// Extracts Dailymotion video ID from URL
const getDailymotionId = (url: string): string | null => {
    const regex = /dailymotion.com\/(?:video|embed\/video)\/([^_?]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// Fetches video data from Dailymotion API
export const fetchDailymotionVideoData = async (
    url: string
): Promise<Partial<Video> | null> => {
    const videoId = getDailymotionId(url);
    if (!videoId) {
        console.error("Invalid Dailymotion URL");
        return null;
    }

    const apiUrl = `https://api.dailymotion.com/video/${videoId}?fields=title,owner.screenname,thumbnail_large_url,duration`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Dailymotion API Error:", errorData.error.message);
            throw new Error(`Erro na API do Dailymotion: ${errorData.error.message}`);
        }
        const data = await response.json();

        const formatDuration = (totalSeconds: number) => {
             const hours = Math.floor(totalSeconds / 3600);
             const minutes = Math.floor((totalSeconds % 3600) / 60);
             const seconds = totalSeconds % 60;
             if (hours > 0) {
                 return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
             }
             return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return {
            title: data.title,
            channel: data['owner.screenname'],
            thumbnailUrl: data.thumbnail_large_url,
            duration: formatDuration(data.duration),
        };
    } catch (error) {
        console.error("Failed to fetch Dailymotion video data:", error);
        throw error;
    }
};

// Fetches video data from Vimeo oEmbed API
export const fetchVimeoVideoData = async (
    url: string
): Promise<Partial<Video> | null> => {
    const apiUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Vimeo API Error:", response.status, errorText);
            throw new Error(`Erro na API do Vimeo: ${response.statusText}`);
        }
        const data = await response.json();

        const formatDuration = (totalSeconds: number) => {
             if (isNaN(totalSeconds) || totalSeconds <= 0) return "N/A";
             const hours = Math.floor(totalSeconds / 3600);
             const minutes = Math.floor((totalSeconds % 3600) / 60);
             const seconds = totalSeconds % 60;
             if (hours > 0) {
                 return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
             }
             return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return {
            title: data.title,
            channel: data.author_name,
            thumbnailUrl: data.thumbnail_url,
            duration: formatDuration(data.duration),
        };
    } catch (error) {
        console.error("Failed to fetch Vimeo video data:", error);
        throw error;
    }
};

// Simulates fetching Kwai video data as there's no simple public API
export const fetchKwaiVideoData = async (
    url: string
): Promise<Partial<Video> | null> => {
    try {
        // This is a simulation. A real implementation would need a backend to scrape or use an internal API.
        return {
            title: `Vídeo do Kwai`,
            channel: 'Criador do Kwai',
            thumbnailUrl: `https://picsum.photos/seed/${new Date().getTime()}/400/800`, // Placeholder
            duration: "0:25", // Typical duration
        };
    } catch (error) {
        console.error("Could not process Kwai URL:", error);
        return null;
    }
};