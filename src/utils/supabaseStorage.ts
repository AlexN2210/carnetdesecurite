import { Site } from '../types';
import { supabase } from './supabase';

const SITES_TABLE = 'sites';
const MASTER_PASSWORD_TABLE = 'master_passwords';

export const loadSites = async (): Promise<Site[]> => {
  try {
    const { data, error } = await supabase
      .from(SITES_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading sites from Supabase:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error loading sites:', error);
    return [];
  }
};

export const saveSites = async (sites: Site[]): Promise<void> => {
  try {
    // Supprimer tous les sites existants
    const { error: deleteError } = await supabase
      .from(SITES_TABLE)
      .delete()
      .neq('id', ''); // Supprime tous les enregistrements

    if (deleteError) {
      console.error('Error deleting existing sites:', deleteError);
      return;
    }

    // Insérer les nouveaux sites
    if (sites.length > 0) {
      const { error: insertError } = await supabase
        .from(SITES_TABLE)
        .insert(sites);

      if (insertError) {
        console.error('Error inserting sites:', insertError);
      }
    }
  } catch (error) {
    console.error('Error saving sites:', error);
  }
};

export const saveSite = async (site: Site): Promise<void> => {
  try {
    const { error } = await supabase
      .from(SITES_TABLE)
      .upsert(site);

    if (error) {
      console.error('Error saving site:', error);
    }
  } catch (error) {
    console.error('Error saving site:', error);
  }
};

export const deleteSite = async (siteId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from(SITES_TABLE)
      .delete()
      .eq('id', siteId);

    if (error) {
      console.error('Error deleting site:', error);
    }
  } catch (error) {
    console.error('Error deleting site:', error);
  }
};

export const setMasterPassword = async (password: string): Promise<void> => {
  try {
    const hashed = btoa(password); // Simple encoding for demo purposes
    const { error } = await supabase
      .from(MASTER_PASSWORD_TABLE)
      .upsert({ id: 'master', password: hashed });

    if (error) {
      console.error('Error setting master password:', error);
    }
  } catch (error) {
    console.error('Error setting master password:', error);
  }
};

export const checkMasterPassword = async (password: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(MASTER_PASSWORD_TABLE)
      .select('password')
      .eq('id', 'master')
      .single();

    if (error) {
      console.error('Error checking master password:', error);
      return false;
    }

    return data?.password === btoa(password);
  } catch (error) {
    console.error('Error checking master password:', error);
    return false;
  }
};

export const hasMasterPassword = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from(MASTER_PASSWORD_TABLE)
      .select('id')
      .eq('id', 'master')
      .single();

    if (error) {
      console.error('Error checking if master password exists:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking if master password exists:', error);
    return false;
  }
};
