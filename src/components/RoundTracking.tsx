import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Target, DoorOpen, Building, MapPin, 
  Play, Pause, Square, RotateCcw,
  Navigation, Footprints, Clock, Map
} from 'lucide-react';
import { saveRound, loadRounds, deleteRound, RoundData } from '../utils/hybridStorage';
import { loadSites } from '../utils/hybridStorage';
import { GPSReplay } from './GPSReplay';
import { Site } from '../types';

// Types pour l'accéléromètre
interface DeviceMotionEvent extends Event {
  accelerationIncludingGravity: {
    x: number | null;
    y: number | null;
    z: number | null;
  } | null;
}

declare global {
  interface Window {
    DeviceMotionEvent: {
      requestPermission?: () => Promise<string>;
    };
  }
}

interface RoundStep {
  id: string;
  timestamp: number;
  action: string;
  direction?: string;
  steps: number;
  location?: string;
  notes?: string;
}

// Interface RoundData maintenant importée depuis localStorage

export const RoundTracking: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [savedRounds, setSavedRounds] = useState<RoundData[]>([]);
  const [showRounds, setShowRounds] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pedometerEnabled, setPedometerEnabled] = useState(false);
  const [showGPSReplay, setShowGPSReplay] = useState(false);
  const [selectedRound, setSelectedRound] = useState<RoundData | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [roundNotes, setRoundNotes] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepValidated, setIsStepValidated] = useState(false);
  const [showStepValidation, setShowStepValidation] = useState(false);
  const [actualSteps, setActualSteps] = useState(0);
  const [expectedSteps, setExpectedSteps] = useState(0);
  const [customExpectedSteps, setCustomExpectedSteps] = useState(1);
  const [showValidationPanel, setShowValidationPanel] = useState(true);
  
  const stepCountRef = useRef(0);
  const roundStartTime = useRef<number>(0);
  const lastAcceleration = useRef<{ x: number; y: number; z: number } | null>(null);
  const stepThreshold = useRef(0.5); // Seuil pour détecter un pas
  const lastStepTime = useRef(0);
  const minStepInterval = 300; // Intervalle minimum entre les pas (ms)

  // Charger les rondes et sites au montage du composant
  useEffect(() => {
    loadRoundsFromDatabase();
    loadSitesData();
  }, []);

  const loadSitesData = async () => {
    try {
      const sitesData = await loadSites();
      setSites(sitesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  // Podomètre basé sur l'accéléromètre
  useEffect(() => {
    if (isRecording && pedometerEnabled) {
      roundStartTime.current = Date.now();
      startPedometer();
    } else {
      stopPedometer();
    }
    
    return () => {
      stopPedometer();
    };
  }, [isRecording, pedometerEnabled]);

  const startPedometer = () => {
    if (typeof window.DeviceMotionEvent !== 'undefined' && window.DeviceMotionEvent.requestPermission) {
      // iOS 13+ nécessite une permission
      window.DeviceMotionEvent.requestPermission().then(response => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', handleMotion);
        }
      });
    } else {
      // Android et autres navigateurs
      window.addEventListener('devicemotion', handleMotion);
    }
  };

  const stopPedometer = () => {
    window.removeEventListener('devicemotion', handleMotion);
  };

  const handleMotion = (event: any) => {
    if (!isRecording || !pedometerEnabled) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration || acceleration.x === null || acceleration.y === null || acceleration.z === null) return;

    const { x, y, z } = acceleration;
    const currentTime = Date.now();

    // Calculer la magnitude de l'accélération
    const magnitude = Math.sqrt(x * x + y * y + z * z);
    
    if (lastAcceleration.current) {
      const lastMagnitude = Math.sqrt(
        lastAcceleration.current.x * lastAcceleration.current.x +
        lastAcceleration.current.y * lastAcceleration.current.y +
        lastAcceleration.current.z * lastAcceleration.current.z
      );
      
      const delta = Math.abs(magnitude - lastMagnitude);

      // Détecter un pas si le changement d'accélération dépasse le seuil
      // et qu'assez de temps s'est écoulé depuis le dernier pas
      if (delta > stepThreshold.current && 
          currentTime - lastStepTime.current > minStepInterval) {
        addStep('Marche', 'automatique');
        lastStepTime.current = currentTime;
        
        // Mettre à jour le compteur de pas actuels pour la validation
        setActualSteps(prev => prev + 1);
        
        // Log pour le débogage
        console.log(`Pas détecté automatiquement - Delta: ${delta.toFixed(3)}, Seuil: ${stepThreshold.current}`);
      }
    }

    lastAcceleration.current = { x, y, z };
  };

  const loadRoundsFromDatabase = async () => {
    setIsLoading(true);
    try {
      const { rounds, error } = await loadRounds();
      if (error) {
        console.error('Erreur lors du chargement des rondes:', error);
      } else {
        setSavedRounds(rounds);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStep = (action: string, direction?: string, location?: string) => {
    if (!isRecording || !roundData) return;

    // Pour les actions manuelles (boutons), toujours ajouter une étape
    // Pour les actions automatiques (podomètre), ajouter une étape seulement si c'est un vrai pas
    const isManualAction = direction !== 'automatique';
    const isStepAction = action === 'Marche' || action === 'Tout droit' || action === 'Reculer' || 
                        action === 'Droite' || action === 'Gauche';

    // Incrémenter le compteur d'étapes pour toutes les actions
    if (isManualAction) {
      stepCountRef.current += 1;
      setStepCount(stepCountRef.current);
    } else if (isStepAction && direction === 'automatique') {
      stepCountRef.current += 1;
      setStepCount(stepCountRef.current);
    }

    // Pour les actions de marche, compter les pas réels
    const stepCount = isStepAction ? (direction === 'automatique' ? 1 : customExpectedSteps) : 0;
    
    const newStep: RoundStep = {
      id: `step_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      action,
      direction,
      steps: stepCount,
      location,
      notes: ''
    };

    const updatedSteps = [...roundData.steps, newStep];
    
    // Calculer le total des pas réels (seulement pour les actions de marche)
    const realStepCount = updatedSteps
      .filter(step => step.action === 'Marche' || step.action === 'Tout droit' || step.action === 'Reculer' || 
                     step.action === 'Droite' || step.action === 'Gauche')
      .reduce((total, step) => total + (step.steps || 0), 0);
    
    setRoundData({
      ...roundData,
      steps: updatedSteps,
      totalSteps: realStepCount
    });

    // Mettre à jour l'index de l'étape actuelle
    setCurrentStepIndex(updatedSteps.length - 1);
    setCurrentStep(updatedSteps.length - 1);

    // Pour les actions de marche, activer la validation seulement si elle n'est pas désactivée
    if (isStepAction && isManualAction && showValidationPanel) {
      setExpectedSteps(customExpectedSteps); // Utiliser la valeur personnalisée
      setShowStepValidation(true);
      setIsStepValidated(false);
      setActualSteps(0); // Reset des pas actuels
    }

    // Log pour le débogage
    console.log(`Étape ajoutée: ${action} ${direction || ''} - Total: ${stepCountRef.current} - Index: ${updatedSteps.length - 1}`);
  };

  const validateStep = () => {
    setIsStepValidated(true);
    setShowStepValidation(false);
    setActualSteps(0); // Reset pour la prochaine étape
  };

  const goToPreviousStep = () => {
    if (roundData && currentStepIndex > 0) {
      const newIndex = currentStepIndex - 1;
      setCurrentStepIndex(newIndex);
      const prevStep = roundData.steps[newIndex];
      if (prevStep) {
        setStepCount(prevStep.steps);
        stepCountRef.current = prevStep.steps;
        setCurrentStep(newIndex);
        console.log(`Navigation vers étape ${newIndex + 1}: ${prevStep.action}`);
      }
    }
  };

  const goToNextStep = () => {
    if (roundData && currentStepIndex < roundData.steps.length - 1) {
      const newIndex = currentStepIndex + 1;
      setCurrentStepIndex(newIndex);
      const nextStep = roundData.steps[newIndex];
      if (nextStep) {
        setStepCount(nextStep.steps);
        stepCountRef.current = nextStep.steps;
        setCurrentStep(newIndex);
        console.log(`Navigation vers étape ${newIndex + 1}: ${nextStep.action}`);
      }
    }
  };

  const startRound = () => {
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
    
    setRoundData(newRound);
    setIsRecording(true);
    setCurrentStep(0);
    setCurrentStepIndex(0);
    stepCountRef.current = 0;
    setStepCount(0);
    setActualSteps(0);
    setExpectedSteps(0);
    setIsStepValidated(false);
    setShowStepValidation(false);
  };

  const stopRound = async () => {
    if (roundData) {
      const completedRound = {
        ...roundData,
        endTime: Date.now(),
        duration: Date.now() - roundData.startTime,
        isCompleted: true
      };
      
      // Sauvegarder en base de données
      setIsLoading(true);
      try {
        const { success, error } = await saveRound(completedRound);
        if (success) {
          console.log('Ronde sauvegardée avec succès');
          // Recharger les rondes depuis la base
          await loadRoundsFromDatabase();
        } else {
          console.error('Erreur lors de la sauvegarde:', error);
          // Sauvegarder localement en fallback
          setSavedRounds(prev => [...prev, completedRound]);
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        // Sauvegarder localement en fallback
        setSavedRounds(prev => [...prev, completedRound]);
      } finally {
        setIsLoading(false);
      }
      
      setRoundData(null);
    }
    
    setIsRecording(false);
    setCurrentStep(0);
    stepCountRef.current = 0;
    setStepCount(0);
  };

  const replayRound = (round: RoundData) => {
    setRoundData(round);
    setIsReplaying(true);
    setReplayIndex(0);
    setCurrentStep(0);
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

  const nextReplayStep = () => {
    if (!roundData || replayIndex >= roundData.steps.length) {
      setIsReplaying(false);
      setReplayIndex(0);
      return;
    }

    const step = roundData.steps[replayIndex];
    setCurrentStep(replayIndex);
    setReplayIndex(prev => prev + 1);
    
    // Simulation de l'action
    console.log(`Replay: ${step.action} ${step.direction || ''} - ${step.steps} pas`);
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
          <button
            onClick={() => setShowRounds(!showRounds)}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            <Map className="h-4 w-4 mr-1 inline" />
            {savedRounds.length}
          </button>
        </div>
      </div>

      {/* Statistiques compactes */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-gray-800 flex-shrink-0">
        <div className="bg-gray-700 rounded p-1.5 text-center">
          <Navigation className="h-3 w-3 text-blue-400 mx-auto mb-0.5" />
          <div className="text-xs font-bold text-white">{stepCount}</div>
          <div className="text-xs text-gray-400">Étapes</div>
        </div>
        
        <div className="bg-gray-700 rounded p-1.5 text-center">
          <Clock className="h-3 w-3 text-green-400 mx-auto mb-0.5" />
          <div className="text-xs font-bold text-white">
            {isRecording ? formatDuration(Date.now() - (roundData?.startTime || 0)) : '00:00'}
          </div>
          <div className="text-xs text-gray-400">Durée</div>
        </div>
        
        <div className="bg-gray-700 rounded p-1.5 text-center">
          <Target className="h-3 w-3 text-red-400 mx-auto mb-0.5" />
          <div className="text-xs font-bold text-white">{roundData?.steps.length || 0}</div>
          <div className="text-xs text-gray-400">Actions</div>
        </div>
        
        <div className="bg-gray-700 rounded p-1.5 text-center">
          <Footprints className="h-3 w-3 text-purple-400 mx-auto mb-0.5" />
          <div className="text-xs font-bold text-white">{actualSteps}</div>
          <div className="text-xs text-gray-400">Pas</div>
        </div>
      </div>

      {/* Affichage de l'étape actuelle - Version ultra compacte */}
      {isRecording && roundData && roundData.steps.length > 0 && (
        <div className="p-1 bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="bg-gray-700 rounded p-1.5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-white">
                Étape {currentStepIndex + 1}/{roundData.steps.length}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={goToPreviousStep}
                  disabled={currentStepIndex === 0}
                  className="p-0.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                  title="Étape précédente"
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button
                  onClick={goToNextStep}
                  disabled={currentStepIndex >= roundData.steps.length - 1}
                  className="p-0.5 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors"
                  title="Étape suivante"
                >
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
            
            <div className="text-white text-xs font-medium mb-1">
              {roundData.steps[currentStepIndex]?.action}
              {roundData.steps[currentStepIndex]?.direction && 
                ` - ${roundData.steps[currentStepIndex]?.direction}`
              }
            </div>
            
            {/* Validation des pas - Version ultra compacte */}
            {showStepValidation && showValidationPanel && (
              <div className="mt-1 pt-1 border-t border-gray-600">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Pas: {actualSteps}/{expectedSteps}</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={expectedSteps}
                      onChange={(e) => setExpectedSteps(parseInt(e.target.value) || 1)}
                      className="w-8 px-1 py-0.5 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-center text-xs"
                    />
                    {actualSteps >= expectedSteps && (
                      <button
                        onClick={validateStep}
                        className="px-1 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                        title="Valider l'étape"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => setShowValidationPanel(false)}
                      className="px-1 py-0.5 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
                      title="Masquer la validation"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Informations de l'étape - Version ultra compacte */}
            <div className="mt-1 pt-1 border-t border-gray-600 text-xs text-gray-400 flex justify-between">
              <span>{new Date(roundData.steps[currentStepIndex]?.timestamp || 0).toLocaleTimeString()}</span>
              <div className="flex items-center space-x-2">
                <span>#{roundData.steps[currentStepIndex]?.steps}</span>
                {showStepValidation && !showValidationPanel && (
                  <button
                    onClick={() => setShowValidationPanel(true)}
                    className="px-1 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                    title="Afficher la validation des pas"
                  >
                    Pas
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sélection du site et notes (avant de commencer) - Version compacte */}
      {!isRecording && (
        <div className="p-2 bg-gray-800 border-b border-gray-700 flex-shrink-0 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Site (optionnel)
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
              >
                <option value="">Sélectionner...</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Pas attendus par action
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={customExpectedSteps}
                onChange={(e) => setCustomExpectedSteps(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                placeholder="1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              value={roundNotes}
              onChange={(e) => setRoundNotes(e.target.value)}
              placeholder="Notes sur cette ronde..."
              className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none resize-none text-sm"
              rows={1}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="disableValidation"
              checked={!showValidationPanel}
              onChange={(e) => setShowValidationPanel(!e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="disableValidation" className="text-xs text-gray-300">
              Désactiver la validation des pas
            </label>
          </div>
        </div>
      )}

      {/* Contrôles principaux - Version compacte */}
      <div className="p-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex space-x-2 mb-2">
          {!isRecording ? (
            <button
              onClick={startRound}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Play className="h-4 w-4 mr-1" />
              Démarrer
            </button>
          ) : (
            <button
              onClick={stopRound}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium text-sm"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
              ) : (
                <Square className="h-4 w-4 mr-1" />
              )}
              {isLoading ? 'Sauvegarde...' : 'Arrêter'}
            </button>
          )}
          
          {isReplaying && (
            <button
              onClick={nextReplayStep}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Suivant
            </button>
          )}
        </div>
        
        {/* Contrôle du podomètre - Version compacte */}
        {isRecording && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPedometerEnabled(!pedometerEnabled)}
                className={`flex items-center px-3 py-1 rounded transition-colors text-xs font-medium ${
                  pedometerEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <Footprints className="h-3 w-3 mr-1" />
                {pedometerEnabled ? 'ON' : 'OFF'}
              </button>
              
              {/* Indicateur de statut */}
              <div className={`w-2 h-2 rounded-full ${
                pedometerEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`} title={pedometerEnabled ? 'Podomètre actif' : 'Podomètre inactif'} />
            </div>
            
            {/* Affichage des pas actuels - Version compacte */}
            {pedometerEnabled && (
              <div className="bg-gray-700 rounded px-2 py-1 text-center">
                <div className="text-sm font-bold text-white">{actualSteps}</div>
                <div className="text-xs text-gray-400">pas</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pad de navigation - Optimisé mobile */}
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {navigationButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => addStep(button.action, button.direction)}
              disabled={!isRecording}
              className={`${button.color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all transform active:scale-95 flex flex-col items-center space-y-1 min-h-[60px] shadow-lg`}
            >
              <button.icon className="h-5 w-5" />
              <span className="text-xs font-medium text-center">{button.action}</span>
            </button>
          ))}
        </div>

        {/* Log des actions - Version compacte */}
        {isRecording && roundData && roundData.steps.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-2">
            <h3 className="text-xs font-semibold text-white mb-1 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Dernières Actions
            </h3>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {roundData.steps.slice(-3).map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs bg-gray-700 rounded px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-400 font-medium">{step.action}</span>
                    {step.direction && <span className="text-gray-500">- {step.direction}</span>}
                  </div>
                  <div className="text-gray-400">
                    {step.steps}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Historique des rondes - Modal mobile */}
      {showRounds && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-end">
          <div className="bg-gray-800 w-full max-h-[80vh] rounded-t-xl">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Rondes Enregistrées</h3>
                <button
                  onClick={() => setShowRounds(false)}
                  className="text-gray-400 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {savedRounds.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Aucune ronde enregistrée
                </div>
              ) : (
                savedRounds.map((round) => (
                  <div key={round.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white font-medium text-sm">{round.name}</div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            startGPSReplay(round);
                          }}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs flex items-center space-x-1"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>GPS</span>
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
                    <div className="text-xs text-gray-400">
                      <div>{round.totalSteps} pas • {round.steps.length} actions</div>
                      <div>{round.duration ? formatDuration(round.duration) : 'En cours'}</div>
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
