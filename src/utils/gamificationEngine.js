import { POINTS, LEVELS } from './constants';

/**
 * Calcula los puntos obtenidos por un check-in
 */
export function calculateCheckinPoints(streak, isAllComplete = false) {
  let points = POINTS.CHECKIN;
  
  // Multiplicador por racha (cada 7 días, +50%)
  const multiplier = 1 + Math.floor(streak / 7) * POINTS.STREAK_MULTIPLIER;
  points = Math.round(points * multiplier);
  
  // Bonus por completar todos los hábitos del día
  if (isAllComplete) {
    points += POINTS.ALL_DAILY_COMPLETE;
  }
  
  return points;
}

/**
 * Calcula los puntos por resistir un hábito malo
 */
export function calculateResistPoints(streak) {
  let points = POINTS.BAD_HABIT_RESIST;
  const multiplier = 1 + Math.floor(streak / 7) * POINTS.STREAK_MULTIPLIER;
  return Math.round(points * multiplier);
}

/**
 * Obtiene el nivel actual basado en los puntos totales
 */
export function getLevel(totalPoints) {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (totalPoints >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

/**
 * Obtiene el progreso hacia el siguiente nivel (0-100)
 */
export function getLevelProgress(totalPoints) {
  const current = getLevel(totalPoints);
  const currentIndex = LEVELS.findIndex(l => l.level === current.level);
  const next = LEVELS[currentIndex + 1];
  
  if (!next) return 100; // Nivel máximo
  
  const pointsInLevel = totalPoints - current.xpRequired;
  const pointsNeeded = next.xpRequired - current.xpRequired;
  return Math.round((pointsInLevel / pointsNeeded) * 100);
}

/**
 * Obtiene los puntos necesarios para el siguiente nivel
 */
export function getNextLevelXP(totalPoints) {
  const current = getLevel(totalPoints);
  const currentIndex = LEVELS.findIndex(l => l.level === current.level);
  const next = LEVELS[currentIndex + 1];
  
  if (!next) return 0;
  return next.xpRequired - totalPoints;
}

/**
 * Definición de medallas
 */
export const MEDALS = [
  // Medallas de racha por hábito
  {
    id: 'streak_3',
    name: 'Primera Llama',
    description: '3 días seguidos con un hábito',
    icon: '🔥',
    type: 'streak',
    requirement: 3,
    tier: 'bronze',
  },
  {
    id: 'streak_7',
    name: 'Semana Perfecta',
    description: '7 días seguidos con un hábito',
    icon: '⭐',
    type: 'streak',
    requirement: 7,
    tier: 'silver',
  },
  {
    id: 'streak_14',
    name: 'Quincena de Hierro',
    description: '14 días seguidos con un hábito',
    icon: '💪',
    type: 'streak',
    requirement: 14,
    tier: 'silver',
  },
  {
    id: 'streak_30',
    name: 'Mes Invencible',
    description: '30 días seguidos con un hábito',
    icon: '🏆',
    type: 'streak',
    requirement: 30,
    tier: 'gold',
  },
  {
    id: 'streak_100',
    name: 'Centurión',
    description: '100 días seguidos con un hábito',
    icon: '💎',
    type: 'streak',
    requirement: 100,
    tier: 'diamond',
  },
  // Medallas de cantidad total
  {
    id: 'checkins_10',
    name: 'Primeros Pasos',
    description: '10 check-ins totales',
    icon: '👣',
    type: 'total_checkins',
    requirement: 10,
    tier: 'bronze',
  },
  {
    id: 'checkins_50',
    name: 'Medio Centenar',
    description: '50 check-ins totales',
    icon: '🎯',
    type: 'total_checkins',
    requirement: 50,
    tier: 'silver',
  },
  {
    id: 'checkins_100',
    name: 'Centenario',
    description: '100 check-ins totales',
    icon: '💯',
    type: 'total_checkins',
    requirement: 100,
    tier: 'gold',
  },
  {
    id: 'checkins_500',
    name: 'Leyenda Viviente',
    description: '500 check-ins totales',
    icon: '👑',
    type: 'total_checkins',
    requirement: 500,
    tier: 'diamond',
  },
  // Medallas especiales
  {
    id: 'all_daily_3',
    name: 'Día Completo x3',
    description: 'Completar todos los hábitos del día, 3 veces',
    icon: '✅',
    type: 'all_daily',
    requirement: 3,
    tier: 'bronze',
  },
  {
    id: 'all_daily_7',
    name: 'Semana Redonda',
    description: 'Completar todos los hábitos del día, 7 veces',
    icon: '🌟',
    type: 'all_daily',
    requirement: 7,
    tier: 'silver',
  },
  {
    id: 'all_daily_30',
    name: 'Mes Dorado',
    description: 'Completar todos los hábitos del día, 30 veces',
    icon: '🥇',
    type: 'all_daily',
    requirement: 30,
    tier: 'gold',
  },
  {
    id: 'habits_5',
    name: 'Coleccionista',
    description: 'Tener 5 hábitos activos',
    icon: '📋',
    type: 'habit_count',
    requirement: 5,
    tier: 'bronze',
  },
  {
    id: 'habits_10',
    name: 'Multitasker',
    description: 'Tener 10 hábitos activos',
    icon: '🚀',
    type: 'habit_count',
    requirement: 10,
    tier: 'silver',
  },
  {
    id: 'resist_7',
    name: 'Voluntad de Acero',
    description: 'Resistir un hábito malo por 7 días',
    icon: '🛡️',
    type: 'resist_streak',
    requirement: 7,
    tier: 'silver',
  },
  {
    id: 'resist_30',
    name: 'Libre al Fin',
    description: 'Resistir un hábito malo por 30 días',
    icon: '🦅',
    type: 'resist_streak',
    requirement: 30,
    tier: 'gold',
  },
];

/**
 * Verifica qué medallas nuevas se desbloquearon
 */
export function checkNewMedals(stats, earnedMedals = []) {
  const newMedals = [];
  
  for (const medal of MEDALS) {
    if (earnedMedals.includes(medal.id)) continue;
    
    let earned = false;
    
    switch (medal.type) {
      case 'streak':
        earned = stats.maxStreak >= medal.requirement;
        break;
      case 'total_checkins':
        earned = stats.totalCheckins >= medal.requirement;
        break;
      case 'all_daily':
        earned = stats.allDailyCount >= medal.requirement;
        break;
      case 'habit_count':
        earned = stats.habitCount >= medal.requirement;
        break;
      case 'resist_streak':
        earned = stats.maxResistStreak >= medal.requirement;
        break;
      default:
        break;
    }
    
    if (earned) {
      newMedals.push(medal);
    }
  }
  
  return newMedals;
}

/**
 * Obtiene el color del tier de medalla
 */
export function getTierColor(tier) {
  switch (tier) {
    case 'bronze': return '#CD7F32';
    case 'silver': return '#C0C0C0';
    case 'gold': return '#FFD700';
    case 'diamond': return '#B9F2FF';
    default: return '#888';
  }
}
