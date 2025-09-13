import { Site } from '../types';
import { supabase } from './supabase';

const SITES_TABLE = 'sites';
const MASTER_PASSWORD_TABLE = 'master_passwords';

// Fonction pour obtenir l'ID utilisateur actuel
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

export const loadSites = async (): Promise<Site[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No user authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from(SITES_TABLE)
      .select('*')
      .eq('user_id', userId)
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
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No user authenticated');
      return;
    }

    // Supprimer tous les sites existants de l'utilisateur
    const { error: deleteError } = await supabase
      .from(SITES_TABLE)
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing sites:', deleteError);
      return;
    }

    // Insérer les nouveaux sites avec l'ID utilisateur
    if (sites.length > 0) {
      const sitesWithUserId = sites.map(site => ({
        ...site,
        user_id: userId
      }));

      const { error: insertError } = await supabase
        .from(SITES_TABLE)
        .insert(sitesWithUserId);

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
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No user authenticated');
      return;
    }

    const siteWithUserId = {
      ...site,
      user_id: userId
    };

    const { error } = await supabase
      .from(SITES_TABLE)
      .upsert(siteWithUserId);

    if (error) {
      console.error('Error saving site:', error);
    }
  } catch (error) {
    console.error('Error saving site:', error);
  }
};

export const deleteSite = async (siteId: string): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No user authenticated');
      return;
    }

    const { error } = await supabase
      .from(SITES_TABLE)
      .delete()
      .eq('id', siteId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting site:', error);
    }
  } catch (error) {
    console.error('Error deleting site:', error);
  }
};
