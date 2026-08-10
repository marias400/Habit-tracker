// Categorías de hábitos
export const CATEGORIES = [
  { id: 'salud', label: 'Salud', icon: 'Heart', color: '#EF4444' },
  { id: 'ejercicio', label: 'Ejercicio', icon: 'Dumbbell', color: '#F97316' },
  { id: 'productividad', label: 'Productividad', icon: 'Target', color: '#3B82F6' },
  { id: 'bienestar', label: 'Bienestar', icon: 'Smile', color: '#10B981' },
  { id: 'educacion', label: 'Educación', icon: 'BookOpen', color: '#8B5CF6' },
  { id: 'finanzas', label: 'Finanzas', icon: 'Wallet', color: '#EAB308' },
  { id: 'social', label: 'Social', icon: 'Users', color: '#EC4899' },
  { id: 'creatividad', label: 'Creatividad', icon: 'Palette', color: '#06B6D4' },
];

// Frecuencias disponibles
export const FREQUENCIES = [
  { id: 'diario', label: 'Diario', days: 1 },
  { id: 'dia_por_medio', label: 'Día por medio', days: 2 },
  { id: 'semanal', label: 'Semanal', days: 7 },
  { id: 'personalizado', label: 'Personalizado', days: null },
];

// Días de la semana
export const DAYS_OF_WEEK = [
  { id: 0, short: 'Dom', long: 'Domingo' },
  { id: 1, short: 'Lun', long: 'Lunes' },
  { id: 2, short: 'Mar', long: 'Martes' },
  { id: 3, short: 'Mié', long: 'Miércoles' },
  { id: 4, short: 'Jue', long: 'Jueves' },
  { id: 5, short: 'Vie', long: 'Viernes' },
  { id: 6, short: 'Sáb', long: 'Sábado' },
];

// Sistema de puntos
export const POINTS = {
  CHECKIN: 10,
  ALL_DAILY_COMPLETE: 25,
  STREAK_MULTIPLIER: 0.5, // +50% por cada 7 días de racha
  BAD_HABIT_RESIST: 15,
};

// Niveles de experiencia
export const LEVELS = [
  { level: 1, name: 'Principiante', xpRequired: 0 },
  { level: 2, name: 'Aprendiz', xpRequired: 100 },
  { level: 3, name: 'Constante', xpRequired: 300 },
  { level: 4, name: 'Dedicado', xpRequired: 600 },
  { level: 5, name: 'Comprometido', xpRequired: 1000 },
  { level: 6, name: 'Disciplinado', xpRequired: 1500 },
  { level: 7, name: 'Imparable', xpRequired: 2200 },
  { level: 8, name: 'Maestro', xpRequired: 3000 },
  { level: 9, name: 'Leyenda', xpRequired: 4000 },
  { level: 10, name: 'Iluminado', xpRequired: 5500 },
];

// Tipos de hábito
export const HABIT_TYPES = {
  GOOD: 'good',
  BAD: 'bad',
};

// Storage keys
export const STORAGE_KEYS = {
  HABITS: 'ht_habits',
  CHECKINS: 'ht_checkins',
  POINTS: 'ht_points',
  MEDALS: 'ht_medals',
  THEME: 'ht_theme',
  SETTINGS: 'ht_settings',
  NOTIFICATIONS: 'ht_notifications',
};
