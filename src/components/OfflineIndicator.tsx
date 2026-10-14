import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-500/90 text-slate-950 font-display px-3.5 py-2 text-xs font-bold shadow-xl backdrop-blur-md border border-emerald-300/40 animate-fade-in">
        <Wifi className="w-4 h-4" />
        <span>Conexão Restabelecida!</span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-500/90 text-slate-950 font-display px-3.5 py-2 text-xs font-bold shadow-xl backdrop-blur-md border border-amber-300/40 animate-pulse">
      <WifiOff className="w-4 h-4" />
      <span>Modo Offline — O PWA está rodando do cache.</span>
    </div>
  );
};
