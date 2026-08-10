import { Moon, Sun, Bell, Volume2, ShieldAlert } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import { useToast } from '../components/ui/Toast';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { permission, requestPermission, isSupported } = useNotifications();
  const { addToast } = useToast();

  const handleNotificationToggle = async () => {
    if (permission === 'granted') {
      addToast('Las notificaciones ya están activas. Podés desactivarlas desde tu navegador.', 'info');
      return;
    }
    const granted = await requestPermission();
    if (granted) {
      addToast('Notificaciones activadas', 'success');
    } else {
      addToast('Permiso de notificaciones denegado', 'error');
    }
  };

  const handleClearData = () => {
    if (confirm('⚠️ ¿Estás SEGURO de querer borrar TODO tu progreso? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ajustes</h1>
          <p className="page-subtitle">Configurá la aplicación a tu gusto</p>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Apariencia</h3>
        <div className="settings-row">
          <div className="settings-info">
            <div className="settings-label">Modo Oscuro</div>
            <div className="settings-desc">Cambiar entre tema claro y oscuro</div>
          </div>
          <button 
            className={`toggle ${theme === 'dark' ? 'active' : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle modo oscuro"
          >
            <div className="toggle-knob flex-center" style={{ color: theme === 'dark' ? '#1a1425' : '#f59e0b' }}>
              {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
            </div>
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">Notificaciones</h3>
        <div className="settings-row">
          <div className="settings-info">
            <div className="settings-label">Recordatorios locales</div>
            <div className="settings-desc">
              {isSupported 
                ? `Estado: ${permission === 'granted' ? 'Activadas' : 'Desactivadas'}`
                : 'Tu navegador no soporta notificaciones'}
            </div>
          </div>
          <button 
            className={`toggle ${permission === 'granted' ? 'active' : ''}`}
            onClick={handleNotificationToggle}
            disabled={!isSupported}
          >
            <div className="toggle-knob flex-center">
              <Bell size={12} style={{ color: '#1a1425' }} />
            </div>
          </button>
        </div>
      </div>

      <div className="settings-section" style={{ borderColor: 'var(--danger-500)40' }}>
        <h3 className="section-title text-danger">Zona Peligrosa</h3>
        <div className="settings-row">
          <div className="settings-info">
            <div className="settings-label text-danger">Borrar todos los datos</div>
            <div className="settings-desc">Elimina todos los hábitos, check-ins y puntos guardados.</div>
          </div>
          <button className="btn btn-danger" onClick={handleClearData}>
            <ShieldAlert size={18} />
            Resetear App
          </button>
        </div>
      </div>
    </div>
  );
}
