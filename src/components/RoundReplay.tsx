import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, RotateCcw, ArrowLeft, ArrowRight,
  Navigation, Clock, Target, Footprints, CheckCircle,
  ArrowUp, ArrowDown, ArrowLeft as Left, ArrowRight as Right
} from 'lucide-react';
import { RoundData } from '../types';

interface RoundReplayProps {
  round: RoundData;
  onClose: () => void;
}

export const RoundReplay: React.FC<RoundReplayProps> = ({ round, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showInstructions, setShowInstructions] = useState(true);

  const currentStep = round.steps[currentStepIndex];
  const totalSteps = round.steps.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  // Auto-play des étapes
  useEffect(() => {
    if (isPlaying && currentStepIndex < totalSteps - 1) {
      const timer = setTimeout(() => {
        nextStep();
      }, 2000); // 2 secondes par étape
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      setIsCompleted(true);
    }
  }, [isPlaying, currentStepIndex, totalSteps]);

  const nextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const togglePlay = () => {
    if (isCompleted) {
      // Recommencer
      setCurrentStepIndex(0);
      setIsCompleted(false);
      setCompletedSteps(new Set());
    }
    setIsPlaying(!isPlaying);
  };

  const markStepCompleted = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
    if (currentStepIndex < totalSteps - 1) {
      nextStep();
    } else {
      setIsCompleted(true);
      setIsPlaying(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Tout droit':
        return <ArrowUp className="h-6 w-6" />;
      case 'Reculer':
        return <ArrowDown className="h-6 w-6" />;
      case 'Droite':
        return <Right className="h-6 w-6" />;
      case 'Gauche':
        return <Left className="h-6 w-6" />;
      case 'Marche':
        return <Footprints className="h-6 w-6" />;
      case 'Pointeaux':
        return <Target className="h-6 w-6" />;
      case 'Porte':
        return <div className="h-6 w-6 flex items-center justify-center text-lg">🚪</div>;
      case 'Étage':
        return <div className="h-6 w-6 flex items-center justify-center text-lg">🏢</div>;
      case 'Position':
        return <div className="h-6 w-6 flex items-center justify-center text-lg">📍</div>;
      default:
        return <Navigation className="h-6 w-6" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Tout droit':
        return 'text-green-400 bg-green-900/30';
      case 'Reculer':
        return 'text-yellow-400 bg-yellow-900/30';
      case 'Droite':
        return 'text-blue-400 bg-blue-900/30';
      case 'Gauche':
        return 'text-blue-400 bg-blue-900/30';
      case 'Marche':
        return 'text-purple-400 bg-purple-900/30';
      case 'Pointeaux':
        return 'text-red-400 bg-red-900/30';
      case 'Porte':
        return 'text-indigo-400 bg-indigo-900/30';
      case 'Étage':
        return 'text-pink-400 bg-pink-900/30';
      case 'Position':
        return 'text-amber-400 bg-amber-900/30';
      default:
        return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStepInstructions = (step: any) => {
    const instructions = [];
    
    if (step.action === 'Marche' || step.action === 'Tout droit' || step.action === 'Reculer' || 
        step.action === 'Droite' || step.action === 'Gauche') {
      instructions.push(`Effectuer ${step.steps} pas`);
      if (step.direction) {
        instructions.push(`Direction: ${step.direction}`);
      }
    }
    
    if (step.action === 'Pointeaux') {
      instructions.push('Pointer les pointeaux de sécurité');
    }
    
    if (step.action === 'Porte') {
      instructions.push('Vérifier la porte');
    }
    
    if (step.action === 'Étage') {
      instructions.push('Changer d\'étage');
    }
    
    if (step.action === 'Position') {
      instructions.push('Enregistrer la position');
    }
    
    return instructions;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-white flex items-center">
              <RotateCcw className="h-5 w-5 mr-2" />
              Relecture de Ronde
            </h2>
          </div>
          
          <div className="text-sm text-gray-400">
            {round.name}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">
            Étape {currentStepIndex + 1} sur {totalSteps}
          </span>
          <span className="text-sm text-gray-400">
            {Math.round(progress)}% complété
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Step Display */}
      {currentStep && (
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className={`rounded-lg p-4 ${getActionColor(currentStep.action)}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getActionIcon(currentStep.action)}
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {currentStep.action}
                  </h3>
                  {currentStep.direction && (
                    <p className="text-sm text-gray-300">
                      Direction: {currentStep.direction}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {new Date(currentStep.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-xs text-gray-500">
                  Étape #{currentStep.steps}
                </div>
              </div>
            </div>

            {/* Instructions */}
            {showInstructions && (
              <div className="mt-3 pt-3 border-t border-gray-600">
                <h4 className="text-sm font-semibold text-white mb-2">Instructions :</h4>
                <ul className="space-y-1">
                  {getStepInstructions(currentStep).map((instruction, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                      {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={previousStep}
            disabled={currentStepIndex === 0}
            className="p-3 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            title="Étape précédente"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={togglePlay}
            className={`p-4 rounded-full transition-colors ${
              isPlaying 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : isCompleted
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title={isPlaying ? 'Pause' : isCompleted ? 'Recommencer' : 'Lecture'}
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : isCompleted ? (
              <RotateCcw className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          
          <button
            onClick={nextStep}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-3 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            title="Étape suivante"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={markStepCompleted}
            disabled={completedSteps.has(currentStepIndex)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              completedSteps.has(currentStepIndex)
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {completedSteps.has(currentStepIndex) ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2 inline" />
                Étape terminée
              </>
            ) : (
              'Marquer comme terminé'
            )}
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
            <Navigation className="h-4 w-4 mr-2" />
            Toutes les étapes ({totalSteps})
          </h3>
          
          {round.steps.map((step, index) => {
            const isCurrentStep = index === currentStepIndex;
            const isCompleted = completedSteps.has(index);
            const isWalkAction = step.action === 'Marche' || step.action === 'Tout droit' || 
                               step.action === 'Reculer' || step.action === 'Droite' || step.action === 'Gauche';
            
            return (
              <div
                key={step.id}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isCurrentStep
                    ? 'bg-blue-900/30 border-blue-500'
                    : isCompleted
                    ? 'bg-green-900/30 border-green-500'
                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                }`}
                onClick={() => setCurrentStepIndex(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrentStep
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getActionIcon(step.action)}
                      <span className={`font-medium ${
                        isCurrentStep ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-white'
                      }`}>
                        {step.action}
                      </span>
                      {step.direction && (
                        <span className="text-gray-400">- {step.direction}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isWalkAction && step.steps > 0 && (
                      <span className="text-yellow-400 font-bold text-sm">
                        {step.steps} pas
                      </span>
                    )}
                    {isCompleted && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
