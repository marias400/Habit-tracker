import { useMemo } from 'react';
import { Download, BarChart2, TrendingUp, CheckCircle } from 'lucide-react';
import { useHabits } from '../contexts/HabitContext';
import { useGamification } from '../contexts/GamificationContext';
import { exportStatsToPDF } from '../utils/pdfExport';
import { getLastNDays, toDateKey } from '../utils/dateUtils';
import { CATEGORIES } from '../utils/constants';

export default function Statistics() {
  const { habits, checkins, getTotalCheckins, getMaxStreak } = useHabits();
  const { points, level, earnedMedals } = useGamification();

  const totalCheckins = getTotalCheckins();
  const maxStreak = getMaxStreak();

  // Datos para gráfico semanal
  const weeklyData = useMemo(() => {
    const last7Days = getLastNDays(7);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return last7Days.map(dateKey => {
      const d = new Date(dateKey + 'T00:00:00');
      let completed = 0;
      let total = 0;
      
      habits.forEach(h => {
        // Simplificación: asume que todos están activos todos los días
        total++; 
        if (checkins[h.id]?.[dateKey]) completed++;
      });
      
      return {
        label: dayNames[d.getDay()],
        value: total > 0 ? (completed / total) * 100 : 0,
        completed
      };
    });
  }, [habits, checkins]);

  // Datos para heatmap (últimos 28 días)
  const heatmapData = useMemo(() => {
    const last28Days = getLastNDays(28);
    return last28Days.map(dateKey => {
      let completed = 0;
      habits.forEach(h => {
        if (checkins[h.id]?.[dateKey]) completed++;
      });
      return completed;
    });
  }, [habits, checkins]);

  const handleExportPDF = () => {
    const stats = {
      totalCheckins,
      totalPoints: points,
      level,
      maxStreak,
      earnedMedals
    };
    exportStatsToPDF(habits, checkins, stats);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Estadísticas</h1>
          <p className="page-subtitle">Analizá tu progreso y constancia</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportPDF}>
          <Download size={18} />
          Exportar a PDF
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Resumen de 7 días</h3>
            <BarChart2 style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="weekly-chart">
            {weeklyData.map((day, i) => (
              <div key={i} className="weekly-bar-wrapper">
                <div 
                  className="weekly-bar" 
                  style={{ height: `${Math.max(day.value, 4)}%` }} 
                  title={`${day.completed} completados`}
                />
                <span className="weekly-bar-label">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Constancia (28 días)</h3>
            <TrendingUp style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="heatmap" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {heatmapData.map((count, i) => {
              let levelClass = '';
              if (count === 1) levelClass = 'level-1';
              if (count === 2) levelClass = 'level-2';
              if (count === 3) levelClass = 'level-3';
              if (count >= 4) levelClass = 'level-4';
              return (
                <div 
                  key={i} 
                  className={`heatmap-cell ${levelClass}`}
                  title={`${count} completados`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <h3 className="section-title mt-6">Desglose por Categoría</h3>
      <div className="stats-grid">
        {CATEGORIES.map(cat => {
          const catHabits = habits.filter(h => h.category === cat.id);
          if (catHabits.length === 0) return null;
          
          let catCheckins = 0;
          catHabits.forEach(h => {
             catCheckins += Object.values(checkins[h.id] || {}).filter(Boolean).length;
          });

          return (
            <div key={cat.id} className="stat-card" style={{ borderColor: `${cat.color}30` }}>
              <div className="stat-value" style={{ backgroundImage: `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)` }}>
                {catCheckins}
              </div>
              <div className="stat-label">{cat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
