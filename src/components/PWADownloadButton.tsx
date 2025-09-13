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
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // LANCER L'INSTALLATION AUTOMATIQUEMENT
      setTimeout(() => {
        handleInstallClick();
      }, 1000); // Attendre 1 seconde puis lancer l'installation
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

  // Ne rien afficher - l'installation est automatique
  return null;
};
