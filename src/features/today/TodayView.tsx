import React from 'react';
import { useEnka } from '../../context';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { NextUpCard } from './NextUpCard';
import { TimelineList } from './TimelineList';
import { Icon } from '../../components/ui/Icon';
import {
  getTodayDateString,
  formatSpanishDateHeader,
  getDayGreeting,
  getRelativeTimeText,
  findNextUpcomingActivity
} from '../../utils/dateUtils';

export const TodayView: React.FC = () => {
  const {
    activities,
    categories,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    openCreateModal
  } = useEnka();

  const todayDateStr = React.useMemo(() => getTodayDateString(), []);
  const todayHeader = React.useMemo(() => formatSpanishDateHeader(todayDateStr), [todayDateStr]);
  const greeting = React.useMemo(() => getDayGreeting(), []);

  const todayActivities = React.useMemo(() => {
    return activities.filter((a: Activity) => {
      const matchesDate = a.date === todayDateStr;
      const matchesCategory = selectedCategoryFilter ? a.categoryId === selectedCategoryFilter : true;
      return matchesDate && matchesCategory;
    });
  }, [activities, todayDateStr, selectedCategoryFilter]);

  const nextActivity = React.useMemo(() => {
    return findNextUpcomingActivity(todayActivities);
  }, [todayActivities]);

  const nextActivityCategory = React.useMemo(() => {
    if (!nextActivity) return undefined;
    return categories.find((c: Category) => c.id === nextActivity.categoryId);
  }, [nextActivity, categories]);

  const relativeTimeText = React.useMemo(() => {
    return getRelativeTimeText(nextActivity?.startTime);
  }, [nextActivity]);

  const daySummaryText = React.useMemo(() => {
    if (todayActivities.length === 0) return 'Día completamente libre';
    const hasUncertain = todayActivities.some(a => a.certainty !== 'confirmed' || a.isEndTimeUnknown);
    if (hasUncertain) return 'Horarios con margen';
    return 'Día planificado';
  }, [todayActivities]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {greeting}
          </span>
          <h1
            style={{
              fontSize: '1.625rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              marginTop: '2px'
            }}
          >
            {todayHeader}
          </h1>
        </div>

        {/* Quick Day Metrics */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-confirmed)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {todayActivities.length} {todayActivities.length === 1 ? 'actividad' : 'actividades'}
            </span>
          </div>
          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-default)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="Hourglass" size={13} color="var(--status-confirmed)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {daySummaryText}
            </span>
          </div>
        </div>
      </div>

      {/* Siguiente Actividad */}
      <div>
        <NextUpCard
          activity={nextActivity}
          category={nextActivityCategory}
          relativeTimeText={relativeTimeText}
        />
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <button
          onClick={() => setSelectedCategoryFilter(null)}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: selectedCategoryFilter === null ? 700 : 500,
            backgroundColor: selectedCategoryFilter === null ? 'var(--text-primary)' : 'var(--bg-surface-subtle)',
            color: selectedCategoryFilter === null ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: selectedCategoryFilter === null ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
            whiteSpace: 'nowrap',
            transition: 'var(--transition-fast)'
          }}
        >
          Todas
        </button>
        {categories.map((cat: Category) => {
          const isSelected = selectedCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(isSelected ? null : cat.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? cat.color : 'var(--bg-surface-subtle)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                border: isSelected ? `1px solid ${cat.color}` : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon name={cat.iconName} size={12} color={isSelected ? '#ffffff' : cat.color} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Day Timeline */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Cronología del día
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Base: Bullas
          </span>
        </div>

        <TimelineList
          activities={todayActivities}
          categories={categories}
          onOpenCreate={(_slotTime) => openCreateModal(todayDateStr)}
        />
      </div>
    </div>
  );
};
