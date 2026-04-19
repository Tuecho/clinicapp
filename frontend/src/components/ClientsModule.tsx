import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Calendar, Users, Briefcase, DollarSign,
  ChevronLeft, ChevronRight, X, Check, Phone, Mail, MapPin,
  Clock, Stethoscope, FileText, Lock, Shield, Eye, EyeOff,
  Download, AlertCircle, CheckCircle
} from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Client {
  id: string;
  name: string;
  dni: string;
  birthdate: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  medical_history: string;
  consultation_reason: string;
  referral_source: string;
  gdpr_consent: number;
  treatment_consent: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface Visit {
  id: string;
  client_id: string;
  appointment_id?: string;
  visit_date: string;
  clinical_notes: string;
  observations: string;
  medications_prescribed: string;
  follow_up_date?: string;
  next_appointment_date?: string;
  created_at: string;
  updated_at: string;
}

interface Consent {
  id: string;
  client_id: string;
  consent_type: string;
  consent_text: string;
  signed_at: string;
  signature_data: string;
  ip_address: string;
  user_agent: string;
  valid_until?: string;
  revoked: number;
  revoked_at?: string;
  created_at: string;
}

interface GDPRData {
  id?: string;
  client_id?: string;
  consent_marketing: number;
  consent_data_processing: number;
  consent_third_parties: number;
  data_retention_days: number;
  right_to_be_forgotten: number;
  right_to_access_requested_at?: string;
  right_to_access_provided_at?: string;
  deletion_requested_at?: string;
  deletion_completed_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

type TabType = 'info' | 'visits' | 'consents' | 'gdpr';

export function ClientsModule() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loading, setLoading] = useState(false);

  // Client modal
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState<Partial<Client>>({});

  // Visits
  const [visits, setVisits] = useState<Visit[]>([]);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState<Partial<Visit>>({});

  // Consents
  const [consents, setConsents] = useState<Consent[]>([]);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentForm, setConsentForm] = useState<Partial<Consent>>({});
  const [signatureCanvas, setSignatureCanvas] = useState<HTMLCanvasElement | null>(null);

  // GDPR
  const [gdprData, setGdprData] = useState<GDPRData | null>(null);
  const [showGDPRModal, setShowGDPRModal] = useState(false);
  const [gdprForm, setGdprForm] = useState<Partial<GDPRData>>({});

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Load clients
  const loadClients = async () => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/clients`, {
        headers: getAuthHeaders()
      });
      setClients(await response.json());
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  // Load visits
  const loadVisits = async (clientId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/visits/${clientId}`, {
        headers: getAuthHeaders()
      });
      setVisits(await response.json());
    } catch (error) {
      console.error('Error loading visits:', error);
    }
  };

  // Load consents
  const loadConsents = async (clientId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/consents/${clientId}`, {
        headers: getAuthHeaders()
      });
      setConsents(await response.json());
    } catch (error) {
      console.error('Error loading consents:', error);
    }
  };

  // Load GDPR data
  const loadGDPRData = async (clientId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/clinic/gdpr/${clientId}`, {
        headers: getAuthHeaders()
      });
      setGdprData(await response.json());
    } catch (error) {
      console.error('Error loading GDPR data:', error);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      switch (activeTab) {
        case 'visits':
          loadVisits(selectedClient.id);
          break;
        case 'consents':
          loadConsents(selectedClient.id);
          break;
        case 'gdpr':
          loadGDPRData(selectedClient.id);
          break;
      }
    }
  }, [activeTab, selectedClient]);

  // Client operations
  const handleSaveClient = async () => {
    if (!clientForm.name) return;
    try {
      const method = editingClient ? 'PUT' : 'POST';
      const url = editingClient
        ? `${API_URL}/api/clinic/clients/${editingClient.id}`
        : `${API_URL}/api/clinic/clients`;

      await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientForm)
      });

      setShowClientModal(false);
      setClientForm({});
      setEditingClient(null);
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('¿Estás seguro? Esta acción eliminará al cliente y todos sus datos.')) return;
    try {
      await fetch(`${API_URL}/api/clinic/clients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      loadClients();
      setSelectedClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  // Visit operations
  const handleSaveVisit = async () => {
    if (!selectedClient || !visitForm.visit_date) return;
    try {
      const method = 'POST';
      const url = `${API_URL}/api/clinic/visits`;

      await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: selectedClient.id,
          ...visitForm
        })
      });

      setShowVisitModal(false);
      setVisitForm({});
      loadVisits(selectedClient.id);
    } catch (error) {
      console.error('Error saving visit:', error);
    }
  };

  // Consent operations
  const handleSaveConsent = async () => {
    if (!selectedClient || !consentForm.consent_type || !consentForm.signature_data) return;
    try {
      const method = 'POST';
      const url = `${API_URL}/api/clinic/consents`;

      await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: selectedClient.id,
          ...consentForm
        })
      });

      setShowConsentModal(false);
      setConsentForm({});
      loadConsents(selectedClient.id);
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    if (!confirm('¿Revocar este consentimiento?')) return;
    try {
      await fetch(`${API_URL}/api/clinic/consents/${consentId}/revoke`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (selectedClient) loadConsents(selectedClient.id);
    } catch (error) {
      console.error('Error revoking consent:', error);
    }
  };

  // GDPR operations
  const handleSaveGDPRData = async () => {
    if (!selectedClient) return;
    try {
      const method = 'PUT';
      const url = `${API_URL}/api/clinic/gdpr/${selectedClient.id}`;

      await fetch(url, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gdprForm)
      });

      setShowGDPRModal(false);
      loadGDPRData(selectedClient.id);
    } catch (error) {
      console.error('Error saving GDPR data:', error);
    }
  };

  const handleRightToBeForgettenRequest = async () => {
    if (!selectedClient) return;
    if (!confirm('¿Solicitar derecho al olvido? Los datos serán marcados para eliminación.')) return;

    try {
      await fetch(`${API_URL}/api/clinic/gdpr/${selectedClient.id}/right-to-be-forgotten`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (selectedClient) loadGDPRData(selectedClient.id);
    } catch (error) {
      console.error('Error requesting right to be forgotten:', error);
    }
  };

  const handleCompleteDeletion = async () => {
    if (!selectedClient) return;
    if (!confirm('⚠️ ADVERTENCIA: Esta acción eliminará permanentemente TODOS los datos del cliente. ¿Continuar?')) return;

    try {
      await fetch(`${API_URL}/api/clinic/gdpr/${selectedClient.id}/complete-deletion`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      loadClients();
      setSelectedClient(null);
    } catch (error) {
      console.error('Error completing deletion:', error);
    }
  };

  const signCanvas = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvas) return;
    const canvas = signatureCanvas;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (event.buttons === 1) {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const initSignatureCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    setSignatureCanvas(canvas);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  };

  const clearSignature = () => {
    if (signatureCanvas) {
      const ctx = signatureCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
      }
    }
  };

  const getSignatureImage = () => {
    if (!signatureCanvas) return null;
    return signatureCanvas.toDataURL('image/png');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            Módulo de Clientes (CRM)
          </h1>
          <p className="text-slate-600 mt-2">Gestión completa de fichas de cliente, historial de visitas, consentimientos y conformidad RGPD</p>
        </div>

        {!selectedClient ? (
          // Clients List View
          <div>
            {/* Search and Add */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  setEditingClient(null);
                  setClientForm({});
                  setShowClientModal(true);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Cliente
              </button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setActiveTab('info');
                  }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 border-blue-600"
                >
                  <h3 className="text-lg font-bold text-slate-900">{client.name}</h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.phone}
                      </div>
                    )}
                    {client.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {client.city}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClient(client);
                        setClientForm(client);
                        setShowClientModal(true);
                      }}
                      className="flex-1 px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClient(client.id);
                      }}
                      className="flex-1 px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Client Detail View
          <div>
            {/* Back Button and Actions */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setActiveTab('info');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Volver a Clientes
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingClient(selectedClient);
                    setClientForm(selectedClient);
                    setShowClientModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar Ficha
                </button>
              </div>
            </div>

            {/* Client Header */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{selectedClient.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {selectedClient.dni && (
                  <div>
                    <p className="text-sm text-slate-600">DNI/NIE</p>
                    <p className="font-medium text-slate-900">{selectedClient.dni}</p>
                  </div>
                )}
                {selectedClient.phone && (
                  <div>
                    <p className="text-sm text-slate-600">Teléfono</p>
                    <p className="font-medium text-slate-900">{selectedClient.phone}</p>
                  </div>
                )}
                {selectedClient.email && (
                  <div>
                    <p className="text-sm text-slate-600">Email</p>
                    <p className="font-medium text-slate-900">{selectedClient.email}</p>
                  </div>
                )}
                {selectedClient.birthdate && (
                  <div>
                    <p className="text-sm text-slate-600">Fecha de Nacimiento</p>
                    <p className="font-medium text-slate-900">{selectedClient.birthdate}</p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {selectedClient.gender && (
                  <div>
                    <p className="text-sm text-slate-600">Género</p>
                    <p className="font-medium text-slate-900">{selectedClient.gender}</p>
                  </div>
                )}
                {selectedClient.city && (
                  <div>
                    <p className="text-sm text-slate-600">Ciudad</p>
                    <p className="font-medium text-slate-900">{selectedClient.city}</p>
                  </div>
                )}
                {selectedClient.consultation_reason && (
                  <div>
                    <p className="text-sm text-slate-600">Motivo de Consulta</p>
                    <p className="font-medium text-slate-900">{selectedClient.consultation_reason}</p>
                  </div>
                )}
                {selectedClient.referral_source && (
                  <div>
                    <p className="text-sm text-slate-600">Referente</p>
                    <p className="font-medium text-slate-900 capitalize">{selectedClient.referral_source}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-3">
                {selectedClient.gdpr_consent === 1 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> LOPD
                  </span>
                )}
                {selectedClient.treatment_consent === 1 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Consentimiento
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap bg-white rounded-lg p-2 shadow-md">
              {(['info', 'visits', 'consents', 'gdpr'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'info' && '📋 Información'}
                  {tab === 'visits' && '📅 Historial de Visitas'}
                  {tab === 'consents' && '📝 Consentimientos'}
                  {tab === 'gdpr' && '🔒 RGPD'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Información General</h3>
                {selectedClient.notes && (
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                    <p className="text-sm font-medium text-blue-900">Notas:</p>
                    <p className="text-slate-700 mt-1">{selectedClient.notes}</p>
                  </div>
                )}
                <div className="mt-4 text-sm text-slate-600">
                  <p>Registrado: {new Date(selectedClient.created_at).toLocaleDateString()}</p>
                  <p>Última actualización: {new Date(selectedClient.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            )}

            {activeTab === 'visits' && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Historial de Visitas</h3>
                  <button
                    onClick={() => {
                      setVisitForm({});
                      setShowVisitModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Visita
                  </button>
                </div>

                {visits.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">Sin historial de visitas registradas</p>
                ) : (
                  <div className="space-y-4">
                    {visits.map((visit) => (
                      <div key={visit.id} className="border border-slate-300 rounded-lg p-4 hover:border-blue-600 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">
                              {new Date(visit.visit_date).toLocaleDateString()}
                            </p>
                            {visit.clinical_notes && (
                              <p className="text-sm text-slate-700 mt-2">
                                <span className="font-medium">Notas Clínicas:</span> {visit.clinical_notes}
                              </p>
                            )}
                            {visit.observations && (
                              <p className="text-sm text-slate-700 mt-1">
                                <span className="font-medium">Observaciones:</span> {visit.observations}
                              </p>
                            )}
                            {visit.medications_prescribed && (
                              <p className="text-sm text-slate-700 mt-1">
                                <span className="font-medium">Medicamentos:</span> {visit.medications_prescribed}
                              </p>
                            )}
                            {visit.follow_up_date && (
                              <p className="text-sm text-slate-700 mt-1">
                                <span className="font-medium">Seguimiento:</span> {visit.follow_up_date}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'consents' && (
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Consentimientos Informados</h3>
                  <button
                    onClick={() => {
                      setConsentForm({});
                      clearSignature();
                      setShowConsentModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Consentimiento
                  </button>
                </div>

                {consents.length === 0 ? (
                  <p className="text-slate-600 text-center py-8">Sin consentimientos registrados</p>
                ) : (
                  <div className="space-y-4">
                    {consents.map((consent) => (
                      <div
                        key={consent.id}
                        className={`border-2 rounded-lg p-4 ${
                          consent.revoked
                            ? 'border-red-300 bg-red-50'
                            : 'border-green-300 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900">{consent.consent_type}</h4>
                              {consent.revoked ? (
                                <span className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full">
                                  Revocado
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                                  Vigente
                                </span>
                              )}
                            </div>
                            {consent.consent_text && (
                              <p className="text-sm text-slate-700 mt-2">{consent.consent_text}</p>
                            )}
                            <p className="text-xs text-slate-600 mt-2">
                              Firmado: {new Date(consent.signed_at).toLocaleDateString()}
                            </p>
                            {consent.valid_until && (
                              <p className="text-xs text-slate-600">
                                Válido hasta: {new Date(consent.valid_until).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {!consent.revoked && (
                            <button
                              onClick={() => handleRevokeConsent(consent.id)}
                              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-all"
                            >
                              Revocar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gdpr' && gdprData && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-6 h-6 text-purple-600" />
                      Gestión de Consentimientos RGPD
                    </h3>
                    <button
                      onClick={() => {
                        setGdprForm(gdprData);
                        setShowGDPRModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      gdprData.consent_marketing ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {gdprData.consent_marketing ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-slate-400" />
                        )}
                        <p className="font-medium">Marketing y Comunicaciones</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      gdprData.consent_data_processing ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {gdprData.consent_data_processing ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-slate-400" />
                        )}
                        <p className="font-medium">Procesamiento de Datos</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      gdprData.consent_third_parties ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {gdprData.consent_third_parties ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-slate-400" />
                        )}
                        <p className="font-medium">Compartir con Terceros</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg border-2 border-slate-300 bg-slate-50">
                      <p className="font-medium">Retención de Datos</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">
                        {gdprData.data_retention_days} días
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Derechos del Cliente</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleRightToBeForgettenRequest}
                      className="w-full px-4 py-3 bg-red-50 border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-all text-left font-medium"
                    >
                      ⚖️ Derecho al Olvido (Solicitar Eliminación)
                    </button>
                    <button
                      onClick={handleCompleteDeletion}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
                    >
                      🗑️ Eliminar Todos los Datos Permanentemente
                    </button>
                  </div>
                </div>

                {gdprData.deletion_requested_at && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
                    <p className="text-sm font-medium text-yellow-900">
                      Solicitud de derecho al olvido realizada el {new Date(gdprData.deletion_requested_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Client Modal */}
        {showClientModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">1. Identificación</h4>
                  <input
                    type="text"
                    placeholder="Nombre completo *"
                    value={clientForm.name || ''}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="DNI/NIE/Pasaporte"
                    value={clientForm.dni || ''}
                    onChange={(e) => setClientForm({ ...clientForm, dni: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date" lang="es"
                    placeholder="Fecha de nacimiento"
                    value={clientForm.birthdate || ''}
                    onChange={(e) => setClientForm({ ...clientForm, birthdate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={clientForm.gender || ''}
                  onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar género</option>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">2. Contacto</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="tel"
                      placeholder="Teléfono móvil"
                      value={clientForm.phone || ''}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={clientForm.email || ''}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={clientForm.address || ''}
                    onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-2"
                  />
                  <input
                    type="text"
                    placeholder="Código postal"
                    value={clientForm.postal_code || ''}
                    onChange={(e) => setClientForm({ ...clientForm, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={clientForm.city || ''}
                  onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">3. Información Clínica</h4>
                  <textarea
                    placeholder="Historial médico (alergias, medicación, cirugías, enfermedades)"
                    value={clientForm.medical_history || ''}
                    onChange={(e) => setClientForm({ ...clientForm, medical_history: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Motivo de consulta (ej: Botox, depilación láser, limpieza)"
                    value={clientForm.consultation_reason || ''}
                    onChange={(e) => setClientForm({ ...clientForm, consultation_reason: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={clientForm.referral_source || ''}
                  onChange={(e) => setClientForm({ ...clientForm, referral_source: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">¿Cómo nos conoció?</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                  <option value="recomendacion">Recomendación</option>
                  <option value="pasando">Pasando por la calle</option>
                  <option value="otro">Otro</option>
                </select>

                <div>
                  <h4 className="font-medium text-slate-900 mb-2">4. Consentimientos</h4>
                  <label className="flex items-center gap-3 p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={clientForm.gdpr_consent === 1}
                      onChange={(e) => setClientForm({ ...clientForm, gdpr_consent: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Consentimiento LOPD (protección de datos) *</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 mt-2">
                    <input
                      type="checkbox"
                      checked={clientForm.treatment_consent === 1}
                      onChange={(e) => setClientForm({ ...clientForm, treatment_consent: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Consentimiento informado para tratamientos</span>
                  </label>
                </div>

                <textarea
                  placeholder="Notas privadas"
                  value={clientForm.notes || ''}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowClientModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveClient}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visit Modal */}
        {showVisitModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Registrar Nueva Visita</h2>
              <div className="space-y-3">
                <input
                  type="date" lang="es"
                  value={visitForm.visit_date || ''}
                  onChange={(e) => setVisitForm({ ...visitForm, visit_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Notas clínicas"
                  value={visitForm.clinical_notes || ''}
                  onChange={(e) => setVisitForm({ ...visitForm, clinical_notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Observaciones"
                  value={visitForm.observations || ''}
                  onChange={(e) => setVisitForm({ ...visitForm, observations: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Medicamentos prescritos"
                  value={visitForm.medications_prescribed || ''}
                  onChange={(e) => setVisitForm({ ...visitForm, medications_prescribed: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date" lang="es"
                  placeholder="Fecha de seguimiento"
                  value={visitForm.follow_up_date || ''}
                  onChange={(e) => setVisitForm({ ...visitForm, follow_up_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowVisitModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVisit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Guardar Visita
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Consent Modal */}
        {showConsentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Nuevo Consentimiento Informado</h2>
              <div className="space-y-3">
                <select
                  value={consentForm.consent_type || ''}
                  onChange={(e) => setConsentForm({ ...consentForm, consent_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo de consentimiento</option>
                  <option value="tratamiento">Tratamiento General</option>
                  <option value="procedimiento">Procedimiento Especial</option>
                  <option value="datos">Procesamiento de Datos</option>
                  <option value="marketing">Marketing y Comunicaciones</option>
                  <option value="fotos">Uso de Fotografías</option>
                </select>
                <textarea
                  placeholder="Texto del consentimiento"
                  value={consentForm.consent_text || ''}
                  onChange={(e) => setConsentForm({ ...consentForm, consent_text: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date" lang="es"
                  placeholder="Válido hasta"
                  value={consentForm.valid_until || ''}
                  onChange={(e) => setConsentForm({ ...consentForm, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="border-2 border-slate-300 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Firma Digital:</p>
                  <canvas
                    ref={initSignatureCanvas}
                    width={400}
                    height={150}
                    onMouseMove={signCanvas}
                    onMouseDown={(e) => {
                      const canvas = e.currentTarget;
                      setSignatureCanvas(canvas);
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.beginPath();
                        const rect = canvas.getBoundingClientRect();
                        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                      }
                    }}
                    className="w-full border border-slate-300 rounded bg-white cursor-crosshair"
                  />
                  <button
                    onClick={clearSignature}
                    className="mt-2 px-3 py-1 bg-slate-200 text-slate-700 rounded text-sm hover:bg-slate-300 transition-all"
                  >
                    Limpiar Firma
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowConsentModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const sig = getSignatureImage();
                    if (sig) {
                      setConsentForm({ ...consentForm, signature_data: sig });
                    }
                    handleSaveConsent();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Guardar Consentimiento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GDPR Modal */}
        {showGDPRModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Gestión RGPD</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={(gdprForm.consent_marketing as any) === 1}
                    onChange={(e) => setGdprForm({ ...gdprForm, consent_marketing: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Consentimiento para Marketing</span>
                </label>

                <label className="flex items-center gap-3 p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={(gdprForm.consent_data_processing as any) === 1}
                    onChange={(e) => setGdprForm({ ...gdprForm, consent_data_processing: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Consentimiento para Procesamiento de Datos</span>
                </label>

                <label className="flex items-center gap-3 p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={(gdprForm.consent_third_parties as any) === 1}
                    onChange={(e) => setGdprForm({ ...gdprForm, consent_third_parties: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">Compartir Datos con Terceros</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Retención de Datos (días):
                  </label>
                  <input
                    type="number"
                    value={gdprForm.data_retention_days || 365}
                    onChange={(e) => setGdprForm({ ...gdprForm, data_retention_days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <textarea
                  placeholder="Notas"
                  value={gdprForm.notes || ''}
                  onChange={(e) => setGdprForm({ ...gdprForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowGDPRModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveGDPRData}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
