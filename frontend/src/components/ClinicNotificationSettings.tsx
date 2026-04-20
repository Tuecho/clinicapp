import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface NotificationSettings {
  reminder_email_enabled: number;
  reminder_sms_enabled: number;
  reminder_hours_before: number;
  reminder_time: string;
  sms_provider: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_phone_number: string;
  confirmation_email_enabled: number;
  confirmation_sms_enabled: number;
  cancellation_email_enabled: number;
  cancellation_sms_enabled: number;
  follow_up_email_enabled: number;
  follow_up_days_after: number;
  smtp_user: string;
  smtp_password: string;
  smtp_host: string;
  smtp_port: number;
}

export default function ClinicNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'reminders' | 'confirmations' | 'sms' | 'email'>('reminders');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/notification-settings`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      setSettings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setMessage({ type: 'error', text: 'Error cargando configuración' });
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/clinic/notification-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Error guardando configuración');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error guardando configuración' });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  if (!settings) {
    return <div className="text-center text-gray-500">Error cargando configuración</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'reminders'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bell className="inline mr-2 h-4 w-4" />
          Recordatorios
        </button>
        <button
          onClick={() => setActiveTab('confirmations')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'confirmations'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle className="inline mr-2 h-4 w-4" />
          Confirmaciones
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'sms'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="inline mr-2 h-4 w-4" />
          SMS
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'email'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Mail className="inline mr-2 h-4 w-4" />
          Email SMTP
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* RECORDATORIOS */}
      {activeTab === 'reminders' && (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="mr-2 h-5 w-5 text-indigo-600" />
              Configurar Recordatorios de Citas
            </h3>

            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Recordatorio por Email</p>
                    <p className="text-sm text-gray-600">Envía email el día anterior a la cita</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminder_email_enabled === 1}
                    onChange={(e) => updateSetting('reminder_email_enabled', e.target.checked ? 1 : 0)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* SMS */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Recordatorio por SMS</p>
                    <p className="text-sm text-gray-600">Envía SMS el día anterior a la cita</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminder_sms_enabled === 1}
                    onChange={(e) => updateSetting('reminder_sms_enabled', e.target.checked ? 1 : 0)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Hora de recordatorio */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Hora de Envío del Recordatorio
                </label>
                <input
                  type="time"
                  value={settings.reminder_time}
                  onChange={(e) => updateSetting('reminder_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-2">Se enviarán recordatorios a esta hora</p>
              </div>

              {/* Horas antes */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Enviar Recordatorio Horas Antes
                </label>
                <select
                  value={settings.reminder_hours_before}
                  onChange={(e) => updateSetting('reminder_hours_before', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={12}>12 horas antes</option>
                  <option value={24}>24 horas (1 día) antes</option>
                  <option value={48}>48 horas (2 días) antes</option>
                  <option value={72}>72 horas (3 días) antes</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMACIONES */}
      {activeTab === 'confirmations' && (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              Confirmación de Reservas
            </h3>

            <div className="space-y-4">
              {/* Confirmation Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-indigo-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Confirmación por Email</p>
                    <p className="text-sm text-gray-600">Al crear una nueva cita</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.confirmation_email_enabled === 1}
                    onChange={(e) => updateSetting('confirmation_email_enabled', e.target.checked ? 1 : 0)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Confirmation SMS */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Confirmación por SMS</p>
                    <p className="text-sm text-gray-600">Al crear una nueva cita</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.confirmation_sms_enabled === 1}
                    onChange={(e) => updateSetting('confirmation_sms_enabled', e.target.checked ? 1 : 0)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Cancellation Email */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Notificación de Cancelación (Email)</p>
                    <p className="text-sm text-gray-600">Cuando se cancela una cita</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cancellation_email_enabled === 1}
                    onChange={(e) => updateSetting('cancellation_email_enabled', e.target.checked ? 1 : 0)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Cancellation SMS */}
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Notificación de Cancelación (SMS)</p>
                    <p className="text-sm text-gray-600">Cuando se cancela una cita</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cancellation_sms_enabled === 1}
                    onChange={(e) => updateSetting('cancellation_sms_enabled', e.target.checked ? 1 : 0)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Follow-up */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <label className="flex items-center space-x-3 mb-2">
                  <input
                    type="checkbox"
                    checked={settings.follow_up_email_enabled === 1}
                    onChange={(e) => updateSetting('follow_up_email_enabled', e.target.checked ? 1 : 0)}
                    className="rounded"
                  />
                  <span className="font-medium text-gray-900">Email de Seguimiento Post-Cita</span>
                </label>
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Días después de la cita
                  </label>
                  <select
                    value={settings.follow_up_days_after}
                    onChange={(e) => updateSetting('follow_up_days_after', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={settings.follow_up_email_enabled === 0}
                  >
                    <option value={1}>1 día después</option>
                    <option value={3}>3 días después</option>
                    <option value={7}>7 días después</option>
                    <option value={14}>14 días después</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS CONFIGURATION */}
      {activeTab === 'sms' && (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-green-600" />
              Configuración de SMS (Twilio)
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p className="font-medium">Requiere cuenta en Twilio</p>
                <p className="mt-1">
                  Para usar SMS, necesitas una{' '}
                  <a
                    href="https://www.twilio.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    cuenta en Twilio
                  </a>
                  . Obtén tus credenciales del dashboard de Twilio.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Proveedor de SMS
                </label>
                <select
                  value={settings.sms_provider}
                  onChange={(e) => updateSetting('sms_provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="twilio">Twilio</option>
                  <option value="otros">Otros (próximamente)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Account SID
                </label>
                <input
                  type="password"
                  value={settings.twilio_account_sid || ''}
                  onChange={(e) => updateSetting('twilio_account_sid', e.target.value)}
                  placeholder="Tu Account SID de Twilio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">Mantén esto seguro y no lo compartas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Auth Token
                </label>
                <input
                  type="password"
                  value={settings.twilio_auth_token || ''}
                  onChange={(e) => updateSetting('twilio_auth_token', e.target.value)}
                  placeholder="Tu Auth Token de Twilio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">Mantén esto seguro y no lo compartas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Número de Teléfono de Twilio
                </label>
                <input
                  type="tel"
                  value={settings.twilio_phone_number || ''}
                  onChange={(e) => updateSetting('twilio_phone_number', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">El número de Twilio desde el que se enviarán SMS</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMAIL SMTP CONFIGURATION */}
      {activeTab === 'email' && (
        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="mr-2 h-5 w-5 text-indigo-600" />
              Configuración de Email SMTP
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <p className="font-medium">Configura tu servidor SMTP</p>
                <p className="mt-1">
                  Usa credenciales de Gmail u otro proveedor. Para Gmail, usa una{' '}
                  <a
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    contraseña de aplicación
                  </a>
                  .
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Usuario SMTP (email)
                </label>
                <input
                  type="email"
                  value={settings.smtp_user || ''}
                  onChange={(e) => updateSetting('smtp_user', e.target.value)}
                  placeholder="tuemail@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Contraseña SMTP
                </label>
                <input
                  type="password"
                  value={settings.smtp_password || ''}
                  onChange={(e) => updateSetting('smtp_password', e.target.value)}
                  placeholder="Contraseña de aplicación"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">No es tu contraseña normal, sino una contraseña de aplicación</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  value={settings.smtp_host || 'smtp.gmail.com'}
                  onChange={(e) => updateSetting('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Puerto SMTP
                </label>
                <input
                  type="number"
                  value={settings.smtp_port || 587}
                  onChange={(e) => updateSetting('smtp_port', parseInt(e.target.value))}
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>
    </div>
  );
}
