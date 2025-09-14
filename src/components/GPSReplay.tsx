import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Square, RotateCcw, ArrowUp, ArrowDown, 
  ArrowLeft, ArrowRight, Target, DoorOpen, Building, MapPin,
  Navigation, Clock, Footprints, Volume2, VolumeX
} from 'lucide-react';
import { RoundData, RoundStep } from '../utils/roundStorage';

interface GPSReplayProps {
  round: RoundData;
  onClose: () => void;
}

export const GPSReplay: React.FC<GPSReplayProps> = ({ round, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<RoundStep | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    speechSynthesis.current = window.speechSynthesis;
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentStepIndex < round.steps.length) {
      setCurrentStep(round.steps[currentStepIndex]);
      setProgress((currentStepIndex / round.steps.length) * 100);
      
      if (voiceEnabled && isPlaying) {
        speakInstruction(round.steps[currentStepIndex]);
      }
    }
  }, [currentStepIndex, round.steps, voiceEnabled, isPlaying]);

  const speakInstruction = (step: RoundStep) => {
    if (!speechSynthesis.current || !voiceEnabled) return;
    
    // Arrêter toute synthèse en cours
    speechSynthesis.current.cancel();
    
    const instruction = getInstructionText(step);
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    speechSynthesis.current.speak(utterance);
  };

  const getInstructionText = (step: RoundStep): string => {
    const stepNumber = currentStepIndex + 1;
    const totalSteps = round.steps.length;
    
    switch (step.action) {
      case 'Tout droit':
        return `Étape ${stepNumber} sur ${totalSteps}. Avancez tout droit. Étape numéro ${step.steps}.`;
      case 'Droite':
        return `Étape ${stepNumber} sur ${totalSteps}. Tournez à droite. Étape numéro ${step.steps}.`;
      case 'Gauche':
        return `Étape ${stepNumber} sur ${totalSteps}. Tournez à gauche. Étape numéro ${step.steps}.`;
      case 'Reculer':
        return `Étape ${stepNumber} sur ${totalSteps}. Reculer. Étape numéro ${step.steps}.`;
      case 'Pointeaux':
        return `Étape ${stepNumber} sur ${totalSteps}. Vérifiez les pointeaux. Étape numéro ${step.steps}.`;
      case 'Porte':
        return `Étape ${stepNumber} sur ${totalSteps}. Vérifiez la porte. Étape numéro ${step.steps}.`;
      case 'Étage':
        return `Étape ${stepNumber} sur ${totalSteps}. Vérifiez l'étage. Étape numéro ${step.steps}.`;
      case 'Position':
        return `Étape ${stepNumber} sur ${totalSteps}. Marquez votre position. Étape numéro ${step.steps}.`;
      case 'Marche':
        return `Étape ${stepNumber} sur ${totalSteps}. Continuez à marcher. Étape numéro ${step.steps}.`;
      default:
        return `Étape ${stepNumber} sur ${totalSteps}. ${step.action}. Étape numéro ${step.steps}.`;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Tout droit': return ArrowUp;
      case 'Droite': return ArrowRight;
      case 'Gauche': return ArrowLeft;
      case 'Reculer': return ArrowDown;
      case 'Marche': return Footprints;
      case 'Pointeaux': return Target;
      case 'Porte': return DoorOpen;
      case 'Étage': return Building;
      case 'Position': return MapPin;
      default: return Navigation;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Tout droit': return 'text-green-400';
      case 'Droite': return 'text-blue-400';
      case 'Gauche': return 'text-blue-400';
      case 'Reculer': return 'text-yellow-400';
      case 'Marche': return 'text-cyan-400';
      case 'Pointeaux': return 'text-red-400';
      case 'Porte': return 'text-purple-400';
      case 'Étage': return 'text-indigo-400';
      case 'Position': return 'text-pink-400';
      default: return 'text-white';
    }
  };

  const startReplay = () => {
    setIsPlaying(true);
    setCurrentStepIndex(0);
    
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= round.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000); // 3 secondes entre chaque instruction
    }
  };

  const pauseReplay = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (speechSynthesis.current) {
      speechSynthesis.current.cancel();
    }
  };

  const nextStep = () => {
    if (currentStepIndex < round.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const resetReplay = () => {
    pauseReplay();
    setCurrentStepIndex(0);
    setProgress(0);
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header GPS */}
      <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Navigation className="h-6 w-6 text-green-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Mode GPS</h2>
              <p className="text-sm text-gray-400">{round.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                voiceEnabled ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {voiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            
            <button
              onClick={onClose}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="bg-gray-800 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
          <span>Étape {currentStepIndex + 1} sur {round.steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Écran principal GPS */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black">
        {currentStep ? (
          <div className="text-center space-y-6">
            {/* Icône principale */}
            <div className="flex justify-center">
              {React.createElement(getActionIcon(currentStep.action), {
                className: `h-20 w-20 ${getActionColor(currentStep.action)}`,
                strokeWidth: 1.5
              })}
            </div>

            {/* Instruction principale */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                {currentStep.action}
              </h1>
              {currentStep.direction && (
                <p className="text-xl text-gray-300">
                  Direction: {currentStep.direction}
                </p>
              )}
            </div>

            {/* Informations de l'étape */}
            <div className="bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Navigation className="h-4 w-4" />
                  <span>Étape {currentStep.steps}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(currentStep.timestamp)}</span>
                </div>
              </div>
              
              {currentStep.location && (
                <p className="text-gray-300 text-sm">
                  Lieu: {currentStep.location}
                </p>
              )}
              
              {currentStep.notes && (
                <p className="text-gray-400 text-sm italic">
                  "{currentStep.notes}"
                </p>
              )}
            </div>

            {/* Prochaine étape (aperçu) */}
            {currentStepIndex < round.steps.length - 1 && (
              <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-green-400">
                <p className="text-sm text-gray-400 mb-1">Prochaine étape:</p>
                <p className="text-white font-medium">
                  {round.steps[currentStepIndex + 1].action}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4">
            <Navigation className="h-16 w-16 text-gray-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-400">
              Prêt pour la relecture
            </h2>
            <p className="text-gray-500">
              Cliquez sur "Démarrer" pour commencer la navigation GPS
            </p>
          </div>
        )}
      </div>

      {/* Contrôles GPS */}
      <div className="bg-gray-900 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-center space-x-4">
          {/* Bouton Précédent */}
          <button
            onClick={previousStep}
            disabled={currentStepIndex === 0}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Contrôles principaux */}
          <div className="flex items-center space-x-2">
            {!isPlaying ? (
              <button
                onClick={startReplay}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                <Play className="h-5 w-5" />
                <span>Démarrer</span>
              </button>
            ) : (
              <button
                onClick={pauseReplay}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
              >
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </button>
            )}
          </div>

          {/* Bouton Suivant */}
          <button
            onClick={nextStep}
            disabled={currentStepIndex >= round.steps.length - 1}
            className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Options */}
        <div className="flex items-center justify-center space-x-4 mt-3">
          <label className="flex items-center space-x-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              className="rounded"
            />
            <span>Lecture automatique (3s)</span>
          </label>
          
          <button
            onClick={resetReplay}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>

        {/* Statistiques de la ronde */}
        <div className="mt-4 pt-3 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-white font-bold">{round.totalSteps}</div>
              <div className="text-gray-400">Étapes total</div>
            </div>
            <div>
              <div className="text-white font-bold">{round.steps.length}</div>
              <div className="text-gray-400">Actions</div>
            </div>
            <div>
              <div className="text-white font-bold">
                {round.duration ? formatDuration(round.duration) : '--:--'}
              </div>
              <div className="text-gray-400">Durée</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
