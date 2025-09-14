import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  Target, DoorOpen, Building, MapPin, 
  Play, Pause, Square, RotateCcw,
  Navigation, Footprints, Clock, Map
} from 'lucide-react';

interface RoundStep {
  id: string;
  timestamp: number;
  action: string;
  direction?: string;
  steps: number;
  location?: string;
  notes?: string;
}

interface RoundData {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  steps: RoundStep[];
  totalSteps: number;
  duration?: number;
}

export const RoundTracking: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [roundData, setRoundData] = useState<RoundData | null>(null);
  const [stepCount, setStepCount] = useState(0);
  const [savedRounds, setSavedRounds] = useState<RoundData[]>([]);
  const [showRounds, setShowRounds] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);
  
  const stepCountRef = useRef(0);
  const roundStartTime = useRef<number>(0);

  // Podomètre simple basé sur les clics de boutons
  useEffect(() => {
    if (isRecording) {
      roundStartTime.current = Date.now();
    }
  }, [isRecording]);

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

  const stopRound = () => {
    if (roundData) {
      const completedRound = {
        ...roundData,
        endTime: Date.now(),
        duration: Date.now() - roundData.startTime
      };
      
      setSavedRounds(prev => [...prev, completedRound]);
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
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Navigation className="h-6 w-6 mr-2" />
          Suivi de Ronde
        </h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRounds(!showRounds)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <Map className="h-4 w-4 mr-2 inline" />
            Rondes ({savedRounds.length})
          </button>
        </div>
      </div>

      {/* Statistiques en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <Footprints className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{stepCount}</div>
          <div className="text-sm text-gray-400">Pas</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <Clock className="h-6 w-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {isRecording ? formatDuration(Date.now() - (roundData?.startTime || 0)) : '00:00'}
          </div>
          <div className="text-sm text-gray-400">Durée</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <Target className="h-6 w-6 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{roundData?.steps.length || 0}</div>
          <div className="text-sm text-gray-400">Actions</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <Navigation className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{currentStep}</div>
          <div className="text-sm text-gray-400">Étape</div>
        </div>
      </div>

      {/* Contrôles principaux */}
      <div className="flex justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRound}
            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            <Play className="h-5 w-5 mr-2" />
            Démarrer Ronde
          </button>
        ) : (
          <button
            onClick={stopRound}
            className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            <Square className="h-5 w-5 mr-2" />
            Arrêter Ronde
          </button>
        )}
        
        {isReplaying && (
          <button
            onClick={nextReplayStep}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Étape Suivante
          </button>
        )}
      </div>

      {/* Pad de navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {navigationButtons.map((button, index) => (
          <button
            key={index}
            onClick={() => addStep(button.action, button.direction)}
            disabled={!isRecording}
            className={`${button.color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-white p-4 rounded-lg transition-all transform hover:scale-105 flex flex-col items-center space-y-2`}
          >
            <button.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{button.action}</span>
          </button>
        ))}
      </div>

      {/* Historique des rondes */}
      {showRounds && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Rondes Enregistrées</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savedRounds.map((round) => (
              <div key={round.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">{round.name}</div>
                  <div className="text-sm text-gray-400">
                    {round.totalSteps} pas • {round.steps.length} actions • 
                    {round.duration ? formatDuration(round.duration) : 'En cours'}
                  </div>
                </div>
                <button
                  onClick={() => replayRound(round)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Rejouer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log des actions en temps réel */}
      {isRecording && roundData && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Actions en Temps Réel</h3>
          <div className="bg-gray-900 rounded-lg p-4 max-h-40 overflow-y-auto">
            {roundData.steps.slice(-10).map((step) => (
              <div key={step.id} className="text-sm text-gray-300 mb-1">
                <span className="text-blue-400">{step.action}</span>
                {step.direction && <span className="text-gray-500"> - {step.direction}</span>}
                <span className="text-gray-500"> - {step.steps} pas</span>
                <span className="text-gray-600 text-xs ml-2">
                  {new Date(step.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
