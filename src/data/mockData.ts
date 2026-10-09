import type { Activity } from '../models/activity';
import type { FlexibleGymSession, PlanningProject, WeeklyPlanningSummary } from '../models/planning';

// Empty initial state: Enka no longer preloads example data.
export const MOCK_ACTIVITIES: Activity[] = [];
export const INITIAL_GYM_SESSIONS: FlexibleGymSession[] = [];
export const INITIAL_PROJECTS: PlanningProject[] = [];
export const INITIAL_WEEKLY_SUMMARY: WeeklyPlanningSummary = {
  weekNumber: 0,
  weekStart: '',
  weekEnd: '',
  totalAvailableFreeHours: 0,
  gymSessionsTarget: 0,
  gymSessionsPlanned: 0,
  gymSessionsCompleted: 0
};
