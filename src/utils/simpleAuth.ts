// Système d'authentification simplifié pour les tests
import { supabase } from './supabase';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_USER_EMAIL = 'test@example.com';

export interface SimpleUser {
  id: string;
  email: string;
}

// Utilisateur par défaut pour les tests
let currentUser: SimpleUser | null = {
  id: DEFAULT_USER_ID,
  email: DEFAULT_USER_EMAIL
};

// Fonction pour simuler une session Supabase
const createMockSession = (user: SimpleUser) => {
  return {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: user.id,
      email: user.email,
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };
};

export const signIn = async (email: string, password: string) => {
  // Pour les tests, on accepte n'importe quel email/mot de passe
  currentUser = {
    id: DEFAULT_USER_ID,
    email: email || DEFAULT_USER_EMAIL
  };
  
  // Simuler une session Supabase
  if (currentUser) {
    const session = createMockSession(currentUser);
    await supabase.auth.setSession(session);
  }
  
  console.log('✅ Connexion simplifiée réussie:', currentUser.email);
  return { data: { user: currentUser }, error: null };
};

export const signUp = async (email: string, password: string) => {
  // Pour les tests, on accepte n'importe quel email/mot de passe
  currentUser = {
    id: DEFAULT_USER_ID,
    email: email || DEFAULT_USER_EMAIL
  };
  
  // Simuler une session Supabase
  if (currentUser) {
    const session = createMockSession(currentUser);
    await supabase.auth.setSession(session);
  }
  
  console.log('✅ Inscription simplifiée réussie:', currentUser.email);
  return { data: { user: currentUser }, error: null };
};

export const signOut = async () => {
  currentUser = null;
  await supabase.auth.signOut();
  console.log('✅ Déconnexion simplifiée');
  return { error: null };
};

export const getCurrentUser = async () => {
  return { user: currentUser, error: null };
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  // Initialiser l'utilisateur au démarrage
  if (!currentUser) {
    currentUser = {
      id: DEFAULT_USER_ID,
      email: DEFAULT_USER_EMAIL
    };
    // Simuler une session Supabase
    const session = createMockSession(currentUser);
    supabase.auth.setSession(session);
  }
  
  // Simuler un changement d'état d'authentification
  callback(currentUser);
  
  return {
    data: {
      subscription: {
        unsubscribe: () => {}
      }
    }
  };
};
