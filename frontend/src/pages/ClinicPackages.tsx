import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, Users, Calendar, CheckCircle2, Loader2, Sparkles, X, Gift, Zap } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ServicePackage {
  id: string;
  owner_id: number;
  name: string;
  description: string;
  service_id: string;
  total_sessions: number;
  price: number;
  session_price?: number;
  active: number;
  created_at: string;
}

interface ClientPackageUsage {
  id: string;
  owner_id: number;
  client_id: string;
  package_id: string;
  sessions_consumed: number;
  sessions_remaining: number;
  purchase_date: string;
  expiry_date?: string;
  status: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
}

interface Client {
  id: string;
  name: string;
}

export function ClinicPackages() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [clientUsage, setClientUsage] = useState<ClientPackageUsage[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'packages' | 'usage'>('packages');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);
  const [editingUsage, setEditingUsage] = useState<ClientPackageUsage | null>(null);

  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    service_id: '',
    total_sessions: 10,
    price: 0,
  });

  const [usageForm, setUsageForm] = useState({
    client_id: '',
    package_id: '',
    sessions_consumed: 0,
  });
  const [editingUsageId, setEditingUsageId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [packagesRes, usageRes, servicesRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/api/clinic/packages`, { headers }),
        fetch(`${API_URL}/api/clinic/packages/usage/all`, { headers }),
        fetch(`${API_URL}/api/clinic/services`, { headers }),
        fetch(`${API_URL}/api/clinic/clients`, { headers }),
      ]);

      const packagesData = await packagesRes.json();
      const usageData = await usageRes.json();
      const servicesData = await servicesRes.json();
      const clientsData = await clientsRes.json();

      setPackages(Array.isArray(packagesData) ? packagesData : []);
      setClientUsage(Array.isArray(usageData) ? usageData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePackage = async () => {
    try {
      if (!packageForm.name || !packageForm.service_id || packageForm.total_sessions <= 0 || packageForm.price <= 0) {
        alert('Por favor completa todos los campos requeridos');
        return;
      }

      const headers = getAuthHeaders();
      const url = editingPackage
        ? `${API_URL}/api/clinic/packages/${editingPackage.id}`
        : `${API_URL}/api/clinic/packages`;

      const method = editingPackage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(packageForm),
      });

      if (response.ok) {
        setShowPackageModal(false);
        setEditingPackage(null);
        setPackageForm({ name: '', description: '', service_id: '', total_sessions: 10, price: 0 });
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al guardar el paquete');
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar el paquete');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este paquete?')) {
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_URL}/api/clinic/packages/${id}`, { method: 'DELETE', headers });
        if (response.ok) fetchData();
      } catch (error) {
        console.error('Error deleting package:', error);
      }
    }
  };

  const handleRegisterUsage = async () => {
    try {
      if (!usageForm.client_id || !usageForm.package_id) {
        alert('Por favor selecciona cliente y paquete');
        return;
      }
      const headers = getAuthHeaders();
      const url = editingUsageId
        ? `${API_URL}/api/clinic/packages/usage/${editingUsageId}`
        : `${API_URL}/api/clinic/packages/usage/register`;
      const method = editingUsageId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(usageForm),
      });
      if (response.ok) {
        setShowUsageModal(false);
        setUsageForm({ client_id: '', package_id: '', sessions_consumed: 0 });
        setEditingUsageId(null);
        fetchData();
      } else {
        alert('Error al registrar el uso');
      }
    } catch (error) {
      console.error('Error registering usage:', error);
      alert('Error al registrar el uso');
    }
  };

  const handleDeleteUsage = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro de uso?')) {
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`${API_URL}/api/clinic/packages/usage/${id}`, { method: 'DELETE', headers });
        if (response.ok) fetchData();
      } catch (error) {
        console.error('Error deleting usage:', error);
      }
    }
  };

  const openEditUsage = (usage: ClientPackageUsage) => {
    setEditingUsageId(usage.id);
    setUsageForm({
      client_id: usage.client_id,
      package_id: usage.package_id,
      sessions_consumed: usage.sessions_consumed,
    });
    setShowUsageModal(true);
  };

  const getServiceName = (serviceId: string) => services.find(s => s.id === serviceId)?.name || 'N/A';
  const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.name || 'N/A';
  const getPackageName = (packageId: string) => packages.find(p => p.id === packageId)?.name || 'N/A';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm animate-pulse">Cargando bonos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-5 md:p-7 shadow-xl shadow-orange-200/40 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA3KSIvPjwvc3ZnPg==')] opacity-60"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Bonos y Suscripciones</h1>
              <p className="text-orange-100 text-sm mt-0.5">Gestiona packs de sesiones y consumo de clientes</p>
            </div>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[80px]">
              <p className="text-2xl font-black text-white">{packages.length}</p>
              <p className="text-[11px] text-orange-100 font-medium uppercase tracking-wide">Paquetes</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[80px]">
              <p className="text-2xl font-black text-white">{clientUsage.filter(u => u.status === 'active').length}</p>
              <p className="text-[11px] text-orange-100 font-medium uppercase tracking-wide">Activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
            activeTab === 'packages'
              ? 'bg-white text-orange-700 shadow-md shadow-orange-100/50 border-orange-200 ring-1 ring-orange-100'
              : 'bg-transparent text-slate-500 border-transparent hover:bg-white/70 hover:text-slate-700 hover:shadow-sm'
          }`}
        >
          <Package className="w-4 h-4" />
          Paquetes
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
            activeTab === 'usage'
              ? 'bg-white text-orange-700 shadow-md shadow-orange-100/50 border-orange-200 ring-1 ring-orange-100'
              : 'bg-transparent text-slate-500 border-transparent hover:bg-white/70 hover:text-slate-700 hover:shadow-sm'
          }`}
        >
          <Users className="w-4 h-4" />
          Control de Sesiones
        </button>
      </div>

      {/* ─── PACKAGES TAB ─── */}
      {activeTab === 'packages' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Paquetes Disponibles</h2>
            <button
              onClick={() => {
                setEditingPackage(null);
                setPackageForm({ name: '', description: '', service_id: '', total_sessions: 10, price: 0 });
                setShowPackageModal(true);
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-orange-200/50 transition-all font-semibold text-sm active:scale-[0.97]"
            >
              <Plus size={18} />
              Nuevo Paquete
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-orange-100/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-50 to-transparent rounded-bl-[3rem]"></div>
                <div className="relative flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200/40">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{pkg.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{getServiceName(pkg.service_id)}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingPackage(pkg);
                        setPackageForm({
                          name: pkg.name,
                          description: pkg.description || '',
                          service_id: pkg.service_id,
                          total_sessions: pkg.total_sessions,
                          price: pkg.price,
                        });
                        setShowPackageModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="flex-1 bg-amber-50/70 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Sesiones</p>
                    <p className="font-extrabold text-amber-700 text-2xl">{pkg.total_sessions}</p>
                  </div>
                  <div className="flex-1 bg-emerald-50/70 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Precio</p>
                    <p className="font-extrabold text-emerald-700 text-xl">€{pkg.price}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Coste/sesión</span>
                  <span className="text-sm font-extrabold text-violet-600">€{(pkg.price / pkg.total_sessions).toFixed(2)}</span>
                </div>

                {pkg.description && (
                  <p className="text-xs text-slate-400 mt-3 line-clamp-2">{pkg.description}</p>
                )}
              </div>
            ))}

            {packages.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-slate-400">Aún no hay paquetes creados</p>
                <p className="text-xs text-slate-300 mt-1">Crea tu primer bono para empezar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── USAGE TAB ─── */}
      {activeTab === 'usage' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Control de Sesiones</h2>
            <button
              onClick={() => {
                setUsageForm({ client_id: '', package_id: '', sessions_consumed: 0 });
                setShowUsageModal(true);
              }}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-orange-200/50 transition-all font-semibold text-sm active:scale-[0.97]"
            >
              <Plus size={18} />
              Registrar Consumo
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200">
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Paquete</th>
                  <th className="text-center py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Usadas</th>
                  <th className="text-center py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Restantes</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-center py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientUsage.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-400 font-medium">No hay consumos registrados</p>
                    </td>
                  </tr>
                ) : (
                  clientUsage.map(usage => {
                    const total = usage.sessions_consumed + usage.sessions_remaining;
                    const progress = total > 0 ? (usage.sessions_consumed / total) * 100 : 0;
                    return (
                      <tr key={usage.id} className="border-b border-slate-50 hover:bg-orange-50/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-800">{getClientName(usage.client_id)}</td>
                        <td className="py-3.5 px-5 text-slate-600">{getPackageName(usage.package_id)}</td>
                        <td className="py-3.5 px-5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-700 font-bold text-sm">{usage.sessions_consumed}</span>
                        </td>
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${usage.sessions_remaining <= 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{usage.sessions_remaining}</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            usage.status === 'active' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' :
                            usage.status === 'completed' ? 'bg-violet-50 text-violet-600 ring-1 ring-violet-200' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {usage.status === 'active' && <Zap size={11} />}
                            {usage.status === 'active' ? 'Activo' : 'Completado'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 text-xs">
                          {new Date(usage.purchase_date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditUsage(usage)}
                              className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteUsage(usage.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── PACKAGE MODAL ─── */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/10 border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800">
                {editingPackage ? 'Editar Paquete' : 'Nuevo Paquete'}
              </h2>
              <button onClick={() => { setShowPackageModal(false); setEditingPackage(null); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nombre del Paquete *</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={e => setPackageForm({ ...packageForm, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800"
                  placeholder="Ej: Pack 10 Depilaciones"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Servicio *</label>
                <select
                  value={packageForm.service_id}
                  onChange={e => setPackageForm({ ...packageForm, service_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800"
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Sesiones *</label>
                  <input
                    type="number"
                    value={packageForm.total_sessions}
                    onChange={e => setPackageForm({ ...packageForm, total_sessions: parseInt(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800 text-center text-lg font-bold"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Precio Total €</label>
                  <input
                    type="number"
                    value={packageForm.price}
                    onChange={e => setPackageForm({ ...packageForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800 text-center text-lg font-bold"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              {packageForm.total_sessions > 0 && packageForm.price > 0 && (
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <span className="text-xs text-amber-600 font-medium">Precio por sesión: </span>
                  <span className="text-lg font-extrabold text-amber-700">€{(packageForm.price / packageForm.total_sessions).toFixed(2)}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Descripción</label>
                <textarea
                  value={packageForm.description}
                  onChange={e => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800 resize-none text-sm"
                  rows={2}
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowPackageModal(false); setEditingPackage(null); }}
                className="flex-1 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 font-semibold text-slate-600 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePackage}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-2.5 hover:shadow-lg hover:shadow-orange-200/50 font-semibold text-sm transition-all active:scale-[0.97]"
              >
                Guardar Paquete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── USAGE MODAL ─── */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/10 border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800">{editingUsageId ? 'Editar Control de Sesiones' : 'Registrar Consumo'}</h2>
              <button onClick={() => { setShowUsageModal(false); setEditingUsageId(null); setUsageForm({ client_id: '', package_id: '', sessions_consumed: 0 }); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Cliente *</label>
                <select
                  value={usageForm.client_id}
                  onChange={e => setUsageForm({ ...usageForm, client_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800"
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Paquete *</label>
                <select
                  value={usageForm.package_id}
                  onChange={e => setUsageForm({ ...usageForm, package_id: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800"
                >
                  <option value="">Selecciona un paquete</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Sesiones Consumidas *</label>
                <input
                  type="number"
                  value={usageForm.sessions_consumed}
                  onChange={e => setUsageForm({ ...usageForm, sessions_consumed: parseInt(e.target.value) || 0 })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all text-slate-800 text-center text-lg font-bold"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowUsageModal(false); setEditingUsageId(null); setUsageForm({ client_id: '', package_id: '', sessions_consumed: 0 }); }}
                className="flex-1 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 font-semibold text-slate-600 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegisterUsage}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-2.5 hover:shadow-lg hover:shadow-orange-200/50 font-semibold text-sm transition-all active:scale-[0.97]"
              >
                {editingUsageId ? 'Guardar Cambios' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
