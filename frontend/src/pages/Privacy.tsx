import { Shield, Eye, Lock, Users, Trash2, Mail, Globe } from 'lucide-react';

export function Privacy() {
  return (
    <div className="p-3 sm:p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-pink-500 rounded-xl sm:rounded-2xl mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-lg">
            <Shield className="text-white w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Política de Privacidad</h1>
          <p className="text-gray-500">Cómo protegemos y manejamos sus datos</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-primary" />
            1. Información que Recopilamos
          </h2>
          <p className="text-gray-600 mb-4">
            Recopilamos información necesaria para proporcionar y mejorar nuestros servicios:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Información de cuenta:</strong> Nombre, email, contraseña encriptada</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Datos familiares:</strong> Nombre de familia, miembros, preferencias</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Datos financieros:</strong> Ingresos, gastos, presupuestos (solo para usted)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Datos de uso:</strong> Cómo interactúa con la aplicación</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lock size={20} className="text-primary" />
            2. Cómo Protegemos sus Datos
          </h2>
          <p className="text-gray-600 mb-4">
            Implementamos medidas de seguridad robustas para proteger su información:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Encriptación de datos en tránsito y en reposo (AES-256)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Contraseñas hasheadas conbcrypt</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Autenticación segura con tokens JWT</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Acceso limitado solo al personal autorizado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Auditorías de seguridad regulares</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            3. Uso de la Información
          </h2>
          <p className="text-gray-600 mb-4">
            Utilizamos su información para:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Proporcionar y mantener nuestros servicios</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Personalizar su experiencia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Procesar transacciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Comunicarnos con usted sobre actualizaciones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Mejorar nuestros servicios</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            4. Compartir Información
          </h2>
          <p className="text-gray-600 mb-4">
            No vendemos su información personal. Solo compartimos datos en las siguientes circunstancias:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Con su consentimiento:</strong> Cuando usted decide compartir datos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Proveedores de servicios:</strong> Para procesar pagos, enviar emails, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span><strong>Requerimientos legales:</strong> Cuando la ley lo requiera</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            5. Sus Derechos
          </h2>
          <p className="text-gray-600 mb-4">
            Usted tiene los siguientes derechos sobre sus datos:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Acceso:</strong> Puede solicitar una copia de sus datos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Rectificación:</strong> Puede corregir datos incorrectos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Eliminación:</strong> Puede solicitar la eliminación de sus datos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Portabilidad:</strong> Puede exportar sus datos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span><strong>Opción:</strong> Puede exportar sus datos en cualquier momento</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trash2 size={20} className="text-primary" />
            6. Retención y Eliminación de Datos
          </h2>
          <p className="text-gray-600 mb-4">
            Conservamos sus datos mientras su cuenta esté activa o según sea necesario para proporcionar servicios. Puede solicitar la eliminación de su cuenta y todos los datos asociados en cualquier momento.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            7. Cookies y Tecnologías Similares
          </h2>
          <p className="text-gray-600 mb-4">
            Utilizamos cookies y tecnologías similares para:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Mantener su sesión iniciada</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Recordar sus preferencias</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Analizar el uso de la aplicación</span>
            </li>
          </ul>
          <p className="text-gray-600 mt-4">
            Puede configurar su navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            8. Transferencias Internacionales
          </h2>
          <p className="text-gray-600">
            Sus datos pueden transferirse y procesarse en servidores fuera de su país. Implementamos salvaguardas apropiadas para proteger su información durante estas transferencias.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            9. Cambios a esta Política
          </h2>
          <p className="text-gray-600">
            Podemos actualizar esta política periódicamente. Le notificaremos cualquier cambio significativo a través de la aplicación o por email. El uso continuado de Family Agent después de dichos cambios constituye su aceptación.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail size={20} className="text-primary" />
            10. Contacto
          </h2>
          <p className="text-gray-600">
            Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos a través de la sección de contacto en la aplicación o enviando un email a privacy@familyagent.app
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
