# Clínica - Specification

## Project Overview
- **Project Name**: Clínica - Gestor de Citas
- **Type**: Full-stack Web Application (React + Node.js API)
- **Core Functionality**: Aesthetic clinic management system with clients, services, appointments, professionals, products, budgets, and invoicing
- **Target Users**: Clinic professionals and administrators

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **State**: Zustand
- **Backend**: Node.js + Express + sql.js (SQLite)
- **Cache**: Redis 7
- **Docker**: docker-compose with frontend, backend and redis services

## UI/UX Specification

### Layout Structure
- **Sidebar**: Fixed left sidebar with navigation
- **Main Content**: Flexible content area

### Pages
1. **Dashboard** - Overview with summary cards and quick actions
2. **Clients** - Client management with CRM
3. **Services** - Service catalog with prices and duration
4. **Appointments** - Appointment scheduler with calendar view
5. **Professionals** - Staff management with schedules
6. **Products** - Inventory management with stock control
7. **Budgets** - Budget generation
8. **Invoicing** - Invoice and payment management
9. **Accounting** - Transactions (income/expenses)
10. **Calendar** - Full calendar view
11. **Reminders** - Automatic email reminders
12. **Settings** - App and notification settings
13. **GDPR** - Privacy and consent management

### Visual Design
- **Primary Color**: #4F46E5 (indigo)
- **Secondary Color**: #10B981 (emerald)
- **Danger Color**: #EF4444 (red)
- **Background**: #F9FAFB (light gray)
- **Cards**: White with subtle shadow
- **Typography**: System font stack
- **Border Radius**: 8px for cards, 6px for buttons

### Components
- Sidebar with navigation items
- Summary cards
- Data tables with filters
- Modals for add/edit
- Calendar components
- Client cards
- Service cards
- Product inventory table
- Invoice generator
- Export functionality (DB, JSON, Excel)

## Functionality Specification

### Client Management (CRM)
- Client database with personal info (encrypted)
- Package management and usage tracking
- Appointment history
- Import/Export functionality

### Service Catalog
- Services with prices and duration
- Categories management

### Appointment System
- Time slot scheduling
- Calendar view with day/week/month
- Professional assignment
- States: scheduled, completed, cancelled
- Automatic email reminders

### Professional Management
- Staff schedules and availability
- Blocked hours management

### Product Inventory
- Product catalog with stock control
- Stock movements tracking

### Budgets & Invoicing
- Budget generation
- Invoice creation
- Payment tracking

### Accounting
- Income and expense tracking
- Categories: Gasolina, Comida, Alquiler, Servicios, Ocio, Otros

### Data Management
- SQLite database (sql.js)
- Redis caching for performance
- Import/Export (DB, JSON)
- Database backup

### GDPR & Privacy
- AES-256-GCM encryption for sensitive data
- Consent management with audit trail
- SHA-256 hash for integrity

## Acceptance Criteria
1. React app runs in Docker container on port 5174
2. API runs in Docker container on port 3001
3. Redis service runs on port 6379
4. Sidebar navigation works between all pages
5. Client CRUD operations work
6. Service management works
7. Appointment scheduling works
8. Professional schedules can be configured
9. Product inventory tracking works
10. Budget and invoice generation works
11. Data persists in SQLite
12. Redis caching works correctly
13. GDPR encryption works for sensitive data

## Docker Setup
- Frontend: Vite dev server (development mode)
- Backend: Node.js Express API
- Redis: Redis 7 Alpine for caching
- Network: clinic-network (internal)
- Ports: 5174 (frontend), 3001 (API), 6379 (Redis)