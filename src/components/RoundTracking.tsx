import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Target, DoorOpen, Building, MapPin, 
  Play, Pause, Square, RotateCcw,
  Navigation, Footprints, Clock, Map
} from 'lucide-react';
import { saveRound, loadRounds, deleteRound, RoundData } from '../utils/hybridStorage';

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
  
  const stepCountRef = useRef(0);
  const roundStartTime = useRef<number>(0);
  const lastAcceleration = useRef<{ x: number; y: number; z: number } | null>(null);
  const stepThreshold = useRef(0.5); // Seuil pour détecter un pas
  const lastStepTime = useRef(0);
  const minStepInterval = 300; // Intervalle minimum entre les pas (ms)

  // Charger les rondes au montage du composant
  useEffect(() => {
    loadRoundsFromDatabase();
  }, []);

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

    // Pour les actions manuelles (boutons), toujours ajouter un pas
    // Pour les actions automatiques (podomètre), ajouter un pas seulement si c'est un vrai pas
    const isManualAction = direction !== 'automatique';
    const isStepAction = action === 'Marche' || action === 'Tout droit' || action === 'Reculer' || 
                        action === 'Droite' || action === 'Gauche';

    if (isStepAction) {
      stepCountRef.current += 1;
      setStepCount(stepCountRef.current);
    }

    const newStep: RoundStep = {
      id: `step_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      action,
      direction,
      steps: stepCountRef.current,
      location,
      notes: ''
    };

    const updatedSteps = [...roundData.steps, newStep];
    setRoundData({
      ...roundData,
      steps: updatedSteps,
      totalSteps: stepCountRef.current
    });

    // Log pour le débogage
    console.log(`Pas ajouté: ${action} ${direction || ''} - Total: ${stepCountRef.current}`);
  };

  const startRound = () => {
    const newRound: RoundData = {
      id: `round_${Date.now()}`,
      name: `Ronde ${new Date().toLocaleString()}`,
      startTime: Date.now(),
      steps: [],
      totalSteps: 0
    };
    
    setRoundData(newRound);
    setIsRecording(true);
    setCurrentStep(0);
    stepCountRef.current = 0;
    setStepCount(0);
  };

  const stopRound = async () => {
    if (roundData) {
      const completedRound = {
        ...roundData,
        endTime: Date.now(),
        duration: Date.now() - roundData.startTime
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
      <div className="grid grid-cols-4 gap-2 p-3 bg-gray-800 flex-shrink-0">
        <div className="bg-gray-700 rounded-lg p-2 text-center">
          <Footprints className="h-4 w-4 text-blue-400 mx-auto mb-1" />
          <div className="text-sm font-bold text-white">{stepCount}</div>
          <div className="text-xs text-gray-400">Pas</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-2 text-center">
          <Clock className="h-4 w-4 text-green-400 mx-auto mb-1" />
          <div className="text-sm font-bold text-white">
            {isRecording ? formatDuration(Date.now() - (roundData?.startTime || 0)) : '00:00'}
          </div>
          <div className="text-xs text-gray-400">Durée</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-2 text-center">
          <Target className="h-4 w-4 text-red-400 mx-auto mb-1" />
          <div className="text-sm font-bold text-white">{roundData?.steps.length || 0}</div>
          <div className="text-xs text-gray-400">Actions</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-2 text-center">
          <Navigation className="h-4 w-4 text-purple-400 mx-auto mb-1" />
          <div className="text-sm font-bold text-white">{currentStep}</div>
          <div className="text-xs text-gray-400">Étape</div>
        </div>
      </div>

      {/* Contrôles principaux - Mobile first */}
      <div className="p-3 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex space-x-2 mb-2">
          {!isRecording ? (
            <button
              onClick={startRound}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-3 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
            >
              <Play className="h-5 w-5 mr-2" />
              Démarrer
            </button>
          ) : (
            <button
              onClick={stopRound}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-3 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <Square className="h-5 w-5 mr-2" />
              )}
              {isLoading ? 'Sauvegarde...' : 'Arrêter'}
            </button>
          )}
          
          {isReplaying && (
            <button
              onClick={nextReplayStep}
              className="flex-1 flex items-center justify-center px-3 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Suivant
            </button>
          )}
        </div>
        
        {/* Contrôle du podomètre */}
        {isRecording && (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPedometerEnabled(!pedometerEnabled)}
                className={`flex items-center px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                  pedometerEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <Footprints className="h-4 w-4 mr-1" />
                {pedometerEnabled ? 'Podomètre ON' : 'Podomètre OFF'}
              </button>
              
              {/* Indicateur de statut */}
              <div className={`w-3 h-3 rounded-full ${
                pedometerEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`} title={pedometerEnabled ? 'Podomètre actif' : 'Podomètre inactif'} />
            </div>
            
            <div className="text-center">
              <span className="text-xs text-gray-400">
                {pedometerEnabled ? 'Détection automatique activée - Bougez le téléphone' : 'Cliquez sur les boutons pour compter manuellement'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pad de navigation - Optimisé mobile */}
      <div className="flex-1 p-3 overflow-y-auto">
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mb-3">
          {navigationButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => addStep(button.action, button.direction)}
              disabled={!isRecording}
              className={`${button.color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 sm:p-4 rounded-lg transition-all transform active:scale-95 flex flex-col items-center space-y-1 sm:space-y-2 min-h-[50px] sm:min-h-[70px]`}
            >
              <button.icon className="h-4 w-4 sm:h-6 sm:w-6" />
              <span className="text-xs font-medium text-center">{button.action}</span>
            </button>
          ))}
        </div>

        {/* Log des actions - Mobile optimisé */}
        {isRecording && roundData && roundData.steps.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-3">
            <h3 className="text-xs font-semibold text-white mb-2 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Dernières Actions
            </h3>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {roundData.steps.slice(-3).map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs bg-gray-700 rounded p-1">
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-400 font-medium">{step.action}</span>
                    {step.direction && <span className="text-gray-500">- {step.direction}</span>}
                  </div>
                  <div className="text-gray-400">
                    {step.steps} pas
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
    </div>
  );
};
