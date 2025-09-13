import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
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

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installée avec succès');
      } else {
        console.log('Installation PWA refusée');
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Ne plus afficher pendant cette session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Ne pas afficher si déjà installée ou si l'utilisateur a refusé
  if (isInstalled || !showInstallPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4 md:left-auto md:right-4 md:w-80">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Download className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Installer l'application</h3>
            <p className="text-gray-400 text-sm">Accès rapide depuis votre écran d'accueil</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Smartphone className="h-4 w-4" />
          <span>Fonctionne hors ligne</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <Monitor className="h-4 w-4" />
          <span>Navigation Waze intégrée</span>
        </div>
        
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            Installer
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
};
