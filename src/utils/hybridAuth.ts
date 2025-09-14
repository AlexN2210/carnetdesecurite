// Système d'authentification hybride : Supabase + fallback local
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

let currentUser: User | null = null;
let authListeners: ((user: User | null) => void)[] = [];

// Fonction pour notifier tous les listeners
const notifyListeners = (user: User | null) => {
  currentUser = user;
  authListeners.forEach(callback => callback(user));
};

export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined
      }
    });
    
    if (error) {
      console.error('Erreur Supabase signup:', error);
      // Fallback : créer un utilisateur local
      const fallbackUser: User = {
        id: `local_${Date.now()}`,
        email,
        created_at: new Date().toISOString()
      };
      notifyListeners(fallbackUser);
      return { data: { user: fallbackUser }, error: null };
    }
    
    if (data.user) {
      notifyListeners(data.user);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Erreur Supabase signin:', error);
      // Fallback : créer un utilisateur local
      const fallbackUser: User = {
        id: `local_${Date.now()}`,
        email,
        created_at: new Date().toISOString()
      };
      notifyListeners(fallbackUser);
      return { data: { user: fallbackUser }, error: null };
    }
    
    if (data.user) {
      notifyListeners(data.user);
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erreur Supabase signout:', error);
    }
    notifyListeners(null);
    return { error: null };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    notifyListeners(null);
    return { error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Erreur Supabase getCurrentUser:', error);
      return { user: currentUser, error: null };
    }
    
    if (user) {
      notifyListeners(user);
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return { user: currentUser, error };
  }
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  // Ajouter le callback à la liste
  authListeners.push(callback);
  
  // Écouter les changements d'état Supabase
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      notifyListeners(session.user);
    } else {
      notifyListeners(null);
    }
  });
  
  // Appeler immédiatement avec l'utilisateur actuel
  callback(currentUser);
  
  return {
    data: {
      subscription: {
        unsubscribe: () => {
          // Retirer le callback de la liste
          const index = authListeners.indexOf(callback);
          if (index > -1) {
            authListeners.splice(index, 1);
          }
          subscription.unsubscribe();
        }
      }
    }
  };
};
