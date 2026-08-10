import jsPDF from 'jspdf';

/**
 * Exporta las estadísticas de hábitos a PDF
 */
export async function exportStatsToPDF(habits, checkins, stats) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 20;

  // Título
  pdf.setFontSize(22);
  pdf.setTextColor(124, 58, 237); // Violeta
  pdf.text('Habit Tracker — Reporte de Estadísticas', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Fecha
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  const today = new Date();
  pdf.text(`Generado el ${today.toLocaleDateString('es-AR')}`, pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Resumen general
  pdf.setFontSize(16);
  pdf.setTextColor(30);
  pdf.text('Resumen General', 20, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.setTextColor(60);
  const summaryItems = [
    `Total de hábitos activos: ${habits.length}`,
    `Check-ins totales: ${stats.totalCheckins}`,
    `Puntos acumulados: ${stats.totalPoints}`,
    `Nivel actual: ${stats.level?.name || 'Principiante'}`,
    `Mejor racha: ${stats.maxStreak} días`,
    `Medallas obtenidas: ${stats.earnedMedals?.length || 0}`,
  ];

  for (const item of summaryItems) {
    pdf.text(`• ${item}`, 25, y);
    y += 7;
  }
  y += 10;

  // Detalle por hábito
  pdf.setFontSize(16);
  pdf.setTextColor(30);
  pdf.text('Detalle por Hábito', 20, y);
  y += 10;

  for (const habit of habits) {
    if (y > 260) {
      pdf.addPage();
      y = 20;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(habit.type === 'bad' ? 239 : 16, habit.type === 'bad' ? 68 : 185, habit.type === 'bad' ? 68 : 129);
    const typeLabel = habit.type === 'bad' ? '🚫' : '✅';
    pdf.text(`${typeLabel} ${habit.name}`, 25, y);
    y += 7;

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    
    const habitCheckins = checkins[habit.id] || {};
    const completedDays = Object.values(habitCheckins).filter(Boolean).length;
    
    pdf.text(`Categoría: ${habit.category} | Frecuencia: ${habit.frequency}`, 30, y);
    y += 6;
    pdf.text(`Días completados: ${completedDays} | Racha actual: ${habit.streak || 0} días`, 30, y);
    y += 10;
  }

  // Guardar
  pdf.save('habit-tracker-estadisticas.pdf');
}
