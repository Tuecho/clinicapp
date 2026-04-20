import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, X, Check, Phone, Mail,
  Clock, Stethoscope, AlertCircle, ChevronDown, ChevronUp, Calendar, Users
} from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string;
  bio: string;
  active: number;
}

interface Specialty {
  id: string;
  name: string;
  description: string;
}

interface Schedule {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start: string;
  break_end: string;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function Professionals() {
  const [activeTab, setActiveTab] = useState<'professionals' | 'specialties' | 'schedules'>('professionals');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedProfessional, setExpandedProfessional] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: [] as string[],
    bio: ''
  });

  const [specialtyForm, setSpecialtyForm] = useState({
    name: '',
    description: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    professional_id: '',
    day_of_week: 0,
    start_time: '09:00',
    end_time: '17:00',
    break_start: '12:00',
    break_end: '13:00'
  });

  const [editingSpecialtyId, setEditingSpecialtyId] = useState<string | null>(null);
  const [specialtyForm, setSpecialtyForm] = useState({
    name: '',
    description: ''
  });

  const [scheduleForm, setScheduleForm] = useState({

  useEffect(() => {
    loadProfessionals();
    loadSpecialties();
    loadSchedules();
  }, []);

  const loadProfessionals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/professionals`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data);
      }
    } catch (err) {
      console.error('Error loading professionals:', err);
    }
  };

  const loadSpecialties = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/specialties`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSpecialties(data);
      }
    } catch (err) {
      console.error('Error loading specialties:', err);
    }
  };

  const loadSchedules = async () => {
    try {
      const response = await fetch(`${API_URL}/api/professional-schedules`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  const handleSaveProfessional = async () => {
    if (!formData.name || !formData.email || formData.specialties.length === 0) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const url = editingId
        ? `${API_URL}/api/professionals/${editingId}`
        : `${API_URL}/api/professionals`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          ...formData,
          specialties: formData.specialties.join(','),
          active: 1
        })
      });

      if (response.ok) {
        setFormData({ name: '', email: '', phone: '', specialties: [], bio: '' });
        setShowForm(false);
        setEditingId(null);
        await loadProfessionals();
        setError('');
      } else {
        setError('Error al guardar profesional');
      }
    } catch (err) {
      setError('Error al guardar profesional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    if (!confirm('¿Estás segura de que deseas eliminar este profesional?')) return;

    try {
      const response = await fetch(`${API_URL}/api/clinic/professionals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadProfessionals();
      } else {
        const data = await response.json();
        setError(data.error || 'Error al eliminar profesional');
      }
    } catch (err) {
      console.error('Error deleting professional:', err);
      setError('Error al eliminar profesional');
    }
  };

  const handleSaveSpecialty = async () => {
    if (!specialtyForm.name) {
      setError('El nombre de la especialidad es requerido');
      return;
    }

    setLoading(true);
    try {
      const url = editingSpecialtyId
        ? `${API_URL}/api/clinic/specialties/${editingSpecialtyId}`
        : `${API_URL}/api/clinic/specialties`;

      const method = editingSpecialtyId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(specialtyForm)
      });

      if (response.ok) {
        setSpecialtyForm({ name: '', description: '' });
        setEditingSpecialtyId(null);
        await loadSpecialties();
        setError('');
      } else {
        setError('Error al guardar especialidad');
      }
    } catch (err) {
      setError('Error al guardar especialidad');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.professional_id || !scheduleForm.start_time || !scheduleForm.end_time) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/professional-schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(scheduleForm)
      });

      if (response.ok) {
        setScheduleForm({
          professional_id: '',
          day_of_week: 0,
          start_time: '09:00',
          end_time: '17:00',
          break_start: '12:00',
          break_end: '13:00'
        });
        await loadSchedules();
        setError('');
      } else {
        setError('Error al guardar horario');
      }
    } catch (err) {
      setError('Error al guardar horario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    if (!confirm('¿Estás segura de que deseas eliminar esta especialidad?')) return;

    try {
      const response = await fetch(`${API_URL}/api/clinic/specialties/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadSpecialties();
      }
    } catch (err) {
      console.error('Error deleting specialty:', err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('¿Estás segura de que deseas eliminar este horario?')) return;

    try {
      const response = await fetch(`${API_URL}/api/professional-schedules/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        await loadSchedules();
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
    }
  };

  const getProfessionalSchedules = (professionalId: string) => {
    return schedules.filter(s => s.professional_id === professionalId);
  };

  const getProfessionalSpecialties = (specialtiesStr: string, allSpecialties: Specialty[]) => {
    if (!specialtiesStr) return [];
    const names = specialtiesStr.split(',').map(s => s.trim());
    return allSpecialties.filter(s => names.includes(s.name));
  };

  const toggleSpecialty = (specialtyId: string) => {
    setFormData(prev => {
      const current = prev.specialties;
      if (current.includes(specialtyId)) {
        return { ...prev, specialties: current.filter(id => id !== specialtyId) };
      } else {
        return { ...prev, specialties: [...current, specialtyId] };
      }
    });
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Profesionales</h1>
          </div>
          <Plus
            className="w-6 h-6 cursor-pointer text-blue-600 hover:text-blue-700"
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setFormData({ name: '', email: '', phone: '', specialties: [], bio: '' });
                setEditingId(null);
              }
            }}
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          {['professionals', 'specialties', 'schedules'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'professionals' && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Profesionales
                </div>
              )}
              {tab === 'specialties' && (
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Especialidades
                </div>
              )}
              {tab === 'schedules' && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Horarios
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Professionals Tab */}
        {activeTab === 'professionals' && (
          <div>
            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">
                  {editingId ? 'Editar Profesional' : 'Agregar Profesional'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidades
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specialties.map((specialty) => (
                      <label
                        key={specialty.id}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                          formData.specialties.includes(specialty.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.specialties.includes(specialty.id)}
                          onChange={() => toggleSpecialty(specialty.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm">{specialty.name}</span>
                      </label>
                    ))}
                  </div>
                  {specialties.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No hay especialidades disponibles. Crea una en la pestaña Especialidades.
                    </p>
                  )}
                </div>

                <textarea
                  placeholder="Biografía"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfessional}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    <Check className="w-4 h-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ name: '', email: '', phone: '', specialties: [], bio: '' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professionals.map((prof) => (
                <div key={prof.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{prof.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{prof.specialties}</p>
                      </div>
                      <div className="flex gap-2">
                        <Edit
                          className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-700"
                          onClick={() => {
                            const profSpecialties = prof.specialties
                              ? prof.specialties.split(',').map(s => s.trim())
                              : [];
                            const matchingIds = specialties
                              .filter(s => profSpecialties.includes(s.name))
                              .map(s => s.id);
                            setFormData({
                              ...prof,
                              specialties: matchingIds
                            });
                            setEditingId(prof.id);
                            setShowForm(true);
                          }}
                        />
                        <Trash2
                          className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700"
                          onClick={() => handleDeleteProfessional(prof.id)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {prof.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {prof.phone}
                      </div>
                    </div>

                    {prof.bio && (
                      <p className="text-sm text-gray-600 mb-4 italic">{prof.bio}</p>
                    )}

                    <button
                      onClick={() =>
                        setExpandedProfessional(
                          expandedProfessional === prof.id ? null : prof.id
                        )
                      }
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Clock className="w-4 h-4" />
                      Horarios
                      {expandedProfessional === prof.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {expandedProfessional === prof.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        {getProfessionalSchedules(prof.id).length > 0 ? (
                          <div className="space-y-2">
                            {getProfessionalSchedules(prof.id).map((schedule) => (
                              <div
                                key={schedule.id}
                                className="text-sm bg-gray-50 p-3 rounded flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">
                                    {DAYS[schedule.day_of_week]}
                                  </p>
                                  <p className="text-gray-600">
                                    {schedule.start_time} - {schedule.end_time}
                                  </p>
                                  {schedule.break_start && (
                                    <p className="text-gray-500 text-xs">
                                      Descanso: {schedule.break_start} - {schedule.break_end}
                                    </p>
                                  )}
                                </div>
                                <Trash2
                                  className="w-4 h-4 text-red-600 cursor-pointer hover:text-red-700"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            Sin horarios asignados
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialties Tab */}
        {activeTab === 'specialties' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">
                {editingSpecialtyId ? 'Editar Especialidad' : 'Agregar Especialidad'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre de especialidad"
                  value={specialtyForm.name}
                  onChange={(e) =>
                    setSpecialtyForm({ ...specialtyForm, name: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Descripción"
                  value={specialtyForm.description}
                  onChange={(e) =>
                    setSpecialtyForm({ ...specialtyForm, description: e.target.value })
                  }
                  rows={1}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveSpecialty}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  <Check className="w-4 h-4" />
                  {editingSpecialtyId ? 'Actualizar' : 'Agregar Especialidad'}
                </button>
                {editingSpecialtyId && (
                  <button
                    onClick={() => {
                      setEditingSpecialtyId(null);
                      setSpecialtyForm({ name: '', description: '' });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {specialties.map((specialty) => (
                <div key={specialty.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {specialty.name}
                      </h3>
                      {specialty.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {specialty.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Edit
                        className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-700"
                        onClick={() => {
                          setSpecialtyForm({
                            name: specialty.name,
                            description: specialty.description
                          });
                          setEditingSpecialtyId(specialty.id);
                        }}
                      />
                      <Trash2
                        className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700"
                        onClick={() => handleDeleteSpecialty(specialty.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Asignar Horario</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <select
                  value={scheduleForm.professional_id}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, professional_id: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un profesional</option>
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name}
                    </option>
                  ))}
                </select>

                <select
                  value={scheduleForm.day_of_week}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      day_of_week: parseInt(e.target.value)
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>

                <input
                  type="time"
                  value={scheduleForm.start_time}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, start_time: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="time"
                  value={scheduleForm.end_time}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, end_time: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="time"
                  value={scheduleForm.break_start}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, break_start: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Inicio descanso"
                />

                <input
                  type="time"
                  value={scheduleForm.break_end}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, break_end: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fin descanso"
                />
              </div>

              <button
                onClick={handleSaveSchedule}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Plus className="w-4 h-4" />
                Asignar Horario
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {schedules.length > 0 ? (
                schedules.map((schedule) => {
                  const prof = professionals.find((p) => p.id === schedule.professional_id);
                  return (
                    <div key={schedule.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {prof?.name}
                          </h3>
                          <p className="text-gray-600 mt-2">
                            <strong>{DAYS[schedule.day_of_week]}</strong> - {schedule.start_time}{' '}
                            a {schedule.end_time}
                          </p>
                          {schedule.break_start && (
                            <p className="text-sm text-gray-500 mt-1">
                              Descanso: {schedule.break_start} - {schedule.break_end}
                            </p>
                          )}
                        </div>
                        <Trash2
                          className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-700"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600">No hay horarios asignados</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
