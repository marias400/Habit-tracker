/**
 * Utilidades de fechas para Habit Tracker
 */

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTHS_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Formatea una fecha como "YYYY-MM-DD" (key para localStorage)
 */
export function toDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Devuelve la fecha de hoy como key
 */
export function todayKey() {
  return toDateKey(new Date());
}

/**
 * Formatea fecha para mostrar: "10 de Agosto, 2026"
 */
export function formatDateLong(date) {
  const d = new Date(date);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
}

/**
 * Formatea fecha corta: "10 Ago"
 */
export function formatDateShort(date) {
  const d = new Date(date);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

/**
 * Devuelve el nombre del día de la semana
 */
export function getDayName(date) {
  return DAYS_SHORT[new Date(date).getDay()];
}

/**
 * Devuelve el nombre del mes
 */
export function getMonthName(monthIndex) {
  return MONTHS[monthIndex];
}

/**
 * Devuelve los días del mes como array de objetos Date
 */
export function getDaysInMonth(year, month) {
  const days = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= lastDay; i++) {
    days.push(new Date(year, month, i));
  }
  return days;
}

/**
 * Devuelve el primer día de la semana del mes (0 = Domingo)
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Calcula la diferencia en días entre dos fechas
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Devuelve true si dos fechas son el mismo día
 */
export function isSameDay(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

/**
 * Devuelve true si la fecha es hoy
 */
export function isToday(date) {
  return isSameDay(date, new Date());
}

/**
 * Devuelve las últimas N fechas como array de dateKeys
 */
export function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

/**
 * Devuelve true si el hábito debe hacerse hoy según su frecuencia
 */
export function isHabitDueToday(habit) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  if (habit.frequency === 'diario') return true;
  if (habit.frequency === 'dia_por_medio') {
    const created = new Date(habit.createdAt);
    const diff = daysBetween(created, today);
    return diff % 2 === 0;
  }
  if (habit.frequency === 'semanal') {
    return habit.weekDay === dayOfWeek;
  }
  if (habit.frequency === 'personalizado') {
    return habit.customDays?.includes(dayOfWeek);
  }
  return false;
}

/**
 * Devuelve true si el hábito estaba programado para la fecha dada
 */
export function isHabitDueOnDate(habit, date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();

  if (habit.frequency === 'diario') return true;
  if (habit.frequency === 'dia_por_medio') {
    const created = new Date(habit.createdAt);
    const diff = daysBetween(created, d);
    return diff % 2 === 0;
  }
  if (habit.frequency === 'semanal') {
    return habit.weekDay === dayOfWeek;
  }
  if (habit.frequency === 'personalizado') {
    return habit.customDays?.includes(dayOfWeek);
  }
  return false;
}

/**
 * Calcula la racha actual de un hábito
 */
export function calculateStreak(habit, checkins) {
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i <= 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const key = toDateKey(checkDate);

    if (!isHabitDueOnDate(habit, checkDate)) continue;

    const isChecked = checkins[habit.id]?.[key];
    if (habit.type === 'bad') {
      // Para hábitos malos, check-in significa que NO lo hiciste (resististe)
      if (isChecked) {
        streak++;
      } else if (i > 0) {
        break;
      }
    } else {
      if (isChecked) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
  }
  return streak;
}
