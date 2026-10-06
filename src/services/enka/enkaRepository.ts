import { getSupabase } from '../supabase/supabaseClient';
import type {
  DbCategory,
  DbLocation,
  DbProject,
  DbPlanningGoal,
  DbRecurrenceRule,
  DbRecurrenceSlot,
  DbActivity,
  DbRouteEstimate,
  DbTransition,
  DbOccurrenceException,
  DbActivityRelation,
} from './types';

export interface RepositoryQueryResult<T> {
  data: T[] | null;
  error: Error | null;
}

export const enkaRepository = {
  async fetchCategories(): Promise<RepositoryQueryResult<DbCategory>> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('enka_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbCategory[]) || [], error: null };
  },

  async fetchLocations(): Promise<RepositoryQueryResult<DbLocation>> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('enka_locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbLocation[]) || [], error: null };
  },

  async fetchProjects(): Promise<RepositoryQueryResult<DbProject>> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('enka_projects')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbProject[]) || [], error: null };
  },

  async fetchPlanningGoals(): Promise<RepositoryQueryResult<DbPlanningGoal>> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('enka_planning_goals')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbPlanningGoal[]) || [], error: null };
  },

  async fetchRecurrenceRules(): Promise<RepositoryQueryResult<DbRecurrenceRule>> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('enka_recurrence_rules')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbRecurrenceRule[]) || [], error: null };
  },

  async fetchRecurrenceSlots(ruleId?: string): Promise<RepositoryQueryResult<DbRecurrenceSlot>> {
    const supabase = getSupabase();
    let query = supabase
      .from('enka_recurrence_slots')
      .select('*')
      .order('weekday', { ascending: true });

    if (ruleId) {
      query = query.eq('recurrence_rule_id', ruleId);
    }

    const { data, error } = await query;
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbRecurrenceSlot[]) || [], error: null };
  },

  async fetchActivities(filter?: {
    startDate?: string;
    endDate?: string;
  }): Promise<RepositoryQueryResult<DbActivity>> {
    const supabase = getSupabase();
    let query = supabase
      .from('enka_activities')
      .select('*')
      .order('start_date', { ascending: true });

    if (filter?.startDate) {
      query = query.gte('start_date', filter.startDate);
    }
    if (filter?.endDate) {
      query = query.lte('start_date', filter.endDate);
    }

    const { data, error } = await query;
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbActivity[]) || [], error: null };
  },

  async fetchRouteEstimates(): Promise<RepositoryQueryResult<DbRouteEstimate>> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('enka_route_estimates')
      .select('*');

    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbRouteEstimate[]) || [], error: null };
  },

  async fetchTransitions(activityId?: string): Promise<RepositoryQueryResult<DbTransition>> {
    const supabase = getSupabase();
    let query = supabase.from('enka_transitions').select('*');

    if (activityId) {
      query = query.or(`from_activity_id.eq.${activityId},to_activity_id.eq.${activityId}`);
    }

    const { data, error } = await query;
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbTransition[]) || [], error: null };
  },

  async fetchOccurrenceExceptions(ruleId?: string): Promise<RepositoryQueryResult<DbOccurrenceException>> {
    const supabase = getSupabase();
    let query = supabase
      .from('enka_occurrence_exceptions')
      .select('*')
      .order('original_date', { ascending: true });

    if (ruleId) {
      query = query.eq('recurrence_rule_id', ruleId);
    }

    const { data, error } = await query;
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbOccurrenceException[]) || [], error: null };
  },

  async fetchActivityRelations(activityId?: string): Promise<RepositoryQueryResult<DbActivityRelation>> {
    const supabase = getSupabase();
    let query = supabase.from('enka_activity_relations').select('*');

    if (activityId) {
      query = query.or(`source_activity_id.eq.${activityId},target_activity_id.eq.${activityId}`);
    }

    const { data, error } = await query;
    if (error) {
      return { data: null, error: new Error(error.message) };
    }
    return { data: (data as DbActivityRelation[]) || [], error: null };
  },

  /**
   * Diagnostic function to test Read access to all 11 ENKA tables under RLS
   */
  async verifyAllTablesAccess(): Promise<Record<string, { count: number; error: string | null }>> {
    const tables = [
      'enka_categories',
      'enka_locations',
      'enka_projects',
      'enka_planning_goals',
      'enka_recurrence_rules',
      'enka_recurrence_slots',
      'enka_activities',
      'enka_route_estimates',
      'enka_transitions',
      'enka_occurrence_exceptions',
      'enka_activity_relations',
    ] as const;

    const supabase = getSupabase();
    const results: Record<string, { count: number; error: string | null }> = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('id', { count: 'exact' }).limit(1);
        if (error) {
          results[table] = { count: 0, error: error.message };
        } else {
          results[table] = { count: data ? data.length : 0, error: null };
        }
      } catch (err: any) {
        results[table] = { count: 0, error: err?.message || 'Error desconocido' };
      }
    }

    return results;
  },
};
