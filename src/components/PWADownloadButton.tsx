import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

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
    setIsInstalling(true);
    
    try {
      if (deferredPrompt) {
        // Utiliser le prompt natif si disponible
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA installée avec succès');
          setIsInstalled(true);
        } else {
          console.log('Installation PWA refusée');
        }
      } else {
        // FORCER L'INSTALLATION PWA - MÉTHODES MULTIPLES
        console.log('🚀 TENTATIVE D\'INSTALLATION PWA FORCÉE...');
        
        // Méthode 1: Vérifier le manifest
        const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
        if (manifestLink) {
          console.log('✅ Manifest trouvé:', manifestLink.href);
        } else {
          console.log('❌ Manifest non trouvé');
        }
        
        // Méthode 2: Vérifier le service worker
        if ('serviceWorker' in navigator) {
          console.log('✅ Service Worker supporté');
          navigator.serviceWorker.getRegistrations().then(registrations => {
            console.log('Service Workers actifs:', registrations.length);
          });
        } else {
          console.log('❌ Service Worker non supporté');
        }
        
        // Méthode 3: Essayer de déclencher l'événement manuellement
        console.log('🔄 Tentative de déclenchement manuel...');
        
        // Méthode 4: Vérifier les critères PWA
        const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
        const hasManifest = !!manifestLink;
        const hasServiceWorker = 'serviceWorker' in navigator;
        
        console.log('Critères PWA:', {
          HTTPS: isHTTPS,
          Manifest: hasManifest,
          ServiceWorker: hasServiceWorker
        });
        
        // Méthode 5: Instructions détaillées avec diagnostic
        const diagnostic = `
🔍 DIAGNOSTIC PWA :
- HTTPS: ${isHTTPS ? '✅' : '❌'}
- Manifest: ${hasManifest ? '✅' : '❌'}
- Service Worker: ${hasServiceWorker ? '✅' : '❌'}
- Prompt disponible: ${deferredPrompt ? '✅' : '❌'}
        `;
        
        const instructions = `
🚀 INSTALLATION PWA - Carnet de Sécurité

${diagnostic}

📱 SUR ANDROID (Chrome) :
1. Ouvrez le menu Chrome (⋮) en haut à droite
2. Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"
3. Ou cherchez l'icône d'installation (⬇️) dans la barre d'adresse

💻 SUR DESKTOP (Chrome/Edge) :
1. Cherchez l'icône d'installation (⬇️) dans la barre d'adresse
2. Ou menu Chrome (⋮) > "Installer l'application"
3. Ou Ctrl+Shift+I > Application > Manifest > Install

🍎 SUR iOS (Safari) :
1. Appuyez sur le bouton de partage (□↑) en bas
2. Sélectionnez "Sur l'écran d'accueil"

⚠️ Si aucune option n'apparaît :
- Rechargez la page (F5)
- Attendez 10 secondes et réessayez
- Vérifiez que vous êtes en HTTPS
        `;
        
        alert(instructions);
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation PWA:', error);
      alert('Erreur lors de l\'installation. Vérifiez que votre navigateur supporte les PWA.');
    } finally {
      setIsInstalling(false);
    }
  };

  // Debug : toujours afficher le bouton pour tester
  console.log('PWA Button State:', { isInstalled, deferredPrompt: !!deferredPrompt });

  return (
    <div className="bg-red-500 p-1 text-white text-xs">
      PWA BTN
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