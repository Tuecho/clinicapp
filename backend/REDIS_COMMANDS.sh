#!/bin/bash

# Redis Commands Cheat Sheet
# Comandos útiles para trabajar con Redis en la aplicación Clinica

echo "🚀 Redis Commands for Clinica Application"
echo "========================================="
echo ""

# ============================================
# BASIC COMMANDS
# ============================================

echo "1. CONEXIÓN"
echo "-----------"
echo "# Conectar a Redis CLI"
echo "docker exec -it redis_clinic redis-cli"
echo ""

echo "# Verificar conexión"
echo "redis-cli> PING"
echo ""

# ============================================
# INFORMACIÓN
# ============================================

echo "2. INFORMACIÓN DEL SERVIDOR"
echo "---------------------------"
echo "# Ver información del servidor"
echo "redis-cli> INFO"
echo ""

echo "# Ver espacio de claves"
echo "redis-cli> INFO keyspace"
echo ""

echo "# Ver estadísticas de memoria"
echo "redis-cli> INFO memory"
echo ""

echo "# Tamaño de la base de datos"
echo "redis-cli> DBSIZE"
echo ""

# ============================================
# KEY MANAGEMENT
# ============================================

echo "3. GESTIÓN DE CLAVES"
echo "--------------------"
echo "# Ver todas las claves"
echo "redis-cli> KEYS *"
echo ""

echo "# Ver claves de un usuario específico"
echo "redis-cli> KEYS clinic:clients:1*"
echo ""

echo "# Ver todas las claves de caché de clientes"
echo "redis-cli> KEYS clinic:clients:*"
echo ""

echo "# Ver todas las claves de caché de citas"
echo "redis-cli> KEYS clinic:appointments:*"
echo ""

echo "# Ver todas las claves de caché de servicios"
echo "redis-cli> KEYS clinic:services:*"
echo ""

echo "# Buscar por patrón complejo"
echo "redis-cli> KEYS clinic:*"
echo ""

# ============================================
# CACHE OPERATIONS
# ============================================

echo "4. OPERACIONES DE CACHÉ"
echo "-----------------------"
echo "# Obtener valor del caché"
echo "redis-cli> GET clinic:clients:1"
echo ""

echo "# Ver TTL de una clave"
echo "redis-cli> TTL clinic:clients:1"
echo ""

echo "# Eliminar una clave"
echo "redis-cli> DEL clinic:clients:1"
echo ""

echo "# Eliminar múltiples claves"
echo "redis-cli> DEL clinic:clients:1 clinic:clients:2 clinic:clients:3"
echo ""

echo "# Eliminar todas las claves de un usuario"
echo "redis-cli> KEYS clinic:clients:1* | xargs redis-cli DEL"
echo ""

echo "# Limpiar todo el caché"
echo "redis-cli> FLUSHDB"
echo ""

# ============================================
# MONITORING
# ============================================

echo "5. MONITOREO"
echo "------------"
echo "# Ver comandos en tiempo real"
echo "redis-cli> MONITOR"
echo ""

echo "# Ver comandos lentos"
echo "redis-cli> SLOWLOG GET 10"
echo ""

echo "# Ver clientes conectados"
echo "redis-cli> CLIENT LIST"
echo ""

echo "# Ver estadísticas de clientes"
echo "redis-cli> CLIENT INFO"
echo ""

# ============================================
# QUEUE OPERATIONS
# ============================================

echo "6. OPERACIONES DE COLA"
echo "----------------------"
echo "# Ver elementos en la cola de emails"
echo "redis-cli> LRANGE queue:emails 0 10"
echo ""

echo "# Longitud de la cola"
echo "redis-cli> LLEN queue:emails"
echo ""

echo "# Limpiar la cola"
echo "redis-cli> DEL queue:emails"
echo ""

# ============================================
# COUNTERS
# ============================================

echo "7. CONTADORES"
echo "--------------"
echo "# Ver valor del contador"
echo "redis-cli> GET counter:appointments"
echo ""

echo "# Incrementar contador"
echo "redis-cli> INCRBY counter:appointments 1"
echo ""

echo "# Resetear contador"
echo "redis-cli> SET counter:appointments 0"
echo ""

# ============================================
# DOCKER COMMANDS
# ============================================

echo "8. COMANDOS DOCKER"
echo "------------------"
echo "# Ver logs de Redis"
echo "docker logs -f redis_clinic"
echo ""

echo "# Entrar en contenedor Redis"
echo "docker exec -it redis_clinic sh"
echo ""

echo "# Restart Redis"
echo "docker restart redis_clinic"
echo ""

echo "# Ver estadísticas del contenedor"
echo "docker stats redis_clinic"
echo ""

# ============================================
# PERFORMANCE
# ============================================

echo "9. PERFORMANCE"
echo "---------------"
echo "# Ver estadísticas de performance"
echo "redis-cli> INFO stats"
echo ""

echo "# Encontrar claves grandes"
echo "redis-cli> --bigkeys"
echo ""

echo "# Benchmark básico"
echo "redis-cli --latency"
echo ""

# ============================================
# BACKUP & RESTORE
# ============================================

echo "10. BACKUP Y RESTAURACIÓN"
echo "------------------------"
echo "# Hacer backup"
echo "docker exec redis_clinic redis-cli BGSAVE"
echo ""

echo "# Ver archivo de dump"
echo "ls -la docker-compose-volumes/redis-data/"
echo ""

echo "# Restaurar desde backup"
echo "docker restart redis_clinic"
echo ""

# ============================================
# USEFUL ALIASES
# ============================================

echo "11. ALIASES ÚTILES"
echo "------------------"
echo "# Añadir a tu ~/.bashrc o ~/.zshrc:"
echo ""
echo "alias redis-cli='docker exec -it redis_clinic redis-cli'"
echo "alias redis-monitor='docker exec -it redis_clinic redis-cli MONITOR'"
echo "alias redis-flush='docker exec -it redis_clinic redis-cli FLUSHDB'"
echo "alias redis-size='docker exec -it redis_clinic redis-cli DBSIZE'"
echo "alias redis-info='docker exec -it redis_clinic redis-cli INFO'"
echo ""

# ============================================
# EXAMPLE MONITORING SCRIPT
# ============================================

echo "12. SCRIPT DE MONITOREO"
echo "----------------------"
cat > /tmp/redis-monitor.sh << 'EOF'
#!/bin/bash
# Script para monitorear Redis cada 5 segundos

watch -n 5 'docker exec redis_clinic redis-cli INFO keyspace && echo "---" && docker exec redis_clinic redis-cli DBSIZE'
EOF
echo "chmod +x /tmp/redis-monitor.sh && /tmp/redis-monitor.sh"
echo ""

# ============================================
# CACHE INVALIDATION EXAMPLE
# ============================================

echo "13. EJEMPLO: INVALIDACIÓN DE CACHÉ POR USUARIO"
echo "----------------------------------------------"
echo ""
echo "# En redis-cli, ejecutar:"
echo "redis-cli> KEYS clinic:*:1*"
echo "redis-cli> DEL (resultado del comando anterior)"
echo ""
echo "# Vía API (POST a /api/clinic/clients):"
echo "curl -X POST http://localhost:3000/api/clinic/clients \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'user-id: 1' \\"
echo "  -d '{\"name\":\"New Client\"}'"
echo ""

# ============================================
# RATE LIMIT HEADERS
# ============================================

echo "14. HEADERS DE RATE LIMIT"
echo "------------------------"
echo "# Cada respuesta incluye:"
echo "RateLimit-Limit: 100"
echo "RateLimit-Remaining: 99"
echo "RateLimit-Reset: 1681234567"
echo ""

# ============================================
# TESTING REDIS
# ============================================

echo "15. TESTING REDIS"
echo "-----------------"
echo "# Ejecutar suite de tests"
echo "cd backend && node test-redis.js"
echo ""

echo "# Test de performance"
echo "redis-cli --memkeys"
echo ""

# ============================================
# TROUBLESHOOTING
# ============================================

echo "16. SOLUCIÓN DE PROBLEMAS"
echo "------------------------"
echo ""
echo "# Si Redis no conecta:"
echo "1. Verificar que Docker está corriendo:"
echo "   docker ps | grep redis"
echo ""
echo "2. Revisar logs:"
echo "   docker logs redis_clinic"
echo ""
echo "3. Probar conexión manual:"
echo "   redis-cli -h redis_clinic -p 6379 ping"
echo ""
echo "4. Reiniciar:"
echo "   docker restart redis_clinic"
echo ""

echo "# Si caché no se invalida:"
echo "1. Verificar que las operaciones son async (await)"
echo "2. Revisar que se llama await cache.del() en POST/PUT/DELETE"
echo "3. Ver logs en terminal: docker logs api_clinic"
echo ""

echo "# Si memoria crece mucho:"
echo "1. Ver claves grandes:"
echo "   redis-cli --bigkeys"
echo ""
echo "2. Bajar TTL de caché en server.js"
echo "3. Limpiar caché:"
echo "   redis-cli FLUSHDB"
echo ""

echo ""
echo "========================================="
echo "✅ Todos los comandos están listos"
echo "========================================="
