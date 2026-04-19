# Family Agent - Specification

## Project Overview
- **Project Name**: Family Agent
- **Type**: Full-stack Web Application (React + Node.js API)
- **Core Functionality**: Family dashboard with accounting, appointments, tasks, budgets, client management, and AI chatbot
- **Target Users**: Family members and clinic professionals

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS
- **State**: Zustand
- **Backend**: Node.js + Express
- **Database**: SQLite (sql.js) + Redis for caching/sessions
- **Docker**: docker-compose with frontend and backend services

## UI/UX Specification

### Layout Structure
- **Sidebar**: Fixed left sidebar (240px) with navigation
- **Main Content**: Flexible content area
- **Chat Widget**: Floating button bottom-right, expands to chat window

### Pages
1. **Dashboard** - Overview with summary cards and quick actions
2. **Accounting** - Income/expenses management with categories
3. **Agenda** - Calendar with events and appointments
4. **Appointments** - Appointment scheduler with time slots
5. **Tasks** - Family tasks and to-do management
6. **Budgets** - Budget planning and tracking
7. **Clients** - Client management module
8. **Professionals** - Professional staff management
9. **Reports** - Analytics and reports
10. **Birthdays** - Birthday tracking
11. **Shopping List** - Family shopping lists
12. **Utility Bills** - Bills tracking and management
13. **Home Maintenance** - Home maintenance tasks
14. **Notes** - Notes and documentation
15. **Privacy/Terms** - Legal pages

### Visual Design
- **Primary Color**: #4F46E5 (indigo)
- **Secondary Color**: #10B981 (emerald for income)
- **Danger Color**: #EF4444 (red for expenses)
- **Background**: #F9FAFB (light gray)
- **Cards**: White with subtle shadow
- **Typography**: System font stack
- **Border Radius**: 8px for cards, 6px for buttons

### Components
- Sidebar with navigation items
- Summary cards
- Transaction list with filters
- Add transaction modal
- Chat widget (floating button + chat window)
- Appointment scheduler
- Client management table
- Import/Export (DB, Excel, PDF)
- Notification settings
- Language selector

## Functionality Specification

### Accounting Module
- **Income entries**: amount, description, date
- **Expense entries**: amount, concept (gasolina, comida, alquiler, servicios, ocio, otros), date, description
- **Monthly view**: Filter by current month
- **Summary**: Total income, total expenses, net balance
- **Categories**: Gasolina, Comida, Alquiler, Servicios, Ocio, Otros

### Client Management
- Client database with personal info
- Package management
- Appointment history
- Import from Excel/PDF

### Appointment System
- Time slot scheduling
- Calendar view
- Professional assignment
- Notification settings (web push, email)

### AI Chat Bot
- Floating button to toggle chat
- Local responses for family queries
- Can answer questions about expenses/income
- Uses conversation context

### Data Management
- SQLite database (family_agent.db)
- Redis caching
- Import/Export functionality
- Database backup

## Acceptance Criteria
1. React app runs in Docker container
2. API runs and serves data
3. Sidebar navigation works between pages
4. Can add income and expenses
5. Expenses show categorized by concept
6. Monthly totals are calculated correctly
7. Chat bot opens/closes and responds to messages
8. Client management works
9. Appointment scheduling works
10. Data persists in SQLite

## Docker Setup
- Frontend: nginx serving Vite build
- Backend: Node.js Express API
- Redis service
- Port 5173 for frontend, 3000 for API