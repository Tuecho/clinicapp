# 💆‍♀️ Guía de Uso - Gestor de Clínica de Estética

## Descripción

Se ha creado un sistema completo de gestión de citas para tu clínica de estética con las siguientes características:

### ✨ Funcionalidades Implementadas

#### 1. **Dashboard** 
- Estadísticas en tiempo real:
  - Total de clientes
  - Servicios activos
  - Citas programadas hoy
  - Citas este mes
  - Ingresos del mes
- Vista de próximas citas

#### 2. **Gestión de Clientes**
- Crear, editar y eliminar clientes
- Información completa:
  - Nombre, email, teléfono
  - Fecha de nacimiento
  - Dirección, ciudad, código postal
  - Notas adicionales

#### 3. **Gestión de Servicios**
- Crear, editar y eliminar servicios
- Información del servicio:
  - Nombre y descripción
  - Duración (en minutos)
  - Precio
  - Categoría
  - Estado (Activo/Inactivo)

#### 4. **Gestión de Citas**
- Crear, editar y eliminar citas
- Información de la cita:
  - Cliente y servicio
  - Fecha y hora
  - Duración personalizada
  - Precio
  - Notas
- Estados disponibles:
  - ✅ Programada
  - ✅ Completada
  - ✅ Cancelada

#### 5. **Sistema de Recordatorios**
- ⏰ Envía recordatorios automáticos cada día a las **20:00** (8:00 PM)
- 📧 Email formateado con detalle de citas para mañana
- Respeta la zona horaria del usuario (por defecto: Europe/Madrid)

---

## 🚀 Cómo Usar

### Acceder al Módulo
1. En el Sidebar izquierdo, busca el icono de estetoscopio
2. Haz clic en "Mi Clínica"
3. Verás 4 pestañas principales:
   - 📊 **Dashboard**
   - 📅 **Citas**
   - 👥 **Clientes**
   - 💆 **Servicios**

### Crear un Cliente
1. Ve a la pestaña **👥 Clientes**
2. Haz clic en **+ Nuevo Cliente**
3. Completa los datos del cliente
4. Haz clic en **Crear Cliente**

### Crear un Servicio
1. Ve a la pestaña **💆 Servicios**
2. Haz clic en **+ Nuevo Servicio**
3. Completa:
   - Nombre del servicio (ej: "Masaje Relajante")
   - Descripción (opcional)
   - Duración en minutos (ej: 60)
   - Precio (ej: 50.00)
   - Categoría (ej: "Masajes")
4. Marca como "Activo" si deseas que esté disponible
5. Haz clic en **Crear Servicio**

### Programar una Cita
1. Ve a la pestaña **📅 Citas**
2. Haz clic en **+ Nueva Cita**
3. Selecciona:
   - Cliente
   - Servicio (se rellenará el precio automáticamente)
   - Fecha y hora
   - Duración (opcional, por defecto uso la del servicio)
4. Agrega notas si es necesario
5. Haz clic en **Crear Cita**

### Cambiar Estado de una Cita
1. En la tabla de citas, busca la cita
2. En la columna "Estado", selecciona el nuevo estado:
   - **Programada**: Cita agendada pero no realizada
   - **Completada**: Cita completada exitosamente
   - **Cancelada**: Cita cancelada

---

## ⚙️ Configuración

### Configurar Recordatorios por Email
Para recibir recordatorios automáticos:

1. Ve a tu perfil de usuario (esquina superior derecha)
2. En la sección "Notificaciones", activa:
   - ✅ **Email habilitado**
   - Configura tu correo SMTP (Gmail, Outlook, etc.)
3. Establece la hora de recordatorio (por defecto: 20:00)
4. Elige tu zona horaria (por defecto: Europe/Madrid)

### Sobre los Recordatorios
- Se envían automáticamente cada día a la hora configurada
- Solo se envían si hay citas para el día siguiente
- El email incluye:
  - Lista de todas las citas para mañana
  - Hora, cliente y servicio
  - Un resumen útil para preparación

---

## 📊 Base de Datos

Los datos de tu clínica se almacenan en la base de datos SQL.js local:
- **Clientes**: Toda la información de contacto y detalles
- **Servicios**: Catálogo de servicios con precios
- **Citas**: Registro completo de citas
- **Recordatorios**: Historial de recordatorios enviados

---

## 💡 Consejos de Uso

1. **Primero crea servicios**: Define todos los servicios que ofreces antes de programar citas
2. **Agrega clientes regularmente**: Facilita la programación desde el módulo de citas
3. **Mantén precios actualizados**: Los servicios pueden tener precios individuales
4. **Revisa el dashboard**: Úsalo para ver tus métricas y planificación
5. **Personaliza duración**: Algunos servicios pueden tomar diferente tiempo
6. **Usa notas**: Agrega información especial en las citas (preferencias, alergias, etc.)

---

## 🔧 Información Técnica

### Backend
- API REST en `/api/clinic/`
- Almacenamiento en SQLite
- Recordatorios via node-cron (cada minuto)
- Emails via nodemailer

### Frontend
- React + TypeScript + Tailwind CSS
- Interface responsiva (desktop y móvil)
- Validación de campos
- Modal dialogs para crear/editar

### Almacenamiento
- Base de datos: `family_agent.db`
- Respaldo automático diario

---

## ❓ Preguntas Frecuentes

**¿Qué pasa si borro un cliente?**
- Se eliminarán también todas sus citas asociadas

**¿Qué pasa si borro un servicio?**
- Se eliminarán todas las citas con ese servicio

**¿Puedo cambiar el precio de una cita después de crearla?**
- Sí, edita la cita y cambia el precio

**¿Los recordatorios se envían en otra zona horaria?**
- Sí, se respeta tu zona horaria configurada

**¿Puedo ver el historial de citas completadas?**
- Sí, aparecen en la tabla de citas con estado "Completada"

---

## 📞 Soporte

Para más información sobre otras características de la aplicación, consulta:
- Dashboard general
- Otras secciones de módulos
- Perfil y configuración de notificaciones

¡Disfruta gestionando tu clínica! 💆‍♀️✨
