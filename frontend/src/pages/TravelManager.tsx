import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Plane, Hotel, MapPin, CheckCircle, Calendar, Users, DollarSign, Package, Briefcase, CreditCard } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import type { Trip, TripMember } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

export function TravelManager() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripMembers, setTripMembers] = useState<Record<string, TripMember[]>>({});
  const [loading, setLoading] = useState(true);
  const [showTripForm, setShowTripForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const [tripForm, setTripForm] = useState({
    name: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget: '',
    flights_booked: false,
    hotels_booked: false,
    activities_planned: false,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [tripsRes, membersRes] = await Promise.all([
        fetch(`${API_URL}/api/family/trips`, { headers }),
        fetch(`${API_URL}/api/family/trips/members`, { headers }),
      ]);
      const tripsData = await tripsRes.json();
      const membersData = await membersRes.json();
      
      setTrips(Array.isArray(tripsData) ? tripsData : []);
      if (Array.isArray(membersData)) {
        const grouped: Record<string, TripMember[]> = {};
        membersData.forEach((m: TripMember) => {
          if (!grouped[m.trip_id]) grouped[m.trip_id] = [];
          grouped[m.trip_id].push(m);
        });
        setTripMembers(grouped);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = editingTrip ? `${API_URL}/api/family/trips/${editingTrip.id}` : `${API_URL}/api/family/trips`;
      const method = editingTrip ? 'PUT' : 'POST';
      
      const res = await fetch(url, { method, headers, body: JSON.stringify(tripForm) });
      if (res.ok) {
        fetchData();
        resetTripForm();
      }
    } catch (error) {
      console.error('Error saving trip:', error);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('¿Eliminar este viaje?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/family/trips/${id}`, { method: 'DELETE', headers });
      setTrips(trips.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const toggleChecklistItem = async (memberId: string, itemIndex: number) => {
    const member = tripMembers[selectedTrip!]?.find(m => m.id === memberId);
    if (!member) return;
    
    const newChecklist = [...member.checklist];
    newChecklist[itemIndex] = { ...newChecklist[itemIndex], packed: !newChecklist[itemIndex].packed };
    
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/family/trips/members/${memberId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ checklist: newChecklist })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  const resetTripForm = () => {
    setShowTripForm(false);
    setEditingTrip(null);
    setTripForm({
      name: '',
      destination: '',
      start_date: '',
      end_date: '',
      budget: '',
      flights_booked: false,
      hotels_booked: false,
      activities_planned: false,
      notes: '',
    });
  };

  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-ES') : '-';
  
  const getTripDuration = (start?: string, end?: string) => {
    if (!start || !end) return 0;
    return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const upcomingTrips = trips.filter(t => t.start_date && new Date(t.start_date) >= new Date());
  const pastTrips = trips.filter(t => t.start_date && new Date(t.start_date) < new Date());

  const totalBudget = trips.reduce((sum, t) => sum + (t.budget || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestor de Viajes</h1>
          <p className="text-gray-500 text-sm">Vuelos, hoteles, actividades y presupuesto</p>
        </div>
        <button
          onClick={() => setShowTripForm(true)}
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors"
        >
          <Plus size={18} />
          Nuevo viaje
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Plane size={18} />
            <span className="text-sm">Viajes planned</span>
          </div>
          <p className="text-3xl font-bold">{trips.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Calendar size={18} />
            <span className="text-sm">Próximo</span>
          </div>
          <p className="text-xl font-bold text-gray-800">
            {upcomingTrips[0]?.name || 'Sin viajes'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <DollarSign size={18} />
            <span className="text-sm">Presupuesto total</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalBudget}€</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando...</div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Plane size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay viajes</p>
          <p className="text-sm text-gray-400">Planifica tu próxima vacaciones</p>
        </div>
      ) : (
        <div className="space-y-6">
          {upcomingTrips.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Próximos viajes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{trip.name}</h3>
                          <p className="text-sm text-gray-500">{trip.destination || 'Destino por definir'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingTrip(trip);
                            setTripForm({
                              name: trip.name,
                              destination: trip.destination || '',
                              start_date: trip.start_date || '',
                              end_date: trip.end_date || '',
                              budget: trip.budget?.toString() || '',
                              flights_booked: trip.flights_booked || false,
                              hotels_booked: trip.hotels_booked || false,
                              activities_planned: trip.activities_planned || false,
                              notes: trip.notes || '',
                            });
                            setShowTripForm(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] rounded-lg hover:bg-gray-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-600">
                          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                          {trip.start_date && trip.end_date && ` (${getTripDuration(trip.start_date, trip.end_date)} días)`}
                        </span>
                      </div>
                      {trip.budget && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign size={14} className="text-gray-400" />
                          <span className="text-gray-600">Presupuesto: {trip.budget}€</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mb-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trip.flights_booked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <Plane size={12} />
                        {trip.flights_booked ? 'Vuelos OK' : 'Sin vuelos'}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trip.hotels_booked ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <Hotel size={12} />
                        {trip.hotels_booked ? 'Hotel OK' : 'Sin hotel'}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${trip.activities_planned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <MapPin size={12} />
                        {trip.activities_planned ? 'Actividades OK' : 'Sin actividades'}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedTrip(trip.id)}
                      className="w-full py-2 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-colors"
                    >
                      Ver checklist de equipaje
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastTrips.length > 0 && (
            <div>
              <h2 className="font-semibold text-gray-500 mb-3">Viajes pasados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {pastTrips.map((trip) => (
                  <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gray-100 text-gray-500">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">{trip.name}</h3>
                        <p className="text-sm text-gray-500">{trip.destination}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showTripForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {editingTrip ? 'Editar viaje' : 'Nuevo viaje'}
              </h2>
              <form onSubmit={handleTripSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={tripForm.name}
                    onChange={(e) => setTripForm({ ...tripForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="Vacaciones verano 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
                  <input
                    type="text"
                    value={tripForm.destination}
                    onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="España, Francia..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                    <input
                      type="date"
                      value={tripForm.start_date}
                      onChange={(e) => setTripForm({ ...tripForm, start_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                    <input
                      type="date"
                      value={tripForm.end_date}
                      onChange={(e) => setTripForm({ ...tripForm, end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto (€)</label>
                  <input
                    type="number"
                    value={tripForm.budget}
                    onChange={(e) => setTripForm({ ...tripForm, budget: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    placeholder="1500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={tripForm.flights_booked}
                      onChange={(e) => setTripForm({ ...tripForm, flights_booked: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--color-primary)]"
                    />
                    Vuelos reservados
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={tripForm.hotels_booked}
                      onChange={(e) => setTripForm({ ...tripForm, hotels_booked: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--color-primary)]"
                    />
                    Hotel reservado
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={tripForm.activities_planned}
                      onChange={(e) => setTripForm({ ...tripForm, activities_planned: e.target.checked })}
                      className="w-4 h-4 rounded text-[var(--color-primary)]"
                    />
                    Actividades planned
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={tripForm.notes}
                    onChange={(e) => setTripForm({ ...tripForm, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetTripForm} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg">
                    {editingTrip ? 'Guardar' : 'Crear'}
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
