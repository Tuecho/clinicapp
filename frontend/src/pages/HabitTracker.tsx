import { useState, useEffect } from 'react';
import { Plus, Check, Edit2, Trash2, ArrowLeft, ArrowRight, Target, Pill, Apple, BookOpen, Dumbbell, Moon, Coffee, Heart, Clock } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Habit {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  target_type: string;
  target_value: number;
  recurrence: string;
}

interface HabitLog {
  id: number;
  habit_id: number;
  date: string;
  value: number;
  completed: number;
}

const ICONS = [
  { key: 'pill', icon: Pill, label: 'Pastillas' },
  { key: 'apple', icon: Apple, label: 'Fruta' },
  { key: 'book', icon: BookOpen, label: 'Lectura' },
  { key: 'dumbbell', icon: Dumbbell, label: 'Ejercicio' },
  { key: 'moon', icon: Moon, label: 'Dormir' },
  { key: 'coffee', icon: Coffee, label: 'Desayuno' },
  { key: 'heart', icon: Heart, label: 'Salud' },
  { key: 'target', icon: Target, label: 'Otro' },
];

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

const RECURRENCE_OPTIONS = [
  { key: 'daily', label: 'Todos los días' },
  { key: 'weekdays', label: 'Lunes a viernes' },
  { key: 'weekends', label: 'Fines de semana' },
  { key: 'weekly', label: 'Una vez a la semana' },
];

function getDaysOfWeek(recurrence: string): number[] {
  switch (recurrence) {
    case 'daily': return [0, 1, 2, 3, 4, 5, 6];
    case 'weekdays': return [1, 2, 3, 4, 5];
    case 'weekends': return [0, 6];
    case 'weekly': return [];
    default: return [0, 1, 2, 3, 4, 5, 6];
  }
}

function shouldShowHabitToday(habit: Habit): boolean {
  const today = new Date().getDay();
  const days = getDaysOfWeek(habit.recurrence);
  return days.length === 0 || days.includes(today);
}

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<number, HabitLog>>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'pill',
    color: '#22c55e',
    target_type: 'boolean',
    target_value: 1,
    recurrence: 'daily'
  });

  const today = currentDate.toISOString().split('T')[0];

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    loadLogs();
  }, [currentDate]);

  const loadHabits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/habits`, { headers: getAuthHeaders() });
      const data = await res.json();
      setHabits(data);
    } catch (err) {
      console.error('Error loading habits:', err);
    }
  };

  const loadLogs = async () => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const res = await fetch(`${API_URL}/api/habits/logs?date=${dateStr}`, { headers: getAuthHeaders() });
      const data = await res.json();
      setLogs(data.logs || {});
    } catch (err) {
      console.error('Error loading logs:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHabit) {
        await fetch(`${API_URL}/api/habits/${editingHabit.id}`, {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`${API_URL}/api/habits`, {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setShowForm(false);
      setEditingHabit(null);
      setFormData({ name: '', description: '', icon: 'pill', color: '#22c55e', target_type: 'boolean', target_value: 1, recurrence: 'daily' });
      loadHabits();
    } catch (err) {
      console.error('Error saving habit:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este hábito?')) return;
    try {
      await fetch(`${API_URL}/api/habits/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      loadHabits();
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const toggleHabit = async (habit: Habit) => {
    const existingLog = logs[habit.id];
    const isCompleted = existingLog?.completed === 1;
    
    try {
      if (isCompleted) {
        await fetch(`${API_URL}/api/habits/${habit.id}/log`, {
          method: 'DELETE',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today })
        });
      } else {
        await fetch(`${API_URL}/api/habits/${habit.id}/log`, {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today, value: 1, completed: true })
        });
      }
      loadLogs();
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const isToday = currentDate.toDateString() === new Date().toDateString();

  const getIcon = (iconKey: string) => {
    const iconObj = ICONS.find(i => i.key === iconKey);
    return iconObj ? iconObj.icon : Target;
  };

  const visibleHabits = habits.filter(shouldShowHabitToday);
  const completedCount = visibleHabits.filter(h => logs[h.id]?.completed === 1).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hábitos Diarios</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isToday 
              ? `${completedCount}/${visibleHabits.length} completados hoy`
              : currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
            }
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span>Nuevo Hábito</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <span className="text-lg font-semibold">{today}</span>
            {isToday && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Hoy</span>}
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {visibleHabits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Target size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay hábitos para hoy</p>
          <p className="text-gray-400 text-sm mt-1">Crea un hábito que se repita diariamente</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-primary hover:underline"
          >
            Crear hábito
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {visibleHabits.map(habit => {
            const log = logs[habit.id];
            const isCompleted = log?.completed === 1;
            const IconComponent = getIcon(habit.icon || 'pill');
            const recurrenceLabel = RECURRENCE_OPTIONS.find(r => r.key === habit.recurrence)?.label || 'Diario';
            
            return (
              <div
                key={habit.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 transition-all ${
                  isCompleted ? 'bg-green-50 border-green-200' : ''
                }`}
              >
                <button
                  onClick={() => toggleHabit(habit)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {isCompleted ? <Check size={24} /> : <IconComponent size={24} />}
                </button>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${isCompleted ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {recurrenceLabel}
                    </span>
                    {habit.description && (
                      <span>{habit.description}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingHabit(habit);
                      setFormData({
                        name: habit.name,
                        description: habit.description || '',
                        icon: habit.icon || 'pill',
                        color: habit.color,
                        target_type: habit.target_type,
                        target_value: habit.target_value,
                        recurrence: habit.recurrence
                      });
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingHabit ? 'Editar Hábito' : 'Nuevo Hábito'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ej: Tomar vitaminas"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ej: 3 pastillas al día"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                <div className="grid grid-cols-4 gap-2">
                  {ICONS.map(ic => (
                    <button
                      key={ic.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: ic.key })}
                      className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                        formData.icon === ic.key 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ic.icon size={20} />
                      <span className="text-xs">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repetición</label>
                <div className="grid grid-cols-2 gap-2">
                  {RECURRENCE_OPTIONS.map(rec => (
                    <button
                      key={rec.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, recurrence: rec.key })}
                      className={`p-3 rounded-lg text-sm transition-all ${
                        formData.recurrence === rec.key 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        formData.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHabit(null);
                    setFormData({ name: '', description: '', icon: 'pill', color: '#22c55e', target_type: 'boolean', target_value: 1, recurrence: 'daily' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingHabit ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
