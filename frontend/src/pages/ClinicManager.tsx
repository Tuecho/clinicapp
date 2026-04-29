import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit, Calendar, Users, Briefcase, DollarSign,
  ChevronLeft, ChevronRight, X, Check, Phone, Mail, MapPin,
  Clock, Stethoscope, AlertCircle, Settings, Send, Package,
  BarChart3, TrendingUp, ShoppingCart, UserCog, List, Receipt, Wallet
} from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { formatDateEs } from '../utils/format';
import { DateInput, TimeInput } from '../utils/DateTimeInput';
import { useAuth } from '../components/Auth';
import { UserRole } from '../types';
import { Accounting } from './Accounting';

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
}

interface Service {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  duration_minutes: number;
  price: number;
  price_offer?: number;
  category: string;
  required_resources?: string;
  professional_ids?: string;
  equipment?: string;
  pre_instructions?: string;
  post_instructions?: string;
  active: number;
}

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

interface Appointment {
  id: string;
  client_id: string;
  service_id: string;
  professional_id?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  price: number;
  notes: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_name: string;
  service_price: number;
}

interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string;
  bio: string;
  active: number;
  color: string;
}

interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  description?: string;
  cost_price?: number;
  selling_price: number;
  current_stock?: number;
  min_stock?: number;
  active: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_id?: string;
  client_name?: string;
  date: string;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  items?: InvoiceItem[];
}

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface RevenueReport {
  summary: { totalRevenue: number; totalAppointments: number; averagePerAppointment: number };
  byService: { name: string; category: string; total_revenue: number; total_appointments: number }[];
  byMonth: { month: string; total: number; count: number }[];
}

interface Invoice {
  id: string;
  client_id: string;
  client_name?: string;
  invoice_number: string;
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  tax_amount: number;
  total: number;
  status: string;
  payment_method: string;
  paid_amount: number;
  date: string;
  due_date: string;
  notes: string;
  created_at: string;
}

type View = 'appointments' | 'calendar' | 'clients' | 'services' | 'professionals' | 'products' | 'invoices' | 'reports' | 'packages';

export function ClinicManager() {
  const { role } = useAuth();
  const userRole = role?.trim().toLowerCase() || 'worker';
  const isWorker = userRole === 'worker';
  const isAdminOrAdministrative = userRole === 'admin' || userRole === 'administrative';
  
  const [view, setView] = useState<View>(() => {
    const stored = localStorage.getItem('clinic_lastView');
    return (stored as View) || (isAdminOrAdministrative ? 'dashboard' : 'appointments');
  });
  const [loading, setLoading] = useState(false);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('hiddenCategories');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('');

  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Package states
  const [packages, setPackages] = useState<any[]>([]);
  const [packageUsage, setPackageUsage] = useState<any[]>([]);

  // Modal states
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);

  // Edit states
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Form states
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [birthdateDisplay, setBirthdateDisplay] = useState('');
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({});
  const [appointmentForm, setAppointmentForm] = useState<Partial<Appointment>>({});
  const [professionalForm, setProfessionalForm] = useState<Partial<Professional>>({});
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice & { items: InvoiceItem[] }>>({ items: [] });

  const parseDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const formatDateForInput = (dateDisplay: string) => {
    const parts = dateDisplay.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [clientReport, setClientReport] = useState<any>(null);
  const [appointmentReport, setAppointmentReport] = useState<any>(null);

  // New UI states
  const [clientFormTab, setClientFormTab] = useState(0);
  const [serviceFormTab, setServiceFormTab] = useState(0);
  const [professionalFormTab, setProfessionalFormTab] = useState(0);
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('day');

  // Initialize date range
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (role === 'administrative') {
      setDateRange({ start: today, end: today });
    } else {
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      setDateRange({
        start: firstDay.toISOString().split('T')[0],
        end: today,
      });
    }
  }, [role]);

  // Auto-select professional for workers
  useEffect(() => {
    if (isWorker && professionals.length > 0 && !selectedProfessionalId) {
      setSelectedProfessionalId(professionals[0].id);
    }
  }, [professionals, isWorker]);

  // Save view to localStorage
  useEffect(() => {
    localStorage.setItem('clinic_lastView', view);
  }, [view]);

  const [dailyDashboard, setDailyDashboard] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      
      // Load core data needed for almost all views and modals
      const [cliRes, svcRes, profRes] = await Promise.all([
        fetch(`${API_URL}/api/clinic/clients`, { headers }),
        fetch(`${API_URL}/api/clinic/services`, { headers }),
        fetch(`${API_URL}/api/clinic/professionals`, { headers })
      ]);
      
      const [cliData, svcData, profData] = await Promise.all([
        cliRes.json(),
        svcRes.json(),
        profRes.json()
      ]);
      
      if (Array.isArray(cliData)) setClients(cliData);
      if (Array.isArray(svcData)) setServices(svcData);
      if (Array.isArray(profData)) setProfessionals(profData);
      
      // Load specific data depending on active view
      if (view === 'dashboard') {
        const res = await fetch(`${API_URL}/api/clinic/dashboard/today`, { headers });
        setDailyDashboard(await res.json());
      }
      
      if (view === 'appointments' || view === 'calendar') {
        const [aptRes, statsRes] = await Promise.all([
          fetch(`${API_URL}/api/clinic/appointments`, { headers }),
          fetch(`${API_URL}/api/clinic/dashboard`, { headers })
        ]);
        setAppointments(await aptRes.json());
        setStats(await statsRes.json());
      }
      
      if (view === 'products') {
        const res = await fetch(`${API_URL}/api/clinic/products`, { headers });
        setProducts(await res.json());
      }
      
      if (view === 'invoices') {
        const res = await fetch(`${API_URL}/api/clinic/invoices`, { headers });
        const data = await res.json();
        setInvoices(data.map((inv: any) => ({ ...inv, items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items || [] })));
      }

      if (view === 'packages') {
        const [pkgRes, usageRes] = await Promise.all([
          fetch(`${API_URL}/api/clinic/packages`, { headers }),
          fetch(`${API_URL}/api/clinic/packages/usage/all`, { headers })
        ]);
        setPackages(await pkgRes.json());
        setPackageUsage(await usageRes.json());
      }
      
      if (view === 'reports') {
        const startDate = dateRange.start || new Date().toISOString().split('T')[0];
        const endDate = dateRange.end || new Date().toISOString().split('T')[0];
        const [revRes, cliReportRes, aptReportRes] = await Promise.all([
          fetch(`${API_URL}/api/clinic/reports/revenue?start_date=${startDate}&end_date=${endDate}`, { headers }),
          fetch(`${API_URL}/api/clinic/reports/clients?start_date=${startDate}&end_date=${endDate}`, { headers }),
          fetch(`${API_URL}/api/clinic/reports/appointments?start_date=${startDate}&end_date=${endDate}`, { headers })
        ]);
        setReport(await revRes.json());
        setClientReport(await cliReportRes.json());
        setAppointmentReport(await aptReportRes.json());
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [view, currentDate, dateRange]);

  // Client operations
  const handleSaveClient = async () => {
    if (!clientForm.name) return;
    try {
      const method = editingClient ? 'PUT' : 'POST';
      const url = editingClient ? `${API_URL}/api/clinic/clients/${editingClient.id}` : `${API_URL}/api/clinic/clients`;
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(clientForm) });
      if (!response.ok) throw new Error('Error al guardar cliente');
      setShowClientModal(false); setClientForm({}); setEditingClient(null); loadData();
    } catch (error) { 
      console.error('Error saving client:', error);
      alert('Error al guardar el cliente. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('¿Eliminar cliente?')) return;
    await fetch(`${API_URL}/api/clinic/clients/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadData();
  };

  // Service operations
  const handleSaveService = async () => {
    if (!serviceForm.name || serviceForm.price === undefined) return;
    try {
      const method = editingService ? 'PUT' : 'POST';
      const url = editingService ? `${API_URL}/api/clinic/services/${editingService.id}` : `${API_URL}/api/clinic/services`;
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm) });
      if (!response.ok) throw new Error('Error al guardar servicio');
      setShowServiceModal(false); setServiceForm({}); setEditingService(null); loadData();
    } catch (error) { 
      console.error('Error saving service:', error);
      alert('Error al guardar el servicio. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('¿Eliminar servicio?')) return;
    await fetch(`${API_URL}/api/clinic/services/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadData();
  };

  // Professional operations
  const handleSaveProfessional = async () => {
    if (!professionalForm.name) return;
    try {
      const method = editingProfessional ? 'PUT' : 'POST';
      const url = editingProfessional ? `${API_URL}/api/clinic/professionals/${editingProfessional.id}` : `${API_URL}/api/clinic/professionals`;
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(professionalForm) });
      if (!response.ok) throw new Error('Error al guardar profesional');
      setShowProfessionalModal(false); setProfessionalForm({}); setEditingProfessional(null); loadData();
    } catch (error) { 
      console.error('Error saving professional:', error);
      alert('Error al guardar el profesional. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    if (!confirm('¿Eliminar profesional?')) return;
    await fetch(`${API_URL}/api/clinic/professionals/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadData();
  };

  // Product operations
  const handleSaveProduct = async () => {
    if (!productForm.name || productForm.selling_price === undefined) return;
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct ? `${API_URL}/api/clinic/products/${editingProduct.id}` : `${API_URL}/api/clinic/products`;
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(productForm) });
      if (!response.ok) throw new Error('Error al guardar producto');
      setShowProductModal(false); setProductForm({}); setEditingProduct(null); loadData();
    } catch (error) { 
      console.error('Error saving product:', error);
      alert('Error al guardar el producto. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    await fetch(`${API_URL}/api/clinic/products/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadData();
  };

  const handleSaveInvoice = async () => {
    if (!invoiceForm.client_id || !invoiceForm.date || !invoiceForm.items?.length) return;
    try {
      const method = editingInvoice ? 'PUT' : 'POST';
      const url = editingInvoice ? `${API_URL}/api/clinic/invoices/${editingInvoice.id}` : `${API_URL}/api/clinic/invoices`;
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(invoiceForm) });
      if (!response.ok) throw new Error('Error al guardar factura');
      setShowInvoiceModal(false); setInvoiceForm({ items: [] }); setEditingInvoice(null); loadData();
    } catch (error) { 
      console.error('Error saving invoice:', error);
      alert('Error al guardar la factura. Por favor, inténtelo de nuevo.');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('¿Eliminar factura?')) return;
    await fetch(`${API_URL}/api/clinic/invoices/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadData();
  };

  // Appointment operations
  const handleSaveAppointment = async () => {
    if (!appointmentForm.client_id || !appointmentForm.service_id || !appointmentForm.appointment_date || !appointmentForm.appointment_time) return;
    try {
      const method = editingAppointment ? 'PUT' : 'POST';
      const url = editingAppointment ? `${API_URL}/api/clinic/appointments/${editingAppointment.id}` : `${API_URL}/api/clinic/appointments`;
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(appointmentForm) });
      if (!response.ok) throw new Error('Error al guardar cita');
      setShowAppointmentModal(false); setAppointmentForm({}); setEditingAppointment(null); loadData();
    } catch (error) { 
      console.error('Error saving appointment:', error);
      alert('Error al guardar la cita. Por favor, verifique los datos e inténtelo de nuevo.');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm('¿Eliminar cita?')) return;
    await fetch(`${API_URL}/api/clinic/appointments/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    loadData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`${API_URL}/api/clinic/appointments/${id}/status`, { method: 'PUT', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    loadData();
  };

  const openEditClient = (client: Client) => { setEditingClient(client); setClientForm(client); setBirthdateDisplay(parseDate(client.birthdate)); setClientFormTab(0); setShowClientModal(true); };
  const openEditService = (service: Service) => { setEditingService(service); setServiceForm(service); setServiceFormTab(0); setShowServiceModal(true); };
  const openEditProfessional = (professional: Professional) => { setEditingProfessional(professional); setProfessionalForm(professional); setProfessionalFormTab(0); setShowProfessionalModal(true); };
  const openEditProduct = (product: Product) => { setEditingProduct(product); setProductForm(product); setShowProductModal(true); };
  const openEditAppointment = (appointment: Appointment) => { setEditingAppointment(appointment); setAppointmentForm({ ...appointment, total_price: appointment.total_price || appointment.price }); setShowAppointmentModal(true); };
  const openEditInvoice = (invoice: Invoice) => { setEditingInvoice(invoice); setInvoiceForm({ ...invoice, items: invoice.items || [] }); setShowInvoiceModal(true); };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < firstDayOfWeek; i++) {
      const d = new Date(year, month, 1 - (firstDayOfWeek - i));
      days.push(d);
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return appointments.filter(a => 
      a.appointment_date === dateStr && 
      (!isAdminOrAdministrative || !selectedProfessionalId || a.professional_id === selectedProfessionalId)
    );
  };

  type View = 'dashboard' | 'appointments' | 'calendar' | 'clients' | 'services' | 'professionals' | 'products' | 'invoices' | 'reports' | 'accounting';

  const allNavItems: { key: View; label: string; icon: any }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { key: 'appointments', label: 'Citas', icon: Calendar },
    { key: 'calendar', label: 'Calendario', icon: Calendar },
    { key: 'clients', label: 'Clientes', icon: Users },
    { key: 'services', label: 'Servicios', icon: Briefcase },
    { key: 'professionals', label: 'Profesionales', icon: UserCog },
    { key: 'products', label: 'Productos', icon: Package },
    { key: 'invoices', label: 'Facturas', icon: Receipt },
    { key: 'reports', label: 'Reportes', icon: BarChart3 },
    { key: 'packages', label: 'Bonos', icon: Package },
    { key: 'accounting', label: 'Contabilidad', icon: Wallet },
  ];

  const navItems = isAdminOrAdministrative 
    ? allNavItems 
    : allNavItems.filter(item => ['appointments', 'calendar'].includes(item.key));

  if (loading) return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div><p className="text-slate-400 font-medium text-sm animate-pulse">Cargando clínica...</p></div>;

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans">
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
        {/* Premium Header */}
        <div className="relative mb-6 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-5 md:p-7 shadow-xl shadow-purple-200/40 overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA3KSIvPjwvc3ZnPg==')] opacity-60"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Mi Clínica</h1>
                <p className="text-purple-100 text-sm mt-0.5">Panel de gestión integral</p>
              </div>
            </div>
            <div className="flex gap-3 text-center">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[80px]">
                <p className="text-2xl font-black text-white">{clients.length}</p>
                <p className="text-[11px] text-purple-100 font-medium uppercase tracking-wide">Clientes</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[80px]">
                <p className="text-2xl font-black text-white">{appointments.length}</p>
                <p className="text-[11px] text-purple-100 font-medium uppercase tracking-wide">Citas</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2 min-w-[80px]">
                <p className="text-2xl font-black text-white">{professionals.length}</p>
                <p className="text-[11px] text-purple-100 font-medium uppercase tracking-wide">Equipo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setView(item.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 border ${
                view === item.key
                  ? 'bg-white text-purple-700 shadow-md shadow-purple-100/50 border-purple-200 ring-1 ring-purple-100'
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-white/70 hover:text-slate-700 hover:shadow-sm'
              }`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </div>

        

        {/* DASHBOARD */}
        {view === 'dashboard' && isAdminOrAdministrative && (
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-5">Dashboard - Hoy</h2>
            
            {!dailyDashboard ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-emerald-100 text-sm font-medium mb-1">Ingresos del día</p>
                    <p className="text-3xl font-bold">€{dailyDashboard.revenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-blue-100 text-sm font-medium mb-1">Citas completadas</p>
                    <p className="text-3xl font-bold">{dailyDashboard.appointments_completed || 0}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                    <p className="text-purple-100 text-sm font-medium mb-1">Citas programadas</p>
                    <p className="text-3xl font-bold">{dailyDashboard.appointments_scheduled || 0}</p>
                  </div>
                </div>

                {dailyDashboard.by_professional && dailyDashboard.by_professional.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <h3 className="font-bold text-slate-800 mb-4">Ingresos por profesional</h3>
                    <div className="space-y-3">
                      {dailyDashboard.by_professional.map((prof: any) => (
                        <div key={prof.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: prof.color || '#888' }}></div>
                            <span className="font-medium text-slate-700">{prof.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-800">€{prof.revenue?.toFixed(2) || '0.00'}</span>
                            <span className="text-xs text-slate-500 ml-2">({prof.appointments || 0} citas)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* APPOINTMENTS LIST */}
        {view === 'appointments' && (
          <div>
<div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-3">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Citas</h2>
              {isAdminOrAdministrative && (
                <select 
                  value={selectedProfessionalId} 
                  onChange={(e) => setSelectedProfessionalId(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Todos los profesionales</option>
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
              {isAdminOrAdministrative && (
                <button onClick={() => { setEditingAppointment(null); setAppointmentForm({}); setShowAppointmentModal(true); }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200/50 transition-all font-semibold text-sm active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Nueva Cita
                </button>
              )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200">
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Hora</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Servicio</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.filter(apt => !isAdminOrAdministrative || !selectedProfessionalId || apt.professional_id === selectedProfessionalId).map(apt => (
                    <tr key={apt.id} className="border-b border-slate-50 hover:bg-violet-50/30 transition-colors">
                      <td className="py-3.5 px-5">{formatDateEs(apt.appointment_date)}</td>
                      <td className="py-3.5 px-5">{apt.appointment_time}</td>
                      <td className="py-3.5 px-5"><div><p className="font-medium">{apt.client_name}</p><p className="text-xs text-slate-500">{apt.client_phone}</p></div></td>
                      <td className="py-3.5 px-5">{apt.service_name}</td>
<td className="py-3.5 px-5">
                          {isAdminOrAdministrative ? (
                          <select value={apt.status} onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs border-0 cursor-pointer ${
                            apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          <option value="scheduled">Programada</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                          </select>
                          ) : (
                          <span className={`px-2 py-1 rounded text-xs ${
                            apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {apt.status === 'scheduled' ? 'Programada' : apt.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </span>
                          )}
                        </td>
                      <td className="py-3.5 px-5">€{apt.price?.toFixed(2) || '-'}</td>
                        <td className="py-3.5 px-5 flex gap-2">
                          {isAdminOrAdministrative && (
                          <>
                          <button onClick={() => openEditAppointment(apt)} className="text-blue-600 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteAppointment(apt.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                          </>
                          )}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {view === 'calendar' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - (calendarMode === 'month' ? 30 : calendarMode === 'week' ? 7 : 1)))} className="p-2 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium text-slate-700 shadow-sm border border-slate-200">Hoy</button>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (calendarMode === 'month' ? 30 : calendarMode === 'week' ? 7 : 1)))} className="p-2 hover:bg-slate-100 rounded text-slate-600"><ChevronRight className="w-5 h-5" /></button>
              </div>
              <h2 className="text-xl font-bold flex-1 text-center md:text-left text-purple-900">
                {calendarMode === 'month' ? currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase()) : 
                 calendarMode === 'week' ? `Semana del ${currentDate.getDate()} de ${currentDate.toLocaleDateString('es-ES', { month: 'short' }).replace(/^\w/, c => c.toUpperCase())}` :
                 currentDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())
                }
              </h2>
              <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 shadow-inner">
                <button onClick={() => setCalendarMode('day')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${calendarMode==='day' ? 'bg-white shadow text-purple-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>Día</button>
                <button onClick={() => setCalendarMode('week')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${calendarMode==='week' ? 'bg-white shadow text-purple-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>Semana</button>
                <button onClick={() => setCalendarMode('month')} className={`px-4 py-1.5 text-sm rounded-md transition-colors ${calendarMode==='month' ? 'bg-white shadow text-purple-600 font-bold' : 'text-slate-600 hover:text-slate-900'}`}>Mes</button>
              </div>
              {isAdminOrAdministrative && (
                <select 
                  value={selectedProfessionalId} 
                  onChange={(e) => setSelectedProfessionalId(e.target.value)}
                  className="border rounded-lg px-3 py-1.5 text-sm bg-white ml-2"
                >
                  <option value="">Todos</option>
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {calendarMode === 'month' && (
              <div className="grid grid-cols-7 gap-1">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => <div key={d} className="text-center font-bold text-sm text-slate-500 py-2 border-b-2 border-purple-100 mb-1">{d}</div>)}
                {getDaysInMonth(currentDate).map((day, i) => {
                  const dayAppointments = getAppointmentsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  return (
                    <div key={i} className={`min-h-[110px] border rounded-lg p-1.5 transition-all ${!isCurrentMonth ? 'bg-slate-50/50 opacity-60' : 'hover:shadow-md hover:border-purple-200 bg-white'} ${isToday ? 'border-purple-500 border-2 bg-purple-50/30' : 'border-slate-200'}`}>
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-purple-700' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'}`}>
                        {isToday ? <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center -ml-1 -mt-1">{day.getDate()}</span> : day.getDate()}
                      </div>
                      {dayAppointments.slice(0, 3).map(apt => (
                        <div key={apt.id} className="text-[11px] bg-purple-100 text-purple-800 px-1.5 py-1 rounded mb-1 truncate font-medium shadow-sm border border-purple-200/50">
                          {apt.appointment_time} <span className="font-normal opacity-75">{apt.client_name.split(' ')[0]}</span>
                        </div>
                      ))}
                      {dayAppointments.length > 3 && <div className="text-[10px] uppercase font-bold text-slate-500 text-center mt-1 bg-slate-100 rounded py-0.5">+{dayAppointments.length - 3} más</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {calendarMode === 'week' && (
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-0 border-b bg-slate-50">
                    <div className="p-3 border-r text-center text-xs font-bold text-slate-500 flex items-center justify-center uppercase tracking-wider">Hora</div>
                    {Array.from({length: 7}).map((_, i) => {
                      const d = new Date(currentDate);
                      const currentDayOfWeek = d.getDay();
                      const daysFromMonday = (currentDayOfWeek + 6) % 7;
                      d.setDate(d.getDate() - daysFromMonday + i);
                      const isToday = d.toDateString() === new Date().toDateString();
                      return (
                        <div key={i} className={`p-3 text-center border-r last:border-r-0 ${isToday ? 'bg-purple-100/50 text-purple-700' : 'text-slate-700'}`}>
                          <div className="text-xs font-semibold uppercase">{d.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                          <div className={`text-xl font-bold ${isToday ? 'text-purple-700' : ''}`}>{d.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-[600px] overflow-y-auto bg-white custom-scrollbar">
                    {Array.from({length: 13}).map((_, hourOffset) => {
                      const hour = hourOffset + 8; // 8 AM to 8 PM
                      return (
                        <div key={hour} className="grid grid-cols-8 gap-0 border-b border-slate-100 min-h-[80px] group transition-colors">
                          <div className="p-2 border-r text-xs text-center text-slate-400 font-medium bg-slate-50 flex items-start justify-center pt-3">{hour}:00</div>
                          {Array.from({length: 7}).map((_, i) => {
                            const d = new Date(currentDate);
                            const currentDayOfWeek = d.getDay();
                            const daysFromMonday = (currentDayOfWeek + 6) % 7;
                            d.setDate(d.getDate() - daysFromMonday + i);
                            const dayApts = getAppointmentsForDate(d).filter(a => parseInt(a.appointment_time.split(':')[0]) === hour);
                            return (
                              <div key={i} className="p-1.5 border-r border-slate-100 last:border-r-0 relative hover:bg-slate-50/50 transition-colors">
                                {dayApts.map(apt => (
                                  <div key={apt.id} title={`${apt.appointment_time} - ${apt.client_name}`} className="text-[11px] bg-gradient-to-br from-purple-100 to-indigo-100 text-purple-900 p-2 mb-1.5 rounded-md leading-tight shadow-sm border border-purple-200/60 hover:shadow-md transition-shadow cursor-default">
                                    <span className="font-bold block mb-0.5">{apt.appointment_time}</span>
                                    <span className="truncate block opacity-90">{apt.client_name}</span>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {calendarMode === 'day' && (
              <div className="max-w-4xl mx-auto border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-purple-50 border-b border-purple-100 p-4 text-center">
                  <h3 className="text-xl font-black text-purple-900">{currentDate.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase()}</h3>
                  <p className="text-purple-600 font-medium">{currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="h-[550px] overflow-y-auto bg-white custom-scrollbar">
                  {Array.from({length: 13}).map((_, hourOffset) => {
                    const hour = hourOffset + 8;
                    const hStr = hour.toString().padStart(2, '0');
                    const dayApts = getAppointmentsForDate(currentDate).filter(a => a.appointment_time.startsWith(`${hStr}:`));
                    
                    return (
                      <div key={hour} className="flex border-b border-slate-100 min-h-[90px] group transition-colors hover:bg-slate-50/50">
                        <div className="w-24 p-4 text-right text-sm text-slate-500 font-bold border-r border-slate-100 bg-slate-50/30">
                          {hour}:00
                        </div>
                        <div className="flex-1 p-3 relative">
                          {dayApts.length === 0 && <div className="absolute inset-0 flex items-center pl-6 opacity-0 group-hover:opacity-100 text-slate-400/70 text-sm font-medium tracking-wide">Espacio disponible</div>}
                          {dayApts.map(apt => (
                            <div key={apt.id} className="bg-gradient-to-r from-purple-50 to-white border-l-4 border-purple-500 rounded-r-lg p-3 mb-2 shadow-sm border border-slate-100 text-sm hover:shadow-md transition-shadow flex justify-between items-center group/card" style={{ borderLeftColor: professionals.find(p=>p.id === apt.professional_id)?.color || '#8b5cf6' }}>
                              <div className="flex items-start gap-4">
                                <div className="font-mono text-purple-700 font-bold bg-white p-1.5 rounded shadow-sm border border-purple-100">{apt.appointment_time}</div>
                                <div>
                                  <h4 className="font-bold text-slate-800 text-base">{apt.client_name} <span className="text-xs font-normal text-slate-500 ml-2">({professionals.find(p=>p.id === apt.professional_id)?.name || 'Sin Asignar'})</span></h4>
                                  <p className="text-purple-600 font-medium text-sm flex items-center gap-1">
                                    <Briefcase className="w-3.5 h-3.5" />
                                    {apt.service_name}
                                  </p>
                                  {apt.notes && <p className="text-xs text-slate-500 mt-1.5 italic max-w-md truncate">{apt.notes}</p>}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-1">
                                  <Clock className="w-3 h-3" /> {apt.duration_minutes} min
                                </span>
                                <br />
                                <span className="font-bold text-slate-700">€{apt.price?.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CLIENTS */}
        {view === 'clients' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Clientes</h2>
              <button onClick={() => { setEditingClient(null); setClientForm({}); setBirthdateDisplay(''); setClientFormTab(0); setShowClientModal(true); }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200/50 transition-all font-semibold text-sm active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Nuevo Cliente
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map(client => (
                <div key={client.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-purple-100/30 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-purple-200/40">{client.name?.charAt(0)?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{client.name}</h3>
                      {client.city && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{client.city}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-slate-500 mb-4">
                    {client.phone && <p className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 text-xs"><Phone className="w-3.5 h-3.5 text-purple-400" /> {client.phone}</p>}
                    {client.email && <p className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 text-xs truncate"><Mail className="w-3.5 h-3.5 text-purple-400" /> {client.email}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditClient(client)} className="flex-1 bg-violet-50 text-violet-600 py-2 rounded-lg hover:bg-violet-100 text-xs font-semibold transition-colors">Editar</button>
                    <button onClick={() => handleDeleteClient(client.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg hover:bg-red-100 text-xs font-semibold transition-colors">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SERVICES */}
        {view === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Servicios</h2>
              <button onClick={() => { setEditingService(null); setServiceForm({}); setServiceFormTab(0); setShowServiceModal(true); }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200/50 transition-all font-semibold text-sm active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Nuevo Servicio
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-purple-100/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-3xl"></div>
                  <div className="flex justify-between items-start mb-3 relative">
                    <h3 className="font-bold text-slate-800">{service.name}</h3>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${service.active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                      {service.active ? '● Activo' : 'Inactivo'}
                    </span>
                  </div>
                  {service.description && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{service.description}</p>}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-violet-50/60 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Duración</p>
                      <p className="font-extrabold text-violet-700 text-lg">{service.duration_minutes}<span className="text-xs font-medium ml-0.5">min</span></p>
                    </div>
                    <div className="flex-1 bg-emerald-50/60 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Precio</p>
                      <p className="font-extrabold text-emerald-700 text-lg">€{service.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditService(service)} className="flex-1 bg-violet-50 text-violet-600 py-2 rounded-lg hover:bg-violet-100 text-xs font-semibold transition-colors">Editar</button>
                    <button onClick={() => handleDeleteService(service.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg hover:bg-red-100 text-xs font-semibold transition-colors">Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROFESSIONALS */}
        {view === 'professionals' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Profesionales</h2>
              <button onClick={() => { setEditingProfessional(null); setProfessionalForm({}); setProfessionalFormTab(0); setShowProfessionalModal(true); }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200/50 transition-all font-semibold text-sm active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Nuevo Profesional
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {professionals.map(pro => (
                <div key={pro.id} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:shadow-purple-100/30 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md" style={{ backgroundColor: pro.color || '#6366f1' }}>
                      {pro.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate">{pro.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${pro.active ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                          {pro.active ? '● Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {pro.specialties && <p className="text-xs text-purple-600 bg-purple-50 rounded-lg px-3 py-1.5 mb-2 font-medium inline-block">{pro.specialties}</p>}
                  {pro.phone && <p className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5"><Phone className="w-3.5 h-3.5 text-purple-400" /> {pro.phone}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEditProfessional(pro)} className="flex-1 bg-violet-50 text-violet-600 py-2 rounded-lg hover:bg-violet-100 text-xs font-semibold transition-colors">Editar</button>
                    <button onClick={() => handleDeleteProfessional(pro.id)} className="flex-1 bg-red-50 text-red-500 py-2 rounded-lg hover:bg-red-100 text-xs font-semibold transition-colors">Eliminar</button>
                  </div>
                </div>
              ))}
              {professionals.length === 0 && <div className="text-slate-400 col-span-full text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200"><UserCog className="w-10 h-10 mx-auto mb-3 text-slate-300" /><p className="font-medium">No hay profesionales registrados</p></div>}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {view === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Productos</h2>
              <button onClick={() => { setEditingProduct(null); setProductForm({}); setShowProductModal(true); }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200/50 transition-all font-semibold text-sm active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Nuevo Producto
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200">
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Precio</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-violet-50/30 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-800">{product.name}</td>
                      <td className="py-3.5 px-5 text-slate-400">{product.sku || '-'}</td>
                      <td className="py-3.5 px-5">{product.category || '-'}</td>
                      <td className="py-3.5 px-5">
                        <span className={product.current_stock <= product.min_stock ? 'text-red-600 font-medium' : ''}>
                          {product.current_stock} {product.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">€{product.selling_price?.toFixed(2)}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-1 rounded text-xs ${product.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 flex gap-2">
                        <button onClick={() => openEditProduct(product)} className="text-blue-600 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INVOICES */}
        {view === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Facturas</h2>
              <button onClick={() => { setEditingInvoice(null); setInvoiceForm({ items: [] }); setShowInvoiceModal(true); }} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200/50 transition-all font-semibold text-sm active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Nueva Factura
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100/80 border-b border-slate-200">
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Nº</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="text-left py-3.5 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-b border-slate-50 hover:bg-violet-50/30 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-800">{invoice.invoice_number}</td>
                      <td className="py-3.5 px-5">{invoice.client_name || '-'}</td>
                      <td className="py-3.5 px-5">{invoice.date || '-'}</td>
                      <td className="py-3.5 px-5 font-black text-slate-800">€{invoice.total?.toFixed(2)}</td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-1 rounded text-xs ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>{invoice.status === 'paid' ? 'Pagada' : 'Pendiente'}</span>
                      </td>
                      <td className="py-3.5 px-5 flex gap-2">
                        <button onClick={() => openEditInvoice(invoice)} className="text-blue-600 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteInvoice(invoice.id)} className="text-red-600 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No hay facturas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {view === 'reports' && (
          <div>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Cargando reportes...</div>
            ) : !report ? (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No hay datos de reportes disponibles</p>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                  <h3 className="font-extrabold text-slate-800 mb-3">Filtrar por Período</h3>
                  {role === 'admin' ? (
                    <div className="flex gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Desde:</label>
                        <input type="date" lang="es" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="border rounded px-2 py-1 text-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-600">Hasta:</label>
                        <input type="date" lang="es" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="border rounded px-2 py-1 text-sm" />
                      </div>
                      <button onClick={loadData} className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Actualizar</button>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Mostrando reporte del día: </span>
                      <span className="font-bold">{dateRange.start}</span>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-5">Reportes de Ingresos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/40">
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Ingresos Totales</p>
                    <p className="text-3xl font-black">€{report.summary.totalRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-violet-200/40">
                    <p className="text-violet-100 text-xs font-bold uppercase tracking-wider mb-1">Citas Completadas</p>
                    <p className="text-3xl font-black">{report.summary.totalAppointments || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-5 text-white shadow-lg">
                    <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Media por Cita</p>
                    <p className="text-3xl font-black">€{report.summary.averagePerAppointment?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 mb-4">Ingresos por Servicio</h3>
                    {report.byService?.length > 0 ? (
                      <div className="space-y-2">
                        {report.byService.map((s: any, i: number) => (
                          <div key={i} className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm">{s.name}</span>
                            <span className="font-medium">€{s.total_revenue?.toFixed(2) || '0.00'} ({s.total_appointments})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Sin datos</p>
                    )}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h3 className="font-extrabold text-slate-800 mb-4">Ingresos por Mes</h3>
                    {report.byMonth?.length > 0 ? (
                      <div className="space-y-2">
                        {report.byMonth.map((m: any, i: number) => (
                          <div key={i} className="flex justify-between items-center border-b pb-2">
                            <span className="text-sm">{m.month}</span>
                            <span className="font-medium">€{m.total?.toFixed(2) || '0.00'} ({m.count} citas)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Sin datos</p>
                    )}
                  </div>
                </div>

                {clientReport && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <h3 className="font-extrabold text-slate-800 mb-4">Top Clientes</h3>
                      {clientReport.topClients?.length > 0 ? (
                        <div className="space-y-2">
                          {clientReport.topClients.slice(0, 10).map((c: any, i: number) => (
                            <div key={i} className="flex justify-between items-center border-b pb-2">
                              <div>
                                <span className="text-sm font-medium">{c.name}</span>
                                <span className="text-xs text-slate-500 ml-2">{c.visit_count} visitas</span>
                              </div>
                              <span className="font-medium">€{c.total_spent?.toFixed(2) || '0.00'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-sm">Sin datos</p>
                      )}
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                      <h3 className="font-extrabold text-slate-800 mb-4">Resumen de Clientes</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Total clientes activos</span>
                          <span className="font-bold">{clientReport.totalClients || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Nuevos clientes (período)</span>
                          <span className="font-bold">{clientReport.newClients || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {appointmentReport && (
                  <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <h3 className="font-extrabold text-slate-800 mb-4">Estado de Citas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {appointmentReport.byStatus?.map((s: any, i: number) => (
                        <div key={i} className="text-center p-3 bg-slate-50 rounded">
                          <p className="text-2xl font-bold">{s.count}</p>
                          <p className="text-xs text-slate-500 capitalize">{s.status}</p>
                          <p className="text-xs text-green-600">€{s.total?.toFixed(2) || '0.00'}</p>
                        </div>
                      ))}
                      {appointmentReport.cancelledCount !== undefined && (
                        <div className="text-center p-3 bg-red-50 rounded">
                          <p className="text-2xl font-bold text-red-600">{appointmentReport.cancelledCount}</p>
                          <p className="text-xs text-slate-500">Canceladas</p>
                        </div>
                      )}
                      {appointmentReport.noShowCount !== undefined && (
                        <div className="text-center p-3 bg-yellow-50 rounded">
                          <p className="text-2xl font-bold text-yellow-600">{appointmentReport.noShowCount}</p>
                          <p className="text-xs text-slate-500">No-shows</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PACKAGES */}
        {view === 'packages' && (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Bonos y Suscripciones</h2>
              <button onClick={() => { setShowPackageModal(true); }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-purple-200/50 transition-all font-semibold text-sm active:scale-[0.97]">
                <Plus className="w-4 h-4" /> Nuevo Bono
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-700">Bonos disponibles</h3>
              </div>
              {packages.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No hay bonos disponibles</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-800">{pkg.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${pkg.active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                          {pkg.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-3">{pkg.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-purple-600">€{pkg.price?.toFixed(2)}</span>
                        <span className="text-sm text-slate-400">{pkg.total_sessions} sesiones</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-700">Uso de bonos por cliente</h3>
              </div>
              {packageUsage.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No hay uso de bonos registrado</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Cliente</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Bono</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">Sesiones</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-600">Restantes</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packageUsage.map(usage => {
                        const client = clients.find(c => c.id === usage.client_id);
                        const pkg = packages.find(p => p.id === usage.package_id);
                        return (
                          <tr key={usage.id} className="border-b border-slate-100 hover:bg-violet-50/30">
                            <td className="py-3 px-4 font-medium">{client?.name || '-'}</td>
                            <td className="py-3 px-4">{pkg?.name || '-'}</td>
                            <td className="py-3 px-4 text-center">{usage.sessions_consumed}</td>
                            <td className="py-3 px-4 text-center font-bold text-purple-600">{usage.sessions_remaining}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                usage.status === 'active' ? 'bg-green-50 text-green-600' :
                                usage.status === 'expired' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {usage.status === 'active' ? 'Activo' : usage.status === 'expired' ? 'Expirado' : 'Completado'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACCOUNTING */}
        {view === 'accounting' && (
          <Accounting />
        )}
      </div>

      {/* MODALS */}
      
      {/* Client Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/10 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingClient ? 'Editar' : 'Nuevo'} Cliente</h3>
              <button onClick={() => setShowClientModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex border-b mb-4">
              {['Básica', 'Contacto', 'Clínica'].map((tab, idx) => (
                <button key={tab} onClick={() => setClientFormTab(idx)} className={`flex-1 py-2 text-sm font-medium ${clientFormTab === idx ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {clientFormTab === 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <div><label className="text-xs text-slate-500 mb-1 block">Nombre completo *</label><input type="text" value={clientForm.name || ''} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-500 mb-1 block">DNI/NIE</label><input type="text" value={clientForm.dni || ''} onChange={(e) => setClientForm({ ...clientForm, dni: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                    <div><label className="text-xs text-slate-500 mb-1 block">F. Nacimiento</label>
                      <input type="text" placeholder="dd/mm/aaaa" value={birthdateDisplay} onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 8) value = value.slice(0, 8);
                        if (value.length > 0) {
                          if (value.length <= 2) {
                          } else if (value.length <= 4) {
                            value = value.slice(0, 2) + '/' + value.slice(2);
                          } else {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
                          }
                        }
                        setBirthdateDisplay(value);
                        setClientForm({ ...clientForm, birthdate: formatDateForInput(value) });
                      }} onBlur={() => {
                        if (birthdateDisplay && !/^\d{2}\/\d{2}\/\d{4}$/.test(birthdateDisplay)) {
                          setBirthdateDisplay('');
                          setClientForm({ ...clientForm, birthdate: '' });
                        }
                      }} className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Género</label>
                    <select value={clientForm.gender || ''} onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value })} className="w-full border rounded px-3 py-2">
                      <option value="">Seleccione género</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                    </select>
                  </div>
                  <div className="pt-2 flex justify-end"><button onClick={() => setClientFormTab(1)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Siguiente</button></div>
                </div>
              )}
              {clientFormTab === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-500 mb-1 block">Teléfono (Móvil)</label><input type="tel" value={clientForm.phone || ''} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                    <div><label className="text-xs text-slate-500 mb-1 block">Email</label><input type="email" value={clientForm.email || ''} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  </div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Dirección Postal</label><input type="text" value={clientForm.address || ''} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-500 mb-1 block">Ciudad</label><input type="text" value={clientForm.city || ''} onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                    <div><label className="text-xs text-slate-500 mb-1 block">C.Postal</label><input type="text" value={clientForm.postal_code || ''} onChange={(e) => setClientForm({ ...clientForm, postal_code: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <button onClick={() => setClientFormTab(0)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Atrás</button>
                    <button onClick={() => setClientFormTab(2)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Siguiente</button>
                  </div>
                </div>
              )}
              {clientFormTab === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <div><label className="text-xs text-slate-500 mb-1 block">Historial médico y alergias (Importante)</label><textarea placeholder="Cirugías, afecciones, alergias..." value={clientForm.medical_history || ''} onChange={(e) => setClientForm({ ...clientForm, medical_history: e.target.value })} className="w-full border rounded px-3 py-2" rows={2} /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Motivo de consulta principal</label><input type="text" value={clientForm.consultation_reason || ''} onChange={(e) => setClientForm({ ...clientForm, consultation_reason: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Referente (Marketing)</label>
                    <select value={clientForm.referral_source || ''} onChange={(e) => setClientForm({ ...clientForm, referral_source: e.target.value })} className="w-full border rounded px-3 py-2">
                      <option value="">¿Cómo nos conoció?</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="google">Búsqueda en Google</option>
                      <option value="recomendacion">Recomendación (Boca a boca)</option>
                      <option value="flyer">Flyer / Cartel</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Consentimientos Legales</h4>
                    <label className="flex items-start gap-2 mb-2 cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={clientForm.gdpr_consent === 1} onChange={(e) => setClientForm({ ...clientForm, gdpr_consent: e.target.checked ? 1 : 0 })} />
                      <span className="text-xs text-slate-600">Acepta la política de Privacidad y LOPD (Obligatorio)</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" className="mt-1" checked={clientForm.treatment_consent === 1} onChange={(e) => setClientForm({ ...clientForm, treatment_consent: e.target.checked ? 1 : 0 })} />
                      <span className="text-xs text-slate-600">Consentimiento informado general firmado</span>
                    </label>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <button onClick={() => setClientFormTab(1)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Atrás</button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4 mt-4 border-t">
                <button onClick={() => setShowClientModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 font-semibold text-slate-600 text-sm transition-colors">Cancelar</button>
                <button onClick={handleSaveClient} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl py-2.5 hover:shadow-lg hover:shadow-purple-200/50 font-semibold transition-all text-sm active:scale-[0.97]">Guardar Cliente</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/10 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingService ? 'Editar' : 'Nuevo'} Servicio</h3>
              <button onClick={() => setShowServiceModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex border-b mb-4">
              {['Principal', 'Precios', 'Detalles'].map((tab, idx) => (
                <button key={tab} onClick={() => setServiceFormTab(idx)} className={`flex-1 py-1.5 text-sm font-medium ${serviceFormTab === idx ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {serviceFormTab === 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <div><label className="text-xs text-slate-500 mb-1 block">Nombre del Servicio *</label><input type="text" value={serviceForm.name || ''} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">Categoría</label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['Facial', 'Corporal', 'Medicina Estética', 'Bienestar'].filter(cat => !hiddenCategories.includes(cat)).map(cat => (
                        <div key={cat} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setServiceForm({ ...serviceForm, category: cat })}
                            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${
                              serviceForm.category === cat 
                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300'
                            }`}
                          >
                            {cat}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if (confirm(`¿Ocultar categoría "${cat}" de la lista?`)) { const newHidden = [...hiddenCategories, cat]; setHiddenCategories(newHidden); localStorage.setItem('hiddenCategories', JSON.stringify(newHidden)); }}}
                            className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            title="Ocultar categoría"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {services
                        .filter(s => s.category && !['Facial', 'Corporal', 'Medicina Estética', 'Bienestar'].includes(s.category) && !hiddenCategories.includes(s.category))
                        .map(s => s.category)
                        .filter((v, i, a) => a.indexOf(v) === i)
                        .map(cat => (
                          <div key={cat} className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setServiceForm({ ...serviceForm, category: cat })}
                              className={`px-3 py-1 text-[10px] uppercase font-bold rounded-full border transition-all ${
                                serviceForm.category === cat 
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300'
                              }`}
                            >
                              {cat}
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); if (confirm(`¿Ocultar categoría "${cat}" de la lista? Esta acción no elimina los servicios existentes.`)) { const newHidden = [...hiddenCategories, cat]; setHiddenCategories(newHidden); localStorage.setItem('hiddenCategories', JSON.stringify(newHidden)); }}}
                              className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              title="Ocultar categoría"
                            >
                              ×
                            </button>
                          </div>
                        ))
                      }
                    </div>
                    <input 
                      type="text"
                      value={serviceForm.category || ''} 
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })} 
                      placeholder="Escribe una nueva categoría..." 
                      className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Descripción breve</label><textarea value={serviceForm.description || ''} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} className="w-full border rounded px-3 py-2" rows={2} /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">URL de Imagen (Miniatura)</label><input type="url" placeholder="https://" value={serviceForm.image_url || ''} onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
                  <label className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded border"><input type="checkbox" checked={serviceForm.active !== 0} onChange={(e) => setServiceForm({ ...serviceForm, active: e.target.checked ? 1 : 0 })} className="w-4 h-4 text-purple-600" /><span className="font-medium text-slate-700">Servicio Activo (Visible)</span></label>
                  <div className="pt-2 flex justify-end"><button onClick={() => setServiceFormTab(1)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Siguiente</button></div>
                </div>
              )}
              {serviceFormTab === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div><label className="text-xs text-slate-500 mb-1 block">Duración estimada (minutos) *</label><input type="number" value={serviceForm.duration_minutes || 60} onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2 text-lg font-mono text-purple-600" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-500 mb-1 block">Precio Regular (€) *</label><input type="number" step="0.01" value={serviceForm.price || ''} onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })} className="w-full border rounded px-3 py-2 text-lg font-bold" /></div>
                    <div><label className="text-xs text-slate-500 mb-1 block">Precio en Oferta (€)</label><input type="number" step="0.01" value={serviceForm.price_offer || ''} onChange={(e) => setServiceForm({ ...serviceForm, price_offer: parseFloat(e.target.value) })} className="w-full border rounded px-3 py-2 text-lg font-bold text-green-600" /></div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-2 block font-medium">Personal Cualificado</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50/50 custom-scrollbar">
                      {professionals.length > 0 ? (
                        professionals.map(prof => (
                          <label key={prof.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                            <input
                              type="checkbox"
                              checked={(serviceForm.professional_ids || '').split(',').filter(id => id).includes(prof.id)}
                              onChange={(e) => {
                                const currentIds = (serviceForm.professional_ids || '').split(',').filter(id => id);
                                const newIds = e.target.checked ? [...currentIds, prof.id] : currentIds.filter(id => id !== prof.id);
                                setServiceForm({ ...serviceForm, professional_ids: newIds.join(',') });
                              }}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 transition-all"
                            />
                            <span className="text-xs font-semibold text-slate-700">{prof.name}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-400 col-span-2 text-center py-2 italic">No hay profesionales registrados</p>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <button onClick={() => setServiceFormTab(0)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Atrás</button>
                    <button onClick={() => setServiceFormTab(2)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Siguiente</button>
                  </div>
                </div>
              )}
              {serviceFormTab === 2 && (
                <div className="space-y-3 animate-fadeIn">
                  <div><label className="text-xs text-slate-500 mb-1 block">Equipamiento o Sala Necesaria</label><input type="text" placeholder="Ej: Láser Diodo, Cabina 2..." value={serviceForm.equipment || ''} onChange={(e) => setServiceForm({ ...serviceForm, equipment: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Recomendaciones Pre-tratamiento</label><textarea placeholder="Ej: No tomar el sol 24h antes..." value={serviceForm.pre_instructions || ''} onChange={(e) => setServiceForm({ ...serviceForm, pre_instructions: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Recomendaciones Post-tratamiento</label><textarea placeholder="Ej: Usar crema hidratante intensiva..." value={serviceForm.post_instructions || ''} onChange={(e) => setServiceForm({ ...serviceForm, post_instructions: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} /></div>
                  
                  <div className="pt-2 flex justify-between">
                    <button onClick={() => setServiceFormTab(1)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Atrás</button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 mt-4 border-t">
                <button onClick={() => setShowServiceModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 font-semibold text-slate-600 text-sm transition-colors">Cancelar</button>
                <button onClick={handleSaveService} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl py-2.5 hover:shadow-lg hover:shadow-purple-200/50 font-semibold transition-all text-sm active:scale-[0.97]">Guardar Servicio</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Modal */}
      {showProfessionalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/10 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingProfessional ? 'Editar' : 'Nuevo'} Profesional</h3>
              <button onClick={() => setShowProfessionalModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex border-b mb-4">
              {['Perfil & Contacto', 'Operativa & Agenda'].map((tab, idx) => (
                <button key={tab} onClick={() => setProfessionalFormTab(idx)} className={`flex-1 py-1.5 text-sm font-medium ${professionalFormTab === idx ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-500 hover:text-slate-700'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {professionalFormTab === 0 && (
                <div className="space-y-3 animate-fadeIn">
                  <div><label className="text-xs text-slate-500 mb-1 block">Nombre y Apellidos *</label><input type="text" value={professionalForm.name || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, name: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-500 mb-1 block">DNI/NIE</label><input type="text" value={professionalForm.dni || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, dni: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                    <div><label className="text-xs text-slate-500 mb-1 block">Nº de Colegiado</label><input type="text" value={professionalForm.collegiate_number || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, collegiate_number: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  </div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Foto de Perfil (URL)</label><input type="url" value={professionalForm.photo_url || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, photo_url: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-500 mb-1 block">Teléfono</label><input type="tel" value={professionalForm.phone || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, phone: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                    <div><label className="text-xs text-slate-500 mb-1 block">Email</label><input type="email" value={professionalForm.email || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, email: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                  </div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Biografía / CV Breve</label><textarea value={professionalForm.bio || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} /></div>
                  <div className="pt-2 flex justify-end"><button onClick={() => setProfessionalFormTab(1)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Siguiente</button></div>
                </div>
              )}
              {professionalFormTab === 1 && (
                <div className="space-y-3 animate-fadeIn">
                  <div><label className="text-xs text-slate-500 mb-1 block">Especialidad/Cargo</label><input type="text" placeholder="Ej: Médico Estético" value={professionalForm.role || professionalForm.specialties || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, role: e.target.value, specialties: e.target.value })} className="w-full border rounded px-3 py-2 font-medium text-purple-700" /></div>
                  <div><label className="text-xs text-slate-500 mb-1 block">Servicios Vinculados (IDs separados por comas)</label><input type="text" placeholder="Ej: serv_1, serv_2" value={professionalForm.service_ids || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, service_ids: e.target.value })} className="w-full border rounded px-3 py-2 text-sm font-mono" /></div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs text-slate-500 mb-1 block">Horario Laboral (JSON simple)</label><input type="text" placeholder='Ej: L-V 09:00-14:00' value={professionalForm.work_schedule || ''} onChange={(e) => setProfessionalForm({ ...professionalForm, work_schedule: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-slate-500 mb-1 block">Margen entre citas (Minutos)</label><input type="number" value={professionalForm.buffer_time_minutes || 0} onChange={(e) => setProfessionalForm({ ...professionalForm, buffer_time_minutes: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm" /></div>
                  </div>

                  <div className="flex gap-4 p-3 bg-slate-50 rounded border">
                    <div className="flex-1"><label className="text-xs font-bold text-slate-700 mb-1 block">Color en Agenda</label><input type="color" value={professionalForm.color || '#6366f1'} onChange={(e) => setProfessionalForm({ ...professionalForm, color: e.target.value })} className="w-12 h-8 rounded cursor-pointer" /></div>
                    <div className="flex items-center pt-4"><label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer"><input type="checkbox" checked={professionalForm.active !== 0} onChange={(e) => setProfessionalForm({ ...professionalForm, active: e.target.checked ? 1 : 0 })} className="w-4 h-4 text-purple-600" />Empleado Activo</label></div>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button onClick={() => setProfessionalFormTab(0)} className="bg-slate-100 px-4 py-2 rounded text-sm font-medium text-slate-700 hover:bg-slate-200">Atrás</button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 mt-4 border-t">
                <button onClick={() => setShowProfessionalModal(false)} className="flex-1 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 font-semibold text-slate-600 text-sm transition-colors">Cancelar</button>
                <button onClick={handleSaveProfessional} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl py-2.5 hover:shadow-lg hover:shadow-purple-200/50 font-semibold transition-all text-sm active:scale-[0.97]">Guardar Profesional</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/10 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingProduct ? 'Editar' : 'Nuevo'} Producto</h3>
              <button onClick={() => setShowProductModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Nombre *" value={productForm.name || ''} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="SKU" value={productForm.sku || ''} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} className="w-full border rounded px-3 py-2" />
              <input type="text" placeholder="Categoría" value={productForm.category || ''} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full border rounded px-3 py-2" />
              <textarea placeholder="Descripción" value={productForm.description || ''} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full border rounded px-3 py-2" rows={2} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Precio coste" step="0.01" value={productForm.cost_price || ''} onChange={(e) => setProductForm({ ...productForm, cost_price: parseFloat(e.target.value) })} className="w-full border rounded px-3 py-2" />
                <input type="number" placeholder="Precio venta *" step="0.01" value={productForm.selling_price || ''} onChange={(e) => setProductForm({ ...productForm, selling_price: parseFloat(e.target.value) })} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Stock actual" value={productForm.current_stock || 0} onChange={(e) => setProductForm({ ...productForm, current_stock: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2" />
                <input type="number" placeholder="Stock mínimo" value={productForm.min_stock || 0} onChange={(e) => setProductForm({ ...productForm, min_stock: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2" />
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={productForm.active !== 0} onChange={(e) => setProductForm({ ...productForm, active: e.target.checked ? 1 : 0 })} className="w-4 h-4" />Activo</label>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowProductModal(false)} className="flex-1 border rounded py-2 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSaveProduct} className="flex-1 bg-purple-600 text-white rounded py-2 hover:bg-purple-700">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingInvoice ? 'Editar' : 'Nueva'} Factura</h3>
              <button onClick={() => setShowInvoiceModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <select value={invoiceForm.client_id || ''} onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Seleccionar Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="date" lang="es" value={invoiceForm.date || ''} onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })} className="w-full border rounded px-3 py-2" />
              <select value={invoiceForm.status || 'pending'} onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as 'pending' | 'paid' | 'cancelled' })} className="w-full border rounded px-3 py-2">
                <option value="pending">Pendiente</option>
                <option value="paid">Pagada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Conceptos</h4>
                {invoiceForm.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input type="text" placeholder="Descripción" value={item.description} onChange={(e) => { const items = [...(invoiceForm.items || [])]; items[idx].description = e.target.value; setInvoiceForm({ ...invoiceForm, items }); }} className="flex-1 border rounded px-2 py-1 text-sm" />
                    <input type="number" placeholder="Cant" value={item.quantity} onChange={(e) => { const items = [...(invoiceForm.items || [])]; items[idx].quantity = parseInt(e.target.value); items[idx].total = items[idx].quantity * items[idx].unit_price; setInvoiceForm({ ...invoiceForm, items }); }} className="w-16 border rounded px-2 py-1 text-sm" />
                    <input type="number" placeholder="Precio" step="0.01" value={item.unit_price} onChange={(e) => { const items = [...(invoiceForm.items || [])]; items[idx].unit_price = parseFloat(e.target.value); items[idx].total = items[idx].quantity * items[idx].unit_price; setInvoiceForm({ ...invoiceForm, items }); }} className="w-20 border rounded px-2 py-1 text-sm" />
                    <span className="w-20 text-sm font-medium">€{item.total?.toFixed(2)}</span>
                    <button type="button" onClick={() => { const items = (invoiceForm.items || []).filter((_, i) => i !== idx); setInvoiceForm({ ...invoiceForm, items }); }} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setInvoiceForm({ ...invoiceForm, items: [...(invoiceForm.items || []), { description: '', quantity: 1, unit_price: 0, total: 0 }] })} className="text-sm text-purple-600 hover:underline">+ Añadir concepto</button>
              </div>
              <div className="text-right font-bold text-lg">
                Total: €{invoiceForm.items?.reduce((sum, item) => sum + (item.total || 0), 0)?.toFixed(2)}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowInvoiceModal(false)} className="flex-1 border rounded py-2 hover:bg-slate-50">Cancelar</button>
                <button onClick={() => { setInvoiceForm({ ...invoiceForm, total: invoiceForm.items?.reduce((sum, item) => sum + (item.total || 0), 0) }); handleSaveInvoice(); }} className="flex-1 bg-purple-600 text-white rounded py-2 hover:bg-purple-700">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-black/10 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingAppointment ? 'Editar' : 'Nueva'} Cita</h3>
              <button onClick={() => setShowAppointmentModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <select value={appointmentForm.client_id || ''} onChange={(e) => setAppointmentForm({ ...appointmentForm, client_id: e.target.value })} className="w-full border rounded px-3 py-2">
                <option value="">Seleccionar Cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={appointmentForm.service_id || ''} onChange={(e) => { const svc = services.find(s => s.id === e.target.value); setAppointmentForm({ ...appointmentForm, service_id: e.target.value, price: svc?.price, total_price: svc?.price, duration_minutes: svc?.duration_minutes }); }} className="w-full border rounded px-3 py-2">
                <option value="">Seleccionar Servicio</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - €{s.price}</option>)}
              </select>
              {professionals.length > 0 && (
                <select value={appointmentForm.professional_id || ''} onChange={(e) => {
                  const prof = professionals.find(p => p.id === e.target.value);
                  setAppointmentForm({ ...appointmentForm, professional_id: e.target.value, duration_minutes: (appointmentForm.duration_minutes || 60) + (prof?.buffer_time_minutes || 0) });
                }} className="w-full border rounded px-3 py-2">
                  <option value="">Seleccionar Profesional (opcional)</option>
                  {professionals.filter(p => !appointmentForm.service_id || !p.service_ids || p.service_ids.includes(appointmentForm.service_id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <DateInput
                value={appointmentForm.appointment_date || ''}
                onChange={(value) => setAppointmentForm({ ...appointmentForm, appointment_date: value })}
              />
              <TimeInput
                value={appointmentForm.appointment_time || ''}
                onChange={(value) => setAppointmentForm({ ...appointmentForm, appointment_time: value })}
              />
              <input type="number" placeholder="Duración (min)" value={appointmentForm.duration_minutes || 60} onChange={(e) => setAppointmentForm({ ...appointmentForm, duration_minutes: parseInt(e.target.value) })} className="w-full border rounded px-3 py-2" />
              <input type="number" placeholder="Precio" step="0.01" value={appointmentForm.price || ''} onChange={(e) => setAppointmentForm({ ...appointmentForm, price: parseFloat(e.target.value) })} className="w-full border rounded px-3 py-2" />
              <textarea placeholder="Notas" value={appointmentForm.notes || ''} onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })} className="w-full border rounded px-3 py-2" rows={2} />
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowAppointmentModal(false)} className="flex-1 border rounded py-2 hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSaveAppointment} className="flex-1 bg-purple-600 text-white rounded py-2 hover:bg-purple-700">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}