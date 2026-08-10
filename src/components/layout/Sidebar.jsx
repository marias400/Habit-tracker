import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  CalendarDays,
  BarChart3,
  Trophy,
  Users,
  Settings,
} from 'lucide-react';
import { useGamification } from '../../contexts/GamificationContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nuevo', icon: PlusCircle, label: 'Nuevo Hábito' },
  { to: '/calendario', icon: CalendarDays, label: 'Calendario' },
  { to: '/estadisticas', icon: BarChart3, label: 'Estadísticas' },
  { to: '/logros', icon: Trophy, label: 'Logros' },
  { to: '/social', icon: Users, label: 'Social' },
  { to: '/ajustes', icon: Settings, label: 'Ajustes' },
];

export default function Sidebar() {
  const { points, level, levelProgress } = useGamification();

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🎯</div>
        <h1>Habit Tracker</h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-level">
          <div className="sidebar-level-info">
            <div className="sidebar-level-name">
              Nv. {level.level} — {level.name}
            </div>
            <div className="sidebar-level-bar">
              <div
                className="sidebar-level-progress"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
          <span className="sidebar-points">{points} XP</span>
        </div>
      </div>
    </aside>
  );
}
