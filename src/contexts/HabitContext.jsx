import { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';
import { toDateKey, todayKey, calculateStreak, isHabitDueToday } from '../utils/dateUtils';

const HabitContext = createContext();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function HabitProvider({ children }) {
  const [habits, setHabits] = useLocalStorage(STORAGE_KEYS.HABITS, []);
  const [checkins, setCheckins] = useLocalStorage(STORAGE_KEYS.CHECKINS, {});

  // Crear hábito
  const addHabit = useCallback((habitData) => {
    const newHabit = {
      id: generateId(),
      name: habitData.name,
      category: habitData.category,
      frequency: habitData.frequency,
      type: habitData.type || 'good',
      weekDay: habitData.weekDay ?? null,
      customDays: habitData.customDays ?? [],
      reminderTime: habitData.reminderTime || null,
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setHabits(prev => [...prev, newHabit]);
    return newHabit;
  }, [setHabits]);

  // Editar hábito
  const updateHabit = useCallback((id, updates) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, [setHabits]);

  // Eliminar hábito
  const deleteHabit = useCallback((id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setCheckins(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setHabits, setCheckins]);

  // Archivar hábito
  const archiveHabit = useCallback((id) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, archived: true } : h));
  }, [setHabits]);

  // Check-in / toggle
  const toggleCheckin = useCallback((habitId, dateKey = null) => {
    const key = dateKey || todayKey();
    setCheckins(prev => {
      const habitCheckins = prev[habitId] || {};
      const isChecked = !habitCheckins[key];
      return {
        ...prev,
        [habitId]: {
          ...habitCheckins,
          [key]: isChecked,
        },
      };
    });
  }, [setCheckins]);

  // Verificar si un hábito está checkeado en una fecha
  const isCheckedIn = useCallback((habitId, dateKey = null) => {
    const key = dateKey || todayKey();
    return !!checkins[habitId]?.[key];
  }, [checkins]);

  // Obtener hábitos del día
  const getTodayHabits = useCallback(() => {
    return habits
      .filter(h => !h.archived && isHabitDueToday(h));
  }, [habits]);

  // Obtener racha de un hábito
  const getStreak = useCallback((habit) => {
    return calculateStreak(habit, checkins);
  }, [checkins]);

  // Obtener total de check-ins
  const getTotalCheckins = useCallback(() => {
    let total = 0;
    for (const habitId of Object.keys(checkins)) {
      total += Object.values(checkins[habitId]).filter(Boolean).length;
    }
    return total;
  }, [checkins]);

  // Obtener máxima racha entre todos los hábitos
  const getMaxStreak = useCallback(() => {
    return habits.reduce((max, habit) => {
      const streak = calculateStreak(habit, checkins);
      return Math.max(max, streak);
    }, 0);
  }, [habits, checkins]);

  // Contar días donde se completaron TODOS los hábitos
  const getAllDailyCompleteCount = useCallback(() => {
    let count = 0;
    const allDates = new Set();
    
    for (const habitCheckins of Object.values(checkins)) {
      for (const dateKey of Object.keys(habitCheckins)) {
        if (habitCheckins[dateKey]) allDates.add(dateKey);
      }
    }
    
    for (const dateKey of allDates) {
      const dueHabits = habits.filter(h => !h.archived);
      if (dueHabits.length === 0) continue;
      
      const allComplete = dueHabits.every(h => checkins[h.id]?.[dateKey]);
      if (allComplete) count++;
    }
    
    return count;
  }, [habits, checkins]);

  // Check-ins de un hábito por fecha
  const getCheckinsByHabit = useCallback((habitId) => {
    return checkins[habitId] || {};
  }, [checkins]);

  // Exportar hábito para compartir
  const exportHabit = useCallback((habitId) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return null;
    const exportData = {
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      type: habit.type,
      weekDay: habit.weekDay,
      customDays: habit.customDays,
    };
    return btoa(JSON.stringify(exportData));
  }, [habits]);

  // Importar hábito compartido
  const importHabit = useCallback((encodedData) => {
    try {
      const data = JSON.parse(atob(encodedData));
      return addHabit(data);
    } catch (e) {
      console.error('Error importando hábito:', e);
      return null;
    }
  }, [addHabit]);

  const value = {
    habits: habits.filter(h => !h.archived),
    allHabits: habits,
    checkins,
    addHabit,
    updateHabit,
    deleteHabit,
    archiveHabit,
    toggleCheckin,
    isCheckedIn,
    getTodayHabits,
    getStreak,
    getTotalCheckins,
    getMaxStreak,
    getAllDailyCompleteCount,
    getCheckinsByHabit,
    exportHabit,
    importHabit,
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits debe usarse dentro de HabitProvider');
  }
  return context;
}
