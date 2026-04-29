import { useState, useEffect } from 'react';
import { Users, Shield, Trash2, Lock, Unlock, Key, Check, X, Loader2, AlertTriangle, UserPlus, BarChart3, Activity, Clock, UserCheck, Lightbulb, MessageSquare, Eye, Send, Settings, Image, EyeOff, ImageIcon, Database, Download, Upload, Home, Wallet, DollarSign, Briefcase, Plus, Save, GripVertical } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { UserRole } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface User {
  id: number;
  username: string;
  is_admin: number;
  role: UserRole;
  status: string;
  created_at: string;
  last_login?: string;
  last_logout?: string;
}

interface Stats {
  total: number;
  active: number;
  blocked: number;
  pending: number;
  admins: number;
  totalTransactions: number;
  totalBudgets: number;
}

export function AdminPage() {
  const [companyName, setCompanyName] = useState('Mi Clínica');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, blocked: 0, pending: 0, admins: 0, totalTransactions: 0, totalBudgets: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserError, setNewUserError] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('worker');
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'login' | 'database' | 'whatsapp' | 'modules' | 'quotes'>('users');
  
  // Password related states
  const [confirmUserPassword, setConfirmUserPassword] = useState('');
  const [showUserPass1, setShowUserPass1] = useState(false);
  const [showUserPass2, setShowUserPass2] = useState(false);
  
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showChangePass1, setShowChangePass1] = useState(false);
  const [showChangePass2, setShowChangePass2] = useState(false);
  
  const [loginImage, setLoginImage] = useState('');
  const [showLock, setShowLock] = useState(true);
  const [savingLogin, setSavingLogin] = useState(false);
  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [savingCompany, setSavingCompany] = useState(false);
  const [downloadingDb, setDownloadingDb] = useState(false);
  const [uploadingDb, setUploadingDb] = useState(false);
  const [dbMessage, setDbMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [savingModules, setSavingModules] = useState(false);

  // WhatsApp Settings (Business API)
  const [whatsappPhoneId, setWhatsappPhoneId] = useState('');
  const [whatsappToken, setWhatsappToken] = useState('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [quotes, setQuotes] = useState<{id: number; quote: string; active: number}[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  
  const [newQuote, setNewQuote] = useState('');
  const [addingQuote, setAddingQuote] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<number | null>(null);
  const [editingQuoteText, setEditingQuoteText] = useState('');
  const [quoteMessage, setQuoteMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [deleteSuggestionId, setDeleteSuggestionId] = useState<number | null>(null);

useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'login') {
      fetchLoginSettings();
      fetchCompanyName();
    } else if (activeTab === 'modules') {
      fetchEnabledModules();
    } else if (activeTab === 'quotes') {
      fetchQuotes();
    }
  }, [activeTab]);

  const fetchQuotes = async () => {
    setQuotesLoading(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/motivational-quotes`, { headers });
      const data = await response.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
    setQuotesLoading(false);
  };

  const addQuote = async () => {
    if (!newQuote.trim()) return;
    setAddingQuote(true);
    setQuoteMessage(null);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/motivational-quotes`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: newQuote.trim(), active: 1 })
      });
      if (response.ok) {
        setNewQuote('');
        fetchQuotes();
        setQuoteMessage({type: 'success', text: 'Frase añadida correctamente'});
      } else {
        const data = await response.json();
        setQuoteMessage({type: 'error', text: data.error || 'Error al añadir frase'});
      }
    } catch (error) {
      console.error('Error adding quote:', error);
      setQuoteMessage({type: 'error', text: 'Error de conexión'});
    }
    setAddingQuote(false);
    setTimeout(() => setQuoteMessage(null), 3000);
  };

  const saveEditQuote = async (id: number) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/motivational-quotes/${id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: editingQuoteText.trim() })
      });
      if (response.ok) {
        setEditingQuoteId(null);
        fetchQuotes();
      }
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const toggleQuoteActive = async (quote: {id: number; active: number}) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/motivational-quotes/${quote.id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: quote.active === 1 ? 0 : 1 })
      });
      if (response.ok) {
        fetchQuotes();
      }
    } catch (error) {
      console.error('Error toggling quote:', error);
    }
  };

  const deleteQuote = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta frase?')) return;
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/motivational-quotes/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await response.json();
      if (response.ok) {
        fetchQuotes();
      } else {
        alert(data.error || 'Error al eliminar la frase');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      alert('Error al eliminar la frase');
    }
  };

  const fetchData = async () => {
    try {
      const headers = getAuthHeaders();
      const [usersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/admin/users`, { headers }),
        fetch(`${API_URL}/api/auth/admin/stats`, { headers })
      ]);
      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      }
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchLoginSettings = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/settings/login-image`, { headers });
      const data = await response.json();
      setLoginImage(data.image || '');
      setShowLock(data.showLock !== false);
    } catch (error) {
      console.error('Error fetching login settings:', error);
    }
  };

  const fetchCompanyName = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/settings/company-name`, { headers });
      const data = await response.json();
      const name = data.companyName || 'Clínica Valencia';
      setLocalCompanyName(name);
      setCompanyName(name);
    } catch (error) {
      console.error('Error fetching company name:', error);
      setLocalCompanyName(companyName);
    }
  };

  const saveCompanyName = async () => {
    setSavingCompany(true);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/settings/company-name`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ companyName: localCompanyName })
      });
      const data = await response.json();
      if (data.success) {
        alert('Nombre de empresa guardado');
        localStorage.setItem('companyName', localCompanyName);
        setCompanyName(localCompanyName);
        window.dispatchEvent(new Event('company_name_updated'));
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving company name:', error);
      alert('Error al guardar');
    }
    setSavingCompany(false);
  };

  const fetchEnabledModules = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/settings/global-modules`, { headers });
      const data = await response.json();
      if (Array.isArray(data.enabled_modules)) {
        setEnabledModules(data.enabled_modules);
      } else {
        setEnabledModules(defaultModulesList.map(m => m.key));
      }
    } catch (error) {
      console.error('Error fetching enabled modules:', error);
      setEnabledModules(defaultModulesList.map(m => m.key));
    }
  };

  const saveEnabledModules = async (modules: string[]) => {
    setSavingModules(true);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const url = API_URL ? `${API_URL}/api/settings/global-modules` : '/api/settings/global-modules';
      console.log('Saving modules to:', url, 'with headers:', headers);
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ enabled_modules: modules })
      });
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (response.ok && data.success) {
        setEnabledModules(modules);
      } else {
        const errorMsg = data.error || `Error: ${response.status}`;
        console.error('Error saving modules:', errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error saving modules:', error);
      alert('Error al guardar');
    }
    setSavingModules(false);
  };

  const defaultModulesList = [
    { key: 'dashboard', label: 'Dashboard', icon: Home },
    { key: 'accounting', label: 'Contabilidad', icon: Wallet },
    { key: 'clinic', label: 'Mi Clínica', icon: Shield },
  ];

  const toggleModule = async (moduleKey: string) => {
    let updatedModules: string[];
    if (enabledModules.includes(moduleKey)) {
      updatedModules = enabledModules.filter((m: string) => m !== moduleKey);
    } else {
      updatedModules = [...enabledModules, moduleKey];
    }
    setEnabledModules(updatedModules);
    await saveEnabledModules(updatedModules);
  };

  useEffect(() => {
    if (activeTab === 'login') {
      fetchLoginSettings();
    } else if (activeTab === 'whatsapp') {
      fetchWhatsAppSettings();
    }
  }, [activeTab]);

  useEffect(() => {
    setLocalCompanyName(companyName);
  }, [companyName]);

  const saveLoginSettings = async () => {
    setSavingLogin(true);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const resp = await fetch(`${API_URL}/api/settings/login-image`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ image: loginImage, showLock })
      });
      const data = await resp.json();
      if (data.success) {
        await fetch(`${API_URL}/api/settings/company-name`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ companyName: localCompanyName })
        });
        const newName = localCompanyName;
        setCompanyName(newName);
        localStorage.setItem('companyName', newName);
        window.dispatchEvent(new Event('company_name_updated'));
        alert('Configuración guardada');
        fetchLoginSettings();
        fetchCompanyName();
      } else {
        alert(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving login settings:', error);
      alert('Error al guardar');
    }
    setSavingLogin(false);
  };

  const fetchWhatsAppSettings = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/settings/whatsapp`, { headers });
      const data = await response.json();
      setWhatsappPhoneId(data.whatsapp_phone_id || '');
      setWhatsappToken(data.whatsapp_token || '');
      setWhatsappEnabled(data.whatsapp_enabled === true);
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
    }
  };

  const saveWhatsAppSettings = async () => {
    setSavingWhatsapp(true);
    setWhatsappMessage(null);

    if (!whatsappPhoneId.trim() || !whatsappToken.trim()) {
      setWhatsappMessage({ type: 'error', text: 'Por favor completa los campos obligatorios' });
      setSavingWhatsapp(false);
      return;
    }

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/settings/whatsapp`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          whatsapp_phone_id: whatsappPhoneId,
          whatsapp_token: whatsappToken,
          whatsapp_enabled: whatsappEnabled
        })
      });

      const data = await response.json();
      if (response.ok) {
        setWhatsappMessage({ type: 'success', text: data.message || 'Configuración de WhatsApp guardada correctamente' });
      } else {
        setWhatsappMessage({ type: 'error', text: data.error || 'Error guardando configuración de WhatsApp' });
      }
    } catch (error) {
      console.error('Error saving WhatsApp settings:', error);
      setWhatsappMessage({ type: 'error', text: 'Error guardando configuración de WhatsApp' });
    }

    setSavingWhatsapp(false);
  };

  const downloadDatabase = async () => {
    setDownloadingDb(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/export/db`, { headers });
      
      if (!response.ok) {
        const error = await response.json();
        setDbMessage({ type: 'error', text: error.error || 'Error al descargar' });
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family_agent_backup_${new Date().toISOString().split('T')[0]}.db`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDbMessage({ type: 'success', text: 'Base de datos (.db) descargada correctamente' });
    } catch (error) {
      console.error('Error downloading database:', error);
      setDbMessage({ type: 'error', text: 'Error al descargar la base de datos' });
    }
    setDownloadingDb(false);
  };

  const downloadJson = async () => {
    setDownloadingDb(true);
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_URL}/api/export/json`, { headers });
      
      if (!response.ok) {
        const error = await response.json();
        setDbMessage({ type: 'error', text: error.error || 'Error al descargar' });
        return;
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family_agent_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setDbMessage({ type: 'success', text: 'Datos (.json) descargados correctamente' });
    } catch (error) {
      console.error('Error downloading JSON:', error);
      setDbMessage({ type: 'error', text: 'Error al descargar los datos' });
    }
    setDownloadingDb(false);
  };

  const uploadDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!window.confirm('¿Estás seguro? Esta acción fusionará los datos con la base de datos actual.')) {
      e.target.value = '';
      return;
    }
    
    setUploadingDb(true);
    setDbMessage(null);
    
    try {
      const headers = getAuthHeaders();
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_URL}/api/import/db`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setDbMessage({ type: 'success', text: data.message || 'Base de datos importada correctamente' });
      } else {
        setDbMessage({ type: 'error', text: data.error || 'Error al importar' });
      }
    } catch (error) {
      console.error('Error uploading database:', error);
      setDbMessage({ type: 'error', text: 'Error al subir la base de datos' });
    }
    setUploadingDb(false);
    e.target.value = '';
  };

  const [exportingJson, setExportingJson] = useState(false);
  const [importingJson, setImportingJson] = useState(false);
  const [jsonMessage, setJsonMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const downloadJsonBackup = async () => {
    setExportingJson(true);
    setJsonMessage(null);
    
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
      
      setJsonMessage({ type: 'success', text: 'Backup JSON descargado correctamente' });
    } catch (error) {
      console.error('Error exporting JSON:', error);
      setJsonMessage({ type: 'error', text: 'Error al descargar el backup JSON' });
    }
    
    setExportingJson(false);
  };

  const uploadJsonBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('¿Estás seguro de importar estos datos? Se añadirán a los datos existentes.')) {
      e.target.value = '';
      return;
    }

    setImportingJson(true);
    setJsonMessage(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/import`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setJsonMessage({ type: 'success', text: 'Datos importados correctamente' });
      } else {
        const errorData = await response.json();
        setJsonMessage({ type: 'error', text: errorData.error || 'Error al importar' });
      }
    } catch (error) {
      console.error('Error importing JSON:', error);
      setJsonMessage({ type: 'error', text: 'Error al procesar el archivo JSON' });
    }

    setImportingJson(false);
    e.target.value = '';
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
      alert('Error al eliminar los datos.');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLoginImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim()) {
      setNewUserError('El nombre de usuario es obligatorio');
      return;
    }
    if (newUsername.length < 3) {
      setNewUserError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    if (!newUserPassword || newUserPassword.length < 4) {
      setNewUserError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (newUserPassword !== confirmUserPassword) {
      setNewUserError('Las contraseñas no coinciden');
      return;
    }

    setCreating(true);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/auth/admin/user/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ username: newUsername.trim(), password: newUserPassword, role: newUserRole })
      });
      const data = await response.json();
      if (response.ok) {
        setShowCreateModal(false);
        setNewUsername('');
        setNewUserPassword('');
        setNewUserError('');
        setNewUserRole('worker');
        fetchData();
      } else {
        setNewUserError(data.error || 'Error al crear usuario');
      }
    } catch {
      setNewUserError('Error de conexión');
    }
    setCreating(false);
  };

  const handleBlock = async (user: User) => {
    const blocked = user.status !== 'blocked';
    const action = blocked ? 'bloquear' : 'desbloquear';
    if (!window.confirm(`¿${action === 'bloquear' ? 'Bloquear' : 'Desbloquear'} a ${user.username}?`)) return;

    setActionLoading(user.id);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      await fetch(`${API_URL}/api/auth/admin/user/${user.id}/block`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ blocked })
      });
      fetchData();
    } catch (error) {
      console.error('Error blocking user:', error);
    }
    setActionLoading(null);
  };

  const handleApprove = async (user: User) => {
    if (!window.confirm(`¿Aprobar la solicitud de ${user.username}?`)) return;
    setActionLoading(user.id);
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/auth/admin/approve/${user.id}`, { method: 'POST', headers });
      fetchData();
    } catch (error) {
      console.error('Error approving user:', error);
    }
    setActionLoading(null);
  };

  const handleReject = async (user: User) => {
    if (!window.confirm(`¿Rechazar la solicitud de ${user.username}?`)) return;
    setActionLoading(user.id);
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/auth/admin/reject/${user.id}`, { method: 'POST', headers });
      fetchData();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
    setActionLoading(null);
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`¿Eliminar definitivamente a ${user.username}?\n\nEsta acción eliminará todos sus datos y no se puede deshacer.`)) return;
    if (!window.confirm(`¿Estás seguro? Esta acción es IRREVERSIBLE.`)) return;

    setActionLoading(user.id);
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/auth/admin/user/${user.id}`, {
        method: 'DELETE',
        headers
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setActionLoading(null);
  };

  const handleRoleChange = async (user: User) => {
    if (user.is_admin && users.filter(u => u.is_admin).length <= 1) {
      alert('No puedes quitar el último administrador');
      return;
    }
    const newRole = user.is_admin ? 'quitarle el rol de admin' : 'hacerle admin';
    if (!window.confirm(`¿${newRole.charAt(0).toUpperCase() + newRole.slice(1)} a ${user.username}?`)) return;

    setActionLoading(user.id);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/auth/admin/user/${user.id}/role`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ is_admin: !user.is_admin })
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Error al cambiar rol');
      }
      fetchData();
    } catch (error) {
      console.error('Error changing role:', error);
    }
    setActionLoading(null);
  };

  const handleChangePassword = async () => {
    if (!showPasswordModal || !newPassword.trim()) {
      setPasswordError('Ingresa una contraseña');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/auth/admin/user/${showPasswordModal.id}/password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ new_password: newPassword })
      });
      const data = await response.json();
      if (data.success) {
        setShowPasswordModal(null);
        setNewPassword('');
        setPasswordError('');
      } else {
        setPasswordError(data.error || 'Error');
      }
    } catch (error) {
      setPasswordError('Error de conexión');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Activo</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pendiente</span>;
      case 'blocked':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Bloqueado</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">Rechazado</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{status}</span>;
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="text-primary" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
        </div>
        {activeTab === 'users' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserPlus size={18} />
            Crear Usuario
          </button>
        )}
      </div>
      <div className="flex gap-2 md:gap-4 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-2 font-medium transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={16} className="inline mr-1 md:mr-2" />
          <span className="hidden sm:inline">Usuarios</span>
          <span className="sm:hidden text-xs">Usu</span>
        </button>
        <button
          onClick={() => setActiveTab('login')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'login'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={16} className="inline" />
          <span className="hidden sm:inline">Login</span>
          <span className="sm:hidden text-xs">Login</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'database'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Database size={16} className="inline" />
          <span className="hidden sm:inline">Base de Datos</span>
          <span className="sm:hidden text-xs">BBDD</span>
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'whatsapp'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare size={16} className="inline" />
          <span className="hidden sm:inline">WhatsApp</span>
          <span className="sm:hidden text-xs">WA</span>
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'modules'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings size={16} className="inline" />
          <span className="hidden sm:inline">Módulos</span>
          <span className="sm:hidden text-xs">Mod</span>
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'quotes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lightbulb size={16} className="inline" />
          <span className="hidden sm:inline">Frases</span>
          <span className="sm:hidden text-xs">FQ</span>
        </button>
        
      </div>

      {activeTab === 'users' && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Lock className="text-red-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Transacciones Totales</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalTransactions}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BarChart3 className="text-indigo-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Presupuestos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalBudgets}</p>
            </div>
            <div className="p-3 bg-teal-100 rounded-lg">
              <Activity className="text-teal-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={18} />
              <span className="font-medium">Lista de Usuarios</span>
            </div>
            <button onClick={fetchData} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Loader2 size={14} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Login</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Logout</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${user.status === 'pending' ? 'bg-yellow-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium text-sm">
                          {user.username[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'admin' || user.is_admin ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 flex items-center gap-1 w-fit">
                        <Shield size={12} />
                        Admin
                      </span>
                    ) : user.role === 'administrative' ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
                        <Briefcase size={12} />
                        Administrativo
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <Users size={12} />
                        Trabajador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('es')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleString('es') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.last_logout ? new Date(user.last_logout).toLocaleString('es') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(user)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Aprobar"
                          >
                            {actionLoading === user.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                          </button>
                          <button
                            onClick={() => handleReject(user)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rechazar"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      {user.status !== 'pending' && (
                        <>
                          <button
                            onClick={() => handleBlock(user)}
                            disabled={actionLoading === user.id || user.is_admin}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              user.status === 'blocked'
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-600 hover:bg-orange-50'
                            }`}
                            title={user.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : user.status === 'blocked' ? (
                              <Unlock size={16} />
                            ) : (
                              <Lock size={16} />
                            )}
                          </button>

                          <button
                            onClick={() => handleRoleChange(user)}
                            disabled={actionLoading === user.id || (user.is_admin && users.filter(u => u.is_admin).length <= 1)}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              user.is_admin
                                ? 'text-purple-600 hover:bg-purple-50'
                                : 'text-gray-400 hover:bg-purple-50 hover:text-purple-600'
                            }`}
                            title={user.is_admin ? 'Quitar admin' : 'Hacer admin'}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Shield size={16} />
                            )}
                          </button>

                          <button
                            onClick={() => setShowPasswordModal(user)}
                            disabled={actionLoading === user.id}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Cambiar contraseña"
                          >
                            <Key size={16} />
                          </button>
                        </>
                      )}

                      {!user.is_admin && user.status !== 'pending' && (
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={actionLoading === user.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar usuario"
                        >
                          {actionLoading === user.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay usuarios registrados
          </div>
        )}
</div>
      </>
      )}

      {activeTab === 'login' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <Settings size={18} />
              <span className="font-medium">Configuración de la pantalla de login</span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imagen de login
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {loginImage ? (
                    <img 
                      src={loginImage} 
                      alt="Login preview" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-3">
                    Sube una imagen para mostrar en la pantalla de login (cuadrada, se mostrará como círculo)
                  </p>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 cursor-pointer transition-colors">
                    <Image size={16} />
                    {loginImage ? 'Cambiar imagen' : 'Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {loginImage && (
                    <button
                      onClick={() => setLoginImage('')}
                      className="ml-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLock}
                  onChange={(e) => setShowLock(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div>
                  <span className="font-medium text-gray-700">Mostrar icono de candado</span>
                  <p className="text-sm text-gray-500">Si está desactivado, se mostrará el icono de casa</p>
                </div>
              </label>
            </div>

            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={localCompanyName}
                onChange={(e) => setLocalCompanyName(e.target.value)}
                placeholder="Clínica Valencia"
                className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <p className="text-sm text-gray-500 mt-1">
                Este nombre aparecerá en la página de login y en el footer
              </p>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={saveLoginSettings}
                disabled={savingLogin}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {savingLogin ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Guardar configuración
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <Database size={18} />
              <span className="font-medium">Gestión de Base de Datos</span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Copia de seguridad completa</h4>
                  <p className="text-sm text-blue-600">
                    Esta opción te permite descargar una copia completa de la base de datos, incluyendo todos los usuarios, 
                    transacciones, presupuestos, eventos, tareas, notas y configuraciones.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Download className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Descargar Backup</h4>
                    <p className="text-sm text-gray-500">Guarda una copia de seguridad</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Descarga toda la base de datos en un archivo .db que podrás guardar de forma segura.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={downloadDatabase}
                    disabled={downloadingDb}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {downloadingDb ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Descargando...
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        .db
                      </>
                    )}
                  </button>
                  <button
                    onClick={downloadJson}
                    disabled={downloadingDb}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {downloadingDb ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        .json
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Upload className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Restaurar Backup</h4>
                    <p className="text-sm text-gray-500">Restaura desde un archivo</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Restaura los datos desde un archivo de backup .db. Los datos existentes se fusionarán.
                </p>
                <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 cursor-pointer transition-colors">
                  {uploadingDb ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Seleccionar archivo .db
                    </>
                  )}
                  <input
                    type="file"
                    accept=".db"
                    onChange={uploadDatabase}
                    disabled={uploadingDb}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {dbMessage && (
              <div className={`p-4 rounded-lg ${dbMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-2">
                  {dbMessage.type === 'success' ? (
                    <Check size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                  {dbMessage.text}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Download className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Backup JSON</h4>
                  <p className="text-sm text-gray-500">Exportar datos en JSON</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Descarga todos tus datos en formato JSON: transacciones, presupuestos, eventos, tareas y notas.
              </p>
              <button
                onClick={downloadJsonBackup}
                disabled={exportingJson}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {exportingJson ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Descargar backup JSON
                  </>
                )}
              </button>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Upload className="text-green-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Restaurar JSON</h4>
                  <p className="text-sm text-gray-500">Importar desde JSON</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Restaura los datos desde un archivo JSON. Los datos existentes se fusionarán.
              </p>
              <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                {importingJson ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Seleccionar archivo JSON
                  </>
                )}
                <input
                  type="file"
                  accept=".json"
                  onChange={uploadJsonBackup}
                  disabled={importingJson}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {jsonMessage && (
            <div className={`mt-4 p-4 rounded-lg ${jsonMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              <div className="flex items-center gap-2">
                {jsonMessage.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                {jsonMessage.text}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="border-2 border-red-200 rounded-lg p-6 bg-red-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 text-lg">Zona de Peligro</h4>
                  <p className="text-sm text-red-600">Acciones irreversibles</p>
                </div>
              </div>
              <p className="text-sm text-red-700 mb-4">
                Esta acción eliminará permanentemente todos los datos de tu familia: transacciones, presupuestos, eventos, tareas, notas y conceptos de gasto. Esta acción no se puede deshacer.
              </p>
              <button
                onClick={handleResetData}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={18} />
                Vaciar todos los datos
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquare size={18} />
              <span className="font-medium">Configuración de WhatsApp Business</span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800 mb-1">WhatsApp Business API</h4>
                  <p className="text-sm text-green-600">
                    Configura tu cuenta de WhatsApp Business API para enviar notificaciones a tus clientes. Necesitas una cuenta en Meta Developer y una cuenta de WhatsApp Business.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={whatsappPhoneId}
                    onChange={(e) => setWhatsappPhoneId(e.target.value)}
                    placeholder="123456789012345"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token de Acceso
                  </label>
                  <input
                    type="password"
                    value={whatsappToken}
                    onChange={(e) => setWhatsappToken(e.target.value)}
                    placeholder="Tu Access Token de WhatsApp API"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <button
                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      whatsappEnabled ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        whatsappEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {whatsappEnabled ? 'WhatsApp activo' : 'WhatsApp desactivado'}
                  </span>
                </div>
              </div>
            </div>

            {whatsappMessage && (
              <div className={`p-4 rounded-lg ${whatsappMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                <div className="flex items-center gap-2">
                  {whatsappMessage.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                  {whatsappMessage.text}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={saveWhatsAppSettings}
                disabled={savingWhatsapp}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {savingWhatsapp ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar configuración de WhatsApp
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-gray-600">
              <Settings size={18} />
              <span className="font-medium">Módulos</span>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              {defaultModulesList.filter(m => m.key !== 'dashboard').map(module => {
                const isEnabled = enabledModules.includes(module.key);
                const IconComponent = module.icon;
                return (
                  <div key={module.key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      {IconComponent && <IconComponent size={20} className={isEnabled ? 'text-primary' : 'text-gray-400'} />}
                      <span className={`font-medium ${isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>{module.label}</span>
                    </div>
                    <button
                      onClick={() => toggleModule(module.key)}
                      disabled={savingModules}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        isEnabled ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quotes' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <Lightbulb size={18} />
                <span className="font-medium">Frases Motivacionales</span>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {quoteMessage && (
              <div className={`p-3 rounded-lg text-sm ${quoteMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {quoteMessage.text}
              </div>
            )}
            <div className="flex gap-3">
              <input
                type="text"
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="Escribe una nueva frase motivacional..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                onKeyDown={(e) => e.key === 'Enter' && addQuote()}
              />
              <button
                onClick={addQuote}
                disabled={addingQuote || !newQuote.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                {addingQuote ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Añadir
              </button>
            </div>

            {quotesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            ) : quotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Lightbulb size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No hay frases motivacionales. ¡Añade la primera!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <div key={quote.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {editingQuoteId === quote.id ? (
                      <>
                        <input
                          type="text"
                          value={editingQuoteText}
                          onChange={(e) => setEditingQuoteText(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditQuote(quote.id);
                            if (e.key === 'Escape') setEditingQuoteId(null);
                          }}
                        />
                        <button
                          onClick={() => saveEditQuote(quote.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => setEditingQuoteId(null)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="text-gray-800">{quote.quote}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {quote.active === 1 ? 'Activa' : 'Inactiva'}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleQuoteActive(quote)}
                          className={`p-2 rounded-lg ${quote.active === 1 ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title={quote.active === 1 ? 'Desactivar' : 'Activar'}
                        >
                          {quote.active === 1 ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button
                          onClick={() => { setEditingQuoteId(quote.id); setEditingQuoteText(quote.quote); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Editar"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Key className="text-blue-500" size={20} />
                Cambiar contraseña
              </h3>
              <button onClick={() => { setShowPasswordModal(null); setNewPassword(''); setConfirmNewPassword(''); setPasswordError(''); setShowChangePass1(false); setShowChangePass2(false); }}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Nueva contraseña para <strong>{showPasswordModal.username}</strong>
            </p>

            <div className="space-y-4 mb-4">
              <div className="relative">
                <input
                  type={showChangePass1 ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Nueva contraseña (mín. 4 caracteres)"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowChangePass1(!showChangePass1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showChangePass1 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showChangePass2 ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => { setConfirmNewPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Confirmar contraseña"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowChangePass2(!showChangePass2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showChangePass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm mb-4 flex items-center gap-1">
                <AlertTriangle size={14} />
                {passwordError}
              </p>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                El usuario deberá usar esta nueva contraseña para iniciar sesión.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowPasswordModal(null); setNewPassword(''); setConfirmNewPassword(''); setPasswordError(''); setShowChangePass1(false); setShowChangePass2(false); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="text-primary" size={20} />
                Crear Nuevo Usuario
              </h3>
              <button onClick={() => { setShowCreateModal(false); setNewUsername(''); setNewUserPassword(''); setConfirmUserPassword(''); setNewUserError(''); setShowUserPass1(false); setShowUserPass2(false); }}>
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => { setNewUsername(e.target.value); setNewUserError(''); }}
                  placeholder="usuario_ejemplo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={showUserPass1 ? 'text' : 'password'}
                    value={newUserPassword}
                    onChange={(e) => { setNewUserPassword(e.target.value); setNewUserError(''); }}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPass1(!showUserPass1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showUserPass1 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol del usuario</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="worker">Trabajador</option>
                  <option value="administrative">Administrativo</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newUserRole === 'worker' && 'Solo puede ver sus propias citas y datos'}
                  {newUserRole === 'administrative' && 'Gestiona citas, clientes, servicios y productos'}
                  {newUserRole === 'admin' && 'Acceso completo al sistema'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <div className="relative">
                  <input
                    type={showUserPass2 ? 'text' : 'password'}
                    value={confirmUserPassword}
                    onChange={(e) => { setConfirmUserPassword(e.target.value); setNewUserError(''); }}
                    placeholder="Repite la contraseña"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserPass2(!showUserPass2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showUserPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {newUserError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertTriangle size={16} />
                  {newUserError}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                El usuario se creará con estado <strong>"Activo"</strong> y podrá iniciar sesión inmediatamente.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setNewUsername(''); setNewUserPassword(''); setConfirmUserPassword(''); setNewUserError(''); setNewUserRole('worker'); setShowUserPass1(false); setShowUserPass2(false); }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteSuggestionId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Confirmar eliminación</h3>
              <button onClick={() => setDeleteSuggestionId(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres borrar esta sugerencia? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteSuggestionId(null)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteSuggestion}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
