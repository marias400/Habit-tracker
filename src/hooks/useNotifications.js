import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para manejar notificaciones del navegador
 */
export function useNotifications() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') return;

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }, [permission]);

  const scheduleReminder = useCallback((habit, timeoutMs) => {
    if (permission !== 'granted') return null;

    const timerId = setTimeout(() => {
      const isGood = habit.type !== 'bad';
      sendNotification(
        isGood ? `¡Hora de ${habit.name}!` : `¡Resiste! No hagas: ${habit.name}`,
        {
          body: isGood
            ? `No pierdas tu racha de ${habit.streak || 0} días 🔥`
            : `Llevas ${habit.streak || 0} días resistiendo 💪`,
          tag: `habit-${habit.id}`,
        }
      );
    }, timeoutMs);

    return timerId;
  }, [permission, sendNotification]);

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
    isSupported: 'Notification' in window,
  };
}
