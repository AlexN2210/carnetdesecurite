import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Header } from './components/Header';
import { SiteCard } from './components/SiteCard';
import { SiteForm } from './components/SiteForm';
import { PasswordModal } from './components/PasswordModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { Site, AppState } from './types';
import { loadSites, saveSites, setMasterPassword, checkMasterPassword, hasMasterPassword } from './utils/supabaseStorage';
import { generateId } from './utils/crypto';

function App() {
  const [state, setState] = useState<AppState>({
    sites: [],
    isLocked: true,
    searchQuery: '',
    showSensitiveData: false,
  });
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSetupPassword, setIsSetupPassword] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const sites = await loadSites();
      const hasPassword = await hasMasterPassword();
      
      setState(prev => ({ 
        ...prev, 
        sites,
        isLocked: hasPassword
      }));
      
      if (!hasPassword) {
        setIsSetupPassword(true);
        setShowPasswordModal(true);
      }
    };
    
    loadData();
  }, []);

  const handlePasswordSubmit = async (password: string, confirmPassword?: string): Promise<boolean> => {
    if (isSetupPassword) {
      await setMasterPassword(password);
      setState(prev => ({ ...prev, isLocked: false }));
      setShowPasswordModal(false);
      setIsSetupPassword(false);
      return true;
    } else {
      const isValid = await checkMasterPassword(password);
      if (isValid) {
        setState(prev => ({ ...prev, isLocked: false }));
        setShowPasswordModal(false);
      }
      return isValid;
    }
  };

  const handleLockToggle = () => {
    if (state.isLocked) {
      setShowPasswordModal(true);
    } else {
      setState(prev => ({ 
        ...prev, 
        isLocked: true, 
        showSensitiveData: false 
      }));
    }
  };

  const handleVisibilityToggle = () => {
    if (!state.showSensitiveData && state.isLocked) {
      setShowPasswordModal(true);
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

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        isLocked={state.isLocked}
        showSensitiveData={state.showSensitiveData}
        searchQuery={state.searchQuery}
        onLockToggle={handleLockToggle}
        onVisibilityToggle={handleVisibilityToggle}
        onSearchChange={handleSearchChange}
      />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Sites surveillés</h2>
            <p className="text-gray-400 mt-1">
              {filteredSites.length} site{filteredSites.length !== 1 ? 's' : ''} 
              {state.searchQuery && ` trouvé${filteredSites.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          
          <button
            onClick={() => setShowSiteForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span>Nouveau site</span>
          </button>
        </div>

        {filteredSites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">
              {state.searchQuery ? 'Aucun site trouvé' : 'Aucun site ajouté'}
            </div>
            {!state.searchQuery && (
              <button
                onClick={() => setShowSiteForm(true)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ajouter votre premier site
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

      {showPasswordModal && (
        <PasswordModal
          isSetup={isSetupPassword}
          onSubmit={handlePasswordSubmit}
          onCancel={isSetupPassword ? undefined : () => setShowPasswordModal(false)}
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

      <PWAInstallPrompt />
    </div>
  );
}

export default App;