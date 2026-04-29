# Clínica - Gestor de Citas

Aplicación web para gestionar citas de una clínica de estética.

## Características

### Sistema de Roles
La aplicación dispone de **3 roles** con permisos diferenciados:

| Rol | Descripción |
|-----|--------------|
| **Admin** | Acceso total al sistema. Puede gestionar usuarios, módulos y todos los datos |
| **Administrative** | Gestión completa de Mi Clínica. Puede crear/modificar citas, clientes, servicios, productos, profesionales. Dashboard con ingresos del día |
| **Worker** | Solo ve sus propias citas en el calendario. Sin acceso a gestión de clientes ni configuración |

### Módulos de Clínica
- **Clientes**: CRM con datos encriptados, historial de visitas
- **Servicios**: Catálogo con precios y duración
- **Citas**: Programación calendario, asignación profesional, estados
- **Profesionales**: Horarios, disponibilidad, horas bloqueadas
- **Productos**: Inventario con control de stock
- **Presupuestos**: Generación y facturación
- **Paquetes**: Gestión de paquetes de servicios
- **Recordatorios**: Emails automáticos

### Módulos Reutilizados
- **Agenda**: Calendario general de eventos
- **Presupuestos**: Presupuestos generales
- **Tareas**: Gestión de tareas
- **Notas**: Notas y tablones
- **Accounting**: Transacciones ingresos/gastos
- **Shopping**: Listas de compra

## Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + sql.js
- **Cache**: Redis
- **Docker**: Docker Compose

## Instalación

```bash
docker-compose up -d
```

Puertos:
- Frontend: http://localhost:5174
- Backend: http://localhost:3001

## Desarrollo

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run dev
```

## Sistema de Autenticación

- Cada usuario se vincula a un **profesional** (campo `user_id` en `clinic_professionals`)
- Las **citas** se filtran automáticamente según el profesional asignado al usuario
- El **worker** solo ve sus propias citas
- El **administrative** y **admin** ven todas las citas y pueden filtrar por profesional

## Tablas de la Clínica (22)

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

## Seguridad (RGPD)

- **Encriptación**: AES-256-GCM (datos sensibles)
- **Consentimientos**: Hash SHA-256 con auditoría