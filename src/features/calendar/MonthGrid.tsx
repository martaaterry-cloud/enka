import React from 'react';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { formatLocalDateToISO, parseLocalDate } from '../../utils/dateUtils';

interface MonthGridProps {
  currentYear: number;
  currentMonth: number; // 0-indexed (8 = September, 9 = October)
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  activities: Activity[];
  categories: Category[];
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  currentYear,
  currentMonth,
  selectedDate,
  onSelectDate,
  activities,
  categories
}) => {
  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const calendarCells = React.useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDayOfMonth.getDate();

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const cells: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const m = currentMonth === 0 ? 12 : currentMonth;
      const y = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ dateStr, dayNumber: d, isCurrentMonth: false });
    }

    for (let day = 1; day <= totalDays; day++) {
      const m = currentMonth + 1;
      const dateStr = `${currentYear}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr, dayNumber: day, isCurrentMonth: true });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const m = currentMonth === 11 ? 1 : currentMonth + 2;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ dateStr, dayNumber: day, isCurrentMonth: false });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const activitiesByDate = React.useMemo(() => {
    const map = new Map<string, Activity[]>();
    activities.forEach(act => {
      const list = map.get(act.date) || [];
      list.push(act);
      map.set(act.date, list);

      if (act.isTrip && act.endDate) {
        const start = parseLocalDate(act.date);
        const end = parseLocalDate(act.endDate);
        const curr = new Date(start);
        curr.setDate(curr.getDate() + 1);
        while (curr <= end) {
          const ds = formatLocalDateToISO(curr);
          const tripList = map.get(ds) || [];
          if (!tripList.some(a => a.id === act.id)) {
            tripList.push(act);
            map.set(ds, tripList);
          }
          curr.setDate(curr.getDate() + 1);
        }
      }
    });
    return map;
  }, [activities]);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          textAlign: 'center',
          marginBottom: '8px'
        }}
      >
        {weekDays.map((d, i) => (
          <div
            key={i}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: i >= 5 ? 'var(--text-muted)' : 'var(--text-secondary)',
              padding: '6px 0'
            }}
          >
            {d}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px'
        }}
      >
        {calendarCells.map(cell => {
          const isSelected = cell.dateStr === selectedDate;
          const dayActs = activitiesByDate.get(cell.dateStr) || [];
          const hasTrip = dayActs.some(a => a.isTrip);
          const hasMatch = dayActs.some(a => a.isSportMatch);
          const hasPendingTime = dayActs.some(a => a.certainty === 'pending_time');

          return (
            <button
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              style={{
                aspectRatio: '1',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isSelected
                  ? 'var(--bg-surface-elevated)'
                  : hasTrip
                  ? 'rgba(6, 182, 212, 0.08)'
                  : 'transparent',
                border: isSelected
                  ? '2px solid var(--text-primary)'
                  : '1px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 2px',
                opacity: cell.isCurrentMonth ? 1 : 0.35,
                transition: 'var(--transition-fast)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 800 : cell.isCurrentMonth ? 600 : 400,
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                {cell.dayNumber}
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  minHeight: '6px',
                  width: '100%'
                }}
              >
                {dayActs.slice(0, 3).map((act, idx) => {
                  const cat = categoryMap.get(act.categoryId);
                  return (
                    <div
                      key={idx}
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: cat?.color || 'var(--text-muted)'
                      }}
                      title={act.title}
                    />
                  );
                })}
              </div>

              {hasMatch && (
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#EF4444'
                  }}
                />
              )}

              {hasPendingTime && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '1px',
                    width: '12px',
                    height: '2px',
                    backgroundColor: 'var(--status-pending)',
                    borderRadius: '999px'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
