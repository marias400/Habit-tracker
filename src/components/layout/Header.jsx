import { Menu, Flame, Star } from 'lucide-react';
import { useGamification } from '../../contexts/GamificationContext';
import { useHabits } from '../../contexts/HabitContext';
import { formatDateLong } from '../../utils/dateUtils';

export default function Header({ pageTitle, onMenuToggle }) {
  const { points } = useGamification();
  const { habits, getMaxStreak } = useHabits();
  const maxStreak = getMaxStreak();

  return (
    <header className="header" id="header">
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onMenuToggle}
          aria-label="Menú"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="header-title">{pageTitle || 'Dashboard'}</h2>
          <span className="header-date">{formatDateLong(new Date())}</span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-streak" title="Mejor racha">
          <Flame size={16} />
          <span>{maxStreak}</span>
        </div>
        <div className="header-points" title="Puntos totales">
          <Star size={16} />
          <span>{points} XP</span>
        </div>
      </div>
    </header>
  );
}
