import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useHabits } from './HabitContext';
import { STORAGE_KEYS } from '../utils/constants';
import {
  calculateCheckinPoints,
  calculateResistPoints,
  getLevel,
  getLevelProgress,
  getNextLevelXP,
  checkNewMedals,
  MEDALS,
} from '../utils/gamificationEngine';

const GamificationContext = createContext();

export function GamificationProvider({ children }) {
  const [points, setPoints] = useLocalStorage(STORAGE_KEYS.POINTS, 0);
  const [earnedMedals, setEarnedMedals] = useLocalStorage(STORAGE_KEYS.MEDALS, []);
  const [pendingMedal, setPendingMedal] = useState(null);
  const { habits, getTotalCheckins, getMaxStreak, getAllDailyCompleteCount } = useHabits();

  // Añadir puntos
  const addPoints = useCallback((amount) => {
    setPoints(prev => prev + amount);
  }, [setPoints]);

  // Calcular puntos al hacer check-in
  const onCheckin = useCallback((habit, streak, isAllComplete) => {
    let pts;
    if (habit.type === 'bad') {
      pts = calculateResistPoints(streak);
    } else {
      pts = calculateCheckinPoints(streak, isAllComplete);
    }
    addPoints(pts);
    return pts;
  }, [addPoints]);

  // Verificar medallas periódicamente
  const checkMedals = useCallback(() => {
    const stats = {
      maxStreak: getMaxStreak(),
      totalCheckins: getTotalCheckins(),
      allDailyCount: getAllDailyCompleteCount(),
      habitCount: habits.length,
      maxResistStreak: habits
        .filter(h => h.type === 'bad')
        .reduce((max, h) => Math.max(max, 0), 0),
    };

    const newMedals = checkNewMedals(stats, earnedMedals);
    if (newMedals.length > 0) {
      setEarnedMedals(prev => [...prev, ...newMedals.map(m => m.id)]);
      // Mostrar la primera medalla nueva
      setPendingMedal(newMedals[0]);
    }
  }, [habits, earnedMedals, getMaxStreak, getTotalCheckins, getAllDailyCompleteCount, setEarnedMedals]);

  // Descartar popup de medalla
  const dismissMedal = useCallback(() => {
    setPendingMedal(null);
  }, []);

  // Verificar medallas cuando cambian los check-ins
  useEffect(() => {
    checkMedals();
  }, [habits.length]);

  const level = getLevel(points);
  const levelProgress = getLevelProgress(points);
  const nextLevelXP = getNextLevelXP(points);

  const value = {
    points,
    level,
    levelProgress,
    nextLevelXP,
    earnedMedals,
    pendingMedal,
    allMedals: MEDALS,
    addPoints,
    onCheckin,
    checkMedals,
    dismissMedal,
    getMedalById: (id) => MEDALS.find(m => m.id === id),
    isMedalEarned: (id) => earnedMedals.includes(id),
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification debe usarse dentro de GamificationProvider');
  }
  return context;
}
