import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, Users, Save, Loader2, Trash2, AlertTriangle, LogOut, Download, Upload, Settings, Calendar, Palette, GripVertical } from 'lucide-react';
import { NotificationSettings } from '../components/NotificationSettings';
import { ImportDB } from '../components/ImportDB';
import { useAuth } from '../components/Auth';
import { getAuthHeaders } from '../utils/auth';
import { useTheme, ThemeName } from '../store/theme';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Profile {
  id: number;
  name: string;
  avatar: string | null;
  email: string | null;
  phone: string | null;
  sex: string | null;
  birth_date: string | null;
  family_name: string;
  city: string | null;
  currency: string;
  enabled_modules: string | null;
}

export function Profile() {
  const { logout, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile>({
    id: 1,
    name: '',
    avatar: null,
    email: null,
    phone: null,
    sex: null,
    birth_date: null,
    family_name: '',
    city: null,
    currency: 'EUR',
    enabled_modules: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/users`, { headers });
      if (response.ok) {
        const users = await response.json();
        setAvailableUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/profile`, { headers });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching profile');
      }
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
    setLoading(false);
  };

  const fetchInvitations = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/invitations`, { headers });
      const data = await response.json();
      setInvitations((data.received || []).filter((i: Invitation) => i.status === 'pending'));
      setSharedUsers(data.sharedWith || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim()) return;

    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/invitations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          to_username: inviteUsername.trim(),
          ...sharePrefs
        })
      });
      const data = await response.json();

      if (response.ok) {
        setInviteSuccess(`Invitación enviada a ${inviteUsername}`);
        setInviteUsername('');
        setShowShareModal(false);
        setSharePrefs({
          share_dashboard: true,
          share_accounting: true,
          share_budgets: true,
          share_agenda: true,
          share_tasks: true,
          share_notes: false,
          share_shopping: false,
          share_contacts: false,
          share_home_maintenance: true,
          share_utility_bills: true,
        });
        fetchInvitations();
      } else {
        setInviteError(data.error || 'Error al enviar invitación');
      }
    } catch (error) {
      setInviteError('Error de conexión');
    }
    setInviting(false);
  };

  const handleUpdateShare = async () => {
    if (!editingShare) return;

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/shares/${editingShare.shared_with_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(sharePrefs)
      });

      if (response.ok) {
        setShowShareModal(false);
        setEditingShare(null);
        fetchInvitations();
      }
    } catch (error) {
      console.error('Error updating share:', error);
    }
  };

  const openEditShare = (share: SharedUser) => {
    setEditingShare(share);
    setSharePrefs({
      share_dashboard: !!share.share_dashboard,
      share_accounting: !!share.share_accounting,
      share_budgets: !!share.share_budgets,
      share_agenda: !!share.share_agenda,
      share_tasks: !!share.share_tasks,
      share_notes: !!share.share_notes,
      share_shopping: !!share.share_shopping,
      share_contacts: !!share.share_contacts,
      share_home_maintenance: !!share.share_home_maintenance,
      share_utility_bills: !!share.share_utility_bills,
    });
    setShowShareModal(true);
  };

  const openNewShare = () => {
    setEditingShare(null);
    setSharePrefs({
      share_dashboard: true,
      share_accounting: true,
      share_budgets: true,
      share_agenda: true,
      share_tasks: true,
      share_notes: false,
      share_shopping: false,
      share_contacts: false,
      share_home_maintenance: true,
      share_utility_bills: true,
    });
    setInviteUsername('');
    setAvailableUsers([]);
    fetchAvailableUsers();
    setShowShareModal(true);
  };

  const handleInvitationAction = async (invitationId: number, action: 'accept' | 'reject') => {
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/invitations/${invitationId}/${action}`, {
        method: 'PUT',
        headers
      });
      fetchInvitations();
    } catch (error) {
      console.error('Error handling invitation:', error);
    }
  };

  const handleRemoveShare = async (sharedWithId: number) => {
    if (!window.confirm('¿Dejar de compartir datos con este usuario?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/shares/${sharedWithId}`, { method: 'DELETE', headers });
      fetchInvitations();
    } catch (error) {
      console.error('Error removing share:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/export`, { headers });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al exportar los datos');
      }
      
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-agent-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error al exportar los datos');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!confirm('¿Estás seguro de importar estos datos? Se añadirán a los datos existentes.')) {
        return;
      }

      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/import`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('¡Datos importados correctamente!');
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al importar los datos');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error al leer el archivo');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    console.log('Submitting profile with avatar length:', profile.avatar ? profile.avatar.length : 'null');

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profile)
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response avatar length:', data.avatar ? data.avatar.length : 'null');
      
      if (response.ok) {
        setProfile(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error('Error saving profile:', data.error);
        alert(data.error || 'Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error de conexión');
    }
    
    setSaving(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Avatar file selected:', file.name, 'size:', file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Avatar read complete, length:', (reader.result as string).length);
        setProfile(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetData = async () => {
    const confirm = window.confirm('¿Estás seguro? Se eliminarán todas las transacciones, presupuestos, eventos y conceptos.\n\nEsta acción no se puede deshacer.');
    if (!confirm) return;

    const doubleConfirm = window.confirm('¿Realmente quieres eliminar TODOS los datos?\n\nPulsa Aceptar para confirmar.');
    if (!doubleConfirm) return;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/reset`, { method: 'POST', headers });
      const data = await response.json();
      if (response.ok) {
        alert('Todos los datos han sido eliminados.');
        window.location.reload();
      } else {
        alert(data.error || 'Error al eliminar los datos.');
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      alert('Error de conexión.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Perfil</h2>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="relative">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <User className="text-primary" size={40} />
                </div>
              )}
              <label
                htmlFor="avatar-input"
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <User size={16} />
              </label>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold text-gray-800">{profile.name || 'Usuario'}</h3>
              <p className="text-gray-500">{profile.family_name}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={14} className="inline mr-1" />
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={14} className="inline mr-1" />
                  Apellidos
                </label>
                <input
                  type="text"
                  value={profile.family_name}
                  onChange={(e) => setProfile({ ...profile, family_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tus apellidos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail size={14} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone size={14} className="inline mr-1" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+34 600 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User size={14} className="inline mr-1" />
                  Sexo
                </label>
                <select
                  value={profile.sex || ''}
                  onChange={(e) => setProfile({ ...profile, sex: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1" />
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={profile.birth_date || ''}
                  onChange={(e) => setProfile({ ...profile, birth_date: e.target.value || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail size={14} className="inline mr-1" />
                  Ciudad (para el clima)
                </label>
                <input
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Madrid"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda
                </label>
                <select
                  value={profile.currency}
                  onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              
              {saved && (
                <span className="ml-4 text-income text-sm">¡Guardado correctamente!</span>
              )}
            </div>
          </form>

          <div className="mt-8">
            <NotificationSettings />
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-4">
              <Palette size={18} className="text-primary" />
              Tema
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'default' as ThemeName, name: 'Clásico', colors: ['#4F46E5', '#10B981', '#EF4444'] },
                { id: 'ocean' as ThemeName, name: 'Océano', colors: ['#0EA5E9', '#14B8A6', '#F43F5E'] },
                { id: 'forest' as ThemeName, name: 'Bosque', colors: ['#059669', '#65A30D', '#DC2626'] },
                { id: 'night' as ThemeName, name: 'Noche', colors: ['#818CF8', '#34D399', '#F87171'] },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex gap-1 justify-center mb-2">
                    {t.colors.map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-4">
              <Settings size={18} className="text-primary" />
              Módulos
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Activa los módulos que quieres usar y reordénalos.
            </p>
            <button
              onClick={() => window.location.hash = 'modules'}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
            >
              <Settings size={16} />
              Gestionar módulos
            </button>
          </div>

          </div>
      </div>
    </div>
  );
}
