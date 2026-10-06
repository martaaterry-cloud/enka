import React from 'react';
import { useEnka } from '../../context';
import type { Activity } from '../../models/activity';
import type { Category } from '../../models/category';
import { Icon } from '../../components/ui/Icon';

interface WeekGridProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  activities: Activity[];
  categories: Category[];
}

export const WeekGrid: React.FC<WeekGridProps> = ({
  selectedDate,
  onSelectDate,
  activities,
  categories
}) => {
  const { openDetailModal } = useEnka();
  const categoryMap = React.useMemo(() => {
    return new Map(categories.map(c => [c.id, c]));
  }, [categories]);

  const weekDays = React.useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const curr = new Date(year, month - 1, day);
    const dayOfWeek = curr.getDay();
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(curr);
    monday.setDate(curr.getDate() + distanceToMon);

    const days: { dateStr: string; dayName: string; dayNumber: number }[] = [];
    const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const m = d.getMonth() + 1;
      const dayNum = d.getDate();
      const dateStr = `${d.getFullYear()}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayName: dayNames[i],
        dayNumber: dayNum
      });
    }

    return days;
  }, [selectedDate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0, width: '100%' }}>
      {/* Mobile Week Strip (Lun - Dom in 7 equal columns, no overflow) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '3px',
          backgroundColor: 'var(--bg-surface)',
          padding: '6px 4px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
          minWidth: 0,
        }}
      >
        {weekDays.map(item => {
          const isSelected = item.dateStr === selectedDate;
          const dayActivities = activities.filter(a => a.date === item.dateStr);

          return (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                padding: '5px 1px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: isSelected ? 'var(--text-primary)' : 'transparent',
                color: isSelected ? 'var(--text-inverse)' : 'var(--text-primary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: isSelected ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-muted)'
                }}
              >
                {item.dayName}
              </span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  lineHeight: 1.1
                }}
              >
                {item.dayNumber}
              </span>

              {/* Dots indicator */}
              <div style={{ display: 'flex', gap: '2px', minHeight: '4px', marginTop: '1px' }}>
                {dayActivities.slice(0, 3).map((act) => {
                  const cat = categoryMap.get(act.categoryId);
                  return (
                    <span
                      key={act.id}
                      style={{
                        width: '3px',
                        height: '3px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#ffffff' : (cat?.color || 'var(--text-muted)')
                      }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Week Day Agenda Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Resumen semanal
          </span>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>
            Toca un día para seleccionarlo
          </span>
        </div>

        {weekDays.map(item => {
          const isSelected = item.dateStr === selectedDate;
          const dayActs = activities.filter(a => a.date === item.dateStr);

          return (
            <div
              key={item.dateStr}
              onClick={() => onSelectDate(item.dateStr)}
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isSelected ? 'var(--bg-surface)' : 'var(--bg-surface-subtle)',
                border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
                minWidth: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    width: '28px',
                    textAlign: 'center',
                    flexShrink: 0
                  }}
                >
                  <div style={{ fontSize: '0.59375rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {item.dayName}
                  </div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {item.dayNumber}
                  </div>
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  {dayActs.length === 0 ? (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--status-confirmed)', fontStyle: 'italic' }}>
                      Libre
                    </span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                      {dayActs.map(act => {
                        const cat = categoryMap.get(act.categoryId);
                        return (
                          <span
                            key={act.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailModal(act);
                            }}
                            style={{
                              fontSize: '0.625rem',
                              padding: '2px 5px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: act.isCancelled ? 'rgba(239, 68, 68, 0.1)' : (cat?.bgColor || 'var(--bg-surface)'),
                              color: act.isCancelled ? '#EF4444' : (cat?.color || 'var(--text-primary)'),
                              fontWeight: 600,
                              textDecoration: act.isCancelled ? 'line-through' : 'none',
                              cursor: 'pointer',
                              maxWidth: '100%',
                            }}
                            className="truncate"
                          >
                            {act.title}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <Icon name="ChevronRight" size={13} color="var(--text-dim)" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
