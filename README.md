# Family Agent

Aplicación web para la gestión de la economía familiar, agenda y planificación del hogar.

## Características

- **Contabilidad familiar**: Registro de ingresos y gastos con importación desde Excel
- **Presupuestos mensuales**: Seguimiento de presupuestos por categoría con progreso visual
- **Agenda familiar**: Eventos con soporte para recurrencia semanal (ej: clases de inglés cada lunes y miércoles)
- **Dashboard**: Gráficos de evolución mensual con los últimos 6 meses
- **Chatbot**: Asistente con IA (Groq) y modo SQL rápido para consultas
- **Notificaciones email**: Resumen diario/semanal de eventos y presupuestos
- **Diseño responsive**: Optimizado para móvil y escritorio

## Stack Tecnológico

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + sql.js (SQLite en memoria)
- **Docker**: Multi-container con Docker Compose
- **Email**: Nodemailer + Gmail SMTP
- **IA**: Groq API (LLaMA 3.3)

## Requisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local)
- Claves API:
  - Groq API Key (gratuita en [console.groq.com](https://console.groq.com))
  - Gmail App Password (para notificaciones)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Tuecho/family-agent.git
cd family-agent
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y añade tus credenciales:

```env
GROQ_API_KEY=tu_api_key_de_groq
DUCKDNS_TOKEN=tu_token_de_duckdns
SMTP_PASSWORD=tu_password_de_aplicacion_gmail
```

### 3. Iniciar con Docker

```bash
docker compose up -d
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- API: http://localhost:3000

## Acceso

- **Usuario admin**: miguel / Asturias12!
- Primer usuario creado se convierte en admin automáticamente

## Desarrollo local

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Estructura del proyecto

```
family-agent/
├── frontend/           # React app
│   ├── src/
│   │   ├── pages/      # Dashboard, Accounting, Agenda, Budgets, Chat, Profile
│   │   ├── components/ # Sidebar, Auth, ChatWidget, etc.
│   │   └── store/     # Estado global (Zustand)
│   └── Dockerfile
├── backend/            # API Express
│   ├── server.js      # Endpoints y lógica
│   └── Dockerfile
├── docker-compose.yml  # Orquestación
├── .env.example       # Plantilla variables de entorno
└── .gitignore
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/users` - Listar usuarios (admin)
- `PUT /api/auth/users/:id/approve` - Aprobar usuario (admin)

### Transacciones
- `GET /api/transactions` - Lista de transacciones
- `POST /api/transactions` - Crear transacción
- `GET /api/transactions/monthly` - Datos mensuales
- `GET /api/transactions/by-concept` - Gastos por categoría

### Presupuestos
- `GET /api/budgets` - Lista de presupuestos
- `POST /api/budgets` - Crear presupuesto
- `PUT /api/budgets/:id` - Actualizar presupuesto

### Agenda
- `GET /api/events` - Eventos (soporta recurrencia semanal)
- `POST /api/events` - Crear evento
- `PUT /api/events/:id` - Actualizar evento
- `DELETE /api/events/:id` - Eliminar evento

### Perfil
- `GET /api/profile` - Obtener perfil
- `PUT /api/profile` - Actualizar perfil

### Chatbot
- `POST /api/chat` - Mensaje al chatbot (Groq o SQL)

### Notificaciones
- `GET /api/notifications/settings` - Configuración
- `PUT /api/notifications/settings` - Actualizar configuración

## Docker Deployment

El proyecto incluye configuración para despliegue con:
- DuckDNS (actualización automática de DNS)
- Nginx Proxy Manager (reverse proxy con SSL)

### Acceso externo

Edita `docker-compose.yml` para cambiar el subdomain de DuckDNS y configura Nginx Proxy Manager con tu dominio.

## Licencia

MIT
