# Family Agent - Exposición Externa

## ⚠️ Nota: Nginx ha sido removido del docker-compose.yml

El servicio `nginx-proxy-manager` ha sido removido del archivo `docker-compose.yml` actual. Este documento se mantiene como referencia, pero para usar nginx necesitarías mantenerlo en tu docker-compose o agregarlo manualmente.

Los servicios actuales son:
- `api_clinic` (Backend API en puerto 3000)
- `frontend_clinic` (Frontend en puerto 5173)

---

## Configuración para acceso externo con Nginx Proxy Manager y DuckDNS

### 1. Crear cuenta en DuckDNS

1. Ve a https://www.duckdns.org
2. Inicia sesión con Google, GitHub o crea cuenta
3. Crea un subdomain (ej: `mifamilia.duckdns.org`)
4. Copia tu **token** de la página

### 2. Configurar DuckDNS

Edita `docker-compose.yml` y cambia:
```yaml
- SUBDOMAINS=mifamilia      # Tu subdomain sin .duckdns.org
- TOKEN=tu-token-aqui       # Tu token de DuckDNS
```

### 3. Configurar Router

**Muy importante - Abre estos puertos en tu router:**

| Puerto | Servicio | Dirección IP interna |
|--------|----------|---------------------|
| 80 (TCP) | HTTP (Let's Encrypt) | IP de tu NAS/Servidor |
| 443 (TCP) | HTTPS (NPM) | IP de tu NAS/Servidor |

**Configura NAT loopback/hairpin NAT** si tu router lo soporta (permite acceder desde fuera usando el dominio).

### 4. Iniciar los servicios

```bash
docker compose up -d
```

### 5. Configurar Nginx Proxy Manager

1. Accede a NPM: `http://tu-ip-local:81`
2. **Login inicial:**
   - Email: `admin@example.com`
   - Password: `changeme`

3. **Crear Proxy Host para Frontend:**
   - Domain Names: `mifamilia.duckdns.org`
   - Scheme: `http`
   - Forward Hostname: `frontend_clinic`
   - Forward Port: `5173`
   - Enable SSL, Force SSL
   - Request a certificado Let's Encrypt automático

4. **Crear Proxy Host para API:**
   - Domain Names: `api.mifamilia.duckdns.org`
   - Scheme: `http`
   - Forward Hostname: `api_clinic`
   - Forward Port: `3000`
   - Enable SSL

### 6. Actualizar VITE_API_URL

Después de configurar NPM con SSL, actualiza el frontend:
```yaml
environment:
  - VITE_API_URL=https://api.mifamilia.duckdns.org
```

### 7. Estructura de carpetas

```
family_agent/
├── frontend/
├── backend/
├── npm/
│   ├── data/          # Datos de NPM
│   └── letsencrypt/   # Certificados SSL
├── duckdns/           # Config de DuckDNS
├── docker-compose.yml
└── README_EXTERNAL.md
```

### URLs de acceso

| Servicio | URL | Descripción |
|----------|-----|------------|
| Nginx Proxy Manager | `http://tu-ip:81` | Administración |
| Family Agent | `https://mifamilia.duckdns.org` | App principal |
| API | `https://api.mifamilia.duckdns.org` | API REST |

### Notas importantes

1. **DuckDNS tarda ~5 minutos** en propagate el DNS
2. **Los certificados SSL** se renuevan automáticamente
3. **Tu IP pública cambia** cada cierto tiempo - DuckDNS lo actualiza automáticamente
4. **NGINX Proxy Manager** proporciona:
   - SSL gratuito con Let's Encrypt
   - Protección con contraseña opcional
   - Registro de accesos
   - Redirecciones

### Comandos útiles

```bash
# Ver logs de DuckDNS
docker compose logs duckdns

# Ver logs de NPM
docker compose logs nginx-proxy-manager

# Reiniciar servicios
docker compose restart

# Parar servicios
docker compose down
```
