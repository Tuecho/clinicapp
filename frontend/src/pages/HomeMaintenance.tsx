import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle, Calendar, Wrench, Car, Wind, Clock, CheckCircle } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import type { MaintenanceTask } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function HomeMaintenance() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    frequency_days: 365,
    last_completed: '',
    estimated_cost: '',
    notes: '',
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/home/maintenance`, { headers });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingTask ? `${API_URL}/api/home/maintenance/${editingTask.id}` : `${API_URL}/api/home/maintenance`;
      const method = editingTask ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
      if (res.ok) {
        fetchTasks();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea de mantenimiento?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/home/maintenance/${id}`, { method: 'DELETE', headers });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const markComplete = async (task: MaintenanceTask) => {
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/home/maintenance/${task.id}/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ last_completed: new Date().toISOString().split('T')[0] })
      });
      fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({
      name: '',
      type: '',
      frequency_days: 365,
      last_completed: '',
      estimated_cost: '',
      notes: '',
    });
  };

  const getDaysUntilDue = (task: MaintenanceTask) => {
    if (!task.last_completed) return -999;
    const last = new Date(task.last_completed);
    const next = new Date(last.getTime() + task.frequency_days * 24 * 60 * 60 * 1000);
    const now = new Date();
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getTypeIcon = (type: string) => {
    if (!type) return <Calendar size={18} />;
    switch (type.toLowerCase()) {
      case 'caldera': return <Wrench size={18} />;
      case 'filtros': return <Wind size={18} />;
      case 'itv': return <Car size={18} />;
      default: return <Calendar size={18} />;
    }
  };

  const getTypeLabel = (type: string) => {
    if (!type) return 'Sin tipo';
    const labels: Record<string, string> = {
      caldera: 'Caldera',
      filtros: 'Filtros A/C',
      itv: 'ITV Vehículo',
    };
    if (labels[type.toLowerCase()]) {
      return labels[type.toLowerCase()];
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const urgentTasks = tasks.filter(t => getDaysUntilDue(t) <= 30 && getDaysUntilDue(t) > 0);
  const overdueTasks = tasks.filter(t => getDaysUntilDue(t) <= 0);
  const upcomingTasks = tasks.filter(t => getDaysUntilDue(t) > 30);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mantenimiento del Hogar</h1>
          <p className="text-gray-500 text-sm">Tareas recurrentes y recordatorios</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Nueva tarea
        </button>
      </div>

      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-red-800">{overdueTasks.length} tarea(s) atrasada(s)</p>
            <p className="text-sm text-red-700">
              {overdueTasks.map(t => `${t.name} (${Math.abs(getDaysUntilDue(t))} días)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {urgentTasks.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-amber-800">{urgentTasks.length} tarea(s) pendiente(s) pronto</p>
            <p className="text-sm text-amber-700">
              {urgentTasks.map(t => `${t.name} (${getDaysUntilDue(t)} días)`).join(', ')}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Wrench size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay tareas de mantenimiento</p>
          <p className="text-sm text-gray-400">Añade tareas como revisión de caldera, ITV...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {overdueTasks.length > 0 && (
            <div>
              <h2 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} />
                Atrasadas
              </h2>
              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onMarkComplete={markComplete} onDelete={handleDelete} onEdit={(t) => {
                    setEditingTask(t);
                    setFormData({
                      name: t.name,
                      type: t.type,
                      frequency_days: t.frequency_days,
                      last_completed: t.last_completed || '',
                      estimated_cost: t.estimated_cost?.toString() || '',
                      notes: t.notes || '',
                    });
                    setShowForm(true);
                  }} daysUntilDue={getDaysUntilDue(task)} getTypeIcon={getTypeIcon} getTypeLabel={getTypeLabel} />
                ))}
              </div>
            </div>
          )}

          {urgentTasks.length > 0 && (
            <div>
              <h2 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <Clock size={18} />
                Próximas (30 días)
              </h2>
              <div className="space-y-3">
                {urgentTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onMarkComplete={markComplete} onDelete={handleDelete} onEdit={(t) => {
                    setEditingTask(t);
                    setFormData({
                      name: t.name,
                      type: t.type,
                      frequency_days: t.frequency_days,
                      last_completed: t.last_completed || '',
                      estimated_cost: t.estimated_cost?.toString() || '',
                      notes: t.notes || '',
                    });
                    setShowForm(true);
                  }} daysUntilDue={getDaysUntilDue(task)} getTypeIcon={getTypeIcon} getTypeLabel={getTypeLabel} />
                ))}
              </div>
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div>
              <h2 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <Calendar size={18} />
                Próximamente
              </h2>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onMarkComplete={markComplete} onDelete={handleDelete} onEdit={(t) => {
                    setEditingTask(t);
                    setFormData({
                      name: t.name,
                      type: t.type,
                      frequency_days: t.frequency_days,
                      last_completed: t.last_completed || '',
                      estimated_cost: t.estimated_cost?.toString() || '',
                      notes: t.notes || '',
                    });
                    setShowForm(true);
                  }} daysUntilDue={getDaysUntilDue(task)} getTypeIcon={getTypeIcon} getTypeLabel={getTypeLabel} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingTask ? 'Editar tarea' : 'Nueva tarea de mantenimiento'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Revisión caldera, ITV..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <input
                    type="text"
                    list="maintenance-types"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Escribe o selecciona un tipo"
                  />
                  <datalist id="maintenance-types">
                    <option value="caldera" />
                    <option value="filtros" />
                    <option value="itv" />
                    <option value="otro" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia (días)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.frequency_days}
                    onChange={(e) => setFormData({ ...formData, frequency_days: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última vez completado</label>
                  <input
                    type="date" lang="es"
                    value={formData.last_completed}
                    onChange={(e) => setFormData({ ...formData, last_completed: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coste estimado (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {editingTask ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskCard({ 
  task, 
  onMarkComplete, 
  onDelete, 
  onEdit, 
  daysUntilDue, 
  getTypeIcon, 
  getTypeLabel 
}: { 
  task: MaintenanceTask;
  onMarkComplete: (t: MaintenanceTask) => void;
  onDelete: (id: string) => void;
  onEdit: (t: MaintenanceTask) => void;
  daysUntilDue: number;
  getTypeIcon: (type: string) => JSX.Element;
  getTypeLabel: (type: string) => string;
}) {
  const isOverdue = daysUntilDue <= 0;
  const isUrgent = daysUntilDue > 0 && daysUntilDue <= 30;

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between ${
      isOverdue ? 'border-red-200 bg-red-50' : isUrgent ? 'border-amber-200 bg-amber-50' : 'border-gray-100'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${
          isOverdue ? 'bg-red-100 text-red-600' : isUrgent ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {getTypeIcon(task.type)}
        </div>
        <div>
          <h3 className="font-medium text-gray-800">{task.name}</h3>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{getTypeLabel(task.type)}</span>
            {task.estimated_cost && (
              <span className="text-gray-500">~{task.estimated_cost}€</span>
            )}
            <span className={isOverdue ? 'text-red-600 font-medium' : isUrgent ? 'text-amber-600 font-medium' : 'text-gray-500'}>
              {isOverdue ? `Atrasado ${Math.abs(daysUntilDue)} días` : `En ${daysUntilDue} días`}
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onMarkComplete(task)}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Marcar completado"
        >
          <CheckCircle size={18} />
        </button>
        <button
          onClick={() => onEdit(task)}
          className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
