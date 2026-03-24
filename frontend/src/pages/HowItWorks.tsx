import { useState, useEffect } from 'react';
import { Wallet, Target, Calendar, ShoppingCart, ListChecks, StickyNote, UtensilsCrossed, Bot, Users, Shield, Check, ChevronRight, HelpCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';
import { useAuth } from '../components/Auth';

const sections = [
  {
    id: 'getting-started',
    title: 'Primeros pasos',
    icon: Users,
    content: `Una vez iniciada la sesión, verás el panel principal. Desde el menú lateral puedes acceder a todas las funciones de la app. Lo primero que debes hacer es configurar tu perfil familiar en la sección "Mi perfil".`
  },
  {
    id: 'accounting',
    title: 'Contabilidad',
    icon: Wallet,
    content: `La sección de contabilidad te permite registrar todos los gastos e ingresos familiares. 
• Añade transacciones con categoría, fecha y descripción
• Filtra por mes o busca por concepto
• Importa datos desde Excel o CSV
• Sube extractos bancarios en PDF para extraer automáticamente los datos
• Visualiza gráficos de tus finanzas`,
    features: ['Registro de gastos e ingresos', 'Categorías personalizables', 'Importar Excel/CSV', 'Extracción automática de PDFs', 'Gráficos y estadísticas']
  },
  {
    id: 'budgets',
    title: 'Presupuestos',
    icon: Target,
    content: `Crea presupuestos mensuales para diferentes categorías de gasto. 
• Establece límites de gasto por categoría
• Visualiza el progreso con barras de progreso
• Recibe alertas cuando te acerques al límite
• Presupuestos recurrentes que se renuevan automáticamente`,
    features: ['Límites por categoría', 'Alertas de gasto', 'Presupuestos recurrentes', 'Seguimiento visual']
  },
  {
    id: 'agenda',
    title: 'Agenda',
    icon: Calendar,
    content: `La agenda te ayuda a organizar eventos y recordatorios familiares.
• Crea eventos con fecha y hora
• Eventos de varios días
• Repetición: diario, semanal o mensual
• Notificaciones para no olvidar nada importante`,
    features: ['Eventos simples y recurrentes', 'Eventos de varios días', 'Notificaciones']
  },
  {
    id: 'shopping',
    title: 'Lista de la compra',
    icon: ShoppingCart,
    content: `Gestiona las compras familiares de forma organizada.
• Crea múltiples listas con nombre y color
• Añade productos con cantidad y precio
• Marca productos como comprados
• Comparte listas por WhatsApp, Telegram, email o redes sociales
• Historial de precios`,
    features: ['Múltiples listas', 'Compartir en redes', 'Historial de precios', 'Marca productos']
  },
  {
    id: 'tasks',
    title: 'Tareas familiares',
    icon: ListChecks,
    content: `Organiza las tareas del hogar asignando responsabilidades.
• Crea tareas con prioridad (alta, media, baja)
• Asigna tareas a miembros de la familia
• Define fechas de vencimiento
• Marca tareas como completadas
• Tareas familiares compartidas`,
    features: ['Prioridades', 'Asignación a miembros', 'Fechas límite', 'Seguimiento']
  },
  {
    id: 'notes',
    title: 'Notas',
    icon: StickyNote,
    content: `Apuntes rápidos y organizados para toda la familia.
• Múltiples tableros de notas
• Organiza por secciones
• Edita y elimina notas fácilmente
• Acceso rápido desde el menú`,
    features: ['Múltiples tableros', 'Secciones organizadas', 'Edición rápida']
  },
  {
    id: 'restaurants',
    title: 'Restaurantes',
    icon: UtensilsCrossed,
    content: `Guarda tus restaurantes favoritos y los de tu familia.
• Añade restaurantes con nombre, dirección y valoración
• Organiza por categorías
• Comparte restaurantes con la familia
• Busca rápidamente cuando busques dónde comer`,
    features: ['Favoritos familiares', 'Valoraciones', 'Categorías']
  },
  {
    id: 'chat-ia',
    title: 'Chat IA',
    icon: Bot,
    content: `El asistente de IA te ayuda con preguntas sobre finanzas y más.
• Preguntas sobre gastos y presupuestos
• Consejos de ahorro
• Análisis de tus finanzas
• Respuestas personalizadas`,
    features: ['Asistente financiero', 'Consejos de ahorro', 'Análisis IA']
  },
  {
    id: 'profile',
    title: 'Perfil y familia',
    icon: Users,
    content: `Configura tu perfil y gestiona tu familia.
• Edita tu nombre y avatar
• Establece el nombre de tu familia
• Configura la zona horaria
• Gestiona la moneda
• Configura notificaciones por email`,
    features: ['Perfil personal', 'Nombre de familia', 'Zona horaria', 'Notificaciones']
  },
  {
    id: 'admin',
    title: 'Administración',
    icon: Shield,
    content: `(Solo administradores) Panel de control completo.
• Gestionar usuarios
• Crear/borrar familias
• Configuración global
• Ver sugerencias de usuarios
• Gestionar FAQs`,
    features: ['Gestión de usuarios', 'Configuración global', 'FAQs', 'Sugerencias']
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
