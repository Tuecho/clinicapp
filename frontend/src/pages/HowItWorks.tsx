import { useState, useEffect } from 'react';
import { Wallet, Target, Calendar, ShoppingCart, ListChecks, StickyNote, UtensilsCrossed, Bot, Users, Shield, Check, ChevronRight, HelpCircle, Plus, Edit2, Trash2, X, Package, Home, Receipt, BarChart3, Briefcase, Cake } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { useAuth } from '../components/Auth';

const sections = [
  {
    id: 'getting-started',
    title: 'Primeros pasos',
    icon: Users,
    content: `Bienvenido a Family Agent, tu asistente familiar. Desde el panel principal puedes acceder a todas las funcionalidades a través del menú lateral. Lo primero que debes hacer es configurar tu perfil y activar los módulos que quieras usar en "Módulos".`,
    features: ['Panel principal personalizado', 'Menú lateral con todas las funciones', 'Configuración de perfil', 'Activar/desactivar módulos']
  },
  {
    id: 'clinic',
    title: 'Mi Clínica',
    icon: Briefcase,
    content: `Gestiona tu clínica o negocio profesional de forma integral.
• Panel de control con estadísticas en tiempo real
• Gestión de pacientes/clientes
• Citas y horarios laborales
• Historial de tratamientos
• Notas y observaciones por cliente
• Acceso multi-usuario para tu equipo`,
    features: ['Dashboard con métricas', 'Gestión de pacientes', 'Citas y agenda', 'Historial clínico', 'Equipo de trabajo']
  },
  {
    id: 'clinic_packages',
    title: 'Bonos y Suscripciones',
    icon: Package,
    content: `Administra los bonos de sesiones y suscripciones de tus clientes.
• Crea bonos con número de sesiones
• Seguimiento de sesiones usadas
• Caducidad configurable
• Renovación automática de suscripciones
• Notificaciones de proximidad a vencimiento
• Historial completo por cliente`,
    features: ['Bonos de sesiones', 'Suscripciones periódicas', 'Control de caducidad', 'Alertas automáticas']
  },
  {
    id: 'accounting',
    title: 'Contabilidad',
    icon: Wallet,
    content: `Controla todos los ingresos y gastos de tu hogar o negocio.
• Registro de transacciones con categoría, fecha y descripción
• Filtros por mes, año o busca por concepto
• Importación de datos desde Excel o CSV
• Extracción automática de PDFs bancarios
• Gráficos y estadísticas visuales
• Informes exportables`,
    features: ['Registro de gastos e ingresos', 'Categorías personalizables', 'Importar Excel/CSV', 'Extracción de PDFs', 'Gráficos y estadísticas', 'Informes']
  },
  {
    id: 'budgets',
    title: 'Presupuestos',
    icon: Target,
    content: `Planifica y controla tu finances con presupuestos mensuales.
• Establece límites de gasto por categoría
• Barras de progreso visuales
• Alertas cuando te acerques al límite
• Presupuestos recurrentes que se renuevan automáticamente
• Comparación con meses anteriores`,
    features: ['Límites por categoría', 'Alertas de gasto', 'Presupuestos recurrentes', 'Seguimiento visual', 'Comparación mensual']
  },
  {
    id: 'agenda',
    title: 'Agenda',
    icon: Calendar,
    content: `Organiza eventos, citas y recordatorios familiares o profesionales.
• Crea eventos con fecha y hora
• Eventos de varios días
• Repetición: diario, semanal o mensual
• Notificaciones para no olvidar nada importante
• Vinculación con citas de clínica`,
    features: ['Eventos simples y recurrentes', 'Eventos de varios días', 'Notificaciones', 'Integración con citas']
  },
  {
    id: 'shopping',
    title: 'Lista de la compra',
    icon: ShoppingCart,
    content: `Gestiona las compras familiares de forma organizada.
• Crea múltiples listas con nombre y color
• Añade productos con cantidad y precio estimado
• Marca productos como comprados
• Comparte listas por WhatsApp, Telegram, email o redes sociales
• Historial de precios por producto
• Crea listas desde productos frecuentes`,
    features: ['Múltiples listas', 'Compartir en redes', 'Historial de precios', 'Marca productos', 'Productos frecuentes']
  },
  {
    id: 'tasks',
    title: 'Tareas',
    icon: ListChecks,
    content: `Organiza las tareas del hogar o negocio asignando responsabilidades.
• Crea tareas con prioridad (alta, media, baja)
• Asigna tareas a miembros de la familia o equipo
• Define fechas de vencimiento
• Marca tareas como completadas
• Tareas recurrentes`,
    features: ['Prioridades', 'Asignación a miembros', 'Fechas límite', 'Seguimiento', 'Tareas recurrentes']
  },
  {
    id: 'notes',
    title: 'Notas',
    icon: StickyNote,
    content: `Apuntes rápidos y organizados para toda la familia.
• Múltiples tableros de notas
• Organiza por secciones dentro de cada tablero
• Edita y elimina notas fácilmente
• Notas con formato básico
• Acceso rápido desde el menú`,
    features: ['Múltiples tableros', 'Secciones organizadas', 'Edición rápida', 'Formato básico']
  },
  {
    id: 'birthdays',
    title: 'Cumpleaños',
    icon: Cake,
    content: `No olvides los cumpleaños de tu familia y amigos.
• Registro de birthdays con fecha
• Notificaciones previas
• Lista de upcoming birthdays
• Integración con contactos`,
    features: ['Registro de cumpleaños', 'Notificaciones', 'Vista previa']
  },
  {
    id: 'home_maintenance',
    title: 'Mantenimiento',
    icon: Home,
    content: `Gestiona el mantenimiento de tu hogar o propiedades.
• Registro de electrodomésticos y sistemas
• Fechas de mantenimiento preventivo
• Historial de reparaciones
• Recordatorios automáticos
• Gastos asociados al mantenimiento`,
    features: ['Registro de equipos', 'Mantenimiento preventivo', 'Historial de reparaciones', 'Gastos por equipo']
  },
  {
    id: 'utility_bills',
    title: 'Facturas',
    icon: Receipt,
    content: `Controla y organiza tus facturas de servicios.
• Registro de facturas emitidas
• Seguimiento de pagos
• Recordatorios de vencimiento
• Historial por proveedor
• Estadísticas de gasto por servicio`,
    features: ['Registro de facturas', 'Seguimiento de pagos', 'Historial por proveedor', 'Estadísticas']
  },
  {
    id: 'reports',
    title: 'Informes',
    icon: BarChart3,
    content: `Análisis y reportes de tu información.
• Informes de contabilidad
• Estadísticas de clínica
• Gráficos interactivos
• Exportación a Excel/PDF
• Selección de período customizable`,
    features: ['Informes contables', 'Estadísticas de cliente', 'Gráficos', 'Exportación']
  },
  {
    id: 'chat-ia',
    title: 'Chat IA',
    icon: Bot,
    content: `El asistente de IA te ayuda con preguntas sobre finanzas y más.
• Preguntas sobre gastos y presupuestos
• Consejos de ahorro
• Análisis de tus finanzas
• Respuestas personalizadas a tus dudas`,
    features: ['Asistente financiero', 'Consejos de ahorro', 'Análisis IA', 'Respuestas personalizadas']
  },
  {
    id: 'profile',
    title: 'Perfil y familia',
    icon: Users,
    content: `Configura tu perfil y gestiona tu familia o equipo.
• Edita tu nombre y avatar
• Establece el nombre de tu familia o negocio
• Configura la zona horaria
• Gestiona la moneda
• Configura notificaciones por email
• Gestiona miembros del grupo`,
    features: ['Perfil personal', 'Nombre de familia/negocio', 'Zona horaria', 'Notificaciones', 'Gestión de miembros']
  },
  {
    id: 'modules',
    title: 'Módulos',
    icon: Package,
    content: `Personaliza tu experiencia activando los módulos que necesitas.
• Activa o desactiva módulos
• Reordena los módulos en el menú
• Módulos disponibles: Contabilidad, Presupuestos, Agenda, Lista compra, Tareas, Notas, Cumpleaños, Mi Clínica, etc.
• Los cambios se guardan automáticamente`,
    features: ['Activar/desactivar módulos', 'Reordenar menú', 'Múltiples módulos disponibles', 'Guardado automático']
  },
  {
    id: 'admin',
    title: 'Administración',
    icon: Shield,
    content: `(Solo administradores) Panel de control completo.
• Gestionar usuarios
• Crear/borrar familias o empresas
• Configuración global
• Ver sugerencias de usuarios
• Gestionar FAQs
• Estadísticas globales`,
    features: ['Gestión de usuarios', 'Configuración global', 'FAQs', 'Sugerencias', 'Estadísticas']
  }
];

const API_URL = import.meta.env.VITE_API_URL || '';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  order_index: number;
}

export function HowItWorks() {
  const { isAdmin } = useAuth();
  const [openSection, setOpenSection] = useState<string>('getting-started');
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ question: '', answer: '' });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/faqs`);
      const data = await response.json();
      setFaqs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
    setLoadingFaqs(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      
      if (editingFaq) {
        const response = await fetch(`${API_URL}/api/faqs/${editingFaq.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });
        if (!response.ok) {
          const error = await response.json();
          alert(error.error || 'Error al actualizar FAQ');
          return;
        }
      } else {
        await fetch(`${API_URL}/api/faqs`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
      }
      
      resetForm();
      fetchFaqs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const resetForm = () => {
    setFormData({ question: '', answer: '' });
    setEditingFaq(null);
    setShowModal(false);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({ question: faq.question, answer: faq.answer });
    setShowModal(true);
  };

  const deleteFaq = async (id: number) => {
    if (!window.confirm('¿Eliminar esta FAQ?')) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API_URL}/api/faqs/${id}`, { method: 'DELETE', headers });
      fetchFaqs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? '' : id);
  };

  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-pink-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
            <span className="text-3xl sm:text-4xl">📖</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Cómo funciona Family Agent</h1>
          <p className="text-gray-500 text-sm sm:text-base">Una guía completa de todas las funcionalidades</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {sections.map((section, index) => (
            <div key={section.id} className={index !== sections.length - 1 ? 'border-b border-gray-200' : ''}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 sm:gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${openSection === section.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                  <section.icon size={20} />
                </div>
                <span className="flex-1 font-medium text-gray-800 text-sm sm:text-base">{section.title}</span>
                <ChevronRight 
                  size={20} 
                  className={`text-gray-400 transition-transform ${openSection === section.id ? 'rotate-90' : ''}`}
                />
              </button>
              
              {openSection === section.id && (
                <div className="px-4 pb-4 text-gray-600 text-sm sm:text-base">
                  <div className="pl-12 sm:pl-14 space-y-3">
                    {section.content.split('\n').map((line, i) => (
                      <p key={i} className="whitespace-pre-line">{line}</p>
                    ))}
                    
                    {section.features && (
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {section.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-gray-700">
                            <Check size={14} className="text-primary flex-shrink-0" />
                            <span className="text-xs sm:text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <HelpCircle className="text-primary" size={24} />
              Preguntas Frecuentes (FAQ)
            </h2>
            {isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                <Plus size={16} />
                Nueva FAQ
              </button>
            )}
          </div>

          {loadingFaqs ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
              <HelpCircle size={40} className="mx-auto mb-2 text-gray-300" />
              <p>No hay FAQs disponibles</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
              {faqs.map((faq, index) => (
                <div key={faq.id}>
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{faq.question}</span>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <div className="flex items-center gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEditModal(faq)}
                            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => deleteFaq(faq.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                      {openFaqIndex === index ? (
                        <ChevronRight size={20} className="text-gray-400 rotate-90" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-400" />
                      )}
                    </div>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-4 pb-4 text-gray-600 text-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingFaq ? 'Editar FAQ' : 'Nueva FAQ'}
                </h3>
                <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pregunta *</label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Escribe la pregunta..."
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Respuesta *</label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Escribe la respuesta..."
                    className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none min-h-[100px]"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    {editingFaq ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
