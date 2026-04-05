import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Calendar, Clock, MapPin, User, DollarSign, Phone, BookOpen } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import type { ExtraSchool } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function ExtraSchoolManager() {
  const [activities, setActivities] = useState<ExtraSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ExtraSchool | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    activity: '',
    schedule: '',
    location: '',
    teacher_name: '',
    teacher_contact: '',
    monthly_price: '',
    payment_due_day: '1',
    material_needed: '',
    notes: '',
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/education/extracurriculars`, { headers });
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingActivity ? `${API_URL}/api/education/extracurriculars/${editingActivity.id}` : `${API_URL}/api/education/extracurriculars`;
      const method = editingActivity ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(formData) });
      if (res.ok) {
        fetchActivities();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta actividad?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/education/extracurriculars/${id}`, { method: 'DELETE', headers });
      setActivities(activities.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingActivity(null);
    setFormData({
      name: '',
      activity: '',
      schedule: '',
      location: '',
      teacher_name: '',
      teacher_contact: '',
      monthly_price: '',
      payment_due_day: '1',
      material_needed: '',
      notes: '',
    });
  };

  const totalMonthly = activities.reduce((sum, a) => sum + (a.monthly_price || 0), 0);
  const daysUntilPayment = (day: number) => {
    const today = new Date();
    const dueDay = new Date(today.getFullYear(), today.getMonth(), day);
    if (dueDay < today) {
      dueDay.setMonth(dueDay.getMonth() + 1);
    }
    return Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const dueSoon = activities.filter(a => a.payment_due_day && daysUntilPayment(a.payment_due_day) <= 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Actividades Extraescolares</h1>
          <p className="text-gray-500 text-sm">Horarios, pagos, contacto de profesores</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Nueva actividad
        </button>
      </div>

      {dueSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <DollarSign className="text-amber-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-amber-800">Pago(s) próximo(s)</p>
            <p className="text-sm text-amber-700">
              {dueSoon.map(a => `${a.name}: día ${a.payment_due_day}`).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <BookOpen size={18} />
            <span className="text-sm">Actividades</span>
          </div>
          <p className="text-3xl font-bold">{activities.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <DollarSign size={18} />
            <span className="text-sm">Gasto mensual</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalMonthly}€</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Calendar size={18} />
            <span className="text-sm">Gasto anual</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{(totalMonthly * 12).toFixed(0)}€</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay actividades extraescolares</p>
          <p className="text-sm text-gray-400">Añade clases de música, deportes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{activity.name}</h3>
                  <p className="text-sm text-gray-500">{activity.activity}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingActivity(activity);
                      setFormData({
                        name: activity.name,
                        activity: activity.activity,
                        schedule: activity.schedule || '',
                        location: activity.location || '',
                        teacher_name: activity.teacher_name || '',
                        teacher_contact: activity.teacher_contact || '',
                        monthly_price: activity.monthly_price?.toString() || '',
                        payment_due_day: activity.payment_due_day?.toString() || '1',
                        material_needed: activity.material_needed || '',
                        notes: activity.notes || '',
                      });
                      setShowForm(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {activity.schedule && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>{activity.schedule}</span>
                  </div>
                )}
                {activity.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{activity.location}</span>
                  </div>
                )}
                {activity.teacher_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} className="text-gray-400" />
                    <span>{activity.teacher_name}</span>
                  </div>
                )}
                {activity.teacher_contact && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{activity.teacher_contact}</span>
                  </div>
                )}
              </div>

              {activity.monthly_price && (
                <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-2 mb-2">
                  <span className="text-sm text-indigo-700">Mensual</span>
                  <span className="font-bold text-indigo-700">{activity.monthly_price}€</span>
                </div>
              )}

              {activity.material_needed && (
                <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-2">
                  <strong>Material:</strong> {activity.material_needed}
                </div>
              )}

              {activity.notes && (
                <p className="mt-2 text-sm text-gray-500">{activity.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingActivity ? 'Editar actividad' : 'Nueva actividad'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Pablo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
                    <input
                      type="text"
                      required
                      value={formData.activity}
                      onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Piano, Fútbol..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horario</label>
                  <input
                    type="text"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Lunes 17:00-18:00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Calle Mayor 5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
                    <input
                      type="text"
                      value={formData.teacher_name}
                      onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                    <input
                      type="text"
                      value={formData.teacher_contact}
                      onChange={(e) => setFormData({ ...formData, teacher_contact: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="Teléfono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio mensual (€)</label>
                    <input
                      type="number"
                      value={formData.monthly_price}
                      onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Día de pago</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formData.payment_due_day}
                      onChange={(e) => setFormData({ ...formData, payment_due_day: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material necesario</label>
                  <input
                    type="text"
                    value={formData.material_needed}
                    onChange={(e) => setFormData({ ...formData, material_needed: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Cuaderno, uniforme..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    {editingActivity ? 'Guardar' : 'Crear'}
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
