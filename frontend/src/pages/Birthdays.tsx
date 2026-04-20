import { useState, useEffect } from 'react';
import { Cake, Plus, Trash2, Edit2, X, Calendar } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Birthday {
  id: number;
  owner_id: number;
  name: string;
  birthdate: string;
}

export function Birthdays() {
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', birthdate: '' });

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const fetchBirthdays = async () => {
    try {
      const res = await fetch(`${API_URL}/api/birthdays`, { headers: getAuthHeaders() });
      const data = await res.json();
      setBirthdays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingBirthdays = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return birthdays.map(b => {
      const birthDate = new Date(b.birthdate);
      const birthMonth = birthDate.getMonth();
      const birthDay = birthDate.getDate();
      
      let nextBirthday = new Date(currentYear, birthMonth, birthDay);
      if (nextBirthday < today) {
        nextBirthday = new Date(currentYear + 1, birthMonth, birthDay);
      }
      
      const daysUntil = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const ageAtBirthday = nextBirthday.getFullYear() - birthDate.getFullYear();
      
      return { ...b, nextBirthday, daysUntil, ageAtBirthday };
    }).sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.birthdate) return;

    try {
      if (editingId) {
        await fetch(`${API_URL}/api/birthdays/${editingId}`, {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, birthdate: form.birthdate })
        });
      } else {
        await fetch(`${API_URL}/api/birthdays`, {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, birthdate: form.birthdate })
        });
      }
      setForm({ name: '', birthdate: '' });
      setEditingId(null);
      setShowModal(false);
      fetchBirthdays();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (b: Birthday) => {
    setForm({ name: b.name, birthdate: b.birthdate });
    setEditingId(b.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este cumpleaños?')) return;
    try {
      await fetch(`${API_URL}/api/birthdays/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      fetchBirthdays();
    } catch (err) {
      console.error(err);
    }
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  const isToday = (daysUntil: number) => daysUntil === 0;
  const isSoon = (daysUntil: number) => daysUntil <= 30;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
              <Cake size={20} className="text-pink-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Cumpleaños</h1>
              <p className="text-sm text-gray-500">No olvides los cumpleaños de tu familia y amigos</p>
            </div>
          </div>
          <button
            onClick={() => { setForm({ name: '', birthdate: '' }); setEditingId(null); setShowModal(true); }}
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Cargando...</div>
        ) : birthdays.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎂</span>
            </div>
            <p className="text-gray-500 font-medium mb-2">No hay cumpleaños registrados</p>
            <p className="text-sm text-gray-400 mb-4">Añade el primer cumpleaños</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              Añadir Cumpleaños
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingBirthdays.map((b) => (
              <div
                key={b.id}
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  isToday(b.daysUntil)
                    ? 'bg-pink-50 border-pink-200'
                    : isSoon(b.daysUntil)
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                } transition-colors`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isToday(b.daysUntil) ? 'bg-pink-500' : 'bg-pink-100'
                }`}>
                  <Cake size={20} className={isToday(b.daysUntil) ? 'text-white' : 'text-pink-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{b.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(b.birthdate)} • Cumple {b.ageAtBirthday} años
                  </p>
                </div>
                <div className="text-right">
                  {isToday(b.daysUntil) ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-500 text-white rounded-full text-sm font-medium">
                      🎉 Hoy!
                    </span>
                  ) : (
                    <p className="text-sm font-medium text-gray-600">
                      {b.daysUntil === 1 ? 'Mañana' : `${b.daysUntil} días`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Editar' : 'Añadir'} Cumpleaños
              </h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Nombre de la persona"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {editingId ? 'Guardar' : 'Añadir'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}