export type GymSplitType = 'Torso 1' | 'Pierna 1' | 'Torso 2' | 'Pierna 2';

export interface FlexibleGymSession {
  id: string;
  split: GymSplitType;
  sequenceNumber: number; // 1 to 4
  preferredDurationMinutes: number; // ~60, ~90, ~120 min
  completed: boolean;
  completedAt?: string;
  suggestedSlot?: {
    dayOfWeek: string;
    suggestedDate: string;
    timeRange: string;
    gapDurationMinutes: number;
  };
  notes?: string;
}

export interface ProjectSession {
  id: string;
  title: string;
  date: string;
  timeRange: string;
  durationMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface PlanningProject {
  id: string;
  title: string;
  category: string;
  targetDate: string; // e.g. "Junio 2027"
  statusDescription: string;
  sessions?: ProjectSession[];
  notes?: string;
}

export interface WeeklyPlanningSummary {
  weekNumber: number;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string;   // YYYY-MM-DD
  totalAvailableFreeHours: number;
  gymSessionsTarget: number;
  gymSessionsPlanned: number;
  gymSessionsCompleted: number;
}
