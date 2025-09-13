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
      // FORCER L'INSTALLATION PWA - MÉTHODES MULTIPLES
      console.log('🚀 TENTATIVE D\'INSTALLATION PWA FORCÉE...');
      
      // Méthode 1: Vérifier le manifest
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
      const hasManifest = !!manifestLink;
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      console.log('Critères PWA:', {
        HTTPS: isHTTPS,
        Manifest: hasManifest,
        ServiceWorker: hasServiceWorker,
        Prompt: !!deferredPrompt
      });
      
      // Méthode 2: Essayer de déclencher l'installation via le service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          console.log('✅ Service Worker prêt:', registration);
          
          // Essayer de déclencher l'installation
          if (registration.active) {
            console.log('🔄 Service Worker actif, tentative d\'installation...');
          }
        } catch (error) {
          console.log('❌ Erreur Service Worker:', error);
        }
      }
      
      // Méthode 3: Essayer de forcer l'événement beforeinstallprompt
      console.log('🔄 Tentative de déclenchement manuel de l\'événement...');
      
      // Créer un événement personnalisé
      const customEvent = new CustomEvent('beforeinstallprompt', {
        detail: {
          platforms: ['web'],
          userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' })
        }
      });
      
      // Méthode 4: Instructions avec boutons d'action
      const instructions = `
🚀 INSTALLATION PWA - Carnet de Sécurité

🔍 DIAGNOSTIC :
- HTTPS: ${isHTTPS ? '✅' : '❌'}
- Manifest: ${hasManifest ? '✅' : '❌'}
- Service Worker: ${hasServiceWorker ? '✅' : '❌'}
- Prompt: ${deferredPrompt ? '✅' : '❌'}

📱 SUR ANDROID (Chrome) :
1. Menu Chrome (⋮) → "Installer l'application"
2. Ou icône d'installation (⬇️) dans la barre d'adresse
3. Ou "Ajouter à l'écran d'accueil"

💻 SUR DESKTOP (Chrome/Edge) :
1. Icône d'installation (⬇️) dans la barre d'adresse
2. Menu Chrome (⋮) → "Installer l'application"
3. F12 → Application → Manifest → Install

🍎 SUR iOS (Safari) :
1. Bouton partage (□↑) → "Sur l'écran d'accueil"

⚠️ Si rien n'apparaît :
- Rechargez la page (F5)
- Attendez 30 secondes
- Vérifiez HTTPS
      `;
      
      // Afficher les instructions
      alert(instructions);
      
      // Méthode 5: Essayer de déclencher l'installation après un délai
      setTimeout(() => {
        console.log('🔄 Nouvelle tentative d\'installation...');
        
        // Vérifier si le prompt est maintenant disponible
        if (deferredPrompt) {
          console.log('✅ Prompt maintenant disponible !');
          deferredPrompt.prompt().then(() => {
            console.log('🚀 Installation lancée !');
          });
        } else {
          console.log('❌ Prompt toujours indisponible');
          
          // Méthode 6: Créer un lien de téléchargement direct
          console.log('🔄 Création d\'un lien de téléchargement direct...');
          
          // Créer un lien vers le manifest
          const manifestUrl = manifestLink?.href || '/manifest.json';
          const downloadLink = document.createElement('a');
          downloadLink.href = manifestUrl;
          downloadLink.download = 'carnet-securite.json';
          downloadLink.textContent = 'Télécharger le manifest';
          
          // Essayer de déclencher le téléchargement
          try {
            downloadLink.click();
            console.log('✅ Lien de téléchargement créé');
          } catch (error) {
            console.log('❌ Erreur lors de la création du lien:', error);
          }
        }
      }, 2000);
      
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