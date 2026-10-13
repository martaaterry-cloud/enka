import React, { useState, useEffect, useRef } from 'react';
import type { Activity } from '../models/activity';
import type { Category } from '../models/category';
import { enkaRepository } from '../services/enka';
import { useAuth } from './useAuth';
import type { LocationItem } from '../models/location';

import type { FlexibleGymSession, PlanningProject, WeeklyPlanningSummary } from '../models/planning';
import {
  INITIAL_GYM_SESSIONS,
  INITIAL_PROJECTS,
  INITIAL_WEEKLY_SUMMARY
} from '../data/mockData';
import { getTodayDateString } from '../utils/dateUtils';
import type { AppTab, ThemeMode } from './enkaContextCore';
import { EnkaContext } from './enkaContextCore';
import { SUPABASE_PROJECT_URL } from '../services/supabase/supabaseClient';
import { createActivityStore } from '../services/local/activityStorage';
import { captureAuthIdentity } from './authIdentity';

const LOCAL_STORAGE_KEY_THEME = 'enka:theme';

export const EnkaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(false);
  const [isCurrent] = useState(() => captureAuthIdentity(user?.id ?? ''));
  const [store] = useState(() => user ? createActivityStore({
    getItem: key => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
  }, SUPABASE_PROJECT_URL, user.id, isCurrent,
  navigator.locks ? (name, action) => navigator.locks.request(name, action) : undefined) : null);

  const [initial] = useState(() => {
    try {
      if (!store) throw new Error('Sin sesión');
      return { activities: store.load(), error: null };
    } catch {
      return { activities: [] as Activity[], error: 'No se pudieron cargar las actividades de esta cuenta. Los datos se conservan. Recarga para volver a intentarlo.' };
    }
  });
  const [activities, setActivities] = useState<Activity[]>(initial.activities);
  const latestActivities = useRef(initial.activities);
  const [storageError, setStorageError] = useState<string | null>(initial.error);
  const storageReady = initial.error === null;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
      return saved === 'light' || saved === 'dark' ? saved : 'system';
    } catch { return 'system'; }
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
  }, [activeTheme, theme]);

  const [currentTab, setCurrentTab] = useState<AppTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  const persistActivities = async (updated: Activity[]): Promise<boolean> => {
    if (!mounted.current || !isCurrent()) return false;
    if (busy.current || !storageReady || !store || latestActivities.current !== activities) {
      setStorageError('No se puede guardar todavía. Espera a que termine la operación o recarga.');
      return false;
    }
    busy.current = true;
    setSaving(true);
    try {
      await store.save(updated);
      if (!mounted.current || !isCurrent()) return false;
      latestActivities.current = updated;
      setActivities(updated);
      // Resolve against the selection at completion, never the selection captured before the lock.
      setSelectedActivity(current => current ? updated.find(a => a.id === current.id) ?? null : null);
      setStorageError(null);
      return true;
    } catch (error) {
      if (mounted.current && isCurrent()) setStorageError(error instanceof Error ? error.message : 'No se pudo guardar. Los datos anteriores se conservan.');
      return false;
    } finally {
      busy.current = false;
      if (mounted.current && isCurrent()) setSaving(false);
    }
  };
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
      if (cancelled || !isCurrent()) return;
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
          city: l.city ?? '',
          defaultTravelFromHomeMinutes: 0,
          isHomeBase: l.is_home_base,
          notes: l.notes ?? undefined
        })));
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
  }, [user, isCurrent]);
  const [gymSessions, setGymSessions] = useState<FlexibleGymSession[]>(INITIAL_GYM_SESSIONS);
  const [projects, setProjects] = useState<PlanningProject[]>(INITIAL_PROJECTS);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyPlanningSummary>(INITIAL_WEEKLY_SUMMARY);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const setTheme = (mode: ThemeMode) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, mode);
      setThemeState(mode);
    } catch { setStorageError('No se pudo guardar la preferencia de tema.'); }
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

  const addActivity = async (activityData: Omit<Activity, 'id' | 'createdAt'>) => {
    if (!mounted.current || !isCurrent()) return false;
    let id: string;
    try { id = crypto.randomUUID(); }
    catch {
      setStorageError('Este navegador no permite crear actividades de forma segura.');
      return false;
    }
    const newActivity: Activity = {
      ...activityData,
      id,
      createdAt: new Date().toISOString()
    };
    const updated = [newActivity, ...activities];
    return persistActivities(updated);
  };

  const updateActivity = async (
    id: string,
    updates: Partial<Activity>,
    scope: 'this_occurrence' | 'following_occurrences' | 'all_occurrences' = 'this_occurrence'
  ) => {
    const target = activities.find(a => a.id === id);
    if (!target) return false;

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

    if (!await persistActivities(updated)) return false;

    return true;
  };

  const cancelActivity = async (
    id: string,
    scope: 'this_occurrence' | 'following_occurrences' | 'all_occurrences' = 'this_occurrence',
    reason?: string
  ) => {
    const target = activities.find(a => a.id === id);
    if (!target) return false;

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

    if (!await persistActivities(updated)) return false;

    return true;
  };

  const deleteActivity = async (
    id: string,
    scope: 'this_occurrence' | 'following_occurrences' | 'all_occurrences' = 'this_occurrence'
  ) => {
    const target = activities.find(a => a.id === id);
    if (!target) return false;

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

    if (!await persistActivities(updated)) return false;

    return true;
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
        storageError,
        storageReady,
        saving,
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
        isDetailModalOpen: isDetailModalOpen && selectedActivity !== null,
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
      {storageError && <div role="alert" style={{ padding: '12px', color: 'var(--text-primary)', background: 'var(--bg-surface)', border: '2px solid #EF4444' }}>{storageError}</div>}
      {storageReady ? children : <div>
        <p role="status">Las actividades no están disponibles. No se ha modificado el almacenamiento.</p>
        <button type="button" disabled={authLoading} onClick={() => {
          void signOut().catch(() => setStorageError('No se pudo cerrar la sesión. Vuelve a intentarlo.'));
        }}>Cerrar sesión</button>
      </div>}
    </EnkaContext.Provider>
  );
};
