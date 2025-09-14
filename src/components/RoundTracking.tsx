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
  const [timerEnabled, setTimerEnabled] = useState(false);
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
  
  // 🚶‍♂️ NOUVEAUX PARAMÈTRES POUR LE CALCUL DE DISTANCE
  const [userHeight, setUserHeight] = useState(175); // Taille en cm
  const [walkingSpeed, setWalkingSpeed] = useState(5.0); // Vitesse en km/h
  const [currentDistance, setCurrentDistance] = useState(0); // Distance parcourue en mètres
  const [walkingStartTime, setWalkingStartTime] = useState<number | null>(null);
  
  const stepCountRef = useRef(0);
  const roundStartTime = useRef<number>(0);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Charger les rondes et sites au montage du composant
  useEffect(() => {
    loadRoundsFromDatabase();
    loadSitesData();
    recoverTemporaryRounds();
  }, []);

  // Sauvegarde automatique avant fermeture de l'application
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isRecording && roundData) {
        console.log('🚨 Fermeture de l\'application détectée - Sauvegarde d\'urgence...');
        
        // Sauvegarder dans localStorage comme sauvegarde d'urgence
        localStorage.setItem(`temp_round_${roundData.id}`, JSON.stringify(roundData));
        console.log('💾 Sauvegarde d\'urgence effectuée dans localStorage');
        
        // Essayer de sauvegarder en base si possible (synchronement)
        try {
          saveRound(roundData).then(result => {
            if (result.success) {
              console.log('✅ Sauvegarde d\'urgence en base réussie');
            } else {
              console.error('❌ Échec sauvegarde d\'urgence en base:', result.error);
            }
          });
        } catch (error) {
          console.error('❌ Erreur sauvegarde d\'urgence:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording, roundData]);


  // Fonction pour récupérer les rondes temporaires sauvegardées
  const recoverTemporaryRounds = () => {
    try {
      console.log('🔍 Recherche de rondes temporaires...');
      const tempRounds = [];
      
      // Parcourir toutes les clés du localStorage pour trouver les rondes temporaires
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('temp_round_')) {
          const roundData = JSON.parse(localStorage.getItem(key) || '{}');
          if (roundData && roundData.id && roundData.steps) {
            tempRounds.push({ key, roundData });
            console.log(`📦 Ronde temporaire trouvée: ${roundData.name} (${roundData.steps.length} étapes)`);
          }
        }
      }
      
      if (tempRounds.length > 0) {
        console.log(`🔄 Récupération de ${tempRounds.length} ronde(s) temporaire(s)...`);
        
        // Demander à l'utilisateur s'il veut récupérer les rondes temporaires
        const shouldRecover = window.confirm(
          `Des rondes en cours ont été détectées (${tempRounds.length} ronde(s)). Voulez-vous les récupérer ?`
        );
        
        if (shouldRecover) {
          // Récupérer la première ronde temporaire (la plus récente)
          const mostRecentTemp = tempRounds.sort((a, b) => 
            b.roundData.startTime - a.roundData.startTime
          )[0];
          
          console.log(`✅ Récupération de la ronde: ${mostRecentTemp.roundData.name}`);
          
          // Restaurer la ronde
          setRoundData(mostRecentTemp.roundData);
          setIsRecording(true);
          setCurrentStepIndex(mostRecentTemp.roundData.steps.length - 1);
          setCurrentStep(mostRecentTemp.roundData.steps.length - 1);
          
          // Supprimer la clé temporaire
          localStorage.removeItem(mostRecentTemp.key);
          
          // Supprimer les autres rondes temporaires
          tempRounds.forEach(temp => {
            if (temp.key !== mostRecentTemp.key) {
              localStorage.removeItem(temp.key);
            }
          });
          
          console.log('✅ Ronde récupérée avec succès');
        } else {
          // Supprimer toutes les rondes temporaires si l'utilisateur refuse
          tempRounds.forEach(temp => {
            localStorage.removeItem(temp.key);
          });
          console.log('🗑️ Rondes temporaires supprimées');
        }
      } else {
        console.log('ℹ️ Aucune ronde temporaire trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des rondes temporaires:', error);
    }
  };

  const loadSitesData = async () => {
    try {
      const sitesData = await loadSites();
      setSites(sitesData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    }
  };

  // 🚶‍♂️ SYSTÈME DE TIMER POUR CALCULER LA DISTANCE
  useEffect(() => {
    if (isRecording && timerEnabled) {
      roundStartTime.current = Date.now();
      startDistanceTimer();
    } else {
      stopDistanceTimer();
    }
    
    return () => {
      stopDistanceTimer();
    };
  }, [isRecording, timerEnabled]);

  // Sauvegarde automatique périodique des rondes en cours
  useEffect(() => {
    let autoSaveInterval: NodeJS.Timeout;
    
    if (isRecording && roundData) {
      // Sauvegarder automatiquement toutes les 30 secondes
      autoSaveInterval = setInterval(async () => {
        try {
          console.log('⏰ Sauvegarde automatique périodique...');
          const { success, error } = await saveRound(roundData);
          if (success) {
            console.log('✅ Sauvegarde automatique périodique réussie');
          } else {
            console.error('❌ Erreur sauvegarde automatique périodique:', error);
            // Sauvegarde de secours locale
            localStorage.setItem(`temp_round_${roundData.id}`, JSON.stringify(roundData));
          }
        } catch (error) {
          console.error('❌ Erreur sauvegarde automatique périodique:', error);
          // Sauvegarde de secours locale
          localStorage.setItem(`temp_round_${roundData.id}`, JSON.stringify(roundData));
        }
      }, 30000); // 30 secondes
    }
    
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [isRecording, roundData]);

  // 🚶‍♂️ FONCTIONS POUR LE SYSTÈME DE TIMER ET CALCUL DE DISTANCE
  
  const calculateStepLength = (height: number): number => {
    // Formule basée sur la taille : longueur de pas = 0.415 × taille en mètres
    const heightInMeters = height / 100;
    return 0.415 * heightInMeters;
  };

  const startDistanceTimer = () => {
    console.log('🚶‍♂️ Démarrage du timer de distance...');
    setWalkingStartTime(Date.now());
    setCurrentDistance(0);
    
    // Timer qui met à jour la distance toutes les secondes
    timerInterval.current = setInterval(() => {
      if (walkingStartTime) {
        const elapsedSeconds = (Date.now() - walkingStartTime) / 1000;
        const speedInMs = (walkingSpeed * 1000) / 3600; // Convertir km/h en m/s
        const distance = speedInMs * elapsedSeconds;
        setCurrentDistance(distance);
        
        // Calculer le nombre de pas basé sur la distance
        const stepLength = calculateStepLength(userHeight);
        const steps = Math.floor(distance / stepLength);
        setActualSteps(steps);
        
        console.log(`🚶‍♂️ Distance: ${distance.toFixed(1)}m, Pas: ${steps}, Vitesse: ${walkingSpeed}km/h`);
      }
    }, 1000); // Mise à jour toutes les secondes
  };

  const stopDistanceTimer = () => {
    console.log('⏹️ Arrêt du timer de distance');
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    setWalkingStartTime(null);
  };

  const resetDistance = () => {
    console.log('🔄 Reset de la distance');
    setCurrentDistance(0);
    setActualSteps(0);
    if (walkingStartTime) {
      setWalkingStartTime(Date.now());
    }
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

  const addStep = async (action: string, direction?: string, location?: string) => {
    console.log(`🚀🚀🚀 addStep appelée avec: action=${action}, direction=${direction}, isRecording=${isRecording}, roundData=`, roundData);
    console.log(`🚀🚀🚀 ÉTAT COMPLET: isRecording=${isRecording}, roundData=${!!roundData}, roundData.steps.length=${roundData?.steps.length || 0}`);
    
    if (!isRecording || !roundData) {
      console.log(`❌❌❌ addStep annulée: isRecording=${isRecording}, roundData=${!!roundData}`);
      return;
    }

    console.log(`🔄 Ajout d'étape: ${action} ${direction || ''} - Pas actuels: ${stepCountRef.current}`);

    // ✅ SOLUTION SIMPLIFIÉE : Traiter toutes les actions de la même manière
    const isManualAction = direction !== 'automatique';
    const isStepAction = action === 'Marche' || action === 'Tout droit' || action === 'Reculer' || 
                        action === 'Droite' || action === 'Gauche';

    // Incrémenter le compteur d'étapes pour TOUTES les actions
    stepCountRef.current += 1;
    setStepCount(stepCountRef.current);
    console.log(`📈 Compteur d'étapes incrémenté: ${stepCountRef.current}`);

    // ✅ SOLUTION SIMPLIFIÉE : Calcul des pas basé uniquement sur l'action
    let stepCount = 0;
    if (isStepAction) {
      stepCount = customExpectedSteps; // Nombre de pas personnalisé pour toutes les actions de marche
    }
    // Pour les autres actions (Pointeaux, Porte, Étage, etc.), stepCount reste à 0
    
    const newStep: RoundStep = {
      id: `step_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      action,
      direction,
      steps: stepCount,
      location,
      notes: ''
    };

    console.log(`📝 Nouvelle étape créée:`, newStep);

    const updatedSteps = [...roundData.steps, newStep];
    
    // Calculer le total des pas réels (seulement pour les actions de marche)
    const realStepCount = updatedSteps
      .filter(step => step.action === 'Marche' || step.action === 'Tout droit' || step.action === 'Reculer' || 
                     step.action === 'Droite' || step.action === 'Gauche')
      .reduce((total, step) => total + (step.steps || 0), 0);
    
    console.log(`📊 Nouvelle étape: ${action} - Pas: ${stepCount} - Total pas réels: ${realStepCount}`);
    console.log(`📊 Total étapes: ${updatedSteps.length} (toutes actions confondues)`);
    
    const updatedRoundData = {
      ...roundData,
      steps: updatedSteps,
      totalSteps: realStepCount
    };
    
    setRoundData(updatedRoundData);

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

    // 💾 SAUVEGARDE IMMÉDIATE - Sauvegarder automatiquement en temps réel
    try {
      console.log('💾 Sauvegarde automatique de la ronde en cours...');
      const { success, error } = await saveRound(updatedRoundData);
      if (success) {
        console.log('✅ Ronde sauvegardée automatiquement avec succès');
      } else {
        console.error('❌ Erreur lors de la sauvegarde automatique:', error);
        // En cas d'erreur, sauvegarder localement comme fallback
        localStorage.setItem(`temp_round_${roundData.id}`, JSON.stringify(updatedRoundData));
        console.log('💾 Sauvegarde de secours dans localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde automatique:', error);
      // En cas d'erreur, sauvegarder localement comme fallback
      localStorage.setItem(`temp_round_${roundData.id}`, JSON.stringify(updatedRoundData));
      console.log('💾 Sauvegarde de secours dans localStorage');
    }

    // Log détaillé pour le débogage
    console.log(`✅ Étape ajoutée: ${action} ${direction || ''} - Pas: ${stepCount} - Total étapes: ${updatedSteps.length} - Total pas: ${realStepCount}`);
    console.log('📋 Toutes les étapes actuelles:', updatedSteps.map((s, i) => `${i + 1}. ${s.action} (${s.steps} pas)`));
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
    setCurrentStep(0);
    setCurrentStepIndex(0);
    stepCountRef.current = 0;
    setStepCount(0);
    setActualSteps(0);
    setExpectedSteps(0);
    setIsStepValidated(false);
    setShowStepValidation(false);
    setCurrentDistance(0);
    setWalkingStartTime(null);
    
    console.log('✅ Ronde démarrée - isRecording=true, roundData initialisé');
  };

  const stopRound = async () => {
    if (roundData) {
      const completedRound = {
        ...roundData,
        endTime: Date.now(),
        duration: Date.now() - roundData.startTime,
        isCompleted: true
      };
      
      console.log('💾 Sauvegarde de la ronde:', {
        name: completedRound.name,
        totalSteps: completedRound.totalSteps,
        stepsCount: completedRound.steps.length,
        steps: completedRound.steps.map((s, i) => `${i + 1}. ${s.action} (${s.steps} pas)`)
      });
      
      // Sauvegarder en base de données
      setIsLoading(true);
      try {
        const { success, error } = await saveRound(completedRound);
        if (success) {
          console.log('✅ Ronde sauvegardée avec succès');
          // Recharger les rondes depuis la base
          await loadRoundsFromDatabase();
        } else {
          console.error('❌ Erreur lors de la sauvegarde:', error);
          // Sauvegarder localement en fallback
          setSavedRounds(prev => [...prev, completedRound]);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
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
    stopDistanceTimer();
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
            {isRecording && (
              <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
                REC
              </span>
            )}
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

      {/* Debug Info */}
      <div className="bg-gray-800 p-2 text-xs text-gray-400 flex-shrink-0">
        <div className="flex justify-between">
          <span>Recording: {isRecording ? 'OUI' : 'NON'}</span>
          <span>RoundData: {roundData ? 'OUI' : 'NON'}</span>
          <span>Steps: {roundData?.steps.length || 0}</span>
        </div>
        {isRecording && timerEnabled && (
          <div className="mt-1">
            <span>Timer: {timerEnabled ? '✅ ACTIF' : '❌ INACTIF'} | Distance: {currentDistance.toFixed(1)}m | Pas: {actualSteps}</span>
          </div>
        )}
        {isRecording && (
          <div className="mt-2">
            <button
              onClick={() => {
                console.log('🧪 TEST: Ajout d\'une action de test');
                addStep('TEST', 'test');
              }}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
            >
              🧪 Test Action
            </button>
          </div>
        )}
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
          
          {/* 🚶‍♂️ Paramètres de marche */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Taille (cm)
              </label>
              <input
                type="number"
                min="120"
                max="220"
                value={userHeight}
                onChange={(e) => setUserHeight(parseInt(e.target.value) || 175)}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                placeholder="175"
              />
              <div className="text-xs text-gray-400 mt-1">
                Longueur de pas: {calculateStepLength(userHeight).toFixed(2)}m
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Vitesse de marche (km/h)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={walkingSpeed}
                onChange={(e) => setWalkingSpeed(parseFloat(e.target.value) || 5.0)}
                className="w-full px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                placeholder="5.0"
              />
              <div className="text-xs text-gray-400 mt-1">
                {walkingSpeed} km/h = {(walkingSpeed * 1000 / 3600).toFixed(2)} m/s
              </div>
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
        
        {/* 🚶‍♂️ Contrôle du timer de distance - Version compacte */}
        {isRecording && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`flex items-center px-3 py-1 rounded transition-colors text-xs font-medium ${
                  timerEnabled 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                }`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {timerEnabled ? 'ON' : 'OFF'}
              </button>
              
              {/* Indicateur de statut */}
              <div className={`w-2 h-2 rounded-full ${
                timerEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`} title={timerEnabled ? 'Timer actif' : 'Timer inactif'} />
            </div>
            
            {/* Affichage de la distance et des pas - Version compacte */}
            {timerEnabled && (
              <div className="flex space-x-2">
                <div className="bg-gray-700 rounded px-2 py-1 text-center">
                  <div className="text-sm font-bold text-white">{currentDistance.toFixed(1)}m</div>
                  <div className="text-xs text-gray-400">Distance</div>
                </div>
                <div className="bg-gray-700 rounded px-2 py-1 text-center">
                  <div className="text-sm font-bold text-white">{actualSteps}</div>
                  <div className="text-xs text-gray-400">Pas</div>
                </div>
                <button
                  onClick={resetDistance}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                  title="Reset distance"
                >
                  🔄
                </button>
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
              onClick={() => {
                console.log(`🔘🔘🔘 BOUTON CLIQUÉ: ${button.action} ${button.direction || ''}`);
                console.log(`🔘🔘🔘 ÉTAT: isRecording=${isRecording}, roundData=${!!roundData}`);
                console.log(`🔘🔘🔘 roundData.steps.length=${roundData?.steps.length || 0}`);
                addStep(button.action, button.direction);
              }}
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
