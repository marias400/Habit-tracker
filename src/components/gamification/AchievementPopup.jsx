import { useGamification } from '../../contexts/GamificationContext';

export default function AchievementPopup() {
  const { pendingMedal, dismissMedal } = useGamification();

  if (!pendingMedal) return null;

  return (
    <div className="achievement-popup-overlay" onClick={dismissMedal}>
      <div className="achievement-popup" onClick={(e) => e.stopPropagation()}>
        <span className="achievement-popup-icon">{pendingMedal.icon}</span>
        <div className="achievement-popup-label">¡Nueva Medalla!</div>
        <h3 className="achievement-popup-title">{pendingMedal.name}</h3>
        <p className="achievement-popup-desc">{pendingMedal.description}</p>
        <button className="btn btn-primary btn-lg" onClick={dismissMedal}>
          ¡Genial! 🎉
        </button>
      </div>
    </div>
  );
}
