import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useHabits } from '../contexts/HabitContext';
import { useToast } from '../components/ui/Toast';
import { CATEGORIES } from '../utils/constants';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthName,
  toDateKey,
  isToday,
  isHabitDueOnDate,
} from '../utils/dateUtils';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { habits, checkins, toggleCheckin, isCheckedIn } = useHabits();
  const { addToast } = useToast();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDay = useMemo(() => getFirstDayOfMonth(year, month), [year, month]);

  const habitsOnSelectedDate = useMemo(() => {
    return habits.filter(h => isHabitDueOnDate(h, selectedDate));
  }, [habits, selectedDate]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCheckin = (habit) => {
    const dateKey = toDateKey(selectedDate);
    // No permitir check-ins en el futuro
    if (selectedDate > new Date()) {
      addToast('No podés hacer check-in en el futuro', 'error');
      return;
    }
    toggleCheckin(habit.id, dateKey);
  };

  const getDayDots = (date) => {
    const dateKey = toDateKey(date);
    const dueHabits = habits.filter(h => isHabitDueOnDate(h, date));
    if (dueHabits.length === 0) return null;

    const completedCount = dueHabits.filter(h => checkins[h.id]?.[dateKey]).length;
    
    if (completedCount === 0) return <div className="calendar-dot missed" />;
    if (completedCount === dueHabits.length) return <div className="calendar-dot" />;
    return <div className="calendar-dot partial" />;
  };

  const getCategoryInfo = (catId) => CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendario</h1>
          <p className="page-subtitle">Revisá tu historial y editá días anteriores</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Vista de Calendario */}
        <div className="calendar">
          <div className="calendar-header">
            <h3 className="calendar-title">
              {getMonthName(month)} {year}
            </h3>
            <div className="calendar-nav">
              <button className="calendar-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={20} />
              </button>
              <button className="calendar-nav-btn" onClick={nextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="calendar-weekday">{d}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {/* Días vacíos previos */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day other-month" />
            ))}
            
            {/* Días del mes */}
            {daysInMonth.map(date => {
              const isSelected = toDateKey(date) === toDateKey(selectedDate);
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`calendar-day${isTodayDate ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span>{date.getDate()}</span>
                  <div className="calendar-dots">
                    {getDayDots(date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalle del día seleccionado */}
        <div>
          <div className="habit-list-header">
            <h3 className="habit-list-title">
              Hábitos del {selectedDate.getDate()} de {getMonthName(selectedDate.getMonth())}
            </h3>
          </div>

          {habitsOnSelectedDate.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <Info size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }} />
              <p className="empty-state-desc">No hay hábitos programados para este día.</p>
            </div>
          ) : (
            <div className="habit-list">
              {habitsOnSelectedDate.map(habit => {
                const dateKey = toDateKey(selectedDate);
                const checked = isCheckedIn(habit.id, dateKey);
                const cat = getCategoryInfo(habit.category);
                const isFuture = selectedDate > new Date();

                return (
                  <div
                    key={habit.id}
                    className={`habit-card${checked ? ' completed' : ''}${habit.type === 'bad' ? ' bad-habit' : ''}`}
                    style={{ 
                      '--habit-color': habit.type === 'bad' ? '#ef4444' : cat.color,
                      opacity: isFuture ? 0.5 : 1,
                      pointerEvents: isFuture ? 'none' : 'auto'
                    }}
                  >
                    <button
                      className={`habit-check${checked ? (habit.type === 'bad' ? ' bad-checked' : ' checked') : ''}`}
                      onClick={() => handleCheckin(habit)}
                      disabled={isFuture}
                    >
                      {checked && (habit.type === 'bad' ? '🚫' : '✓')}
                    </button>
                    <div className="habit-info">
                      <div className="habit-name">{habit.name}</div>
                      <div className="habit-meta">
                        <span className="habit-category" style={{ color: cat.color, background: `${cat.color}15` }}>
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
