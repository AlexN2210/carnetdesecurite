import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Target, DoorOpen, Building, MapPin, 
  Play, Square, Navigation
} from 'lucide-react';
import { saveRound, loadRounds } from '../utils/hybridStorage';
import { loadSites } from '../utils/hybridStorage';
import { RoundData } from '../utils/roundStorage';
import { GPSReplay } from './GPSReplay';

export const RoundTracking: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [savedRounds, setSavedRounds] = useState<RoundData[]>([]);
  const [showRounds, setShowRounds] = useState(false);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [roundNotes, setRoundNotes] = useState('');
  const [showGPSReplay, setShowGPSReplay] = useState(false);
  const [selectedRound, setSelectedRound] = useState<RoundData | null>(null);
  
  // Timer et distance
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [userHeight, setUserHeight] = useState(175);
  const [walkingSpeed, setWalkingSpeed] = useState(1.4);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [actualSteps, setActualSteps] = useState(0);
  
  const stepCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les paramètres utilisateur depuis localStorage
  useEffect(() => {
    const savedHeight = localStorage.getItem('userHeight');
    const savedSpeed = localStorage.getItem('walkingSpeed');
    
    if (savedHeight) {
      setUserHeight(parseInt(savedHeight));
    }
    if (savedSpeed) {
      setWalkingSpeed(parseFloat(savedSpeed));
    }
  }, []);

  // Sauvegarder les paramètres utilisateur
  useEffect(() => {
    localStorage.setItem('userHeight', userHeight.toString());
  }, [userHeight]);

  useEffect(() => {
    localStorage.setItem('walkingSpeed', walkingSpeed.toString());
  }, [walkingSpeed]);

  // Charger les sites
  useEffect(() => {
  const loadSitesData = async () => {
    try {
      const sitesData = await loadSites();
        setSites(sitesData);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };
    loadSitesData();
  }, []);

  const loadRoundsFromDatabase = async () => {
    try {
      // Charger depuis localStorage d'abord pour affichage immédiat
      const localRounds = JSON.parse(localStorage.getItem('carnet_securite_rounds') || '[]');
      console.log('📦 Rondes chargées depuis localStorage:', localRounds.length);
      setSavedRounds(localRounds);
      
      // Essayer de charger depuis Supabase
      const result = await loadRounds();
      if (result && result.rounds && result.rounds.length > 0) {
        // Convertir les données pour correspondre au type RoundData de roundStorage
        const convertedRounds = result.rounds.map(round => ({
          ...round,
          isCompleted: (round as any).isCompleted || false
        }));
        console.log('✅ Rondes chargées depuis Supabase:', convertedRounds.length);
        setSavedRounds(convertedRounds);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rondes:', error);
    }
  };

  // Charger les rondes
  useEffect(() => {
    loadRoundsFromDatabase();
  }, []);

  const calculateStepLength = () => {
    return userHeight * 0.43; // Formule standard
  };

  const startDistanceTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const startTime = Date.now();
    setTimerEnabled(true);
    
    timerRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const distance = elapsedSeconds * walkingSpeed;
      const stepLength = calculateStepLength();
      const steps = Math.floor(distance / stepLength);
      
      setCurrentDistance(distance);
      setActualSteps(steps);
    }, 1000);
  };

  const stopDistanceTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerEnabled(false);
  };

  const resetDistance = () => {
    setCurrentDistance(0);
    setActualSteps(0);
    if (timerEnabled) {
      stopDistanceTimer();
      startDistanceTimer();
    }
  };

  const startRound = () => {
    console.log('🚀 Démarrage de la ronde...');
    const selectedSite = sites.find(site => site.id === selectedSiteId);
    const newRound: RoundData = {
      id: `round_${Date.now()}`,
      name: `Ronde ${new Date().toLocaleString()}`,
      startTime: Date.now(),
      steps: [],
      totalSteps: 0,
      siteId: selectedSiteId || undefined,
      siteName: selectedSite?.name,
      notes: roundNotes || undefined,
      isCompleted: false
    };
    
    console.log('📝 Nouvelle ronde créée:', newRound);
    
    setRoundData(newRound);
    setIsRecording(true);
    setActualSteps(0);
    setCurrentDistance(0);
    
    console.log('✅ Ronde démarrée - isRecording=true, roundData initialisé');
  };

  const addStep = async (action: string, direction?: string) => {
    console.log(`🚀🚀🚀 addStep appelée avec: action=${action}, direction=${direction}`);
    console.log(`🚀🚀🚀 ÉTAT COMPLET: isRecording=${isRecording}, roundData=${!!roundData}`);
    
    if (!isRecording) {
      console.log(`❌❌❌ addStep annulée: isRecording=${isRecording}`);
      return;
    }

    if (!roundData) {
      console.log(`❌❌❌ addStep annulée: roundData est null`);
      return;
    }

    console.log(`🔄 Ajout d'étape: ${action} ${direction || ''}`);
    console.log(`🔄 roundData.steps avant:`, roundData.steps);

    const newStep = {
      id: `step_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      action,
      direction: direction || undefined,
      steps: actualSteps,
      distance: currentDistance,
      location: '',
      notes: ''
    };

    console.log(`📝 Nouvelle étape créée:`, newStep);

    const updatedSteps = [...roundData.steps, newStep];
    
    const updatedRoundData = {
      ...roundData,
      steps: updatedSteps,
      totalSteps: updatedSteps.length
    };
    
    console.log(`📊 roundData.steps après:`, updatedRoundData.steps);
    
    setRoundData(updatedRoundData);

    // Sauvegarde immédiate dans localStorage
    try {
      const existingRounds = JSON.parse(localStorage.getItem('carnet_securite_rounds') || '[]');
      const existingIndex = existingRounds.findIndex((r: any) => r.id === updatedRoundData.id);
      
      if (existingIndex >= 0) {
        existingRounds[existingIndex] = updatedRoundData;
      } else {
        existingRounds.push(updatedRoundData);
      }
      
      localStorage.setItem('carnet_securite_rounds', JSON.stringify(existingRounds));
      console.log('💾 Ronde mise à jour dans localStorage');
      
      setSavedRounds(existingRounds);
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }

    console.log(`✅ Étape ajoutée avec succès: ${action} ${direction || ''} - Total étapes: ${updatedSteps.length}`);
    console.log('📋 Toutes les étapes actuelles:', updatedSteps.map((s, i) => `${i + 1}. ${s.action}`));
  };


  const stopRound = async () => {
    console.log('🛑 Arrêt de la ronde...');
    console.log('🛑 roundData actuel:', roundData);
    
    if (!roundData) {
      console.log('❌ Pas de ronde à arrêter');
      setIsRecording(false);
      return;
    }

      const completedRound = {
        ...roundData,
        endTime: Date.now(),
        duration: Date.now() - roundData.startTime,
        isCompleted: true
      };
    
    console.log('🛑 Ronde complétée:', completedRound);
    console.log('🛑 Nombre d\'actions:', completedRound.steps.length);
    console.log('🛑 Actions détaillées:', completedRound.steps.map((s, i) => `${i + 1}. ${s.action}`));
      
      console.log('💾 Sauvegarde de la ronde:', {
        name: completedRound.name,
        totalSteps: completedRound.totalSteps,
        stepsCount: completedRound.steps.length,
        steps: completedRound.steps.map((s, i) => `${i + 1}. ${s.action} (${s.steps} pas)`)
      });
      
    try {
      // Sauvegarde immédiate dans localStorage
      const existingRounds = JSON.parse(localStorage.getItem('carnet_securite_rounds') || '[]');
      const existingIndex = existingRounds.findIndex((r: any) => r.id === completedRound.id);
      
      if (existingIndex >= 0) {
        existingRounds[existingIndex] = completedRound;
      } else {
        existingRounds.push(completedRound);
      }
      
      localStorage.setItem('carnet_securite_rounds', JSON.stringify(existingRounds));
      console.log('💾 Ronde sauvegardée dans localStorage');
      
      setSavedRounds(existingRounds);
      
      // Essayer de sauvegarder dans Supabase
        const { success, error } = await saveRound(completedRound);
        if (success) {
        console.log('✅ Ronde sauvegardée avec succès dans Supabase');
        } else {
        console.error('❌ Erreur lors de la sauvegarde Supabase:', error);
        console.log('💾 Mais la ronde est sauvegardée dans localStorage');
        }
      
      await loadRoundsFromDatabase();
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
      }
      
      setRoundData(null);
    setIsRecording(false);
    stepCountRef.current = 0;
    stopDistanceTimer();
  };


  const replayRound = (round: RoundData) => {
    setRoundData(round);
  };

  const startGPSReplay = (round: RoundData) => {
    setSelectedRound(round);
    setShowGPSReplay(true);
    setShowRounds(false);
  };

  const closeGPSReplay = () => {
    setShowGPSReplay(false);
    setSelectedRound(null);
  };


  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const navigationButtons = [
    { action: 'Droite', direction: 'right', icon: ArrowRight, color: 'bg-blue-600' },
    { action: 'Gauche', direction: 'left', icon: ArrowLeft, color: 'bg-blue-600' },
    { action: 'Tout droit', direction: 'forward', icon: ArrowUp, color: 'bg-green-600' },
    { action: 'Reculer', direction: 'backward', icon: ArrowDown, color: 'bg-yellow-600' },
    { action: 'Pointeaux', icon: Target, color: 'bg-red-600' },
    { action: 'Porte', icon: DoorOpen, color: 'bg-purple-600' },
    { action: 'Étage', icon: Building, color: 'bg-indigo-600' },
    { action: 'Position', icon: MapPin, color: 'bg-pink-600' }
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 overflow-hidden">
      {/* Header mobile optimisé */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Navigation className="h-5 w-5 mr-2" />
            Suivi de Ronde
          </h2>
          <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRounds(!showRounds)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
              Rondes
          </button>
            {roundData && (
              <div className="text-white text-sm">
                {roundData.steps.length} actions
          </div>
        )}
      </div>
              </div>
            </div>
            
      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Section de contrôle de la ronde */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="space-y-3">
            {/* Sélection du site */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Site
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRecording}
              >
                <option value="">Sélectionner un site</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Notes de la ronde */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Notes de la ronde
            </label>
            <textarea
              value={roundNotes}
              onChange={(e) => setRoundNotes(e.target.value)}
                placeholder="Notes optionnelles..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRecording}
                rows={2}
            />
          </div>

            {/* Contrôles de la ronde */}
            <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
          {!isRecording ? (
            <button
              onClick={startRound}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
            >
                    <Play className="h-4 w-4 mr-2" />
              Démarrer
            </button>
          ) : (
            <button
              onClick={stopRound}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Arrêter
            </button>
          )}
        </div>
        
        {isRecording && (
                <div className="text-white text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    Enregistrement en cours
            </div>
              </div>
            )}
          </div>
          </div>
        </div>

        {/* Section timer et distance */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Taille (cm)
              </label>
              <input
                type="number"
                value={userHeight}
                onChange={(e) => setUserHeight(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Vitesse (m/s)
              </label>
              <input
                type="number"
                step="0.1"
                value={walkingSpeed}
                onChange={(e) => setWalkingSpeed(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">
                Distance: {currentDistance.toFixed(1)}m
              </div>
              <div className="text-white text-sm">
                Pas estimés: {actualSteps}
              </div>
      </div>

            <div className="flex items-center space-x-2">
              {!timerEnabled ? (
                <button
                  onClick={startDistanceTimer}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Démarrer Timer
                </button>
              ) : (
                <button
                  onClick={stopDistanceTimer}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Arrêter Timer
                </button>
              )}
            <button
                onClick={resetDistance}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
              >
                Reset
            </button>
            </div>
        </div>

                  </div>

        {/* Boutons d'actions */}
        {isRecording && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 gap-3">
              {navigationButtons.map((button, index) => {
                const IconComponent = button.icon;
                return (
                  <button
                    key={index}
                    onClick={() => addStep(button.action, button.direction)}
                    className={`${button.color} hover:opacity-90 text-white p-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200`}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="font-medium">{button.action}</span>
                  </button>
                );
              })}
                  </div>
                </div>
        )}

        {/* Affichage des étapes en cours - Version compacte */}
        {isRecording && roundData && roundData.steps.length > 0 && (
          <div className="bg-gray-800 p-2 border-t border-gray-700">
            <div className="text-white text-xs mb-1">
              Actions: {roundData.steps.length} | Dernière: {roundData.steps[roundData.steps.length - 1]?.action}
            </div>
          </div>
        )}
      </div>

      {/* Panneau des rondes */}
      {showRounds && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Gestion des Rondes</h2>
                <button
                  onClick={() => setShowRounds(false)}
                className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            
            <div className="space-y-3">
              {savedRounds.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  Aucune ronde enregistrée
                </div>
              ) : (
                savedRounds.map((round) => (
                  <div key={round.id} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">{round.name}</h3>
                        <div className="text-xs text-gray-400 mt-1">
                          <div>{round.totalSteps} pas • {round.steps.length} actions</div>
                          <div>{round.duration ? formatDuration(round.duration) : 'En cours'}</div>
                          <div className="text-green-400 font-medium">
                            📏 Distance: {round.steps.reduce((total, step) => total + ((step as any).distance || 0), 0).toFixed(1)}m
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startGPSReplay(round)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                        >
                          GPS
                        </button>
                        <button
                          onClick={() => {
                            replayRound(round);
                            setShowRounds(false);
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        >
                          Rejouer
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Composant GPS Replay */}
      {showGPSReplay && selectedRound && (
        <GPSReplay 
          round={selectedRound} 
          onClose={closeGPSReplay} 
        />
      )}
    </div>
  );
};