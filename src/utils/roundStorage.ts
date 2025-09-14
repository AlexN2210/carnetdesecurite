import { supabase } from './supabase';

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

// Sauvegarder une ronde complète
export const saveRound = async (roundData: RoundData): Promise<{ success: boolean; error?: string }> => {
  try {
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    // Insérer la ronde
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert({
        id: roundData.id,
        user_id: user.id,
        name: roundData.name,
        start_time: new Date(roundData.startTime).toISOString(),
        end_time: roundData.endTime ? new Date(roundData.endTime).toISOString() : null,
        total_steps: roundData.totalSteps,
        duration_ms: roundData.duration
      })
      .select()
      .single();

    if (roundError) {
      console.error('Erreur lors de la sauvegarde de la ronde:', roundError);
      return { success: false, error: roundError.message };
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
        console.error('Erreur lors de la sauvegarde des étapes:', stepsError);
        return { success: false, error: stepsError.message };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return { success: false, error: 'Erreur lors de la sauvegarde' };
  }
};

// Charger toutes les rondes de l'utilisateur
export const loadRounds = async (): Promise<{ rounds: RoundData[]; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { rounds: [], error: 'Utilisateur non connecté' };
    }

    // Charger les rondes avec leurs étapes
    const { data: rounds, error: roundsError } = await supabase
      .from('rounds')
      .select(`
        *,
        round_steps (*)
      `)
      .eq('user_id', user.id)
      .order('start_time', { ascending: false });

    if (roundsError) {
      console.error('Erreur lors du chargement des rondes:', roundsError);
      return { rounds: [], error: roundsError.message };
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
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    return { rounds: [], error: 'Erreur lors du chargement' };
  }
};

// Supprimer une ronde
export const deleteRound = async (roundId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    const { error } = await supabase
      .from('rounds')
      .delete()
      .eq('id', roundId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return { success: false, error: 'Erreur lors de la suppression' };
  }
};

// Mettre à jour une ronde
export const updateRound = async (roundData: RoundData): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    // Mettre à jour la ronde
    const { error: roundError } = await supabase
      .from('rounds')
      .update({
        name: roundData.name,
        end_time: roundData.endTime ? new Date(roundData.endTime).toISOString() : null,
        total_steps: roundData.totalSteps,
        duration_ms: roundData.duration,
        updated_at: new Date().toISOString()
      })
      .eq('id', roundData.id)
      .eq('user_id', user.id);

    if (roundError) {
      console.error('Erreur lors de la mise à jour:', roundError);
      return { success: false, error: roundError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    return { success: false, error: 'Erreur lors de la mise à jour' };
  }
};
