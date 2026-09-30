import React, { useState, useEffect } from 'react';
import type { Activity } from '../models/activity';
import type { Category } from '../models/category';
import { INITIAL_CATEGORIES } from '../models/category';
import type { LocationItem } from '../models/location';
import { INITIAL_LOCATIONS } from '../models/location';
import type { FlexibleGymSession, PlanningProject, WeeklyPlanningSummary } from '../models/planning';
import {
  MOCK_ACTIVITIES,
  INITIAL_GYM_SESSIONS,
  INITIAL_PROJECTS,
  INITIAL_WEEKLY_SUMMARY
} from '../data/mockData';
import type { AppTab, ThemeMode } from './enkaContextCore';
import { EnkaContext } from './enkaContextCore';

const LOCAL_STORAGE_KEY_THEME = 'enka:theme';
const LOCAL_STORAGE_KEY_ACTIVITIES = 'enka:activities';

export const EnkaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) as ThemeMode;
    return saved || 'system';
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const activeTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
  }, [activeTheme, theme]);

  const [currentTab, setCurrentTab] = useState<AppTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-29');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVITIES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return MOCK_ACTIVITIES;
      }
    }
    return MOCK_ACTIVITIES;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [locations] = useState<LocationItem[]>(INITIAL_LOCATIONS);
  const [gymSessions, setGymSessions] = useState<FlexibleGymSession[]>(INITIAL_GYM_SESSIONS);
  const [projects, setProjects] = useState<PlanningProject[]>(INITIAL_PROJECTS);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyPlanningSummary>(INITIAL_WEEKLY_SUMMARY);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const openCreateModal = (defaultDate?: string) => {
    if (defaultDate) {
      setSelectedDate(defaultDate);
    }
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const addActivity = (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newActivity, ...activities];
    setActivities(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));
  };

  const deleteActivity = (id: string) => {
    const updated = activities.filter(a => a.id !== id);
    setActivities(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));
  };

  const toggleGymSession = (id: string) => {
    setGymSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === id) {
          const completed = !s.completed;
          return {
            ...s,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined
          };
        }
        return s;
      });
      const completedCount = updated.filter(s => s.completed).length;
      setWeeklySummary(ws => ({ ...ws, gymSessionsCompleted: completedCount }));
      return updated;
    });
  };

  const toggleProjectSession = (projectId: string, sessionId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id === projectId && p.sessions) {
          const updatedSessions = p.sessions.map(s =>
            s.id === sessionId ? { ...s, completed: !s.completed } : s
          );
          return {
            ...p,
            sessions: updatedSessions
          };
        }
        return p;
      })
    );
  };

  const getActivitiesForDate = (date: string) => {
    return activities.filter(a => {
      if (a.date === date) return true;
      if (a.isTrip && a.endDate && date >= a.date && date <= a.endDate) {
        return true;
      }
      return false;
    });
  };

  return (
    <EnkaContext.Provider
      value={{
        theme,
        activeTheme,
        setTheme,
        currentTab,
        setCurrentTab,
        selectedDate,
        setSelectedDate,
        activities,
        categories,
        locations,
        gymSessions,
        projects,
        weeklySummary,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        isCreateModalOpen,
        openCreateModal,
        closeCreateModal,
        addActivity,
        deleteActivity,
        toggleGymSession,
        toggleProjectSession,
        getActivitiesForDate
      }}
    >
      {children}
    </EnkaContext.Provider>
  );
};
