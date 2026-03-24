import { useState } from 'react';
import { Mail, MessageSquare, Send, Check, MapPin, Clock } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || '';

export function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setError('');
    setSending(true);
    try {
      const headers = { ...getAuthHeaders(), 'Content-Type': 'application/json' };
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          email,
          subject,
          message
        })
      });
      
      if (response.ok) {
        setSent(true);
        setMessage('');
        setSubject('');
        setName('');
        setTimeout(() => setSent(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al enviar el mensaje');
      }
    } catch (err) {
      console.error('Error sending contact:', err);
      setError('Error de conexión');
    }
    setSending(false);
  };

  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-pink-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
            <Mail className="text-white w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Contacto</h1>
          <p className="text-gray-500">¿Tienes preguntas? Estamos aquí para ayudarte</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="text-primary w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-sm text-gray-500">contact@familyagent.app</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-primary w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Soporte</h3>
                <p className="text-sm text-gray-500">Respuesta en 24-48h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="text-primary w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Horario</h3>
                <p className="text-sm text-gray-500">Lun-Vie: 9:00 - 18:00</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="text-primary w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Ubicación</h3>
                <p className="text-sm text-gray-500">España (Remoto)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Send size={20} className="text-primary" />
            Envíanos un mensaje
          </h2>
          <form onSubmit={submitContact} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="¿Sobre qué quieres preguntar?"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={5}
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
                  Enviar mensaje
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-pink-50 rounded-lg p-6 text-center mt-8">
          <p className="text-gray-600 mb-2">
            ¿Prefieres hablar directamente?
          </p>
          <p className="text-sm text-gray-500">
            También puedes联系我们 a través de redes sociales o visitarnos en nuestro GitHub.
          </p>
        </div>
      </div>
    </div>
  );
}
