// Système de stockage hybride : Supabase + localStorage fallback
import { Site } from '../types';
import { supabase } from './supabase';

const SITES_KEY = 'carnet_securite_sites';
const ROUNDS_KEY = 'carnet_securite_rounds';

// Fonction pour obtenir l'ID utilisateur actuel
const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Auth error:', error);
      return null;
    }
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Fonctions pour les sites
export const loadSites = async (): Promise<Site[]> => {
  try {
    // Essayer Supabase d'abord
    const userId = await getCurrentUserId();
    if (userId) {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading sites from Supabase:', error);
        // Fallback vers localStorage
        return loadSitesFromLocal();
      }

      return data || [];
    } else {
      // Pas d'utilisateur connecté, utiliser localStorage
      return loadSitesFromLocal();
    }
  } catch (error) {
    console.error('Error loading sites:', error);
    return loadSitesFromLocal();
  }
};

const loadSitesFromLocal = (): Site[] => {
  try {
    const data = localStorage.getItem(SITES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading sites from localStorage:', error);
    return [];
  }
};

export const saveSites = async (sites: Site[]): Promise<void> => {
  try {
    // Essayer Supabase d'abord
    const userId = await getCurrentUserId();
    if (userId) {
      // Supprimer tous les sites existants de l'utilisateur
      const { error: deleteError } = await supabase
        .from('sites')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing sites:', deleteError);
        // Fallback vers localStorage
        saveSitesToLocal(sites);
        return;
      }

      // Insérer les nouveaux sites avec l'ID utilisateur
      if (sites.length > 0) {
        const sitesWithUserId = sites.map(site => ({
          ...site,
          user_id: userId
        }));

        const { error: insertError } = await supabase
          .from('sites')
          .insert(sitesWithUserId);

        if (insertError) {
          console.error('Error inserting sites:', insertError);
          // Fallback vers localStorage
          saveSitesToLocal(sites);
        } else {
          console.log('✅ Sites sauvegardés dans Supabase');
        }
      }
    } else {
      // Pas d'utilisateur connecté, utiliser localStorage
      saveSitesToLocal(sites);
    }
  } catch (error) {
    console.error('Error saving sites:', error);
    saveSitesToLocal(sites);
  }
};

const saveSitesToLocal = (sites: Site[]): void => {
  try {
    localStorage.setItem(SITES_KEY, JSON.stringify(sites));
    console.log('✅ Sites sauvegardés dans localStorage');
  } catch (error) {
    console.error('Error saving sites to localStorage:', error);
  }
};

export const saveSite = async (site: Site): Promise<void> => {
  try {
    const sites = await loadSites();
    const existingIndex = sites.findIndex(s => s.id === site.id);
    
    if (existingIndex >= 0) {
      sites[existingIndex] = site;
    } else {
      sites.push(site);
    }
    
    await saveSites(sites);
  } catch (error) {
    console.error('Error saving site:', error);
  }
};

export const deleteSite = async (siteId: string): Promise<void> => {
  try {
    const sites = await loadSites();
    const filteredSites = sites.filter(site => site.id !== siteId);
    await saveSites(filteredSites);
  } catch (error) {
    console.error('Error deleting site:', error);
  }
};

// Fonctions pour les rondes
export interface RoundStep {
  id: string;
  timestamp: number;
  action: string;
  direction?: string;
  steps: number;
  location?: string;
  notes?: string;
}

export interface RoundData {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  steps: RoundStep[];
  totalSteps: number;
  duration?: number;
  userId?: string;
}

export const loadRounds = async (): Promise<{ rounds: RoundData[]; error?: string }> => {
  try {
    // Essayer Supabase d'abord
    const userId = await getCurrentUserId();
    if (userId) {
      const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select(`
          *,
          round_steps (*)
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false });

      if (roundsError) {
        console.error('Error loading rounds from Supabase:', roundsError);
        // Fallback vers localStorage
        return loadRoundsFromLocal();
      }

      // Transformer les données
      const transformedRounds: RoundData[] = rounds.map(round => ({
        id: round.id,
        name: round.name,
        startTime: new Date(round.start_time).getTime(),
        endTime: round.end_time ? new Date(round.end_time).getTime() : undefined,
        totalSteps: round.total_steps,
        duration: round.duration_ms,
        userId: round.user_id,
        steps: round.round_steps
          .sort((a: any, b: any) => a.step_number - b.step_number)
          .map((step: any) => ({
            id: step.id,
            timestamp: new Date(step.timestamp).getTime(),
            action: step.action,
            direction: step.direction,
            steps: step.steps_count,
            location: step.location,
            notes: step.notes
          }))
      }));

      return { rounds: transformedRounds };
    } else {
      // Pas d'utilisateur connecté, utiliser localStorage
      return loadRoundsFromLocal();
    }
  } catch (error) {
    console.error('Error loading rounds:', error);
    return loadRoundsFromLocal();
  }
};

const loadRoundsFromLocal = (): { rounds: RoundData[]; error?: string } => {
  try {
    const data = localStorage.getItem(ROUNDS_KEY);
    if (data) {
      const rounds = JSON.parse(data);
      return { rounds };
    }
    return { rounds: [] };
  } catch (error) {
    console.error('Error loading rounds from localStorage:', error);
    return { rounds: [], error: 'Erreur lors du chargement des rondes' };
  }
};

export const saveRound = async (roundData: RoundData): Promise<{ success: boolean; error?: string }> => {
  try {
    // Essayer Supabase d'abord
    const userId = await getCurrentUserId();
    if (userId) {
      // Insérer la ronde
      const { data: round, error: roundError } = await supabase
        .from('rounds')
        .insert({
          id: roundData.id,
          user_id: userId,
          name: roundData.name,
          start_time: new Date(roundData.startTime).toISOString(),
          end_time: roundData.endTime ? new Date(roundData.endTime).toISOString() : null,
          total_steps: roundData.totalSteps,
          duration_ms: roundData.duration
        })
        .select()
        .single();

      if (roundError) {
        console.error('Error saving round to Supabase:', roundError);
        // Fallback vers localStorage
        return saveRoundToLocal(roundData);
      }

      // Insérer les étapes de la ronde
      if (roundData.steps.length > 0) {
        const stepsData = roundData.steps.map((step, index) => ({
          round_id: round.id,
          step_number: index + 1,
          action: step.action,
          direction: step.direction || null,
          steps_count: step.steps,
          location: step.location || null,
          notes: step.notes || null,
          timestamp: new Date(step.timestamp).toISOString()
        }));

        const { error: stepsError } = await supabase
          .from('round_steps')
          .insert(stepsData);

        if (stepsError) {
          console.error('Error saving round steps to Supabase:', stepsError);
          // Fallback vers localStorage
          return saveRoundToLocal(roundData);
        }
      }

      console.log('✅ Ronde sauvegardée dans Supabase');
      return { success: true };
    } else {
      // Pas d'utilisateur connecté, utiliser localStorage
      return saveRoundToLocal(roundData);
    }
  } catch (error) {
    console.error('Error saving round:', error);
    return saveRoundToLocal(roundData);
  }
};

const saveRoundToLocal = (roundData: RoundData): { success: boolean; error?: string } => {
  try {
    const { rounds } = loadRoundsFromLocal();
    const existingIndex = rounds.findIndex(r => r.id === roundData.id);
    
    if (existingIndex >= 0) {
      rounds[existingIndex] = roundData;
    } else {
      rounds.push(roundData);
    }
    
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds));
    console.log('✅ Ronde sauvegardée dans localStorage');
    return { success: true };
  } catch (error) {
    console.error('Error saving round to localStorage:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
};

export const deleteRound = async (roundId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const userId = await getCurrentUserId();
    if (userId) {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', roundId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting round from Supabase:', error);
        // Fallback vers localStorage
        return deleteRoundFromLocal(roundId);
      }

      return { success: true };
    } else {
      return deleteRoundFromLocal(roundId);
    }
  } catch (error) {
    console.error('Error deleting round:', error);
    return deleteRoundFromLocal(roundId);
  }
};

const deleteRoundFromLocal = (roundId: string): { success: boolean; error?: string } => {
  try {
    const { rounds } = loadRoundsFromLocal();
    const filteredRounds = rounds.filter(round => round.id !== roundId);
    localStorage.setItem(ROUNDS_KEY, JSON.stringify(filteredRounds));
    return { success: true };
  } catch (error) {
    console.error('Error deleting round from localStorage:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
};

export const updateRound = async (roundData: RoundData): Promise<{ success: boolean; error?: string }> => {
  return await saveRound(roundData);
};
