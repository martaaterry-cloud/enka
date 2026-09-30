import { createContext } from 'react';
import type { Activity } from '../models/activity';
import type { Category } from '../models/category';
import type { LocationItem } from '../models/location';
import type { FlexibleGymSession, PlanningProject, WeeklyPlanningSummary } from '../models/planning';

export type AppTab = 'today' | 'calendar' | 'planning' | 'more';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface EnkaContextType {
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
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  deleteActivity: (id: string) => void;
  toggleGymSession: (id: string) => void;
  toggleProjectSession: (projectId: string, sessionId: string) => void;
  getActivitiesForDate: (date: string) => Activity[];
}

export const EnkaContext = createContext<EnkaContextType | undefined>(undefined);
