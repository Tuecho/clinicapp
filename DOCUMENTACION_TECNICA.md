# 🏗️ Documentación Técnica - Sistema de Gestión de Clínica

## Resumen de Cambios Implementados

Se ha añadido un módulo completo de gestión de citas para clínica de estética a la aplicación Family Agent existente.

---

## 📁 Archivos Modificados

### Backend (`backend/server.js`)

#### 1. Nuevas Tablas de Base de Datos

Se agregaron 4 nuevas tablas SQL:

```sql
-- Almacena información de clientes
CREATE TABLE clinic_clients (
  id TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birthdate TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)

-- Almacena servicios ofrecidos
CREATE TABLE clinic_services (
  id TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  price REAL NOT NULL,
  category TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)

-- Almacena citas programadas
CREATE TABLE clinic_appointments (
  id TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  client_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT DEFAULT 'scheduled',
  price REAL,
  notes TEXT,
  reminder_sent INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clinic_clients(id),
  FOREIGN KEY (service_id) REFERENCES clinic_services(id)
)

-- Almacena historial de recordatorios
CREATE TABLE clinic_appointment_reminders (
  id TEXT PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  appointment_id TEXT NOT NULL,
  reminder_type TEXT DEFAULT 'email',
  reminder_time TEXT NOT NULL,
  sent_at TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES clinic_appointments(id)
)
```

#### 2. Nuevos Endpoints API

**Clientes:**
- `GET /api/clinic/clients` - Obtener todos los clientes
- `POST /api/clinic/clients` - Crear nuevo cliente
- `PUT /api/clinic/clients/:id` - Editar cliente
- `DELETE /api/clinic/clients/:id` - Eliminar cliente

**Servicios:**
- `GET /api/clinic/services` - Obtener todos los servicios
- `POST /api/clinic/services` - Crear nuevo servicio
- `PUT /api/clinic/services/:id` - Editar servicio
- `DELETE /api/clinic/services/:id` - Eliminar servicio

**Citas:**
- `GET /api/clinic/appointments` - Obtener citas (con filtros de fecha)
- `POST /api/clinic/appointments` - Crear nueva cita
- `PUT /api/clinic/appointments/:id` - Editar cita
- `DELETE /api/clinic/appointments/:id` - Eliminar cita
- `PUT /api/clinic/appointments/:id/status` - Cambiar estado de cita

**Dashboard:**
- `GET /api/clinic/dashboard` - Obtener estadísticas

#### 3. Sistema de Recordatorios

**Nueva función: `sendClinicAppointmentReminders()`**
- Se ejecuta cada minuto (integrada en el scheduler)
- Verifica citas para el día siguiente
- Se envía a las 20:00 (hora local del usuario)
- Email HTML formateado con detalles de las citas
- Respeta zona horaria del usuario

**Características:**
- Solo envía email si hay citas para mañana
- Usa configuración SMTP del usuario desde `notification_settings`
- Registra envío de recordadores
- Manejo de errores robusto

---

### Frontend (`frontend/src/`)

#### 1. Nueva Página: `pages/ClinicManager.tsx`

Componente React completo con:

**Estructura:**
```typescript
- Dashboard (estadísticas principales)
- Appointments (gestión de citas)
- Clients (gestión de clientes)
- Services (gestión de servicios)
```

**Componentes Internos:**
- Modales para crear/editar
- Tablas de datos
- Tarjetas para clientes y servicios
- Selects para relaciones

**Estados Manejados:**
- Clientes: Create, Read, Update, Delete
- Servicios: Create, Read, Update, Delete
- Citas: Create, Read, Update, Delete + cambio de estado
- Estadísticas en dashboard

**Interfaces TypeScript:**
```typescript
interface Client
interface Service
interface Appointment
interface DashboardStats
```

#### 2. Modificaciones a `App.tsx`

- Agregado import: `import { ClinicManager } from './pages/ClinicManager'`
- Agregado tipo: `| 'clinic'` a `PageType`
- Agregada renderización: `{activePage === 'clinic' && <ClinicManager />}`

#### 3. Modificaciones a `components/Sidebar.tsx`

- Agregado import de icono: `Stethoscope`
- Actualizada interfaz `SidebarProps` para incluir `'clinic'`
- Agregada referencia en `defaultModules`
- Agregada entrada en `moduleMap` con ícono de estetoscopio
- Agregada entrada en `allModules` array

---

## 🔄 Flujo de Datos

### Crear una Cita

```
Frontend (ClinicManager.tsx)
    ↓
POST /api/clinic/appointments
    ↓
Backend (server.js - validación)
    ↓
INSERT INTO clinic_appointments
    ↓
saveDb() - guarda en archivo
    ↓
Response JSON { success: true, id }
    ↓
Frontend (recarga tabla)
```

### Enviar Recordatorio

```
Scheduler (cada minuto)
    ↓
sendClinicAppointmentReminders()
    ↓
Obtiene citas para mañana
    ↓
Verifica zona horaria del usuario
    ↓
¿Es hora de enviar (20:00)?
    ↓
SÍ → Obtiene configuración SMTP
    ↓
Crear transporter nodemailer
    ↓
Envía email HTML
    ↓
Log exitoso
```

---

## 📊 Esquema de Datos

### Relaciones

```
auth_user
    ↓
clinic_clients (owner_id)
    ↓ (references)
clinic_appointments (client_id)
    ↑ (references)
clinic_services (owner_id)
    ↑ (references from appointments)
```

### Campos Importantes

**clinic_clients:**
- `id`: UUID único de cliente
- `owner_id`: Usuario propietario
- `email`, `phone`: Contacto

**clinic_services:**
- `id`: UUID único de servicio
- `price`: Precio del servicio
- `duration_minutes`: Duración estándar
- `active`: 1 (activo), 0 (inactivo)

**clinic_appointments:**
- `status`: "scheduled", "completed", "cancelled"
- `reminder_sent`: 1 (enviado), 0 (no enviado)
- `price`: Puede diferir del precio del servicio

---

## 🔐 Seguridad

- Todas las APIs requieren autenticación (validan `getAuthHeaders()`)
- All data es aislado por `owner_id` del usuario
- Las transacciones guardan automáticamente en DB
- Validación de campos requeridos

---

## 📈 Rendimiento

- Índices implícitos en PRIMARY KEY
- Paginación NO implementada (considerar para muchos datos)
- Queries optimizadas con filtros de fecha
- Uso de prepared statements

---

## 🛠️ Extensiones Futuras

### Mejoras Posibles

1. **Notificaciones para Clientes**
   - SMS recordatorio 24 horas antes
   - Confirmación automática de citas

2. **Estadísticas Avanzadas**
   - Gráficos de ingresos
   - Cliente más frecuente
   - Servicio más popular

3. **Gestor de Horarios**
   - Disponibilidad diaria
   - Duración variable por día/hora
   - Bloques de tiempo

4. **Historial y Reportes**
   - Exportar citas a PDF
   - Facturas automáticas
   - Resumen mensual

5. **Integración de Pagos**
   - Stripe/PayPal
   - Facturas digitales
   - Recordatorio de pagos pendientes

6. **Sistema de Comentarios**
   - Notas sobre cada cliente
   - Historial de tratamientos
   - Observaciones para próxima cita

---

## 📝 Configuración de Recordatorios

### En notification_settings:
- `email_enabled`: 1/0
- `smtp_user`: Email para enviar
- `smtp_password`: Contraseña SMTP
- `notify_time`: Hora para enviar (HH:MM)
- `notify_timezone`: Zona horaria del usuario

### Por Defecto:
- Hora: 20:00 (8:00 PM)
- Zona: Europe/Madrid

---

## 🧪 Testing

Para verificar que todo funciona:

1. **Backend:**
   ```bash
   # Verifica que el servidor arranca sin errores
   # Verifica que las tablas se crean
   # Verifica los endpoints con Postman/Insomnia
   ```

2. **Frontend:**
   ```bash
   # Navega a "Mi Clínica" en Sidebar
   # Crea un cliente
   # Crea un servicio
   # Programa una cita
   # Verifica que aparezcan en el dashboard
   ```

3. **Recordatorios:**
   ```bash
   # Configura email en tu perfil
   # Crea una cita para mañana
   # Espera a las 20:00 o ajusta zona horaria
   # Verifica que recibas el email
   ```

---

## 📚 Referencias

- **Framework Backend:** Express.js + SQL.js
- **Framework Frontend:** React 18 + TypeScript + Vite
- **Emails:** Nodemailer
- **Scheduler:** node-cron
- **UI Components:** Lucide React Icons + Tailwind CSS
- **Base de Datos:** SQLite (sql.js)

---

## 📞 Notas Importantes

1. **Database Path:** `./family_agent.db`
2. **Port:** 3000 (configurable con `process.env.PORT`)
3. **Respaldos:** Se hacen automáticamente cada 3 AM
4. **Zona Horaria:** Respeta configuración por usuario
5. **Validación:** Frontend + Backend

¡El sistema está listo para usar! 🚀
