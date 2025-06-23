from .state_manager import game_state_manager
from app.llm import ollama_integration
import random
from typing import Dict, Any, List, Tuple

class EventHandler:
    def __init__(self):
        self.turn_state = "player"  
    
    def process_player_action(self, action_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.turn_state != "player":
            return {"status": "error", "message": "Not player's turn"}
        
        player = game_state_manager.current_state["player"]
        px, py = player["position"]
        dungeon = game_state_manager.get_dungeon()
        
        if action_data["action"] == "move":
            dx, dy = action_data.get("dx", 0), action_data.get("dy", 0)
            new_x, new_y = px + dx, py + dy
            
            if dungeon[new_y][new_x] != '#':
                game_state_manager.update_entity_position("player", (new_x, new_y))
                game_state_manager.add_message(f"Player moves to ({new_x}, {new_y})")
            else:
                game_state_manager.add_message("You bump into a wall")
        
        self.turn_state = "enemies"
        return {"status": "success", "next_turn": "enemies"}
    
    async def process_enemy_turns(self) -> Dict[str, Any]:
        if self.turn_state != "enemies":
            return {"status": "error", "message": "Not enemy turn"}
        
        enemies = game_state_manager.current_state["enemies"]
        player_pos = game_state_manager.get_player_position()
        dungeon = game_state_manager.get_dungeon()
        
        for enemy in enemies:
            context = {
                "enemy_type": enemy["type"],
                "enemy_position": enemy["position"],
                "player_position": player_pos,
                "dungeon": dungeon
            }
            decision = await ollama_integration.get_decision(context)
            ex, ey = enemy["position"]
            if decision["action"] == "move":
                dx, dy = decision.get("dx", 0), decision.get("dy", 0)
                new_x, new_y = ex + dx, ey + dy
                
                if dungeon[new_y][new_x] != '#':
                    game_state_manager.update_entity_position(enemy["id"], (new_x, new_y))
        self.turn_state = "player"
        game_state_manager.save_state()
        return {"status": "success", "next_turn": "player"}

event_handler = EventHandler()