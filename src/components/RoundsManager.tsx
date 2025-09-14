import React, { useState, useEffect } from 'react';
import { 
  Map, Clock, Footprints, Navigation, Filter, Search, 
  Calendar, Building, Play, Trash2, Edit, Eye,
  ArrowLeft, Plus, Target, RotateCcw, Bug
} from 'lucide-react';
import { RoundData, Site } from '../types';
import { loadRounds, deleteRound } from '../utils/hybridStorage';
import { loadSites } from '../utils/hybridStorage';
import { GPSReplay } from './GPSReplay';
import { RoundReplay } from './RoundReplay';
import { RoundDebugger } from './RoundDebugger';

interface RoundsManagerProps {
  onBack: () => void;
}

export const RoundsManager: React.FC<RoundsManagerProps> = ({ onBack }) => {
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<RoundData | null>(null);
  const [showGPSReplay, setShowGPSReplay] = useState(false);
  const [showRoundReplay, setShowRoundReplay] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [filterSite, setFilterSite] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [roundsResult, sitesData] = await Promise.all([
        loadRounds(),
        loadSites()
      ]);
      
      setRounds(roundsResult.rounds || []);
      setSites(sitesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ronde ?')) {
      try {
        const { success } = await deleteRound(roundId);
        if (success) {
          setRounds(prev => prev.filter(round => round.id !== roundId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleStartGPSReplay = (round: RoundData) => {
    setSelectedRound(round);
    setShowGPSReplay(true);
  };

  const handleCloseGPSReplay = () => {
    setShowGPSReplay(false);
    setSelectedRound(null);
  };

  const handleStartRoundReplay = (round: RoundData) => {
    setSelectedRound(round);
    setShowRoundReplay(true);
  };

  const handleCloseRoundReplay = () => {
    setShowRoundReplay(false);
    setSelectedRound(null);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSiteName = (siteId?: string) => {
    if (!siteId) return 'Site non défini';
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : 'Site inconnu';
  };

  const getStatusColor = (round: RoundData) => {
    if (round.isCompleted) return 'bg-green-600';
    if (round.endTime) return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  const getStatusText = (round: RoundData) => {
    if (round.isCompleted) return 'Terminée';
    if (round.endTime) return 'En pause';
    return 'En cours';
  };

  const getRealStepCount = (round: RoundData) => {
    return round.steps
      .filter(step => step.action === 'Marche' || step.action === 'Tout droit' || step.action === 'Reculer' || 
                     step.action === 'Droite' || step.action === 'Gauche')
      .reduce((total, step) => total + (step.steps || 0), 0);
  };

  const getWalkActionsCount = (round: RoundData) => {
    return round.steps.filter(step => 
      step.action === 'Marche' || step.action === 'Tout droit' || step.action === 'Reculer' || 
      step.action === 'Droite' || step.action === 'Gauche'
    ).length;
  };

  const filteredRounds = rounds.filter(round => {
    // Filtre par site
    if (filterSite !== 'all' && round.siteId !== filterSite) {
      return false;
    }

    // Filtre par statut
    if (filterStatus === 'completed' && !round.isCompleted) return false;
    if (filterStatus === 'incomplete' && round.isCompleted) return false;

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        round.name.toLowerCase().includes(query) ||
        getSiteName(round.siteId).toLowerCase().includes(query) ||
        (round.notes && round.notes.toLowerCase().includes(query))
      );
    }

    return true;
  });

  if (showGPSReplay && selectedRound) {
    return (
      <GPSReplay 
        round={selectedRound} 
        onClose={handleCloseGPSReplay} 
      />
    );
  }

  if (showRoundReplay && selectedRound) {
    return (
      <RoundReplay 
        round={selectedRound} 
        onClose={handleCloseRoundReplay} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-white flex items-center">
              <Map className="h-5 w-5 mr-2" />
              Gestion des Rondes
            </h2>
          </div>
          
          <div className="text-sm text-gray-400">
            {filteredRounds.length} ronde{filteredRounds.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0 space-y-3">
        {/* Recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une ronde..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {/* Filtre par site */}
          <select
            value={filterSite}
            onChange={(e) => setFilterSite(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="all">Tous les sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>

          {/* Filtre par statut */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="completed">Terminées</option>
            <option value="incomplete">En cours/En pause</option>
          </select>
        </div>
      </div>

      {/* Liste des rondes */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : filteredRounds.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Map className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium mb-2">Aucune ronde trouvée</p>
            <p className="text-sm">
              {searchQuery || filterSite !== 'all' || filterStatus !== 'all'
                ? 'Aucune ronde ne correspond aux critères de recherche'
                : 'Commencez par créer votre première ronde'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRounds.map((round) => (
              <div key={round.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{round.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(round)}`}>
                          {getStatusText(round)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-400 mb-2">
                        <Building className="h-4 w-4" />
                        <span>{getSiteName(round.siteId)}</span>
                      </div>

                      {round.notes && (
                        <p className="text-sm text-gray-300 bg-gray-700 p-2 rounded mb-2">
                          {round.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={() => handleStartRoundReplay(round)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Rejouer la ronde étape par étape"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleStartGPSReplay(round)}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Rejouer en mode GPS"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedRound(round);
                          setShowDebugger(true);
                        }}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Debug de la ronde"
                      >
                        <Bug className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRound(round.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <Navigation className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-white">{round.steps.length}</div>
                      <div className="text-xs text-gray-400">Actions</div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-3">
                      <Target className="h-4 w-4 text-green-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-white">{getWalkActionsCount(round)}</div>
                      <div className="text-xs text-gray-400">Marches</div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-3">
                      <Footprints className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-white">{getRealStepCount(round)}</div>
                      <div className="text-xs text-gray-400">Pas réels</div>
                    </div>
                    
                    <div className="bg-gray-700 rounded-lg p-3">
                      <Clock className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-white">
                        {round.duration ? formatDuration(round.duration) : '--:--'}
                      </div>
                      <div className="text-xs text-gray-400">Durée</div>
                    </div>
                  </div>

                  {/* Détail des actions */}
                  {round.steps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <h4 className="text-sm font-semibold text-white mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        Actions détaillées ({round.steps.length})
                      </h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {round.steps.map((step, index) => {
                          const isWalkAction = step.action === 'Marche' || step.action === 'Tout droit' || 
                                             step.action === 'Reculer' || step.action === 'Droite' || step.action === 'Gauche';
                          return (
                            <div key={step.id} className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
                              isWalkAction ? 'bg-green-900/30 border-l-2 border-green-500' : 'bg-gray-700'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-400">#{index + 1}</span>
                                <span className={`font-medium ${isWalkAction ? 'text-green-400' : 'text-blue-400'}`}>
                                  {step.action}
                                </span>
                                {step.direction && (
                                  <span className="text-gray-500">- {step.direction}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-gray-400">
                                {isWalkAction && step.steps > 0 && (
                                  <span className="text-yellow-400 font-bold">{step.steps} pas</span>
                                )}
                                <span className="text-gray-500">
                                  {new Date(step.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Début: {formatDate(round.startTime)}</span>
                      {round.endTime && (
                        <span>Fin: {formatDate(round.endTime)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showGPSReplay && selectedRound && (
        <GPSReplay
          round={selectedRound}
          onClose={() => {
            setShowGPSReplay(false);
            setSelectedRound(null);
          }}
        />
      )}

      {showRoundReplay && selectedRound && (
        <RoundReplay
          round={selectedRound}
          onClose={() => {
            setShowRoundReplay(false);
            setSelectedRound(null);
          }}
        />
      )}

      {showDebugger && selectedRound && (
        <RoundDebugger
          round={selectedRound}
          onClose={() => {
            setShowDebugger(false);
            setSelectedRound(null);
          }}
        />
      )}
    </div>
  );
};
