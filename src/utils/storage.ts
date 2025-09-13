import { Site } from '../types';

const STORAGE_KEY = 'carnet-securite-sites';
const MASTER_PASSWORD_KEY = 'carnet-securite-master-password';

export const loadSites = (): Site[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading sites:', error);
    return [];
  }
};

export const saveSites = (sites: Site[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  } catch (error) {
    console.error('Error saving sites:', error);
  }
};

export const setMasterPassword = (password: string): void => {
  const hashed = btoa(password); // Simple encoding for demo purposes
  localStorage.setItem(MASTER_PASSWORD_KEY, hashed);
};

export const checkMasterPassword = (password: string): boolean => {
  const stored = localStorage.getItem(MASTER_PASSWORD_KEY);
  if (!stored) return false;
  return stored === btoa(password);
};

export const hasMasterPassword = (): boolean => {
  return !!localStorage.getItem(MASTER_PASSWORD_KEY);
};