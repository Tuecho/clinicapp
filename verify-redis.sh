#!/bin/bash
# Verification script for Redis implementation

echo "🔍 Redis Implementation Verification"
echo "===================================="
echo ""

# Store test results
PASSED=0
FAILED=0

# Helper functions
check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1 exists"
        ((PASSED++))
    else
        echo "❌ $1 missing"
        ((FAILED++))
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo "✅ $1 contains '$2'"
        ((PASSED++))
    else
        echo "❌ $1 missing '$2'"
        ((FAILED++))
    fi
}

# ============================================
# FILE EXISTENCE CHECKS
# ============================================

echo "📁 Checking files..."
echo ""

check_file "docker-compose.yml"
check_file "backend/package.json"
check_file "backend/server.js"
check_file "backend/redis.config.js"
check_file "backend/cache.manager.js"
check_file "backend/redis-examples.js"
check_file "backend/test-redis.js"
check_file "backend/README_REDIS.md"
check_file "backend/REDIS_COMMANDS.sh"
check_file "REDIS_IMPLEMENTATION.md"
check_file "REDIS_QUICK_START.md"
check_file ".env.example"

echo ""

# ============================================
# CONFIGURATION CHECKS
# ============================================

echo "⚙️  Checking configurations..."
echo ""

check_content "docker-compose.yml" "redis_clinic"
check_content "docker-compose.yml" "redis-data"
check_content "docker-compose.yml" "depends_on"
check_content "backend/package.json" "redis"
check_content "backend/package.json" "express-rate-limit"
check_content ".env.example" "REDIS_HOST"
check_content ".env.example" "REDIS_PORT"

echo ""

# ============================================
# SERVER.JS CHECKS
# ============================================

echo "🔧 Checking server.js modifications..."
echo ""

check_content "backend/server.js" "import { createClient } from 'redis'"
check_content "backend/server.js" "import rateLimit from 'express-rate-limit'"
check_content "backend/server.js" "redisClient.connect()"
check_content "backend/server.js" "app.use('/api/', limiter)"
check_content "backend/server.js" "cache.get(cacheKey)"
check_content "backend/server.js" "cache.set(cacheKey"
check_content "backend/server.js" "cache.del("
check_content "backend/server.js" "async (req, res)"

echo ""

# ============================================
# ENDPOINTS CHECK
# ============================================

echo "🛣️  Checking async endpoints..."
echo ""

check_content "backend/server.js" "app.get('/api/clinic/clients', async"
check_content "backend/server.js" "app.post('/api/clinic/clients', async"
check_content "backend/server.js" "app.put('/api/clinic/clients/:id', async"
check_content "backend/server.js" "app.delete('/api/clinic/clients/:id', async"
check_content "backend/server.js" "app.get('/api/clinic/appointments', async"
check_content "backend/server.js" "app.post('/api/clinic/appointments', async"
check_content "backend/server.js" "app.get('/api/clinic/dashboard', async"

echo ""

# ============================================
# DOCUMENTATION CHECKS
# ============================================

echo "📚 Checking documentation..."
echo ""

check_content "backend/README_REDIS.md" "Redis Implementation"
check_content "REDIS_IMPLEMENTATION.md" "Redis has been"
check_content "REDIS_QUICK_START.md" "Quick Start"
check_content "backend/redis-examples.js" "export {"

echo ""

# ============================================
# LINE COUNT CHECKS
# ============================================

echo "📊 Code statistics..."
echo ""

if [ -f "backend/cache.manager.js" ]; then
    lines=$(wc -l < "backend/cache.manager.js")
    echo "  cache.manager.js: $lines lines"
fi

if [ -f "backend/redis.config.js" ]; then
    lines=$(wc -l < "backend/redis.config.js")
    echo "  redis.config.js: $lines lines"
fi

if [ -f "backend/redis-examples.js" ]; then
    lines=$(wc -l < "backend/redis-examples.js")
    echo "  redis-examples.js: $lines lines"
fi

if [ -f "backend/test-redis.js" ]; then
    lines=$(wc -l < "backend/test-redis.js")
    echo "  test-redis.js: $lines lines"
fi

echo ""

# ============================================
# FINAL SUMMARY
# ============================================

echo "=================================="
echo "✅ VERIFICATION SUMMARY"
echo "=================================="
echo ""
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All checks passed!"
    echo ""
    echo "Next steps:"
    echo "1. cd backend && npm install"
    echo "2. cd .. && docker-compose up"
    echo "3. curl http://localhost:3000/api/clinic/clients -H 'user-id: 1'"
    echo "4. docker exec -it redis_clinic redis-cli KEYS '*'"
    exit 0
else
    echo "⚠️  Some checks failed!"
    echo "Please review the missing items above."
    exit 1
fi
