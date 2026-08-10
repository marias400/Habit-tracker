import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, Circle, Flame, Star, Trophy, 
  TrendingUp, PlusCircle, Ban, ArrowRight,
  Edit3, Trash2, Share2
} from 'lucide-react';
import { useHabits } from '../contexts/HabitContext';
import { useGamification } from '../contexts/GamificationContext';
import { useToast } from '../components/ui/Toast';
import { CATEGORIES } from '../utils/constants';
import { todayKey } from '../utils/dateUtils';
import { generateWhatsAppLink } from '../utils/whatsappShare';

export default function Dashboard() {
  const { 
    habits, checkins, getTodayHabits, toggleCheckin, isCheckedIn, 
    getStreak, getTotalCheckins, getMaxStreak, deleteHabit 
  } = useHabits();
  const { points, level, levelProgress, onCheckin, checkMedals } = useGamification();
  const { addToast } = useToast();

  const todayHabits = useMemo(() => getTodayHabits(), [getTodayHabits]);
  const completedToday = useMemo(
    () => todayHabits.filter(h => isCheckedIn(h.id)).length,
    [todayHabits, isCheckedIn]
  );
  const totalToday = todayHabits.length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const maxStreak = getMaxStreak();
  const totalCheckins = getTotalCheckins();

  const goodHabits = todayHabits.filter(h => h.type !== 'bad');
  const badHabits = todayHabits.filter(h => h.type === 'bad');

  const handleCheckin = (habit) => {
    const wasChecked = isCheckedIn(habit.id);
    toggleCheckin(habit.id);
    
    if (!wasChecked) {
      const streak = getStreak(habit);
      const isAllComplete = completedToday + 1 === totalToday;
      const pts = onCheckin(habit, streak, isAllComplete);
      
      if (habit.type === 'bad') {
        addToast(`💪 ¡Resististe! +${pts} XP`, 'success');
      } else {
        addToast(`✅ ¡Check-in! +${pts} XP`, 'success');
      }
      
      if (isAllComplete) {
        addToast('🎉 ¡Todos los hábitos del día completados!', 'success');
      }
      
      setTimeout(() => checkMedals(), 100);
    }
  };

  const handleDelete = (habit) => {
    if (confirm(`¿Eliminar "${habit.name}"?`)) {
      deleteHabit(habit.id);
      addToast(`Hábito "${habit.name}" eliminado`, 'info');
    }
  };

  const handleShare = (habit) => {
    const streak = getStreak(habit);
    const url = generateWhatsAppLink(habit.name, streak);
    window.open(url, '_blank');
  };

  const getCategoryInfo = (catId) => CATEGORIES.find(c => c.id === catId) || { label: catId, color: '#8b5cf6' };

  return (
    <div>
      {/* Stats row */}
      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <div className="dashboard-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
            <TrendingUp size={22} style={{ color: 'var(--primary-400)' }} />
          </div>
          <div>
            <div className="dashboard-stat-value">{progressPercent}%</div>
            <div className="dashboard-stat-label">Progreso hoy</div>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
            <Flame size={22} style={{ color: 'var(--warning-400)' }} />
          </div>
          <div>
            <div className="dashboard-stat-value">{maxStreak}</div>
            <div className="dashboard-stat-label">Mejor racha</div>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <CheckCircle2 size={22} style={{ color: 'var(--success-500)' }} />
          </div>
          <div>
            <div className="dashboard-stat-value">{totalCheckins}</div>
            <div className="dashboard-stat-label">Check-ins totales</div>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon" style={{ background: 'rgba(236, 72, 153, 0.15)' }}>
            <Star size={22} style={{ color: '#ec4899' }} />
          </div>
          <div>
            <div className="dashboard-stat-value">{points}</div>
            <div className="dashboard-stat-label">Puntos XP</div>
          </div>
        </div>
      </div>

      {/* Progress overview */}
      <div className="card mb-6">
        <div className="card-header">
          <div>
            <h3 className="card-title">Progreso del día</h3>
            <p className="card-subtitle">{completedToday} de {totalToday} hábitos completados</p>
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-2xl)', 
            fontWeight: 800,
            color: progressPercent === 100 ? 'var(--success-500)' : 'var(--primary-400)'
          }}>
            {progressPercent === 100 ? '🎉' : `${progressPercent}%`}
          </div>
        </div>
        <div className="level-bar-track" style={{ height: '12px', borderRadius: '999px' }}>
          <div 
            className="level-bar-fill" 
            style={{ 
              width: `${progressPercent}%`,
              background: progressPercent === 100 
                ? 'var(--gradient-success)' 
                : 'var(--gradient-primary)',
              borderRadius: '999px',
            }} 
          />
        </div>
      </div>

      {/* Good habits */}
      {goodHabits.length > 0 && (
        <div className="mb-6">
          <div className="habit-list-header">
            <h3 className="habit-list-title">✅ Hábitos del día</h3>
            <span className="habit-list-count">
              {goodHabits.filter(h => isCheckedIn(h.id)).length}/{goodHabits.length}
            </span>
          </div>
          <div className="habit-list">
            {goodHabits.map(habit => {
              const checked = isCheckedIn(habit.id);
              const streak = getStreak(habit);
              const cat = getCategoryInfo(habit.category);
              return (
                <div
                  key={habit.id}
                  className={`habit-card${checked ? ' completed' : ''}`}
                  style={{ '--habit-color': cat.color }}
                >
                  <button
                    className={`habit-check${checked ? ' checked' : ''}`}
                    onClick={() => handleCheckin(habit)}
                    aria-label={checked ? 'Desmarcar' : 'Completar'}
                  >
                    {checked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </button>
                  <div className="habit-info">
                    <div className="habit-name">{habit.name}</div>
                    <div className="habit-meta">
                      <span className="habit-category" style={{ color: cat.color, background: `${cat.color}15` }}>
                        {cat.label}
                      </span>
                      {streak > 0 && (
                        <span className="habit-streak">
                          🔥 {streak} días
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="habit-actions">
                    <button 
                      className="habit-action-btn" 
                      onClick={() => handleShare(habit)}
                      title="Compartir por WhatsApp"
                    >
                      <Share2 size={16} />
                    </button>
                    <Link to={`/editar/${habit.id}`} className="habit-action-btn" title="Editar">
                      <Edit3 size={16} />
                    </Link>
                    <button 
                      className="habit-action-btn" 
                      onClick={() => handleDelete(habit)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bad habits */}
      {badHabits.length > 0 && (
        <div className="mb-6">
          <div className="habit-list-header">
            <h3 className="habit-list-title">🚫 Hábitos a evitar</h3>
            <span className="habit-list-count">
              {badHabits.filter(h => isCheckedIn(h.id)).length}/{badHabits.length} resistidos
            </span>
          </div>
          <div className="habit-list">
            {badHabits.map(habit => {
              const checked = isCheckedIn(habit.id);
              const streak = getStreak(habit);
              const cat = getCategoryInfo(habit.category);
              return (
                <div
                  key={habit.id}
                  className={`habit-card bad-habit${checked ? ' completed' : ''}`}
                  style={{ '--habit-color': '#ef4444' }}
                >
                  <button
                    className={`habit-check${checked ? ' bad-checked' : ''}`}
                    onClick={() => handleCheckin(habit)}
                    aria-label={checked ? 'Desmarcar' : 'Resistí hoy'}
                  >
                    {checked ? <Ban size={22} /> : <Circle size={22} />}
                  </button>
                  <div className="habit-info">
                    <div className="habit-name">{habit.name}</div>
                    <div className="habit-meta">
                      <span className="habit-category" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
                        Evitar
                      </span>
                      {streak > 0 && (
                        <span className="habit-streak">
                          💪 {streak} días sin hacerlo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="habit-actions">
                    <Link to={`/editar/${habit.id}`} className="habit-action-btn" title="Editar">
                      <Edit3 size={16} />
                    </Link>
                    <button 
                      className="habit-action-btn" 
                      onClick={() => handleDelete(habit)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {todayHabits.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🎯</span>
          <h3 className="empty-state-title">¡Empezá tu viaje!</h3>
          <p className="empty-state-desc">
            Todavía no tenés hábitos. Creá tu primer hábito para empezar a trackear tu progreso.
          </p>
          <Link to="/nuevo" className="btn btn-primary btn-lg">
            <PlusCircle size={20} />
            Crear primer hábito
          </Link>
        </div>
      )}

      {/* Level progress */}
      <div className="level-bar">
        <div className="level-bar-header">
          <span className="level-bar-name">
            Nv. {level.level} — {level.name}
          </span>
          <span className="level-bar-xp">{levelProgress}%</span>
        </div>
        <div className="level-bar-track">
          <div className="level-bar-fill" style={{ width: `${levelProgress}%` }} />
        </div>
      </div>
    </div>
  );
}
