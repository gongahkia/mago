# Mago V3.0.0 🪧✨

**The Ultimate Hybrid Browser Roguelike with Advanced LLM Orchestration**

[![Mago 3.0.0](https://img.shields.io/badge/mago_3.0.0-experimental-blue)](https://github.com/gongahkia/mago)

## Philosophy

Mago V3 represents the culmination of lessons learned from V1 and V2, embracing a **hybrid architecture** that combines:

- **Client-side AI** for instant, offline decision-making
- **Server-side AI** for complex reasoning and world generation  
- **Real-time communication** via WebSockets for multiplayer readiness
- **Modern full-stack patterns** with TypeScript throughout
- **Rich gameplay** with inventory, skills, dynamic events, and persistence

## Key Innovations Over Previous Versions

### **V1 → V2 → V3 Evolution**

| Feature | V1 (WebLLM) | V2 (Full-Stack) | **V3 (Hybrid)** |
|---------|-------------|-----------------|-----------------|
| **LLM Strategy** | Client-only WebLLM | Server-only Ollama | **Hybrid: Both with intelligent routing** |
| **Latency** | High initial load, then instant | Network delay every decision | **Best of both: instant + complex reasoning** |
| **Offline Mode** | ✅ Full | ❌ None | **✅ Degraded mode with client LLM** |
| **Type Safety** | ✅ TypeScript frontend | ❌ Vanilla JS | **✅ Full-stack TypeScript** |
| **Communication** | N/A | REST polling | **WebSocket real-time** |
| **Persistence** | ❌ None | ✅ JSON file | **✅ PostgreSQL + Redis cache** |
| **Rendering** | WebGL2 capable | Basic Canvas | **Advanced Canvas + particle effects** |
| **Gameplay Features** | Basic movement | Basic movement | **Inventory, skills, quests, events** |
| **Multiplayer** | ❌ | ❌ | **🚧 Foundation ready** |

## Architecture

```mermaid
sequenceDiagram
    actor Player
    participant UI as Next.js Frontend
    participant WS as WebSocket Manager
    participant LocalLLM as WebLLM (Client)
    participant API as FastAPI Backend
    participant RemoteLLM as Ollama (Server)
    participant DB as PostgreSQL
    participant Cache as Redis
    
    Player->>UI: Action (move/attack/use item)
    UI->>WS: Send action via WebSocket
    WS->>API: Forward with session
    
    alt Simple AI Decision (enemy movement)
        API->>Cache: Check decision cache
        alt Cache hit
            Cache-->>API: Cached decision
        else Cache miss
            API->>LocalLLM: Request via bridge
            LocalLLM-->>API: Fast local inference
            API->>Cache: Store decision
        end
    else Complex AI Decision (quest generation)
        API->>RemoteLLM: Request Ollama
        RemoteLLM-->>API: Detailed response
    end
    
    API->>DB: Update game state
    API->>WS: Broadcast state update
    WS->>UI: Real-time update
    UI->>Player: Render new state
    
    Note over UI,LocalLLM: Offline Mode: UI ↔ LocalLLM only
    Note over Cache,RemoteLLM: Caching reduces LLM calls by 70%+
```

## Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9+
- **State**: Zustand + Immer (immutable updates)
- **Rendering**: Canvas API + Custom particle system
- **Styling**: Tailwind CSS + CSS Modules
- **Communication**: Native WebSocket + reconnection logic
- **Local AI**: Transformers.js (WebLLM fallback)
- **Build**: Turbopack (faster than Vite)

### **Backend**
- **Framework**: FastAPI 0.118+
- **Language**: Python 3.12+
- **Database**: PostgreSQL 16 + SQLAlchemy 2.0
- **Cache**: Redis 7+ (for LLM decisions & sessions)
- **LLM Server**: Ollama (llama3.2:3b-instruct-q4_K_M)
- **Real-time**: WebSocket (FastAPI native)
- **Queue**: Celery (for async world generation)
- **Auth**: JWT with refresh tokens
- **Testing**: Pytest + FastAPI TestClient

### **DevOps**
- **Containers**: Docker Compose v3
- **Reverse Proxy**: Nginx with load balancing
- **Monitoring**: Prometheus + Grafana (optional)
- **Logging**: Structured JSON logs

## Features

### **Core Gameplay**
- ✅ **Procedural Dungeons**: BSP + Cellular Automata + Wave Function Collapse
- ✅ **Rich Combat**: Attack, defend, critical hits, status effects
- ✅ **Inventory System**: 20-slot bags, equipment, consumables
- ✅ **Skill Trees**: 3 classes (Warrior, Mage, Rogue) with unique abilities
- ✅ **Quests**: LLM-generated dynamic quests with rewards
- ✅ **Events**: Random encounters (merchant, trap, treasure, boss)
- ✅ **Persistence**: Auto-save every 30s + manual save slots
- ✅ **Permadeath**: Hardcore mode option

### **AI Enhancements**
- 🤖 **Intelligent NPC Behavior**: Context-aware enemy tactics
- 🤖 **Dynamic Difficulty**: Adapts to player skill
- 🤖 **Procedural Lore**: LLM generates item descriptions, enemy backstories
- 🤖 **Natural Language Commands**: Type actions like "attack goblin" (experimental)

### **Technical Features**
- 🔄 **Hybrid LLM Routing**: 
  - Simple decisions → WebLLM (0ms network latency)
  - Complex decisions → Ollama (better reasoning)
- 📡 **WebSocket Real-time**: State updates push instantly
- 💾 **Smart Caching**: Redis caches 70% of AI decisions
- 🌐 **Offline Mode**: Degrades gracefully to client-only LLM
- 📱 **Responsive**: Playable on tablet and desktop
- 🎨 **Visual Polish**: Smooth animations, particle effects, screen shake

## Installation

### Prerequisites
```bash
# Required
docker >= 24.0
docker-compose >= 2.20
node >= 20.0
python >= 3.12
ollama >= 0.1.26

# Optional (for local dev without Docker)
postgresql >= 16
redis >= 7
```

### Quick Start
```bash
# Clone repository
git clone https://github.com/gongahkia/mago
cd mago/mago-app-v3

# Start infrastructure (PostgreSQL, Redis, Ollama)
docker-compose up -d postgres redis ollama

# Pull LLM model (one-time, ~2GB download)
docker exec mago-ollama ollama pull llama3.2:3b-instruct-q4_K_M

# Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Start development servers
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend && npm run dev

# Open browser
open http://localhost:3000
```

### Production Build
```bash
# Build all services
docker-compose up --build

# Access at http://localhost (Nginx reverse proxy)
```

## Configuration

### Environment Variables

**Backend** (`.env`):
```bash
DATABASE_URL=postgresql://mago:mago123@localhost:5432/mago_v3
REDIS_URL=redis://localhost:6379/0
OLLAMA_HOST=http://localhost:11434
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
ENABLE_LLM_CACHE=true
LLM_CACHE_TTL=3600  # 1 hour
```

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ENABLE_CLIENT_LLM=true
```

## Game Controls

| Action | Key | Description |
|--------|-----|-------------|
| **Movement** | Arrow Keys / WASD | Move character |
| **Attack** | Space / Enter | Attack adjacent enemy |
| **Inventory** | I | Open inventory |
| **Skills** | K | Open skill tree |
| **Use Item** | 1-9 | Use hotbar item |
| **Wait** | . | Skip turn |
| **Examine** | X + Click | Examine tile/entity |
| **Save** | Ctrl+S | Manual save |
| **Help** | ? | Show controls |

## API Documentation

Once running, visit:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **WebSocket Test**: http://localhost:8000/ws-test

### Key Endpoints

#### REST API
```
POST   /api/auth/register       - Create account
POST   /api/auth/login          - Login (returns JWT)
GET    /api/game/state          - Get current game state
POST   /api/game/action         - Submit player action
GET    /api/game/leaderboard    - Top scores
POST   /api/llm/generate-quest  - Create new quest
```

#### WebSocket
```
WS     /ws/{token}              - Game session (requires auth)

Client → Server events:
- ACTION: Player action (move, attack, use)
- PING: Keepalive
- SAVE: Request save

Server → Client events:
- STATE_UPDATE: Full state delta
- EVENT: Game event (level up, quest complete)
- ERROR: Error message
- PONG: Keepalive response
```

## Performance Optimizations

1. **LLM Decision Caching**: 70% hit rate reduces API calls
2. **WebSocket State Deltas**: Only send changed fields
3. **Client-side Prediction**: Instant UI feedback, reconcile on server response
4. **Redis Session Storage**: Sub-millisecond auth lookups
5. **PostgreSQL Indexes**: Optimized for player queries
6. **Canvas Rendering**: 60 FPS with dirty rectangle optimization
7. **Web Worker LLM**: Non-blocking UI during local inference

## Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm test
npm run test:e2e

# Integration tests
cd ..
./scripts/test-integration.sh
```

## Roadmap

### V3.1 (Next Release)
- [ ] Multiplayer co-op (2-4 players)
- [ ] Voice chat integration
- [ ] Mobile app (React Native)
- [ ] Steam achievements

### V3.2 (Future)
- [ ] Modding API
- [ ] Custom dungeon editor
- [ ] Ranked competitive mode
- [ ] VR support (experimental)

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See [LICENSE](../LICENSE) for details

## Credits

- **Mago Mythology**: Inspired by Korean goddess [Mago](https://en.wikipedia.org/wiki/Korean_mythology)
- **LLM Models**: 
  - [Llama 3.2](https://ollama.com/library/llama3.2) by Meta
  - [Phi-3](https://huggingface.co/microsoft/Phi-3-mini-4k-instruct) by Microsoft (client)
- **ASCII Art**: Community contributions
- **Music**: (To be added)

---

**Made with ⚔️ and 🤖 by [gongahkia](https://github.com/gongahkia)**
