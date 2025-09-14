import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Target, DoorOpen, Building, MapPin, 
  Play, Pause, Square, RotateCcw,
  Navigation, Footprints, Clock, Map
} from 'lucide-react';
import { saveRound, loadRounds, deleteRound, RoundData } from '../utils/roundStorage';

interface RoundStep {
  id: string;
  timestamp: number;
  action: string;
  direction?: string;
  steps: number;
  location?: string;
  notes?: string;
}

// Interface RoundData maintenant importée depuis roundStorage

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
  
  const stepCountRef = useRef(0);
  const roundStartTime = useRef<number>(0);

  // Charger les rondes au montage du composant
  useEffect(() => {
    loadRoundsFromDatabase();
  }, []);

  // Podomètre simple basé sur les clics de boutons
  useEffect(() => {
    if (isRecording) {
      roundStartTime.current = Date.now();
    }
  }, [isRecording]);

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

    stepCountRef.current += 1;
    setStepCount(stepCountRef.current);

    const newStep: RoundStep = {
      id: `step_${Date.now()}`,
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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header mobile optimisé */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
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
      <div className="grid grid-cols-4 gap-2 p-4 bg-gray-800">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <Footprints className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{stepCount}</div>
          <div className="text-xs text-gray-400">Pas</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <Clock className="h-5 w-5 text-green-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">
            {isRecording ? formatDuration(Date.now() - (roundData?.startTime || 0)) : '00:00'}
          </div>
          <div className="text-xs text-gray-400">Durée</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <Target className="h-5 w-5 text-red-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{roundData?.steps.length || 0}</div>
          <div className="text-xs text-gray-400">Actions</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <Navigation className="h-5 w-5 text-purple-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{currentStep}</div>
          <div className="text-xs text-gray-400">Étape</div>
        </div>
      </div>

      {/* Contrôles principaux - Mobile first */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-3">
          {!isRecording ? (
            <button
              onClick={startRound}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-4 py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium text-lg"
            >
              <Play className="h-6 w-6 mr-2" />
              Démarrer
            </button>
          ) : (
            <button
              onClick={stopRound}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center px-4 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium text-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-2"></div>
              ) : (
                <Square className="h-6 w-6 mr-2" />
              )}
              {isLoading ? 'Sauvegarde...' : 'Arrêter'}
            </button>
          )}
          
          {isReplaying && (
            <button
              onClick={nextReplayStep}
              className="flex-1 flex items-center justify-center px-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium text-lg"
            >
              <RotateCcw className="h-6 w-6 mr-2" />
              Suivant
            </button>
          )}
        </div>
      </div>

      {/* Pad de navigation - Optimisé mobile */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {navigationButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => addStep(button.action, button.direction)}
              disabled={!isRecording}
              className={`${button.color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-6 rounded-xl transition-all transform active:scale-95 flex flex-col items-center space-y-3 min-h-[80px]`}
            >
              <button.icon className="h-8 w-8" />
              <span className="text-sm font-medium text-center">{button.action}</span>
            </button>
          ))}
        </div>

        {/* Log des actions - Mobile optimisé */}
        {isRecording && roundData && roundData.steps.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Dernières Actions
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {roundData.steps.slice(-5).map((step) => (
                <div key={step.id} className="flex items-center justify-between text-xs bg-gray-700 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-end">
          <div className="bg-gray-800 w-full max-h-[70vh] rounded-t-xl">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Rondes Enregistrées</h3>
                <button
                  onClick={() => setShowRounds(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {savedRounds.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  Aucune ronde enregistrée
                </div>
              ) : (
                savedRounds.map((round) => (
                  <div key={round.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium text-sm">{round.name}</div>
                      <button
                        onClick={() => {
                          replayRound(round);
                          setShowRounds(false);
                        }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                      >
                        Rejouer
                      </button>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
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
