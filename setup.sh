#!/bin/bash

# KuruBot Setup Script
# This script helps you set up KuruBot quickly with Docker

set -e

echo "🌙 KuruBot Setup Script"
echo "======================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first:${NC}"
    echo "   - Windows/Mac: https://docs.docker.com/desktop/"
    echo "   - Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not available. Please install Docker Compose.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    if [ -f env.example ]; then
        echo -e "${BLUE}📝 Creating .env file from env.example...${NC}"
        cp env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
    else
        echo -e "${RED}❌ No env.example file found!${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  .env file already exists, skipping creation${NC}"
fi

# Function to check if API key is set
check_api_key() {
    local key_name=$1
    local key_value=$(grep "^$key_name=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    
    if [ -z "$key_value" ] || [[ $key_value == *"your-"* ]] || [[ $key_value == *"sk-..."* ]] || [[ $key_value == *"sk-ant-"* ]]; then
        return 1
    fi
    return 0
}

echo ""
echo -e "${BLUE}🔑 Checking API Keys...${NC}"

# Check required API keys
missing_keys=()

if ! check_api_key "AUTH_DISCORD_ID"; then
    missing_keys+=("AUTH_DISCORD_ID")
fi

if ! check_api_key "AUTH_DISCORD_SECRET"; then
    missing_keys+=("AUTH_DISCORD_SECRET")
fi

if ! check_api_key "OPENAI_API_KEY"; then
    missing_keys+=("OPENAI_API_KEY")
fi

if ! check_api_key "ANTHROPIC_API_KEY"; then
    missing_keys+=("ANTHROPIC_API_KEY")
fi

if [ ${#missing_keys[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required API keys:${NC}"
    for key in "${missing_keys[@]}"; do
        echo "   - $key"
    done
    echo ""
    echo -e "${YELLOW}Please edit the .env file and add your API keys:${NC}"
    echo "   1. Discord OAuth: https://discord.com/developers/applications"
    echo "   2. OpenAI API: https://platform.openai.com/api-keys"
    echo "   3. Anthropic API: https://console.anthropic.com/"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo -e "${GREEN}✅ All required API keys are configured${NC}"

echo ""
echo -e "${BLUE}🐳 Starting Docker services...${NC}"

# Determine which docker-compose command to use
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="docker compose"
fi

# Start the services
$COMPOSE_CMD up -d

echo ""
echo -e "${GREEN}🎉 KuruBot is starting up!${NC}"
echo ""
echo "📊 Service Status:"
echo "   - Application: http://localhost:3000"
echo "   - MinIO Console: http://localhost:9001 (admin/minioadmin123)"
echo "   - Qdrant Dashboard: http://localhost:6333/dashboard"
echo ""
echo "🔍 Useful Commands:"
echo "   - View logs: $COMPOSE_CMD logs -f kurubot"
echo "   - Stop services: $COMPOSE_CMD down"
echo "   - Restart: $COMPOSE_CMD restart"
echo ""
echo "⏳ Please wait 30-60 seconds for all services to fully start up..."
echo ""

# Wait a bit and check if services are running
sleep 5

echo -e "${BLUE}🔧 Checking service health...${NC}"
if $COMPOSE_CMD ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Services are starting successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may still be starting up${NC}"
    echo "   Run '$COMPOSE_CMD logs' to check for any issues"
fi

echo ""
echo -e "${GREEN}🚀 Setup complete! Open http://localhost:3000 to use KuruBot${NC}"
