// Système de stockage local en fallback
import { Site } from '../types';

const SITES_KEY = 'carnet_securite_sites';
const ROUNDS_KEY = 'carnet_securite_rounds';

export const loadSites = async (): Promise<Site[]> => {
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
    console.error('Error saving site to localStorage:', error);
  }
};

export const deleteSite = async (siteId: string): Promise<void> => {
  try {
    const sites = await loadSites();
    const filteredSites = sites.filter(site => site.id !== siteId);
    await saveSites(filteredSites);
  } catch (error) {
    console.error('Error deleting site from localStorage:', error);
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
    const { rounds } = await loadRounds();
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
    const { rounds } = await loadRounds();
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
