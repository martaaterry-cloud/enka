import React, { useState, useEffect } from 'react';
import type { Activity } from '../models/activity';
import type { Category } from '../models/category';
import { enkaRepository } from '../services/enka';
import { useAuth } from './useAuth';
import type { LocationItem } from '../models/location';

import type { FlexibleGymSession, PlanningProject, WeeklyPlanningSummary } from '../models/planning';
import {
  MOCK_ACTIVITIES,
  INITIAL_GYM_SESSIONS,
  INITIAL_PROJECTS,
  INITIAL_WEEKLY_SUMMARY
} from '../data/mockData';
import { getTodayDateString } from '../utils/dateUtils';
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
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
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

  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        setCategories([]);
        setLocations([]);
        return;
      }
      const [categoryResult, locationResult] = await Promise.all([
        enkaRepository.fetchCategories(),
        enkaRepository.fetchLocations()
      ]);
      if (cancelled) return;
      if (categoryResult.error) {
        console.error('No se pudieron cargar las categorías de Enka.');
        setCategories([]);
      } else {
        setCategories((categoryResult.data ?? []).filter(c => c.is_active).map(c => ({
          id: c.id,
          name: c.name,
          iconName: c.icon_name,
          color: c.color,
          bgColor: c.color + '1F',
          borderColor: c.color + '47'
        })));
      }
      if (locationResult.error) {
        console.error('No se pudieron cargar las ubicaciones de Enka.');
        setLocations([]);
      } else {
        setLocations((locationResult.data ?? []).map(l => ({
          id: l.id,
          name: l.name,
          address: l.address ?? '',
          city: l.city ?? '',
          latitude: l.latitude ?? undefined,
          longitude: l.longitude ?? undefined
        } as LocationItem)));
      }
    };
    void load();
    window.addEventListener('enka:data-changed', load);
    window.addEventListener('focus', load);
    return () => {
      cancelled = true;
      window.removeEventListener('enka:data-changed', load);
      window.removeEventListener('focus', load);
    };
  }, [user]);
  const [gymSessions, setGymSessions] = useState<FlexibleGymSession[]>(INITIAL_GYM_SESSIONS);
  const [projects, setProjects] = useState<PlanningProject[]>(INITIAL_PROJECTS);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyPlanningSummary>(INITIAL_WEEKLY_SUMMARY);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

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

  const openDetailModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedActivity(null);
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

  const updateActivity = (
    id: string,
    updates: Partial<Activity>,
    scope: 'this_occurrence' | 'following_occurrences' | 'all_occurrences' = 'this_occurrence'
  ) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;

    let updated: Activity[];

    if (!target.isRecurrent || scope === 'this_occurrence') {
      // Single occurrence edit / exception
      updated = activities.map(a => {
        if (a.id === id) {
          return {
            ...a,
            ...updates,
            isOccurrenceException: target.isRecurrent ? true : a.isOccurrenceException
          };
        }
        return a;
      });
    } else if (scope === 'following_occurrences') {
      const seriesId = target.recurrenceSeriesId;
      const targetDate = target.date;
      updated = activities.map(a => {
        const matchesSeries = seriesId
          ? a.recurrenceSeriesId === seriesId
          : a.isRecurrent && a.title === target.title;

        if (matchesSeries && a.date >= targetDate) {
          // Preserve individual date, but update time, location, title, etc.
          const { date: _ignoreDate, ...sharedUpdates } = updates;
          return {
            ...a,
            ...sharedUpdates
          };
        }
        return a;
      });
    } else {
      // all_occurrences
      const seriesId = target.recurrenceSeriesId;
      updated = activities.map(a => {
        const matchesSeries = seriesId
          ? a.recurrenceSeriesId === seriesId
          : a.isRecurrent && a.title === target.title;

        if (matchesSeries) {
          const { date: _ignoreDate, ...sharedUpdates } = updates;
          return {
            ...a,
            ...sharedUpdates
          };
        }
        return a;
      });
    }

    setActivities(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));

    // Update selectedActivity if open
    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity({ ...selectedActivity, ...updates, isOccurrenceException: target.isRecurrent ? true : selectedActivity.isOccurrenceException });
    }
  };

  const cancelActivity = (
    id: string,
    scope: 'this_occurrence' | 'following_occurrences' | 'all_occurrences' = 'this_occurrence',
    reason?: string
  ) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;

    let updated: Activity[];

    if (!target.isRecurrent || scope === 'this_occurrence') {
      updated = activities.map(a => {
        if (a.id === id) {
          return {
            ...a,
            isCancelled: true,
            cancellationReason: reason || 'Cancelada',
            isOccurrenceException: target.isRecurrent ? true : a.isOccurrenceException
          };
        }
        return a;
      });
    } else if (scope === 'following_occurrences') {
      const seriesId = target.recurrenceSeriesId;
      const targetDate = target.date;
      updated = activities.map(a => {
        const matchesSeries = seriesId
          ? a.recurrenceSeriesId === seriesId
          : a.isRecurrent && a.title === target.title;

        if (matchesSeries && a.date >= targetDate) {
          return {
            ...a,
            isCancelled: true,
            cancellationReason: reason || 'Cancelada'
          };
        }
        return a;
      });
    } else {
      const seriesId = target.recurrenceSeriesId;
      updated = activities.map(a => {
        const matchesSeries = seriesId
          ? a.recurrenceSeriesId === seriesId
          : a.isRecurrent && a.title === target.title;

        if (matchesSeries) {
          return {
            ...a,
            isCancelled: true,
            cancellationReason: reason || 'Cancelada'
          };
        }
        return a;
      });
    }

    setActivities(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));

    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity({
        ...selectedActivity,
        isCancelled: true,
        cancellationReason: reason || 'Cancelada',
        isOccurrenceException: target.isRecurrent ? true : selectedActivity.isOccurrenceException
      });
    }
  };

  const deleteActivity = (
    id: string,
    scope: 'this_occurrence' | 'following_occurrences' | 'all_occurrences' = 'this_occurrence'
  ) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;

    let updated: Activity[];

    if (!target.isRecurrent || scope === 'this_occurrence') {
      updated = activities.filter(a => a.id !== id);
    } else if (scope === 'following_occurrences') {
      const seriesId = target.recurrenceSeriesId;
      const targetDate = target.date;
      updated = activities.filter(a => {
        const matchesSeries = seriesId
          ? a.recurrenceSeriesId === seriesId
          : a.isRecurrent && a.title === target.title;

        if (matchesSeries && a.date >= targetDate) {
          return false;
        }
        return true;
      });
    } else {
      const seriesId = target.recurrenceSeriesId;
      updated = activities.filter(a => {
        const matchesSeries = seriesId
          ? a.recurrenceSeriesId === seriesId
          : a.isRecurrent && a.title === target.title;

        if (matchesSeries) {
          return false;
        }
        return true;
      });
    }

    setActivities(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));

    if (selectedActivity && selectedActivity.id === id) {
      closeDetailModal();
    }
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
        selectedActivity,
        isDetailModalOpen,
        openDetailModal,
        closeDetailModal,
        addActivity,
        updateActivity,
        cancelActivity,
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
