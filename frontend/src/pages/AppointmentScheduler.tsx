import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Users, Lock, AlertCircle, CheckCircle,
  Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { formatDateEs } from '../utils/format';
import { DateInput, TimeInput } from '../utils/DateTimeInput';

const API_URL = import.meta.env.VITE_API_URL || '';

interface BlockedHour {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  reason?: string;
  is_holiday: number;
  notes?: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  client_phone: string;
  service_name: string;
  duration_minutes: number;
  price: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: JSX.Element }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pendiente', icon: <AlertCircle className="w-4 h-4" /> },
  confirmed: { color: 'bg-blue-100 text-blue-700', label: 'Confirmada', icon: <CheckCircle className="w-4 h-4" /> },
  in_progress: { color: 'bg-purple-100 text-purple-700', label: 'En Curso', icon: <Clock className="w-4 h-4" /> },
  completed: { color: 'bg-green-100 text-green-700', label: 'Completada', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelada', icon: <X className="w-4 h-4" /> }
};

export function AppointmentScheduler() {
  const [view, setView] = useState<'calendar' | 'list' | 'blocked'>('calendar');
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blockedHours, setBlockedHours] = useState<BlockedHour[]>([]);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<BlockedHour | null>(null);
  const [blockForm, setBlockForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: '',
    is_holiday: false,
    notes: ''
  });

  const loadAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/appointments`, {
        headers: getAuthHeaders()
      });
      setAppointments(await response.json());
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const loadBlockedHours = async (month?: Date) => {
    try {
      const date = month || currentDate;
      const year = date.getFullYear();
      const month_num = String(date.getMonth() + 1).padStart(2, '0');
      const from = `${year}-${month_num}-01`;
      const to = `${year}-${month_num}-31`;

      const response = await fetch(`${API_URL}/api/clinic/blocked-hours?from=${from}&to=${to}`, {
        headers: getAuthHeaders()
      });
      setBlockedHours(await response.json());
    } catch (error) {
      console.error('Error loading blocked hours:', error);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadBlockedHours();
  }, [currentDate]);

const handleStatusChange = async (aptId: string, newStatus: string) => {
    try {
      await fetch(`${API_URL}/api/clinic/appointments/${aptId}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      loadAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSaveBlock = async () => {
    if (!blockForm.date || !blockForm.start_time) {
      alert('Fecha y hora son requeridas');
      return;
    }

    try {
      const method = editingBlock ? 'PUT' : 'POST';
      const url = editingBlock
        ? `${API_URL}/api/clinic/blocked-hours/${editingBlock.id}`
        : `${API_URL}/api/clinic/blocked-hours`;

      await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blockForm)
      });

      setShowBlockModal(false);
      setBlockForm({ date: '', start_time: '', end_time: '', reason: '', is_holiday: false, notes: '' });
      setEditingBlock(null);
      await loadBlockedHours();
    } catch (error) {
      console.error('Error saving blocked hour:', error);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm('¿Estás seguro?')) return;
    try {
      await fetch(`${API_URL}/api/clinic/blocked-hours/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await loadBlockedHours();
    } catch (error) {
      console.error('Error deleting blocked hour:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAppointmentsForDate = (date: string) => {
    return appointments.filter(apt => apt.appointment_date === date);
  };

  const getBlockedHoursForDate = (date: string) => {
    return blockedHours.filter(block => block.date === date);
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const formatTime = (hour: number) => {
    return `${String(hour).padStart(2, '0')}:00`;
  };

  const renderDayView = () => {
    const dateStr = formatDate(currentDate);
    const dayAppts = getAppointmentsForDate(dateStr).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    const dayBlocks = getBlockedHoursForDate(dateStr);

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            {currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 13 }, (_, i) => {
            const hour = i + 8;
            const hourStr = formatTime(hour);
            const hourAppts = dayAppts.filter(apt => apt.appointment_time.startsWith(hourStr));
            const hourBlocks = dayBlocks.filter(block => {
              const start = block.start_time.substring(0, 2);
              const end = block.end_time ? block.end_time.substring(0, 2) : null;
              return parseInt(start) <= hour && (!end || parseInt(end) > hour);
            });

            return (
              <div key={hour} className="flex border rounded-lg overflow-hidden min-h-16">
                <div className="w-20 bg-slate-50 p-3 flex items-center justify-center font-bold text-slate-600">
                  {hourStr}
                </div>
                <div className="flex-1 p-2 space-y-1">
                  {hourBlocks.map(block => (
                    <div key={block.id} className="bg-red-100 text-red-700 px-3 py-2 rounded flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {block.is_holiday ? 'Festivo' : block.reason || 'Bloqueado'}
                    </div>
                  ))}
                  {hourAppts.map(apt => (
                    <div key={apt.id} className={`px-3 py-2 rounded flex items-center justify-between gap-2 ${STATUS_CONFIG[apt.status].color}`}>
                      <div className="flex items-center gap-2 flex-1">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">{apt.client_name}</span>
                        <span className="text-sm">- {apt.service_name}</span>
                      </div>
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                        className="text-xs bg-white/80 rounded px-2 py-1 cursor-pointer"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="in_progress">En Curso</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });

    const today = formatDate(new Date());

    return (
      <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
        <div className="grid grid-cols-8 gap-2 min-w-[800px]">
          <div></div>
          {weekDays.map((day, i) => (
            <div key={i} className={`text-center py-2 font-bold ${formatDate(day) === today ? 'bg-blue-100 rounded' : ''}`}>
              <div className="text-slate-600">{['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day.getDay()]}</div>
              <div className="text-xl">{day.getDate()}</div>
            </div>
          ))}

          {Array.from({ length: 13 }, (_, hour) => {
            const hourStr = formatTime(hour + 8);
            return (
              <>
                <div key={`h-${hour}`} className="text-right pr-2 text-slate-500 font-medium text-sm py-4">
                  {hourStr}
                </div>
                {weekDays.map((day, i) => {
                  const dateStr = formatDate(day);
                  const dayAppts = getAppointmentsForDate(dateStr).filter(apt => apt.appointment_time.startsWith(hourStr));
                  const dayBlocks = getBlockedHoursForDate(dateStr).filter(block => {
                    const start = block.start_time.substring(0, 2);
                    const end = block.end_time ? block.end_time.substring(0, 2) : null;
                    return parseInt(start) <= (hour + 8) && (!end || parseInt(end) > (hour + 8));
                  });

                  return (
                    <div key={i} className={`border min-h-24 p-1 ${formatDate(day) === today ? 'bg-blue-50' : ''}`}>
                      {dayBlocks.map(block => (
                        <div key={block.id} className="bg-red-100 text-red-700 text-xs p-1 rounded mb-1">
                          <Lock className="w-3 h-3 inline" />
                        </div>
                      ))}
                      {dayAppts.map(apt => (
                        <div key={apt.id} className={`text-xs p-1 rounded mb-1 ${STATUS_CONFIG[apt.status].color}`}>
                          <select
                            value={apt.status}
                            onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                            className="bg-transparent text-xs cursor-pointer w-full"
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="in_progress">En Curso</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                          {apt.appointment_time} {apt.client_name}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-gray-50 h-24"></div>);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const dayAppts = getAppointmentsForDate(dateStr);
      const dayBlocks = getBlockedHoursForDate(dateStr);

      days.push(
        <div key={day} className="border min-h-24 p-2 relative hover:bg-gray-50 transition-colors">
          <div className="text-right font-bold text-slate-900 mb-1">{day}</div>
          
          {dayBlocks.length > 0 && (
            <div className="mb-1">
              {dayBlocks.map(block => (
                <div key={block.id} className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded mb-0.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {block.is_holiday ? 'Festivo' : block.reason || 'Bloqueado'}
                </div>
              ))}
            </div>
          )}

          {dayAppts.length > 0 && (
            <div className="space-y-0.5">
              {dayAppts.slice(0, 2).map(apt => (
                <div key={apt.id} className={`text-xs p-1 rounded truncate ${STATUS_CONFIG[apt.status].color}`}>
                  {apt.appointment_time} - {apt.client_name}
                </div>
              ))}
              {dayAppts.length > 2 && (
                <div className="text-xs text-slate-500 px-1">+{dayAppts.length - 2} más</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-blue-600" />
            Gestión de Citas
          </h1>
          <p className="text-slate-600 mt-2">Calendario visual, reservas y bloqueos de horarios</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {(['calendar', 'list', 'blocked'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                view === v
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {v === 'calendar' && '📅 Calendario'}
              {v === 'list' && '📋 Lista de Citas'}
              {v === 'blocked' && '🔒 Horas Bloqueadas'}
            </button>
          ))}
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {calendarView === 'day'
                  ? currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                  : calendarView === 'week'
                  ? `Semana del ${getStartOfWeek(currentDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                  : currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <div className="flex bg-slate-100 rounded-lg p-1">
                  {(['day', 'week', 'month'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setCalendarView(v)}
                      className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${
                        calendarView === v ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
                    </button>
                  ))}
                </div>
                <div className="w-px bg-slate-300 mx-2"></div>
                <button
                  onClick={() => {
                    if (calendarView === 'day') {
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1));
                    } else if (calendarView === 'week') {
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7));
                    } else {
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
                    }
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border rounded-lg hover:bg-slate-50">
                  Hoy
                </button>
                <button
                  onClick={() => {
                    if (calendarView === 'day') {
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1));
                    } else if (calendarView === 'week') {
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7));
                    } else {
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
                    }
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {calendarView === 'day' && renderDayView()}
            {calendarView === 'week' && renderWeekView()}
            {calendarView === 'month' && (
              <>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="text-center font-bold text-slate-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 bg-slate-100 p-1 rounded-lg">
                  {renderCalendar()}
                </div>
              </>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded ${config.color}`}>{config.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded">
                  <Lock className="w-4 h-4" /> Bloqueado
                </span>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-3 px-4 text-slate-600">Fecha</th>
                  <th className="text-left py-3 px-4 text-slate-600">Hora</th>
                  <th className="text-left py-3 px-4 text-slate-600">Cliente</th>
                  <th className="text-left py-3 px-4 text-slate-600">Servicio</th>
                  <th className="text-left py-3 px-4 text-slate-600">Duración</th>
                  <th className="text-left py-3 px-4 text-slate-600">Estado</th>
                  <th className="text-left py-3 px-4 text-slate-600">Precio</th>
                </tr>
              </thead>
              <tbody>
                {appointments
                  .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
                  .map((apt) => (
                    <tr key={apt.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{formatDateEs(apt.appointment_date)}</td>
                      <td className="py-3 px-4">{apt.appointment_time}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{apt.client_name}</p>
                          <p className="text-sm text-slate-500">{apt.client_phone}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{apt.service_name}</td>
                      <td className="py-3 px-4">{apt.duration_minutes} min</td>
                      <td className="py-3 px-4">
                        <select
                          value={apt.status}
                          onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer ${STATUS_CONFIG[apt.status].color}`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmada</option>
                          <option value="in_progress">En Curso</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-medium">${apt.price?.toFixed(2) || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Blocked Hours View */}
        {view === 'blocked' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Horas Bloqueadas y Días Festivos</h2>
              <button
                onClick={() => {
                  setEditingBlock(null);
                  setBlockForm({ date: '', start_time: '', end_time: '', reason: '', is_holiday: false, notes: '' });
                  setShowBlockModal(true);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
              >
                <Plus className="w-5 h-5" /> Bloquear Hora
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {/* Calendar mini on the left */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="font-bold text-slate-900 mb-4">
                    {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="grid grid-cols-7 gap-1 text-xs text-center">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                      <div key={day} className="font-bold text-slate-600">{day}</div>
                    ))}
                    {Array.from({ length: 35 }).map((_, i) => {
                      const day = i - getFirstDayOfMonth(currentDate) + 1;
                      const isValid = day > 0 && day <= getDaysInMonth(currentDate);
                      const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                      const hasBlocks = blockedHours.some(b => b.date === dateStr);
                      return (
                        <div
                          key={i}
                          className={`p-1 ${isValid ? 'border cursor-pointer hover:bg-slate-100' : ''} ${
                            hasBlocks ? 'bg-red-100' : ''
                          }`}
                        >
                          {isValid ? day : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* List of blocked hours on the right */}
              <div className="lg:col-span-5 space-y-3">
                {blockedHours.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center text-slate-600">
                    <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay horas bloqueadas este mes</p>
                  </div>
                ) : (
                  blockedHours.map(block => (
                    <div key={block.id} className="bg-white rounded-lg shadow-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="w-5 h-5 text-red-600" />
                            <span className="font-bold text-slate-900">{block.date}</span>
                            {block.is_holiday && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                                Día Festivo
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700">
                            {block.start_time} {block.end_time ? `- ${block.end_time}` : ''}
                          </p>
                          {block.reason && <p className="text-sm text-slate-600 mt-1">{block.reason}</p>}
                          {block.notes && <p className="text-xs text-slate-500 italic mt-1">{block.notes}</p>}
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => {
                              setEditingBlock(block);
                              setBlockForm({
                                date: block.date,
                                start_time: block.start_time,
                                end_time: block.end_time || '',
                                reason: block.reason || '',
                                is_holiday: block.is_holiday === 1,
                                notes: block.notes || ''
                              });
                              setShowBlockModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingBlock ? 'Editar Bloqueo' : 'Bloquear Horario'}
              </h3>
              <button onClick={() => setShowBlockModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <DateInput
                  value={blockForm.date}
                  onChange={(value) => setBlockForm({ ...blockForm, date: value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio</label>
                  <TimeInput
                    value={blockForm.start_time}
                    onChange={(value) => setBlockForm({ ...blockForm, start_time: value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fin</label>
                  <TimeInput
                    value={blockForm.end_time}
                    onChange={(value) => setBlockForm({ ...blockForm, end_time: value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo</label>
                <input
                  type="text"
                  placeholder="Ej: Descanso, Reunión, etc."
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={blockForm.is_holiday}
                  onChange={(e) => setBlockForm({ ...blockForm, is_holiday: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Día Festivo</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea
                  placeholder="Notas adicionales"
                  value={blockForm.notes}
                  onChange={(e) => setBlockForm({ ...blockForm, notes: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 border rounded py-2 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveBlock}
                  className="flex-1 bg-red-600 text-white rounded py-2 hover:bg-red-700"
                >
                  {editingBlock ? 'Actualizar' : 'Crear'} Bloqueo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
