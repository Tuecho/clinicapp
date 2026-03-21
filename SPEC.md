# Family Agent - Specification

## Project Overview
- **Project Name**: Family Agent
- **Type**: Web Application (React + Vite)
- **Core Functionality**: Family agenda with accounting (income/expenses tracking) and AI chatbot
- **Target Users**: Family members

## Tech Stack
- Frontend: React 18 + Vite + TypeScript
- UI: TailwindCSS
- State: Zustand
- Chat: simple AI bot with local responses
- Docker: docker-compose with frontend service

## UI/UX Specification

### Layout Structure
- **Sidebar**: Fixed left sidebar (240px) with navigation
- **Main Content**: Flexible content area
- **Chat Widget**: Floating button bottom-right, expands to chat window

### Pages
1. **Dashboard** - Overview with summary cards
2. **Accounting** - Income/expenses management

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
- Summary cards (total income, total expenses, balance)
- Transaction list with filters
- Add transaction modal
- Chat widget (floating button + chat window)
- Forms for adding income/expenses

## Functionality Specification

### Accounting Module
- **Income entries**: amount, description, date
- **Expense entries**: amount, concept (gasolina, comida, alquiler, servicios, ocio, otros), date, description
- **Monthly view**: Filter by current month
- **Summary**: Total income, total expenses, net balance
- **Categories**: Gasolina, Comida, Alquiler, Servicios, Ocio, Otros

### Chat Bot
- Floating button to toggle chat
- Simple responses for family queries
- Can answer questions about expenses/income
- Uses local conversation context

## Acceptance Criteria
1. React app runs in Docker container
2. Sidebar navigation works between pages
3. Can add income and expenses
4. Expenses show categorized by concept
5. Monthly totals are calculated correctly
6. Chat bot opens/closes and responds to messages
7. Data persists in localStorage

## Docker Setup
- Single container with nginx serving Vite build
- Volume mount for development
- Port 5173 exposed
