import { useState, useEffect } from 'react';
import { Bell, Loader2, Check, X, Smartphone, BellOff, Save } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface NotificationSettings {
  email_enabled: number;
  email_to: string;
  notify_time: string;
  notify_timezone: string;
  notify_events: number;
  notify_tasks: number;
  notify_budgets: number;
  notify_meals: number;
  notify_birthdays: number;
  push_enabled: number;
  push_subscription: string | null;
}

const TIMEZONES = [
  { value: 'Europe/Madrid', label: 'España (CET/CEST)' },
  { value: 'Europe/London', label: 'Reino Unido (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Francia (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Alemania (CET/CEST)' },
  { value: 'America/New_York', label: 'EE.UU. Este (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'EE.UU. Oeste (PST/PDT)' },
  { value: 'America/Mexico_City', label: 'México (CST/CDT)' },
  { value: 'America/Buenos_Aires', label: 'Argentina (ART)' },
  { value: 'Europe/Rome', label: 'Italia (CET/CEST)' },
  { value: 'Europe/Lisbon', label: 'Portugal (WET/WEST)' },
];

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_enabled: 0,
    email_to: '',
    notify_time: '22:00',
    notify_timezone: 'Europe/Madrid',
    notify_events: 1,
    notify_tasks: 1,
    notify_budgets: 1,
    notify_meals: 1,
    notify_birthdays: 1,
    push_enabled: 0,
    push_subscription: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    fetchSettings();
    checkPushSupport();
  }, []);

  const checkPushSupport = () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
    }
  };

  const subscribeToPush = async () => {
    if (!pushSupported) return;
    
    setPushLoading(true);
    try {
      const vapidResp = await fetch(`${API_URL}/api/notifications/vapid-key`, { headers: getAuthHeaders() });
      const vapidData = await vapidResp.json();
      
      const vapidKey = Uint8Array.from(atob(vapidData.publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });
      
      await fetch(`${API_URL}/api/notifications/subscribe`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription })
      });
      
      setSettings({ ...settings, push_enabled: 1, push_subscription: 'subscribed' });
      setMessage({ type: 'success', text: 'Notificaciones push activadas' });
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setMessage({ type: 'error', text: 'Error al activar notificaciones push' });
    } finally {
      setPushLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setPushLoading(true);
    try {
      await fetch(`${API_URL}/api/notifications/unsubscribe`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }
      
      setSettings({ ...settings, push_enabled: 0, push_subscription: null });
      setMessage({ type: 'success', text: 'Notificaciones push desactivadas' });
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      setMessage({ type: 'error', text: 'Error al desactivar notificaciones push' });
    } finally {
      setPushLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const resp = await fetch(`${API_URL}/api/notifications/settings`, { headers: getAuthHeaders() });
      const data = await resp.json();
      setSettings({
        email_enabled: data.email_enabled || 0,
        email_to: data.email_to || '',
        notify_time: data.notify_time || '22:00',
        notify_timezone: data.notify_timezone || 'Europe/Madrid',
        notify_events: data.notify_events ?? 1,
        notify_tasks: data.notify_tasks ?? 1,
        notify_budgets: data.notify_budgets ?? 1,
        notify_meals: data.notify_meals ?? 1,
        notify_birthdays: data.notify_birthdays ?? 1,
        push_enabled: data.push_enabled || 0,
        push_subscription: data.push_subscription || null
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const resp = await fetch(`${API_URL}/api/notifications/settings`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await resp.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Configuración guardada' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error guardando' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Notificaciones</h2>
            <p className="text-sm text-gray-500">Recibe un resumen de tu agenda cada día</p>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Smartphone className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Notificaciones en el dispositivo</h3>
                  <p className="text-sm text-gray-500">Recibe avisos instantáneos en tu navegador</p>
                </div>
              </div>
              {pushSupported ? (
                settings.push_enabled === 1 ? (
                  <button
                    onClick={unsubscribeFromPush}
                    disabled={pushLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
                  >
                    {pushLoading ? <Loader2 size={16} className="animate-spin" /> : <BellOff size={16} />}
                    Desactivar
                  </button>
                ) : (
                  <button
                    onClick={subscribeToPush}
                    disabled={pushLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {pushLoading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                    Activar
                  </button>
                )
              ) : (
                <span className="text-sm text-gray-400">No disponible</span>
              )}
            </div>
            {!pushSupported && (
              <p className="text-xs text-gray-400 mt-2">
                Tu navegador no soporta notificaciones push. Usa Chrome, Firefox o Edge.
              </p>
            )}
            {settings.push_enabled === 1 && pushSupported && (
              <button
                onClick={async () => {
                  try {
                    const resp = await fetch(`${API_URL}/api/notifications/test-push`, { 
                      method: 'POST', 
                      headers: getAuthHeaders() 
                    });
                    const data = await resp.json();
                    if (data.success) {
                      setMessage({ type: 'success', text: 'Notificación de prueba enviada' });
                    } else {
                      setMessage({ type: 'error', text: data.error || 'Error al enviar' });
                    }
                  } catch (error) {
                    setMessage({ type: 'error', text: 'Error de conexión' });
                  }
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Enviar notificación de prueba
              </button>
            )}
          </div>

          

          <div className="pt-4 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Guardar configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}