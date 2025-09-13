import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check } from 'lucide-react';

export const AndroidInstallPrompt: React.FC = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifier si on est sur Android
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // Vérifier si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Afficher le prompt seulement sur Android et si pas déjà installé
    if (isAndroid && !isInstalled) {
      // Attendre un peu avant d'afficher le prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // 3 secondes après le chargement

      return () => clearTimeout(timer);
    }
  }, [isInstalled]);

  // Écouter l'événement appinstalled
  useEffect(() => {
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-600 rounded-lg">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Installer l'application</h3>
            <p className="text-gray-400 text-sm">Pour un accès rapide sur Android</p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1 text-gray-400 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-gray-300">
          <p className="mb-2">Chrome détectera automatiquement cette PWA :</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Regardez la barre d'adresse pour l'icône d'installation</li>
            <li>Ou utilisez le menu Chrome (⋮) → "Installer l'application"</li>
            <li>L'application apparaîtra sur votre écran d'accueil</li>
          </ol>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-green-400">
          <Check className="h-4 w-4" />
          <span>Fonctionne hors ligne</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-400">
          <Check className="h-4 w-4" />
          <span>Navigation Waze intégrée</span>
        </div>
      </div>
    </div>
  );
};
