import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  BarChart3,
  Trophy,
  PlusCircle,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/calendario', icon: CalendarDays, label: 'Calendario' },
  { to: '/nuevo', icon: PlusCircle, label: 'Nuevo' },
  { to: '/estadisticas', icon: BarChart3, label: 'Stats' },
  { to: '/logros', icon: Trophy, label: 'Logros' },
];

export default function MobileNav() {
  return (
    <nav className="mobile-nav" id="mobile-nav">
      <div className="mobile-nav-links">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `mobile-nav-link${isActive ? ' active' : ''}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
