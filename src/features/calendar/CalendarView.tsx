import React, { useState } from 'react';
import { useEnka } from '../../context';
import { MonthGrid } from './MonthGrid';
import { WeekGrid } from './WeekGrid';
import { DayDetailPanel } from './DayDetailPanel';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Icon } from '../../components/ui/Icon';

import { getTodayDateString, parseLocalDate } from '../../utils/dateUtils';

export const CalendarView: React.FC = () => {
  const { activities, categories, selectedDate, setSelectedDate, openCreateModal, getActivitiesForDate } = useEnka();

  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const initialDateObj = React.useMemo(() => parseLocalDate(selectedDate || getTodayDateString()), [selectedDate]);
  const [currentYear, setCurrentYear] = useState<number>(() => initialDateObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => initialDateObj.getMonth());

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const selectedDayActivities = getActivitiesForDate(selectedDate);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            Calendario
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Visualiza tus días, solapes, incertidumbres y disponibilidad real.
          </p>
        </div>

        {/* View Switcher: Mes / Semana */}
        <SegmentedControl
          options={[
            { value: 'month', label: 'Mes', iconName: 'Grid' },
            { value: 'week', label: 'Semana', iconName: 'Columns' }
          ]}
          value={viewMode}
          onChange={(val) => setViewMode(val as 'month' | 'week')}
          size="sm"
        />
      </div>

      {/* Month Navigation & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {monthNames[currentMonth]} {currentYear}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => {
              const todayStr = getTodayDateString();
              const now = parseLocalDate(todayStr);
              setCurrentYear(now.getFullYear());
              setCurrentMonth(now.getMonth());
              setSelectedDate(todayStr);
            }}
            style={{
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            Hoy
          </button>
          <button
            onClick={handlePrevMonth}
            aria-label="Mes anterior"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <Icon name="ChevronLeft" size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            aria-label="Mes siguiente"
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-secondary)'
            }}
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
      </div>

      {/* Main Calendar Content */}
      <div className="calendar-layout-grid">
        <div style={{ flex: 1 }}>
          {viewMode === 'month' ? (
            <MonthGrid
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              activities={activities}
              categories={categories}
            />
          ) : (
            <WeekGrid
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              activities={activities}
              categories={categories}
            />
          )}
        </div>

        {/* Selected Day Details Panel */}
        <div style={{ width: '100%' }} className="calendar-detail-column">
          <DayDetailPanel
            date={selectedDate}
            activities={selectedDayActivities}
            categories={categories}
            onOpenCreate={() => openCreateModal(selectedDate)}
          />
        </div>
      </div>

      <style>{`
        .calendar-layout-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 960px) {
          .calendar-layout-grid {
            flex-direction: row;
            align-items: flex-start;
          }
          .calendar-detail-column {
            width: 380px !important;
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
};
