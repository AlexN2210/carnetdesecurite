import React, { useState, useEffect } from 'react';
import { Plus, LogOut, User, Navigation } from 'lucide-react';
import { Header } from './components/Header';
import { SiteCard } from './components/SiteCard';
import { SiteForm } from './components/SiteForm';
import { AuthModal } from './components/AuthModal';
import { PWADownloadButton } from './components/PWADownloadButton';
import { RoundTracking } from './components/RoundTracking';
import { RoundsManager } from './components/RoundsManager';
import { LoadingScreen } from './components/LoadingScreen';
import { Site, AppState } from './types';
import { loadSites, saveSites } from './utils/hybridStorage';
import { generateId } from './utils/crypto';
import { getCurrentUser, signOut, onAuthStateChange } from './utils/hybridAuth';

function App() {
  const [state, setState] = useState<AppState>({
    sites: [],
    isLocked: true,
    searchQuery: '',
    showSensitiveData: false,
  });
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRoundTracking, setShowRoundTracking] = useState(false);
  const [showRoundsManager, setShowRoundsManager] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSites, setIsLoadingSites] = useState(false);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setState(prev => ({ 
        ...prev, 
        isLocked: !user
      }));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Charger les sites quand l'utilisateur est connecté
    if (user) {
      const loadData = async () => {
        setIsLoadingSites(true);
        try {
          const sites = await loadSites();
          setState(prev => ({ 
            ...prev, 
            sites
          }));
        } finally {
          setIsLoadingSites(false);
        }
      };
      loadData();
    }
  }, [user]);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await signOut();
    setState(prev => ({ 
      ...prev, 
      sites: [],
      isLocked: true, 
      showSensitiveData: false 
    }));
  };

  const handleLockToggle = () => {
    if (state.isLocked) {
      setShowAuthModal(true);
    } else {
      handleLogout();
    }
  };

  const handleVisibilityToggle = () => {
    if (!state.showSensitiveData && state.isLocked) {
      setShowAuthModal(true);
      return;
    }
    setState(prev => ({ 
      ...prev, 
      showSensitiveData: !prev.showSensitiveData 
    }));
  };

  const handleSearchChange = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const handleSaveSite = async (siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
    let newSites: Site[];
    
    if (editingSite) {
      newSites = state.sites.map(site =>
        site.id === editingSite.id
          ? {
              ...siteData,
              id: editingSite.id,
              createdAt: editingSite.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : site
      );
    } else {
      const newSite: Site = {
        ...siteData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      newSites = [...state.sites, newSite];
    }

    setState(prev => ({ ...prev, sites: newSites }));
    await saveSites(newSites);
    setShowSiteForm(false);
    setEditingSite(null);
  };

  const handleEditSite = (site: Site) => {
    setEditingSite(site);
    setShowSiteForm(true);
  };

  const handleDeleteSite = async (siteId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) {
      const newSites = state.sites.filter(site => site.id !== siteId);
      setState(prev => ({ ...prev, sites: newSites }));
      await saveSites(newSites);
    }
  };

  const filteredSites = state.sites.filter(site =>
    site.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
    site.address.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  // Écran de chargement initial
  if (isLoading) {
    return <LoadingScreen message="Initialisation de votre carnet de sécurité..." />;
  }

  // Écran de chargement des sites
  if (isLoadingSites) {
    return <LoadingScreen message="Chargement de vos sites surveillés..." />;
  }

  // Écran de connexion
  if (!user) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center p-4 overflow-hidden">
        <div className="text-center max-w-md w-full">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Carnet de Sécurité</h1>
            <p className="text-gray-400">Gestion des sites surveillés avec navigation Waze</p>
          </div>
          
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </button>
        </div>
        
        {showAuthModal && (
          <AuthModal
            onSuccess={handleAuthSuccess}
            onCancel={() => setShowAuthModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 w-full overflow-x-hidden flex flex-col">
      <Header
        isLocked={state.isLocked}
        showSensitiveData={state.showSensitiveData}
        searchQuery={state.searchQuery}
        onLockToggle={handleLockToggle}
        onVisibilityToggle={handleVisibilityToggle}
        onSearchChange={handleSearchChange}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full overflow-x-hidden overflow-y-auto mobile-scroll-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Sites surveillés</h2>
            <p className="text-gray-400 mt-1">
              {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} 
              {state.searchQuery && ` trouvé${filteredSites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <button
              onClick={() => setShowRoundTracking(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg w-full sm:w-auto text-sm sm:text-base"
            >
              <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Suivi de Ronde</span>
            </button>
            
            <button
              onClick={() => setShowSiteForm(true)}
              className="flex items-center justify-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg w-full sm:w-auto text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Nouveau site</span>
            </button>
          </div>
        </div>

        {filteredSites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">
              {state.searchQuery ? 'Aucun site trouvé' : 'Aucun site ajouté'}
            </div>
            {!state.searchQuery && (
              <button
                onClick={() => setShowSiteForm(true)}
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm sm:text-base"
              >
                Ajouter votre premier site
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
            {filteredSites.map(site => (
              <SiteCard
                key={site.id}
                site={site}
                showSensitiveData={state.showSensitiveData}
                onEdit={handleEditSite}
                onDelete={handleDeleteSite}
              />
            ))}
          </div>
        )}
      </main>

      {showAuthModal && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onCancel={() => setShowAuthModal(false)}
        />
      )}

      {showSiteForm && (
        <SiteForm
          site={editingSite}
          onSave={handleSaveSite}
          onCancel={() => {
            setShowSiteForm(false);
            setEditingSite(null);
          }}
        />
      )}

      {showRoundTracking && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
              <h2 className="text-lg font-bold text-white">Suivi de Ronde</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowRoundTracking(false);
                    setShowRoundsManager(true);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                >
                  Gestion
                </button>
                <button
                  onClick={() => setShowRoundTracking(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <RoundTracking />
            </div>
          </div>
        </div>
      )}

      {showRoundsManager && (
        <div className="fixed inset-0 z-50 bg-gray-900">
          <RoundsManager onBack={() => setShowRoundsManager(false)} />
        </div>
      )}

      <PWADownloadButton />
    </div>
  );
}

export default App;