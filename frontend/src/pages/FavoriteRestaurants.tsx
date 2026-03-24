import { useState, useEffect } from 'react';
import { UtensilsCrossed, Plus, X, Star, MapPin, Phone, BookOpen, Trash2, Edit2 } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Restaurant {
  id: string;
  owner_id: number;
  name: string;
  address: string;
  phone: string;
  cuisine_type: string;
  rating: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export function FavoriteRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    cuisine_type: '',
    rating: 0,
    notes: ''
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/favorite-restaurants`, { headers });
      const data = await response.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      console.log('Saving restaurant:', form);
      
      let response;
      if (editingId) {
        response = await fetch(`${API_URL}/api/favorite-restaurants/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(`${API_URL}/api/favorite-restaurants`, {
          method: 'POST',
          headers,
          body: JSON.stringify(form)
        });
      }
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Error desconocido'));
        return;
      }
      
      setForm({ name: '', address: '', phone: '', cuisine_type: '', rating: 0, notes: '' });
      setShowModal(false);
      setEditingId(null);
      fetchRestaurants();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      alert('Error de conexión: ' + error);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setForm({
      name: restaurant.name,
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      cuisine_type: restaurant.cuisine_type || '',
      rating: restaurant.rating || 0,
      notes: restaurant.notes || ''
    });
    setEditingId(restaurant.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este restaurante?')) return;
    
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/favorite-restaurants/${id}`, {
        method: 'DELETE',
        headers
      });
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  };

  const openNewModal = () => {
    setForm({ name: '', address: '', phone: '', cuisine_type: '', rating: 0, notes: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const cuisineTypes = [
    'Española', 'Italiana', 'China', 'Japonesa', 'Mexicana', 'India',
    'Francesa', 'Americana', 'Tailandesa', 'Mediterránea', 'Argentina', 'Otro'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <UtensilsCrossed className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Restaurantes Favoritos</h1>
            <p className="text-gray-500 text-sm">Guarda tus restaurantes preferidos</p>
          </div>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          <span>Nuevo</span>
        </button>
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes restaurantes favoritos</p>
          <button
            onClick={openNewModal}
            className="mt-4 text-primary hover:underline"
          >
            Añadir tu primer restaurante
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{restaurant.name}</h3>
                  {restaurant.cuisine_type && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {restaurant.cuisine_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="p-1.5 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {restaurant.address && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{restaurant.phone}</span>
                  </div>
                )}
                {restaurant.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span>{restaurant.rating}/5</span>
                  </div>
                )}
                {restaurant.notes && (
                  <div className="flex items-start gap-2">
                    <BookOpen size={14} className="text-gray-400 mt-0.5" />
                    <span className="line-clamp-2">{restaurant.notes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Editar Restaurante' : 'Nuevo Restaurante'}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nombre del restaurante"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de cocina
                </label>
                <select
                  value={form.cuisine_type}
                  onChange={(e) => setForm({ ...form, cuisine_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">Seleccionar...</option>
                  {cuisineTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Dirección del restaurante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Teléfono de contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valoración
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className="p-1"
                    >
                      <Star
                        size={24}
                        className={star <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Notas sobre el restaurante..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  {editingId ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
