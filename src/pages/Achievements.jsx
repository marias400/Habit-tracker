import { Trophy, Star, Shield } from 'lucide-react';
import { useGamification } from '../contexts/GamificationContext';

export default function Achievements() {
  const { points, level, nextLevelXP, levelProgress, allMedals, isMedalEarned } = useGamification();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Logros y Nivel</h1>
          <p className="page-subtitle">Subí de nivel y ganá medallas por tu constancia</p>
        </div>
      </div>

      <div className="card mb-6" style={{ background: 'var(--gradient-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', minWidth: '150px' }}>
            <div className="streak-big-number">{level.level}</div>
            <div className="streak-big-label mt-2">Nivel Actual</div>
          </div>
          
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h3 className="card-title" style={{ color: 'var(--primary-400)' }}>{level.name}</h3>
            <p className="card-subtitle mb-4">¡Tenes {points} XP en total!</p>
            
            <div className="level-bar-track" style={{ height: '12px' }}>
              <div className="level-bar-fill" style={{ width: `${levelProgress}%` }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
              <span>Nv. {level.level}</span>
              <span>{nextLevelXP} XP para Nv. {level.level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      <h3 className="section-title">Tus Medallas</h3>
      <div className="medals-grid">
        {allMedals.map(medal => {
          const earned = isMedalEarned(medal.id);
          const medalColors = {
            bronze: '#CD7F32',
            silver: '#C0C0C0',
            gold: '#FFD700',
            diamond: '#06b6d4'
          };
          
          return (
            <div 
              key={medal.id} 
              className={`medal-card ${earned ? 'earned' : 'locked'}`}
              style={{ '--medal-color': medalColors[medal.tier] }}
            >
              <span className="medal-icon">{medal.icon}</span>
              <div className="medal-name" style={{ color: earned ? medalColors[medal.tier] : '' }}>
                {medal.name}
              </div>
              <div className="medal-description">{medal.description}</div>
              <div className="medal-tier" style={{ 
                background: earned ? `${medalColors[medal.tier]}20` : 'var(--bg-tertiary)',
                color: earned ? medalColors[medal.tier] : 'var(--text-muted)'
              }}>
                {medal.tier}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
