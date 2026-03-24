import { useState } from 'react';
import { DollarSign, Users, Building, Send, Check, Star, ExternalLink } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

export function SalesContact() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employees, setEmployees] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submitSales = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setError('');
    setSending(true);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/sales-contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyName,
          contactName,
          email,
          phone,
          employees,
          message
        })
      });
      
      if (response.ok) {
        setSent(true);
        setMessage('');
        setCompanyName('');
        setContactName('');
        setPhone('');
        setEmployees('');
        setTimeout(() => setSent(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al enviar la solicitud');
      }
    } catch (err) {
      console.error('Error sending sales contact:', err);
      setError('Error de conexión');
    }
    setSending(false);
  };

  const plans = [
    {
      icon: Users,
      title: 'Familiar',
      price: 'Gratis',
      description: 'Perfecto para familias individuales',
      features: ['Hasta 5 miembros', 'Gestión básica de finanzas', 'Soporte por email'],
      popular: false
    },
    {
      icon: Building,
      title: 'Pequeñas Familias',
      price: '9.99€/mes',
      description: 'Para familias que necesitan más funcionalidades',
      features: ['Hasta 10 miembros', 'Presupuestos avanzados', 'Reportes detallados', 'Soporte prioritario'],
      popular: true
    },
    {
      icon: Star,
      title: 'Negocios',
      price: 'Personalizado',
      description: 'Soluciones para organizaciones',
      features: ['Usuarios ilimitados', 'API access', 'Integraciones personalizadas', 'Soporte dedicado', 'SLA garantizado'],
      popular: false
    }
  ];

  const handleVisitStore = () => {
    alert('🚧 Página en construcción. ¡Pronto disponibles más productos y servicios!');
  };

  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-pink-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
            <DollarSign className="text-white w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Contacto de Ventas</h1>
          <p className="text-gray-500">¿Interesado en nuestros planes empresariales? Hablemos</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <button
            onClick={handleVisitStore}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-colors font-medium"
          >
            <ExternalLink size={20} />
            <span>Ver más productos y servicios</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-lg shadow-sm border p-5 ${
                plan.popular ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <plan.icon className={`w-5 h-5 ${plan.popular ? 'text-primary' : 'text-gray-500'}`} />
                <h3 className="font-semibold text-gray-800">{plan.title}</h3>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{plan.price}</p>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Send size={20} className="text-primary" />
            Solicita información de ventas
          </h2>
          <form onSubmit={submitSales} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Tu empresa"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persona de contacto</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email profesional</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de empleados/familiares</label>
              <select
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecciona...</option>
                <option value="1-5">1-5</option>
                <option value="6-10">6-10</option>
                <option value="11-25">11-25</option>
                <option value="26-50">26-50</option>
                <option value="50+">50+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿Cómo podemos ayudarte?</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos sobre tus necesidades..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {sending ? (
                <>Enviando...</>
              ) : sent ? (
                <>
                  <Check size={18} />
                  ¡Enviado!
                </>
              ) : (
                <>
                  <Send size={18} />
                  Enviar solicitud
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-pink-50 rounded-lg p-6 text-center mt-8">
          <p className="text-gray-600 mb-2">
            ¿Prefieres una demo personalizada?
          </p>
          <p className="text-sm text-gray-500">
            Nuestro equipo de ventas te contactará en 24 horas para programar una demostración.
          </p>
        </div>
      </div>
    </div>
  );
}
