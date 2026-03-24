import { FileText, Shield, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';

export function Terms() {
  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-pink-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
            <FileText className="text-white w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Condiciones de Venta</h1>
          <p className="text-gray-500">Términos y condiciones de uso de Family Agent</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            1. Aceptación de Términos
          </h2>
          <p className="text-gray-600 mb-4">
            Al acceder y utilizar Family Agent, usted acepta vincularse por estos términos y condiciones. Si no está de acuerdo con alguno de estos términos, no debería utilizar nuestro servicio.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            2. Servicios y Precios
          </h2>
          <p className="text-gray-600 mb-4">
            Family Agent ofrece una versión gratuita con funcionalidades básicas. Los servicios premium están sujetos a las siguientes condiciones:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Los precios pueden cambiar en cualquier momento con previo aviso</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Los pagos se procesan de forma segura a través de pasarelas de pago autorizadas</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Las suscripciones se renuevan automáticamente a menos que se cancelen</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Los impuestos aplicables se añadirán al precio final</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            3. Período de Prueba y Garantía
          </h2>
          <p className="text-gray-600 mb-4">
            Ofecemos un período de prueba de 7 días para nuevos usuarios. Durante este período, puede cancelar sin coste alguno.
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <span>No oferecemos reembolsos una vez transcurrido el período de prueba</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Puede cancelar su suscripción en cualquier momento desde su perfil</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
              <span>Continuará teniendo acceso hasta el final del período facturado</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            4. Uso del Servicio
          </h2>
          <p className="text-gray-600 mb-4">
            Usted se compromete a utilizar el servicio de manera lawful y de acuerdo con estos términos:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <span>No infringir derechos de terceros</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <span>No intentar acceder a cuentas de otros usuarios</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <span>No distribuir malware o contenido malicioso</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <span>No utilizar el servicio para actividades ilegales</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-primary" />
            5. Limitación de Responsabilidad
          </h2>
          <p className="text-gray-600 mb-4">
            Family Agent se proporciona "tal cual" sin garantías de ningún tipo. No seremos responsables por daños indirectos, incidentales, especiales o consecuenciales derivados del uso del servicio.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            6. Modificaciones del Servicio
          </h2>
          <p className="text-gray-600">
            Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento. También podemos actualizar estos términos; el uso continuado del servicio después de dichos cambios constituye su aceptación.
          </p>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-pink-50 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500">
            Última actualización: Marzo 2026
          </p>
          <p className="text-sm text-gray-500 mt-1">
            © {new Date().getFullYear()} Family Agent. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
