import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import AchievementPopup from './components/gamification/AchievementPopup';
import Dashboard from './pages/Dashboard';
import HabitForm from './pages/HabitForm';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Achievements from './pages/Achievements';
import Social from './pages/Social';
import Settings from './pages/Settings';

import { useState } from 'react';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar className={isMobileMenuOpen ? 'open' : ''} />
      
      <div className="app-main">
        <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main style={{ paddingBottom: 'var(--space-8)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/nuevo" element={<HabitForm />} />
            <Route path="/editar/:id" element={<HabitForm />} />
            <Route path="/calendario" element={<Calendar />} />
            <Route path="/estadisticas" element={<Statistics />} />
            <Route path="/logros" element={<Achievements />} />
            <Route path="/social" element={<Social />} />
            <Route path="/ajustes" element={<Settings />} />
          </Routes>
        </main>
      </div>

      <MobileNav />
      <AchievementPopup />
    </div>
  );
}

export default App;
