#!/bin/bash
# Redis Setup Script - One command to get started

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🚀 Redis Implementation - Setup Script             ║"
echo "║                                                            ║"
echo "║  This script will:                                        ║"
echo "║  1. Install Node.js dependencies                         ║"
echo "║  2. Create necessary directories                         ║"
echo "║  3. Verify all files are in place                        ║"
echo "║  4. Show next steps                                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# Step 1: Check if Docker is running
echo -e "${BLUE}Step 1: Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found. Please install Docker Desktop:${NC}"
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo ""

# Step 2: Navigate to backend and install dependencies
echo -e "${BLUE}Step 2: Installing Node.js dependencies...${NC}"
if [ -d "backend" ]; then
    cd backend
    
    if [ -f "package.json" ]; then
        if [ ! -d "node_modules" ]; then
            echo "Installing npm packages..."
            npm install
            echo -e "${GREEN}✅ Dependencies installed${NC}"
        else
            echo -e "${GREEN}✅ node_modules already exists${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  package.json not found${NC}"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️  backend/ directory not found${NC}"
fi

echo ""

# Step 3: Create .env if it doesn't exist
echo -e "${BLUE}Step 3: Configuring environment...${NC}"
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "REDIS_HOST=redis_clinic" > .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo ""

# Step 4: Verify Docker Compose
echo -e "${BLUE}Step 4: Verifying Docker Compose configuration...${NC}"
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.yml found${NC}"
else
    echo -e "${YELLOW}⚠️  docker-compose.yml not found${NC}"
fi

echo ""

# Step 5: Show summary
echo -e "${BLUE}Step 5: Implementation Summary${NC}"
echo ""
echo "📊 Redis Implementation Details:"
echo "   • Redis Service: redis_clinic"
echo "   • Redis Port: 6379"
echo "   • API Port: 3000"
echo "   • Frontend Port: 5174"
echo "   • Persistence: AOF enabled"
echo ""

FILES_CREATED=(
    "backend/redis.config.js"
    "backend/cache.manager.js"
    "backend/redis-examples.js"
    "backend/test-redis.js"
    "backend/README_REDIS.md"
    "REDIS_QUICK_START.md"
    "REDIS_IMPLEMENTATION.md"
)

echo "📁 Files Created/Modified:"
for file in "${FILES_CREATED[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

echo ""
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🚀 NEXT STEPS:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  Start the Docker stack:"
echo "   docker-compose up"
echo ""
echo "2️⃣  Wait for containers to be ready (2-3 minutes)"
echo "   Look for: 'api_clinic | ✅ Connected to Redis'"
echo ""
echo "3️⃣  In another terminal, test the API:"
echo '   curl http://localhost:3000/api/clinic/clients \\'
echo '     -H "user-id: 1"'
echo ""
echo "4️⃣  Verify Redis cache is working:"
echo "   docker exec -it redis_clinic redis-cli KEYS '*'"
echo ""
echo "5️⃣  (Optional) Run the test suite:"
echo "   cd backend && node test-redis.js"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "📚 DOCUMENTATION:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "Quick Start Guide:    REDIS_QUICK_START.md"
echo "Complete Reference:   backend/README_REDIS.md"
echo "Useful Commands:      backend/REDIS_COMMANDS.sh"
echo "Code Examples:        backend/redis-examples.js"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "🆘 TROUBLESHOOTING:"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "If Redis doesn't connect:"
echo "   1. Verify Docker is running: docker ps"
echo "   2. Check Redis logs: docker logs redis_clinic"
echo "   3. Restart: docker restart redis_clinic"
echo ""
echo "If node_modules issues:"
echo "   cd backend"
echo "   rm -rf node_modules package-lock.json"
echo "   npm install"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Ready to go! Run 'docker-compose up' to start${NC}"
echo ""
