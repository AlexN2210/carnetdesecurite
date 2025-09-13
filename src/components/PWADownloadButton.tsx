import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWADownloadButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Vérifier si on est sur mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Ne pas afficher sur mobile
    if (isMobile) {
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installée avec succès');
        setIsInstalled(true);
      } else {
        console.log('Installation PWA refusée');
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  // Ne pas afficher si déjà installée ou si pas de prompt disponible
  if (isInstalled || !showButton || !deferredPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors shadow-lg text-sm font-medium"
    >
      {isInstalling ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <span>Installation...</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>Installer l'app</span>
        </>
      )}
    </button>
  );
};
