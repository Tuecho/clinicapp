# Family Agent

Aplicación web para la gestión de la economía familiar, agenda, tareas y planificación del hogar con sistema multi-usuario. Optimizada para dispositivos móviles.

## Tabla de Contenidos

1. [Características](#características)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Requisitos](#requisitos)
5. [Instalación y Ejecución](#instalación-y-ejecución)
   - [Desarrollo (sin Docker)](#desarrollo-sin-docker)
   - [Producción con Docker](#producción-con-docker)
6. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
7. [Primer Inicio](#primer-inicio)
8. [Páginas y Funcionalidades](#páginas-y-funcionalidades)
   - [Dashboard](#dashboard)
   - [Contabilidad](#contabilidad)
   - [Presupuestos](#presupuestos)
   - [Agenda](#agenda)
   - [Tareas Familiares](#tareas-familiares)
   - [Lista de la Compra](#lista-de-la-compra)
   - [Notas](#notas)
   - [Planificación de Comidas](#planificación-de-comidas)
   - [Cumpleaños](#cumpleaños)
   - [Premium](#premium)
   - [Perfil](#perfil)
9. [Sistema de Tareas Programadas](#sistema-de-tareas-programadas)
   - [Notificaciones por Email](#notificaciones-por-email)
   - [Backup Automático](#backup-automático)
10. [Seguridad](#seguridad)
11. [Compartir Datos entre Usuarios](#compartir-datos-entre-usuarios)
12. [Solución de Problemas](#solución-de-problemas)

---

## Características

### Gestión Familiar
- **Contabilidad familiar**: Registro de ingresos y gastos con importación desde Excel/CSV
- **Presupuestos mensuales**: Seguimiento de presupuestos por categoría con progreso visual
- **Agenda familiar**: Eventos con soporte para recurrencia (diario, semanal, mensual) y fechas de fin
- **Dashboard**: Resumen mensual, gráficos de evolución y presupuestos

### Módulo Hogar
- **Inventario del hogar**: Electrodomésticos, muebles y electrónica con fecha de compra, garantía y manual. Avisa cuando vence la garantía.
- **Mantenimiento del hogar**: Revisión caldera, filtros aire acondicionado, ITV del coche. Tareas recurrentes con recordatorio.
- **Gestor de suscripciones**: Netflix, Spotify, gimnasio, seguros. Control de gasto mensual/anual.

### Organización Familiar
- **Seguimiento de mascotas**: Vacunas, veterinario, alimentación, medicación.
- **Gestor de viajes**: Vuelos, hoteles, actividades, presupuesto del viaje, checklist de equipaje.

### Finanzas Familiares
- **Hucha digital**: Ahorro por objetivos con progress bar visual y motivador.
- **Deudas internas**: Control de quién debe dinero a quién en la familia.
- **Comparador de facturas**: Luz, agua, gas mes a mes. Detección automática de anomalías.

### Educación y Desarrollo
- **Biblioteca familiar**: Libros físicos y ebooks. Seguimiento de quién los tiene y quién los ha leído.
- **Gestor de extraescolares**: Horarios, pagos, contacto del profesor, material necesario.

### Tareas y Lista de la Compra
- **Múltiples listas de compra**: Crea diferentes listas con nombre y color
- **Tareas familiares**: Asignables a miembros de la familia con prioridades
- **Ordenación**: Por importancia (urgente, alta, normal, baja) y fecha

### Notas
- **Tableros múltiples**: Organiza notas en diferentes tableros con nombre y color
- **Notas editables**: Edita título, contenido, categoría y mover entre tableros
- **Vistas**: Vista lista o cuadrícula
- **Búsqueda**: Filtra notas por título o contenido

### Sistema Multi-Usuario
- **Datos aislados**: Cada usuario tiene sus propios datos
- **Primer usuario = administrador**: El primer usuario registrado se crea automáticamente como administrador
- **Compartir datos**: Invita a otros usuarios a ver tus datos familiares
- **Módulos habilitables**: Activa/desactiva módulos desde tu perfil (Mascotas, Educación, Cumpleaños, Contabilidad, Presupuestos)

### Inteligencia Artificial
- **Chatbot IA**: Asistente con Groq (LLaMA 3.3) para analizar tus finanzas
- **Modo SQL rápido**: Consulta tus datos en lenguaje natural

### Extra
- **Planificación de comidas**: Gestiona recetas y planifica el menú semanal
- **Restaurantes favoritos**: Guarda tus restaurantes favoritos con valoración
- **Galería de fotos**: Álbum familiar para guardar momentos especiales
- **Cumpleaños**: Recordatorio de cumpleaños del mes
- **Inventario del hogar**: Electrodomésticos, muebles, electrónica con garantías
- **Mantenimiento del hogar**: Tareas recurrentes de mantenimiento
- **Suscripciones**: Control deNetflix, Spotify, gimnasio, seguros
- **Seguimiento de mascotas**: Vacunas, veterinario, medicación
- **Gestor de viajes**: Vuelos, hoteles, presupuesto, checklist
- **Biblioteca familiar**: Libros físicos y ebooks
- **Extraescolares**: Horarios, pagos, contacto profesor
- **Hucha digital**: Ahorro por objetivos
- **Deudas internas**: Control de deudas familiares
- **Comparador de facturas**: Luz, agua, gas
- **Diseño mobile-first**: Optimizado para móvil

---

## Estructura del Proyecto

```
family-agent/
├── backend/                 # Servidor Node.js + Express
│   ├── server.js           # Servidor principal (API, BD, tareas cron)
│   ├── package.json        # Dependencias del backend
│   ├── database/           # Base de datos SQLite (se crea automáticamente)
│   └── backups/            # Backups automáticos (se crea automáticamente)
│
├── frontend/               # Aplicación React + Vite
│   ├── src/
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── components/    # Componentes reutilizables
│   │   ├── store/         # Estado global (Zustand)
│   │   ├── utils/         # Utilidades (auth, format)
│   │   └── i18n/          # Traducciones
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docker-compose.yml     # Configuración Docker
├── .env                   # Variables de entorno (NO committed)
├── .env.example          # Ejemplo de variables de entorno
├── family_agent.db       # Base de datos SQLite (se crea automáticamente)
└── README.md
```

---

## Stack Tecnológico

- **Frontend**: React + Vite + TypeScript + TailwindCSS + Zustand
- **Backend**: Node.js + Express + sql.js (SQLite en memoria con persistencia)
- **Docker**: Multi-container con Docker Compose
- **IA**: Groq API (LLaMA 3.3)
- **Email**: Nodemailer con SMTP Gmail
- **Tareas programadas**: node-cron

---

## Requisitos

- **Node.js** 18+ (para desarrollo)
- **Docker y Docker Compose** (para producción)
- **Git**
- **Clave API Groq** (gratuita en [console.groq.com](https://console.groq.com))
- **Cuenta Gmail** con contraseña de aplicación (para notificaciones email)

---

## Instalación y Ejecución

### Desarrollo (sin Docker)

Recomendado para desarrollo y pruebas.

#### 1. Clonar el repositorio

```bash
git clone https://github.com/Tuecho/family-agent.git
cd family-agent
```

#### 2. Instalar dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

#### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura:

```env
# Clave API de Groq (obrigatoria para el chat IA)
GROQ_API_KEY=tu_api_key_de_groq

# Contraseña de aplicación Gmail (para notificaciones)
# Genera una en: https://myaccount.google.com/apppasswords
SMTP_PASSWORD=tu_contraseña_de_aplicacion_gmail
```

#### 4. Iniciar el backend

```bash
cd backend
npm start
```

El backend estará disponible en: http://localhost:3000

#### 5. Iniciar el frontend

En otra terminal:

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en: http://localhost:5173

---

### Producción con Docker

#### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
GROQ_API_KEY=tu_api_key_de_groq
SMTP_PASSWORD=tu_contraseña_de_aplicacion_gmail
```

#### 2. Construir y ejecutar

```bash
docker compose up -d --build
```

La aplicación estará disponible en http://localhost:5173

#### 3. Ver logs

```bash
docker compose logs -f
```

#### 4. Detener

```bash
docker compose down
```

---

## Configuración de Variables de Entorno

| Variable | Descripción | Obligatoria |
|----------|-------------|-------------|
| `GROQ_API_KEY` | Clave API de Groq para el chatbot IA | Solo si usas IA |
| `SMTP_PASSWORD` | Contraseña de aplicación Gmail para enviar emails | Solo si usas notificaciones |
| `CLOUDFLARE_TUNNEL_TOKEN` | Token de Cloudflare Tunnel para acceso remoto | No |

### Cómo obtener la clave de Groq

1. Ve a https://console.groq.com
2. Crea una cuenta o inicia sesión
3. Genera una nueva API key
4. Copia la clave en tu `.env`

### Cómo configurar Gmail para notificaciones

1. Ve a https://myaccount.google.com/apppasswords
2. Inicia sesión con tu cuenta Gmail
3. Genera una contraseña de aplicación (nombre: "Family Agent")
4. Usa esa contraseña en `SMTP_PASSWORD`

---

## Primer Inicio

1. Accede a la aplicación en http://localhost:5173
2. Regístrate con un nombre de usuario y contraseña
3. **El primer usuario se convertirá automáticamente en administrador**
4. Completa tu perfil (nombre, nombre de familia, ciudad, etc.)
5. ¡Listo!

---

## Páginas y Funcionalidades

### Dashboard

Página principal que muestra un resumen de la situación familiar:

- **Cita motivación**: Frase motivacional diaria
- **Balance del mes**: Ingresos, gastos y balance
- **Planes para hoy y mañana**: Eventos del día
- **Tareas pendientes**: Las 5 tareas más urgentes (ordenadas por prioridad y fecha)
- **Presupuestos del mes**: Estado de los presupuestos
- **Evolución (6 meses)**: Gráfico de ingresos/gastos de los últimos 6 meses
- **Cumpleaños del mes**: Próximos cumpleaños

**Ubicación del código**: `frontend/src/pages/Dashboard.tsx`

### Contabilidad

Gestión de transacciones financieras:

- **Registro de transacciones**: Ingresos y gastos
- **Categorías**: Comida, alquiler, gasolina, servicios, ocio, etc.
- **Filtros**: Por mes, año, tipo (ingreso/gasto)
- **Importación**: Desde Excel (.xlsx) o CSV
- **Importación de facturas PDF**: Extrae automáticamente concepto, cantidad y fecha

**Ubicación del código**: `frontend/src/pages/Accounting.tsx`

### Presupuestos

Seguimiento de presupuestos mensuales:

- **Presupuestos por categoría**: Gasolina, comida, alquiler, servicios, ocio, otros
- **Estado visual**: Barra de progreso para cada categoría
- **Comparación**: Lo gastado vs lo presupuesto

**Ubicación del código**: `frontend/src/pages/Budgets.tsx`

### Agenda

Gestión de eventos familiares:

- **Eventos**: Título, descripción, ubicación, hora
- **Recurrencia**: Diario, semanal, mensual
- **Eventos de varios días**: Fecha de inicio y fin
- **Tipos**: Trabajo, familia, personal
- **Compartir**: Con familiares

**Ubicación del código**: `frontend/src/pages/Agenda.tsx`

### Tareas Familiares

Gestión de tareas familiares:

- **Crear tareas**: Título, descripción, fecha límite, prioridad
- **Prioridades**: Urgente, alta, normal, baja
- **Asignar a miembro**: Asigna tareas a familiares
- **Estado**: Pendiente/completada
- **Filtrar**: Por estado, prioridad, asignatario

**Ubicación del código**: `frontend/src/pages/FamilyTasks.tsx`

### Lista de la Compra

Gestión de listas de la compra:

- **Múltiples listas**: Crea listas con nombre y color (ej: "Mercadona", "Compras semana")
- **Productos**: Añadir, editar, eliminar, mover entre listas
- **Compartir**: Envía por WhatsApp, Telegram, Email

**Ubicación del código**: `frontend/src/pages/ShoppingList.tsx`

### Notas

Sistema de notas organizadas:

- **Tableros**: Múltiples tableros con nombre y color
- **Notas**: Título, contenido, categoría
- **Categorías**: General, Trabajo, Familia, Personal, Importante
- **Vistas**: Lista o cuadrícula
- **Búsqueda**: Filtra por título o contenido
- **Compartir**: Por WhatsApp, Telegram o copiar

**Ubicación del código**: `frontend/src/pages/Notes.tsx`

### Planificación de Comidas

Planificación semanal de comidas:

- **Recetas**: Crea y organiza recetas
  - Categorías: Principal, Aperitivo, Postre, Bebida, Desayuno
  - Tiempos de preparación y cocción
  - Restricciones: Vegetariano, Vegano, Sin gluten, Sin lactosa
  - Ingredientes e instrucciones
- **Planificación semanal**: Arrastra y suelta recetas en el calendario
- **Vista por días y tipos de comida**: Desayuno, comida, cena

**Ubicación del código**: `frontend/src/pages/MealPlanning.tsx`

### Cumpleaños

Recordatorio de cumpleaños:

- **Miembros de la familia**: Fecha de nacimiento
- **Cumpleaños externos**: Contactos externos
- **Próximos cumpleaños**: Lista ordenada

**Ubicación del código**: `frontend/src/pages/Birthdays.tsx`

### Premium

Sección premium con funciones adicionales:

- **Galería de fotos familiar**: 
  - Álbumes para organizar fotos
  - Subir fotos desde el dispositivo
  - Vista en pantalla completa (lightbox)
- **Contactos familiares**: Gestión de contactos
- **Chat IA**: Asistente conversacional integrado
- **Ventas**: Formulario de contacto comercial
- **Libros y películas**: Seguimiento de lecturas y películas vistas

**Ubicación del código**: `frontend/src/pages/Premium.tsx`

### Perfil

Configuración del usuario y la familia:

- **Datos del perfil**: Nombre, nombre de familia, ciudad, moneda
- **Configuración de notificaciones**: 
  - Activar/desactivar emails
  - Configurar SMTP (Gmail)
  - Hora de envío
  - Qué recibir: eventos, tareas, presupuestos, comidas, cumpleaños
- **Módulos disponibles**: Activa/desactiva módulos (Mascotas, Educación, Cumpleaños, Contabilidad, Presupuestos)
- **Compartir datos**: Permite que otros usuarios vean tus datos
- **Cambiar contraseña**
- **Idioma**: Español, Inglés, Portugués

**Ubicación del código**: `frontend/src/pages/Profile.tsx`

---

## Nuevos Módulos (v1.0.7)

### Inventario del Hogar

Gestión de electrodomésticos, muebles y electrónica:

- **Artículos**: Nombre, categoría (electrodomésticos/muebles/electrónica), fecha de compra
- **Garantía**: Fecha fin de garantía con alertas automáticas (por vencer/vencida)
- **Manual**: URL del manual del fabricante
- **Búsqueda y filtro**: Por nombre y categoría

**Ubicación del código**: `frontend/src/pages/HomeInventory.tsx`

### Mantenimiento del Hogar

Seguimiento de tareas de mantenimiento recurrentes:

- **Tipos**: Caldera, filtros A/C, ITV vehículo, otro
- **Frecuencia**: Días entre cada mantenimiento
- **Coste estimado**: Coste aproximado
- **Estado**: Calcula días hasta próximo mantenimiento
- **Alertas**: Tareas atrasadas y próximas a vencer

**Ubicación del código**: `frontend/src/pages/HomeMaintenance.tsx`

### Gestor de Suscripciones

Control de suscripciones mensuales/anuales:

- **Categorías**: Streaming, música, gimnasio, seguro, otro
- **Importe y ciclo**: Precio y frecuencia de facturación
- **Próxima facturación**: Fecha del próximo pago
- **Resumen**: Gasto mensual y anual total
- **Alertas**: Pagos próximos esta semana

**Ubicación del código**: `frontend/src/pages/SubscriptionManager.tsx`

### Seguimiento de Mascotas

Gestión de mascotas familiares:

- **Mascotas**: Nombre, especie, raza, fecha nacimiento, peso, microchip
- **Vacunas**: Nombre, fecha, próxima dosis, veterinario
- **Medicación**: Nombre, dosis, frecuencia, período de tratamiento

**Ubicación del código**: `frontend/src/pages/PetTracker.tsx`

### Gestor de Viajes

Planificación de viajes y vacaciones:

- **Viaje**: Nombre, destino, fechas, presupuesto
- **Estado de reserva**: Vuelos, hotel, actividades
- **Checklist de equipaje**: Por miembro familiar

**Ubicación del código**: `frontend/src/pages/TravelManager.tsx`

### Hucha Digital

Ahorro por objetivos:

- **Metas**: Nombre, objetivo, ahorrado actual, fecha objetivo
- **Iconos**: Diferentes iconos por tipo de meta
- **Progreso**: Barras de progreso visuales
- **Contribuciones**: Añadir ahorro progresivamente

**Ubicación del código**: `frontend/src/pages/SavingsGoals.tsx`

### Deudas Internas

Control de deudas entre miembros de la familia:

- **Deudas**: De quién, a quién, cantidad, motivo
- **Estado**: Activa/pagada
- **Historial**: Registro de deudas pagadas

**Ubicación del código**: `frontend/src/pages/InternalDebts.tsx`

### Comparador de Facturas

Seguimiento de facturas de servicios:

- **Tipos**: Luz, agua, gas
- **Historial**: Mes a mes con importe y consumo
- **Comparación**: Vs mes anterior y media histórica
- **Alertas**: Anomalías detectadas automáticamente (>30%)

**Ubicación del código**: `frontend/src/pages/UtilityBills.tsx`

### Biblioteca Familiar

Gestión de libros familiares:

- **Libros**: Título, autor, formato (físico/ebook), ISBN
- **Estado**: Disponible, leyendo, leído
- **Propietario**: Quién tiene el libro
- **Valoración**: Estrellas (1-5)

**Ubicación del código**: `frontend/src/pages/FamilyLibrary.tsx`

### Extraescolares

Gestión de actividades extraescolares:

- **Actividad**: Nombre del niño, actividad (música, deporte...)
- **Horario y ubicación**: Día/hora y lugar
- **Profesor**: Nombre y contacto
- **Coste**: Precio mensual y día de pago
- **Material**: Material necesario

**Ubicación del código**: `frontend/src/pages/ExtraSchoolManager.tsx`

---

## Sistema de Tareas Programadas

El backend incluye tareas programadas usando `node-cron`:

### Notificaciones por Email

**Ubicación**: `backend/server.js` líneas 4892-5089

**Función principal**: `runDailyNotification()`

**Configuración**:
- Se ejecuta cada minuto
- Envía email solo cuando la hora local del usuario coincide con `notify_time`
- Por defecto: 22:00 (10 PM)

**Contenido del email**:
1. Saludo: "¡Hola familia [nombre]!"
2. Frase motivacional del día
3. Eventos de la próxima semana
4. Tareas pendientes (todas excepto lista de compra)
5. Estado de presupuestos
6. Comidas planificadas para mañana
7. Cumpleaños del mes

**Configuración del usuario** (tabla `notification_settings`):
- `email_enabled`: Activar/desactivar (0/1)
- `email_to`: Destinatario del email
- `smtp_host`: Servidor SMTP (por defecto smtp.gmail.com)
- `smtp_port`: Puerto SMTP (por defecto 587)
- `smtp_user`: Usuario SMTP (tu email)
- `smtp_password`: Contraseña de aplicación Gmail
- `notify_time`: Hora de envío (formato HH:MM, ej: "22:00")
- `notify_timezone`: Zona horaria (por defecto Europe/Madrid)
- `notify_events`: Incluir eventos (0/1)
- `notify_tasks`: Incluir tareas (0/1)
- `notify_budgets`: Incluir presupuestos (0/1)
- `notify_meals`: Incluir comidas (0/1)
- `notify_birthdays`: Incluir cumpleaños (0/1)

**API endpoints**:
- GET `/api/notifications/settings` - Obtener configuración
- POST `/api/notifications/settings` - Guardar configuración
- POST `/api/notifications/test` - Enviar email de prueba

### Backup Automático

**Ubicación**: `backend/server.js` líneas 5437-5480

**Función**: `scheduleBackup()`

**Configuración**:
- Se ejecuta a las 3:00 AM todos los días (`0 3 * * *`)
- Guarda en: `backend/backups/`
- Nombre: `family_agent_backup_YYYY-MM-DDTHH-MM-SS-msZ.db`
- Mantiene los últimos 7 backups (más antiguos se eliminan automáticamente)

**Ruta completa de backups**:
```
/ruta/a/family-agent/backend/backups/
```

---

## Seguridad

- **Contraseñas seguras**: Validación obligatoria (8+ caracteres, mayúsculas, minúsculas, números)
- **Auto-cierre de sesión**: La sesión expira tras 5 minutos de inactividad
- **Contraseñas hasheadas**: SHA-256 + salt
- **Datos de usuario aislados**: Cada usuario solo ve sus datos + los compartidos
- **`.env` excluido de Git**: Contiene claves sensibles
- **Validación de permisos**: Verificación de acceso a datos compartidos

---

## Compartir Datos entre Usuarios

Los usuarios pueden compartir sus datos con familiares:

1. Ve a **Perfil** → **Compartir datos**
2. Selecciona qué quieres compartir:
   - Contabilidad
   - Presupuestos
   - Agenda
   - Tareas
   - Notas
   - Miembros de la familia
   - Listas de la compra
   - Recetas
   - Restaurantes
   - Galería
3. Selecciona el usuario con quien compartir
4. El usuario receptor verá los datos compartidos en su instalación

---

## Solución de Problemas

### No llegan las notificaciones por email

1. Verifica que tienes `SMTP_PASSWORD` en `.env`
2. Comprueba que el email está habilitado en Perfil → Notificaciones
3. Revisa la contraseña de aplicación de Gmail (no es tu contraseña normal)
4. Verifica la hora de notificación configurada

### No se ven los eventos compartidos

1. Asegúrate de que los eventos están compartidos desde Perfil → Compartir datos
2. Verifica que tienes permisos de visualización

### El chat IA no responde

1. Verifica que tienes `GROQ_API_KEY` en `.env`
2. Comprueba que la API key es válida en console.groq.com

### Error de conexión con el backend

1. Asegúrate de que el backend está ejecutándose (`npm start` en backend/)
2. Verifica que el frontend está configurado para conectarse a localhost:3000

### Los cambios no se reflejan

1. Si usas Docker: `docker compose down && docker compose up -d --build`
2. Si usas desarrollo: Reinicia el servidor (`Ctrl+C` y `npm start`)

---

## Changelog

### v1.0.8 (Abril 2026)
- Dashboard siempre visible (no se puede desactivar)
- 8 módulos activos por defecto: Dashboard, Agenda, Contabilidad, Cumpleaños, Hábitos, Lista Compra, Notas, Tareas
- Arrastrar y soltar para reordenar módulos
- Diseño de módulos en 3 columnas en escritorio
- Botón de cerrar sesión más accesible en móvil
- Backup incluye todos los nuevos módulos
- Nueva página de Módulos en el menú lateral

### v1.0.7 (Abril 2026)
- Módulo Hogar: Inventario del hogar con garantías y manuales
- Módulo Hogar: Mantenimiento del hogar (caldera, filtros A/C, ITV)
- Módulo Hogar: Gestor de suscripciones (Netflix, Spotify, gimnasio...)
- Módulo Organización: Seguimiento de mascotas (vacunas, veterinario)
- Módulo Organización: Gestor de viajes y vacaciones
- Módulo Finanzas: Hucha digital / ahorro por objetivos
- Módulo Finanzas: Control de deudas internas familiares
- Módulo Finanzas: Comparador de facturas (luz, agua, gas)
- Módulo Educación: Biblioteca familiar (libros físicos y ebooks)
- Módulo Educación: Gestor de extraescolares
- Sistema de módulos habilitables desde el perfil
- Módulos disponibles: Mascotas, Educación, Cumpleaños, Contabilidad, Presupuestos

### v2.0.0 (Marzo 2026)
- Galería de Fotos Familiar
- Contactos Familiares
- Chat IA integrado
- Gestión de Recetas
- Planificación Semanal de Comidas
- Mejoras en compartir datos
- Importación de conceptos desde CSV

### v1.0.6 (Marzo 2026)
- Fix: Error al actualizar perfil
- Lista de usuarios para compartir
- Compartición de restaurantes y notas
- Backup completo en JSON y .db
- UI móvil mejorada

### Versiones anteriores
Ver historial completo en el archivo original de GitHub.

---

## Licencia

MIT

---

## Contribuir

1. Fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request
