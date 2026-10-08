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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Compact Clean Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontSize: '0.75rem',
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
              fontSize: '1.375rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginTop: '1px'
            }}
            className="truncate"
          >
            {todayHeader}
          </h1>
        </div>

        {/* Discrete context badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-confirmed)' }} />
          <span>{todayActivities.length} {todayActivities.length === 1 ? 'actividad' : 'actividades'}</span>
        </div>
      </div>

      {/* Siguiente Actividad (Focus card) */}
      <NextUpCard
        activity={nextActivity}
        category={nextActivityCategory}
        relativeTimeText={relativeTimeText}
      />

      {/* Category Filter Pills */}
      {categories.length > 0 && <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          width: '100%',
          minWidth: 0
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter(null)}
          style={{
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.6875rem',
            fontWeight: selectedCategoryFilter === null ? 700 : 500,
            backgroundColor: selectedCategoryFilter === null ? 'var(--text-primary)' : 'var(--bg-surface)',
            color: selectedCategoryFilter === null ? 'var(--text-inverse)' : 'var(--text-secondary)',
            border: selectedCategoryFilter === null ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'var(--transition-fast)'
          }}
        >
          Todas
        </button>
        {categories.map((cat: Category) => {
          const isSelected = selectedCategoryFilter === cat.id;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(isSelected ? null : cat.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.6875rem',
                fontWeight: isSelected ? 700 : 500,
                backgroundColor: isSelected ? cat.color : 'var(--bg-surface)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                border: isSelected ? `1px solid ${cat.color}` : '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'var(--transition-fast)'
              }}
            >
              <Icon name={cat.iconName} size={11} color={isSelected ? '#ffffff' : cat.color} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>}

      {/* Main Day Timeline */}
      <div style={{ marginTop: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Cronología de hoy
          </h2>

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
