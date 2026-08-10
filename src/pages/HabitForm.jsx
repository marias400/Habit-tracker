import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useHabits } from '../contexts/HabitContext';
import { useToast } from '../components/ui/Toast';
import { CATEGORIES, FREQUENCIES, DAYS_OF_WEEK, HABIT_TYPES } from '../utils/constants';

export default function HabitForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addHabit, updateHabit, allHabits } = useHabits();
  const { addToast } = useToast();
  const isEditing = !!id;

  const [form, setForm] = useState({
    name: '',
    category: 'salud',
    frequency: 'diario',
    type: 'good',
    weekDay: 1,
    customDays: [],
    reminderTime: '',
  });

  useEffect(() => {
    if (isEditing) {
      const habit = allHabits.find(h => h.id === id);
      if (habit) {
        setForm({
          name: habit.name,
          category: habit.category,
          frequency: habit.frequency,
          type: habit.type,
          weekDay: habit.weekDay ?? 1,
          customDays: habit.customDays ?? [],
          reminderTime: habit.reminderTime || '',
        });
      }
    }
  }, [id, isEditing, allHabits]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCustomDay = (dayId) => {
    setForm(prev => ({
      ...prev,
      customDays: prev.customDays.includes(dayId)
        ? prev.customDays.filter(d => d !== dayId)
        : [...prev.customDays, dayId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.name.trim()) {
      addToast('El nombre del hábito es obligatorio', 'error');
      return;
    }

    if (isEditing) {
      updateHabit(id, form);
      addToast(`Hábito "${form.name}" actualizado`, 'success');
    } else {
      addHabit(form);
      addToast(`Hábito "${form.name}" creado 🎉`, 'success');
    }
    
    navigate('/');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Volver
          </button>
          <h1 className="page-title mt-4">
            {isEditing ? 'Editar Hábito' : 'Nuevo Hábito'}
          </h1>
          <p className="page-subtitle">
            {isEditing
              ? 'Modificá los detalles de tu hábito'
              : 'Definí un nuevo hábito para trackear'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-6">
          {/* Nombre */}
          <div className="form-group">
            <label className="form-label" htmlFor="habit-name">Nombre del hábito</label>
            <input
              id="habit-name"
              type="text"
              className="form-input"
              placeholder="Ej: Meditar 10 minutos"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              autoFocus
            />
          </div>

          {/* Tipo */}
          <div className="form-group">
            <label className="form-label">Tipo de hábito</label>
            <div className="tabs" style={{ maxWidth: '400px' }}>
              <button
                type="button"
                className={`tab${form.type === 'good' ? ' active' : ''}`}
                onClick={() => handleChange('type', 'good')}
              >
                ✅ Bueno
              </button>
              <button
                type="button"
                className={`tab${form.type === 'bad' ? ' active' : ''}`}
                onClick={() => handleChange('type', 'bad')}
              >
                🚫 Malo (dejar de hacer)
              </button>
            </div>
            {form.type === 'bad' && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                Los hábitos malos se marcan cuando <strong>resististe</strong> la tentación.
              </p>
            )}
          </div>

          {/* Categoría */}
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <div className="form-checkbox-group">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`form-checkbox-btn${form.category === cat.id ? ' selected' : ''}`}
                  onClick={() => handleChange('category', cat.id)}
                  style={form.category === cat.id ? {} : { borderColor: `${cat.color}40` }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Frecuencia */}
          <div className="form-group">
            <label className="form-label" htmlFor="habit-frequency">Frecuencia</label>
            <select
              id="habit-frequency"
              className="form-select"
              value={form.frequency}
              onChange={(e) => handleChange('frequency', e.target.value)}
            >
              {FREQUENCIES.map(freq => (
                <option key={freq.id} value={freq.id}>{freq.label}</option>
              ))}
            </select>
          </div>

          {/* Día de la semana (semanal) */}
          {form.frequency === 'semanal' && (
            <div className="form-group">
              <label className="form-label">¿Qué día?</label>
              <div className="form-checkbox-group">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    className={`form-checkbox-btn${form.weekDay === day.id ? ' selected' : ''}`}
                    onClick={() => handleChange('weekDay', day.id)}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Días personalizados */}
          {form.frequency === 'personalizado' && (
            <div className="form-group">
              <label className="form-label">¿Qué días?</label>
              <div className="form-checkbox-group">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.id}
                    type="button"
                    className={`form-checkbox-btn${form.customDays.includes(day.id) ? ' selected' : ''}`}
                    onClick={() => toggleCustomDay(day.id)}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hora de recordatorio */}
          <div className="form-group">
            <label className="form-label" htmlFor="habit-reminder">
              Hora de recordatorio (opcional)
            </label>
            <input
              id="habit-reminder"
              type="time"
              className="form-input"
              value={form.reminderTime}
              onChange={(e) => handleChange('reminderTime', e.target.value)}
              style={{ maxWidth: '200px' }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={20} />
            {isEditing ? 'Guardar cambios' : 'Crear hábito'}
          </button>
          <button 
            type="button" 
            className="btn btn-ghost btn-lg"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
