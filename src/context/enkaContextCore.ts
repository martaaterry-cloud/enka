import { createContext } from 'react';
import type { Activity } from '../models/activity';
import type { Category } from '../models/category';
import type { LocationItem } from '../models/location';
import type { FlexibleGymSession, PlanningProject, WeeklyPlanningSummary } from '../models/planning';

export type AppTab = 'today' | 'calendar' | 'planning' | 'more';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface EnkaContextType {
  storageError: string | null;
  storageReady: boolean;
  saving: boolean;
  theme: ThemeMode;
  activeTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  activities: Activity[];
  categories: Category[];
  locations: LocationItem[];
  gymSessions: FlexibleGymSession[];
  projects: PlanningProject[];
  weeklySummary: WeeklyPlanningSummary;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (categoryId: string | null) => void;
  isCreateModalOpen: boolean;
  openCreateModal: (defaultDate?: string) => void;
  closeCreateModal: () => void;
  selectedActivity: Activity | null;
  isDetailModalOpen: boolean;
  openDetailModal: (activity: Activity) => void;
  closeDetailModal: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Promise<boolean>;
  updateActivity: (id: string, updates: Partial<Activity>, scope?: 'this_occurrence' | 'following_occurrences' | 'all_occurrences') => Promise<boolean>;
  cancelActivity: (id: string, scope?: 'this_occurrence' | 'following_occurrences' | 'all_occurrences', reason?: string) => Promise<boolean>;
  deleteActivity: (id: string, scope?: 'this_occurrence' | 'following_occurrences' | 'all_occurrences') => Promise<boolean>;
  toggleGymSession: (id: string) => void;
  toggleProjectSession: (projectId: string, sessionId: string) => void;
  getActivitiesForDate: (date: string) => Activity[];
}

export const EnkaContext = createContext<EnkaContextType | undefined>(undefined);
