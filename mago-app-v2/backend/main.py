from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.game.state_manager import game_state_manager
from app.game.event_handler import event_handler
from app.llm.entity_generator import entity_generator
import uvicorn
import os

app = FastAPI(
    title="Mago Backend",
    description="AI-Powered Roguelike Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    if not game_state_manager.load_state():
        game_state_manager.generate_new_dungeon()
        game_state_manager.add_message("New game started!")
        game_state_manager.save_state()

@app.post("/game/action")
async def handle_player_action(action: dict):
    try:
        result = event_handler.process_player_action(action)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/game/process_enemies")
async def process_enemy_turns():
    try:
        result = await event_handler.process_enemy_turns()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/game/state")
async def get_game_state():
    return game_state_manager.current_state

@app.post("/entity/generate")
async def generate_entity(entity_type: str, x: int, y: int):
    try:
        enemy = await entity_generator.create_enemy(entity_type, (x, y))
        game_state_manager.add_enemy(enemy)
        return enemy
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True,
        timeout_keep_alive=30
    )