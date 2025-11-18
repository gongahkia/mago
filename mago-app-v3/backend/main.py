from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os
from typing import AsyncGenerator

from app.api import auth, game, llm
from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.core.websocket_manager import manager
from app.core.redis_client import redis_client
from app.services.game_service import GameService

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """Startup and shutdown events"""
    # Startup
    logger.info("Starting Mago V3 Backend...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize Redis connection
    await redis_client.ping()
    logger.info("Redis connected")
    
    # Pull Ollama model if needed
    try:
        import ollama
        models = ollama.list()
        if not any(m['name'].startswith('llama3.2') for m in models['models']):
            logger.info("Pulling Ollama model...")
            ollama.pull('llama3.2:3b-instruct-q4_K_M')
    except Exception as e:
        logger.warning(f"Ollama not available: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Mago V3 Backend...")
    await redis_client.close()

app = FastAPI(
    title="Mago V3 API",
    description="Hybrid LLM Roguelike Backend",
    version="3.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(game.router, prefix="/api/game", tags=["game"])
app.include_router(llm.router, prefix="/api/llm", tags=["llm"])

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "3.0.0",
        "services": {
            "database": "connected",
            "redis": "connected",
            "ollama": "available"
        }
    }

@app.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db = Depends(get_db)):
    """
    WebSocket endpoint for real-time game updates
    
    Client sends:
    - ACTION: {"type": "move", "direction": "north"}
    - PING: {}
    - SAVE: {}
    
    Server sends:
    - STATE_UPDATE: {full game state delta}
    - EVENT: {"type": "level_up", "data": {...}}
    - ERROR: {"message": "..."}
    - PONG: {}
    """
    # Verify token and get user
    from app.core.auth import verify_token
    try:
        user_id = verify_token(token)
    except Exception as e:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    await manager.connect(websocket, user_id)
    game_service = GameService(db, redis_client)
    
    try:
        # Send initial state
        state = await game_service.get_game_state(user_id)
        await manager.send_personal_message(
            {"type": "STATE_UPDATE", "data": state},
            user_id
        )
        
        while True:
            data = await websocket.receive_json()
            
            if data.get("type") == "PING":
                await manager.send_personal_message({"type": "PONG"}, user_id)
                continue
            
            if data.get("type") == "ACTION":
                # Process player action
                result = await game_service.process_action(user_id, data.get("action"))
                
                # Send state update
                await manager.send_personal_message(
                    {"type": "STATE_UPDATE", "data": result["state"]},
                    user_id
                )
                
                # Broadcast events to relevant players
                if result.get("events"):
                    for event in result["events"]:
                        await manager.broadcast(
                            {"type": "EVENT", "data": event},
                            room=result.get("room_id")
                        )
            
            elif data.get("type") == "SAVE":
                await game_service.save_game(user_id)
                await manager.send_personal_message(
                    {"type": "EVENT", "data": {"type": "save_complete"}},
                    user_id
                )
                
    except WebSocketDisconnect:
        logger.info(f"User {user_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)
        await manager.send_personal_message(
            {"type": "ERROR", "message": str(e)},
            user_id
        )
    finally:
        manager.disconnect(user_id)
        # Auto-save on disconnect
        await game_service.save_game(user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
