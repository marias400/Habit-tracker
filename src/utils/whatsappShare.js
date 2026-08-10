/**
 * Genera el link de WhatsApp con mensaje de racha
 */
export function generateWhatsAppLink(habitName, streak, phone = '') {
  const message = `🔥 ¡Llevo ${streak} días seguidos con mi hábito "${habitName}"! ` +
    `Estoy usando Habit Tracker para mantener la constancia. 💪\n\n` +
    `¿Te sumás al desafío?`;
  
  const encodedMessage = encodeURIComponent(message);
  const baseUrl = phone ? `https://wa.me/${phone}` : 'https://wa.me/';
  return `${baseUrl}?text=${encodedMessage}`;
}

/**
 * Genera un mensaje de compartir genérico
 */
export function generateShareMessage(habitName, streak, points) {
  return `🔥 ¡${streak} días seguidos con "${habitName}"! ` +
    `Ya llevo ${points} puntos en Habit Tracker. 💪🏆`;
}
