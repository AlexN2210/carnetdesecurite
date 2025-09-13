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

  useEffect(() => {
    // Vérifier si on est sur mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
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
    if (deferredPrompt) {
      // Utiliser le prompt natif si disponible
      setIsInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installée avec succès');
          setIsInstalled(true);
          setShowButton(false);
        } else {
          console.log('Installation PWA refusée');
        }
      } catch (error) {
        console.error('Erreur lors de l\'installation PWA:', error);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
      }
    } else {
      // Fallback : afficher les instructions d'installation
      alert(`Pour installer cette application :
      
Chrome/Edge : Cliquez sur l'icône d'installation dans la barre d'adresse
Firefox : Menu > Installer cette application
Safari : Menu Partager > Sur l'écran d'accueil

Ou utilisez le menu de votre navigateur pour installer l'application.`);
    }
  };

  // Debug : afficher toujours le bouton pour tester
  console.log('PWA Button Debug:', { isInstalled, deferredPrompt: !!deferredPrompt });

  // Ne pas afficher si déjà installée
  if (isInstalled) {
    return null;
  }

  return (
    <div className="bg-red-500 p-2 text-white text-xs">
      TEST PWA BUTTON
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className="ml-2 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors shadow-lg text-sm font-medium"
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
    </div>
  );
};
