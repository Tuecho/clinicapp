# Clínica - Gestor de Citas

Aplicación web para la gestión de clínicas de estética. Administra clientes, servicios, citas, profesionales, productos, presupuestos y facturación.

## Características Principales

- **Gestión de clientes**: CRM completo con historial de visitas
- **Servicios**: Catálogo de servicios con precios y duración
- **Citas**: Programación con estado (programada/completada/cancelada)
- **Profesionales**: Gestión de horarios y disponibilidad
- **Productos**: Inventario con control de stock
- **Presupuestos**: Generación de presupuestos
- **Facturación**: Facturación con control de pagos
- **Recordatorios**: Automáticos por email
- **Backup**: Exportar en .db o JSON

> **Nota**: Esta es la versión para una única clínica donde todos los usuarios ven los mismos datos.

## Stack Tecnológico

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + sql.js (SQLite con persistencia)
- **Redis**: Cache para optimizar rendimiento
- **Docker**: Contenedores con Docker Compose

## Requisitos

- **Node.js** 18+
- **Docker y Docker Compose**

## Instalación

### Con Docker

```bash
docker-compose up -d
```

La app estará disponible en:
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001

### Desarrollo (sin Docker)

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

La app estará disponible en http://localhost:5173

## Módulos Implementados (40 tablas)

### Sistema
- auth_user, user_profile, app_settings, notification_settings
- password_reset_codes, faqs, suggestions, contact_messages

### Contabilidad
- transactions, budgets, expense_concepts

### Organización
- family_events, family_tasks, family_members, birthdays
- family_notes, note_boards, shopping_lists, shopping_items
- family_contacts, family_gifts

### Hogar
- home_inventory, home_inventory_categories, home_maintenance
- utility_bills

### Clínica (21 tablas)
- clinic_clients, clinic_services, clinic_appointments
- clinic_appointment_reminders, clinic_visits, clinic_consents
- clinic_gdpr_data, clinic_resources, clinic_notification_settings
- clinic_communication_log, clinic_packages, clinic_package_usage
- clinic_blocked_hours, clinic_professionals
- clinic_professional_schedules, clinic_professional_availability
- clinic_products, clinic_product_movements
- clinic_budgets, clinic_invoices
- clinic_revenue_report, clinic_appointment_notes

## Backup

Desde AdminPage (solo administradores):
- **Exportar .db**: Base de datos SQLite completa
- **Exportar JSON**: Todos los datos en formato JSON

## Estructura

```
clinic/
├── backend/           # Servidor Node.js + Express
│   └── server.js    # API principal
├── frontend/        # Aplicación React + Vite
│   ├── src/
│   │   ├── pages/ # Páginas
│   │   └── components/
├── docker-compose.yml
├── .env
└── README.md
```"# clinicapp" 
