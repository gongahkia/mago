#!/bin/bash

set -e

echo "🪧 Mago V3 Quick Start"
echo "===================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Start infrastructure
echo "🚀 Starting infrastructure (PostgreSQL, Redis, Ollama)..."
docker-compose up -d postgres redis ollama

echo "⏳ Waiting for services to be ready (30 seconds)..."
sleep 30

# Pull LLM model
echo "📥 Pulling LLM model (this may take a few minutes)..."
docker exec mago-ollama ollama pull llama3.2:3b-instruct-q4_K_M || echo "⚠️  Model pull failed, continuing anyway..."

echo ""
echo "✅ Infrastructure ready!"
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo "✅ Backend setup complete!"
echo ""

# Frontend setup
echo "🎨 Setting up frontend..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo "✅ Frontend setup complete!"
echo ""

# Create .env files if they don't exist
cd ..

if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env file..."
    cat > backend/.env << EOF
DATABASE_URL=postgresql://mago:mago123@localhost:5432/mago_v3
REDIS_URL=redis://localhost:6379/0
OLLAMA_HOST=http://localhost:11434
JWT_SECRET=dev-secret-change-in-production-$(openssl rand -hex 32)
CORS_ORIGINS=http://localhost:3000
ENABLE_LLM_CACHE=true
LLM_CACHE_TTL=3600
LOG_LEVEL=INFO
EOF
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend .env.local file..."
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENABLE_CLIENT_LLM=true
EOF
fi

echo ""
echo "✅ All setup complete!"
echo ""
echo "🎮 To start playing:"
echo ""
echo "  Terminal 1 (Backend):"
echo "  $ cd backend"
echo "  $ source venv/bin/activate"
echo "  $ uvicorn main:app --reload --port 8000"
echo ""
echo "  Terminal 2 (Frontend):"
echo "  $ cd frontend"
echo "  $ npm run dev"
echo ""
echo "  Then open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  - README.md       - Main documentation"
echo "  - COMPARISON.md   - Version comparison"
echo "  - FEATURES.md     - Feature suggestions"
echo "  - SUMMARY.md      - Project summary"
echo ""
echo "🔗 Quick Links:"
echo "  - Frontend:        http://localhost:3000"
echo "  - API Docs:        http://localhost:8000/docs"
echo "  - Health Check:    http://localhost:8000/health"
echo ""
echo "🚀 Happy gaming! ⚔️🤖"
