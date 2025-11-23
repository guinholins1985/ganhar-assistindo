import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

interface AdSenseAdProps {
  clientId: string;
  slotId: string;
  format?: 'auto' | 'fluid' | 'display';
  style?: React.CSSProperties;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ clientId, slotId, format = 'auto', style = {} }) => {
  useEffect(() => {
    // Inject the AdSense script if it doesn't already exist.
    if (!document.querySelector('script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    // Push the ad request.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [slotId]); // Re-run when the slotId changes

  if (!clientId || !slotId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 rounded-lg">
        <div className="text-center">
          <p className="font-semibold">Espaço Publicitário</p>
          <p className="text-xs">Configure o ID do anúncio no painel de administração.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%', ...style }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default AdSenseAd;
