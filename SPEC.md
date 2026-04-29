# Clínica - Specification

## Project Overview
- **Name**: Clínica - Gestor de Citas
- **Type**: Web App gestión de clínica de estética
- **Core**: Citas, clientes, servicios, profesionales

## Stack
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Estado**: Zustand
- **Backend**: Node.js + Express + sql.js
- **Cache**: Redis 7
- **Docker**: Docker Compose

## Sistema de Roles

La aplicación implementa un sistema de **3 roles** con permisos diferenciados:

| Rol | Módulos visibles | Permisos |
|-----|------------------|----------|
| **Admin** | Dashboard, Contabilidad, Mi Clínica, Bonos, Admin | Total: gestión usuarios, configuración, todos los datos |
| **Administrative** | Contabilidad, Mi Clínica, Bonos | Gestión clínica: citas, clientes, servicios, productos, profesionales |
| **Worker** | Solo Mi Clínica | Solo ve sus propias citas y calendario |

### Vinculación Usuario - Profesional
- Cada usuario worker se vincula a un profesional (`user_id` en `clinic_professionals`)
- Las citas se filtran automáticamente según el profesional asignado
- El worker solo ve sus propias citas, el administrative/admin ven todas

## UI/UX

### Layout
- Sidebar fixa izquierda
- Área de contenido

### Páginas
1. Dashboard - Resumen
2. ClinicManager - Clientes y servicios
3. AppointmentScheduler - Citas
4. Professionals - Personal
5. ClinicPackages - Paquetes
6. Budgets - Presupuestos
7. Accounting - Transacciones
8. ReportsAnalytics - Informes
9. Agenda - Calendario
10. Tasks - Tareas
11. Notes - Notas
12. AdminPage - Gestión de usuarios y configuración

## Módulos

### Clínica (principal)
- Clientes CRM (encriptados)
- Servicios catálogo
- Citas programación
- Profesionales horarios
- Productos inventario
- Presupuestos/facturación
- Paquetes
- Consentimientos RGPD

### Reutilizados
- Agenda eventos
- Tareas
- Notas
- Listas compra
- Accounting

## Tablas Clínica (22)

- clinic_clients, clinic_services, clinic_appointments
- clinic_appointment_reminders, clinic_visits
- clinic_professionals, clinic_specialties
- clinic_professional_schedules, clinic_professional_availability
- clinic_products, clinic_product_movements
- clinic_budgets, clinic_invoices
- clinic_consents, clinic_consent_audit, clinic_gdpr_data
- clinic_packages, clinic_package_usage
- clinic_blocked_hours
- clinic_notification_settings, clinic_communication_log

## API Endpoints

### Autenticación y Usuarios
- `/api/auth/login` - Login (devuelve role)
- `/api/auth/register` - Registro
- `/api/auth/me` - Info usuario actual (incluye role y professionalId)
- `/api/auth/admin/users` - Listar usuarios (con role)
- `/api/auth/admin/user/create` - Crear usuario con rol

### Clínica
- `/api/clinic/*` - Todos los endpoints de clínica
- `/api/clinic/appointments` - Citas (filtradas por rol)
- `/api/clinic/professionals` - Profesionales (filtrados por rol)

### Otros
- /api/events, /api/tasks, /api/notes
- /api/transactions, /api/budgets
- /api/shopping-lists
- /api/chat/llm

## Criterios
1. Frontend 5174, API 3001, Redis 6379
2. CRUD clientes, servicios, citas
3. Profesionales disponibilidad
4. Productos inventario
5. Presupuestos/facturas
6. RGPD encriptación
7. Módulos reutilizados
8. Sistema de 3 roles implementado